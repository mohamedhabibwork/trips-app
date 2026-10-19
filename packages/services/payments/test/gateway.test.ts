import { describe, expect, it } from "bun:test";

import {
  buildMockGatewayHandoff,
  paymentConfirmDeadlineSafe,
  resolveGatewayCallbackAction,
} from "../src/model";

describe("gateway callback idempotency (FR-PAY-02)", () => {
  it("treats a settled transaction as already processed regardless of outcome", () => {
    for (const status of ["succeeded", "failed", "refunded", "disputed"] as const) {
      expect(resolveGatewayCallbackAction(status, "succeeded")).toEqual({
        action: "already_processed",
      });
      expect(resolveGatewayCallbackAction(status, "failed")).toEqual({
        action: "already_processed",
      });
    }
  });

  it("applies the first success or failure delivery", () => {
    expect(resolveGatewayCallbackAction("pending", "succeeded")).toEqual({
      action: "apply_success",
    });
    expect(resolveGatewayCallbackAction("requires_action", "failed")).toEqual({
      action: "apply_failure",
    });
  });
});

describe("mock gateway handoff (NFR-SEC-12)", () => {
  it("builds a market-gateway redirect without any card data or network I/O", () => {
    const handoff = buildMockGatewayHandoff("paymob", "PAYMOB-ABC123");
    expect(handoff.mock).toBe(true);
    expect(handoff.method).toBe("GET");
    expect(handoff.redirectUrl).toContain("paymob.com");
    expect(handoff.redirectUrl).toContain("ref=PAYMOB-ABC123");
    // No card fields ever exist on the handoff.
    expect(JSON.stringify(handoff)).not.toMatch(/card|pan|cvc/i);
  });

  it("covers every market gateway including Tap", () => {
    for (const gateway of ["stripe", "paymob", "tap", "fawry"] as const) {
      const handoff = buildMockGatewayHandoff(gateway, `${gateway.toUpperCase()}-X`);
      expect(handoff.gateway).toBe(gateway);
      expect(handoff.redirectUrl.startsWith("https://")).toBe(true);
    }
  });

  it("keeps the D-30 confirm deadline at 30 seconds", () => {
    const created = new Date("2026-05-01T10:00:00Z");
    expect(paymentConfirmDeadlineSafe(created).toISOString()).toBe("2026-05-01T10:00:30.000Z");
  });
});
