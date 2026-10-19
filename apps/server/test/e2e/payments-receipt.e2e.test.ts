import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { eq, inArray } from "@trips-app/db";
import { schema } from "@trips-app/db";
import { signAccessToken } from "@trips-app/domain";

import { app } from "../../src/index";
import { db } from "../../src/services";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

interface RpcBody {
  json?: Record<string, unknown> | null;
}

function getReceipt(paymentId: unknown, token?: string): Promise<Response> {
  return app.handle(
    new Request("http://localhost/rpc/payments/getReceipt", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ json: { paymentId } }),
    }),
  );
}

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

function tokenFor(accountId: string, role: string, tenantId?: string): string {
  return signAccessToken({
    sub: accountId,
    sid: randomUUID(),
    role: role as never,
    ...(tenantId ? { tenantId } : {}),
  });
}

const created = { bookingId: "", paidId: "", pendingId: "" };
let travelerId = "";
let tenantId = "";
let payerName = "";

beforeAll(async () => {
  // Arrange: one booking with a paid and a pending payment, on any seeded trip and account.
  const [trip] = await db
    .select({ id: schema.trips.id, tenantId: schema.trips.tenantId })
    .from(schema.trips)
    .limit(1);
  const [account] = await db
    .select({ id: schema.accounts.id, fullName: schema.accounts.fullName })
    .from(schema.accounts)
    .limit(1);
  if (!trip || !account) throw new Error("The local database has no trip or account; seed it.");
  travelerId = account.id;
  tenantId = trip.tenantId;
  payerName = account.fullName;

  const suffix = randomUUID().slice(0, 8).toUpperCase();
  const [booking] = await db
    .insert(schema.bookings)
    .values({
      bookingReference: `E2E-RCPT-${suffix}`,
      tenantId,
      tripId: trip.id,
      travelerAccountId: travelerId,
      passengersCount: 2,
      subtotalMinor: 200_000,
      programsTotalMinor: 0,
      discountMinor: 10_000,
      couponCode: "E2E10",
      totalAmountMinor: 190_000,
      currencyCode: "EGP",
      status: "confirmed",
    })
    .returning({ id: schema.bookings.id });
  created.bookingId = booking!.id;

  const [paid, pending] = await db
    .insert(schema.paymentTransactions)
    .values([
      {
        tenantId,
        bookingId: created.bookingId,
        payerAccountId: travelerId,
        gateway: "paymob",
        amountMinor: 190_000,
        currencyCode: "EGP",
        status: "succeeded",
        providerReference: `PAYMOB-E2E-${suffix}-A`,
        paidAt: new Date(),
      },
      {
        tenantId,
        bookingId: created.bookingId,
        payerAccountId: travelerId,
        gateway: "paymob",
        amountMinor: 190_000,
        currencyCode: "EGP",
        status: "pending",
        providerReference: `PAYMOB-E2E-${suffix}-B`,
      },
    ])
    .returning({ id: schema.paymentTransactions.id });
  created.paidId = paid!.id;
  created.pendingId = pending!.id;
});

afterAll(async () => {
  await db
    .delete(schema.paymentTransactions)
    .where(inArray(schema.paymentTransactions.id, [created.paidId, created.pendingId]));
  await db.delete(schema.bookings).where(eq(schema.bookings.id, created.bookingId));
});

describe("E2E: payments.getReceipt (SCR-SHR-12)", () => {
  test("payments.getReceipt returns the payer's receipt with its lines and totals", async () => {
    // Act
    const response = await getReceipt(created.paidId, tokenFor(travelerId, "traveler"));
    const body = await readRpcBody(response);

    // Assert
    expect(response.status).toBe(HTTP_OK);
    expect(body.json?.paymentId).toBe(created.paidId);
    expect(String(body.json?.invoiceNumber)).toStartWith("INV-PAYMOB-E2E-");
    expect(body.json?.billedToName).toBe(payerName);
    expect(body.json?.subtotalMinor).toBe(200_000);
    expect(body.json?.totalMinor).toBe(190_000);
    const lines = body.json?.lines as { kind: string; quantity: number; amountMinor: number }[];
    expect(lines.map((line) => [line.kind, line.quantity, line.amountMinor])).toEqual([
      ["trip", 2, 200_000],
      ["discount", 1, -10_000],
    ]);
  });

  test("payments.getReceipt lets the receiving organization read the receipt", async () => {
    // Act
    const response = await getReceipt(
      created.paidId,
      tokenFor(randomUUID(), "organization_owner", tenantId),
    );

    // Assert
    expect(response.status).toBe(HTTP_OK);
  });

  test("payments.getReceipt answers another account's payment as not found (IF-12)", async () => {
    // Act
    const response = await getReceipt(created.paidId, tokenFor(randomUUID(), "traveler"));

    // Assert
    expect(response.status).toBe(HTTP_NOT_FOUND);
  });

  test("payments.getReceipt answers another organization as not found (IF-12)", async () => {
    // Act
    const response = await getReceipt(
      created.paidId,
      tokenFor(randomUUID(), "organization_owner", randomUUID()),
    );

    // Assert
    expect(response.status).toBe(HTTP_NOT_FOUND);
  });

  test("payments.getReceipt refuses an unpaid payment with 409 CONFLICT", async () => {
    // Act
    const response = await getReceipt(created.pendingId, tokenFor(travelerId, "traveler"));

    // Assert
    expect(response.status).toBe(HTTP_CONFLICT);
  });

  test("payments.getReceipt rejects a call without a token with 401", async () => {
    // Act
    const response = await getReceipt(created.paidId);

    // Assert
    expect(response.status).toBe(HTTP_UNAUTHORIZED);
  });

  test("payments.getReceipt rejects a malformed payment id with 400 VALIDATION_ERROR", async () => {
    // Act
    const response = await getReceipt("not-a-uuid", tokenFor(travelerId, "traveler"));

    // Assert
    expect(response.status).toBe(HTTP_BAD_REQUEST);
  });
});
