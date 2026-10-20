// Unit tests for the documents service: templates, PDF pipeline and email dispatch.
import { describe, expect, test } from "bun:test";

import { DocumentsServiceError, mapDocumentsError } from "../src/errors";
import { DOCUMENT_TYPES, documentDataSchema, emailDocumentSchema } from "../src/schemas";
import { createDocumentsService } from "../src/services";
import { createDocumentMailer, type DocumentEmailInput } from "../src/services/mailer";
import { createHtmlPassthroughRenderer } from "../src/services/renderer";
import {
  documentFilename,
  escapeHtml,
  formatAmount,
  renderDocumentHtml,
} from "../src/services/templates";

const invoiceData = {
  type: "invoice_b2c" as const,
  meta: {
    reference: "INV-ST-2026-004812",
    issueDate: "2026-10-06T11:40:00Z",
    statusLine: "Reported · 6 Oct, 11:40",
    qrPayload: "seller:Sunrise|vat:310245678900003|total:4592.00",
    notes: ["Issued by Trips Enjoy Co. on behalf of the seller."],
  },
  seller: {
    name: "Sunrise Tours Co.",
    nameAr: "شركة شروق للسياحة",
    taxId: "310245678900003",
  },
  buyer: { name: "Sara Al-Qahtani" },
  supplyDate: "2026-10-16",
  lines: [
    {
      description: "Seats · adults",
      quantity: 2,
      unitPrice: 1250,
      total: 2500,
    },
    { description: "Travel insurance", quantity: 4, unitPrice: 25, total: 100 },
  ],
  totals: {
    currency: "SAR",
    subtotal: 2260.87,
    vat: 339.13,
    total: 2600,
    adjustments: [],
    paymentNote: "Paid · Visa •• 4421",
  },
  locale: "en" as const,
};

const ticketData = {
  type: "ticket" as const,
  meta: { reference: "TE-48213", issueDate: "2026-10-06", notes: [] },
  seller: { name: "Trips Enjoy Co." },
  traveler: { name: "Sara Al-Qahtani" },
  trip: {
    name: "AlUla Heritage Weekend",
    departure: "2026-10-16",
    bus: "Bus 2",
    boardingPoint: "Riyadh Gate 3",
    boardingTime: "05:30",
  },
  passengers: [
    { name: "Sara Al-Qahtani", seat: "12A", kind: "adult" },
    { name: "Omar Al-Qahtani", seat: "12B", kind: "child" },
  ],
  lines: [{ description: "Seats", quantity: 2, unitPrice: 1250, total: 2500 }],
  totals: {
    currency: "SAR",
    subtotal: 2173.91,
    vat: 326.09,
    total: 2500,
    adjustments: [],
  },
  locale: "en" as const,
};

const providerStatementData = {
  type: "provider_statement" as const,
  meta: { reference: "PS-2026-10-0042", issueDate: "2026-10-06", notes: [] },
  seller: { name: "Trips Enjoy Co." },
  buyer: { name: "Sunrise Tours Co." },
  provider: { name: "Khalid Al-Otaibi", taxId: "3155" },
  period: "Oct 2026",
  lines: [{ description: "AlUla weekend · 2 departures", total: 1800 }],
  totals: {
    currency: "SAR",
    subtotal: 1800,
    vat: 0,
    total: 1800,
    adjustments: [{ label: "Platform commission 8%", amount: -144 }],
  },
  locale: "en" as const,
};

const itineraryData = {
  type: "itinerary" as const,
  meta: {
    reference: "IT-48213",
    issueDate: "2026-10-06",
    notes: ["Bring your passport."],
  },
  seller: { name: "Trips Enjoy Co." },
  traveler: { name: "Sara Al-Qahtani" },
  trip: {
    name: "AlUla Heritage Weekend",
    departure: "2026-10-16",
    return: "2026-10-18",
    destination: "AlUla",
  },
  days: [
    {
      heading: "Day 1",
      date: "2026-10-16",
      activities: ["Hegra guided tour", "Maraya concert"],
    },
    { heading: "Day 2", date: "2026-10-17", activities: ["Old Town walk"] },
  ],
  inclusions: ["Bus", "Hotel"],
  exclusions: ["Flights"],
  locale: "en" as const,
};

const manifestData = {
  type: "manifest" as const,
  meta: { reference: "MF-48213-B2", issueDate: "2026-10-16", notes: [] },
  seller: { name: "Trips Enjoy Co." },
  trip: {
    name: "AlUla Heritage Weekend",
    departure: "2026-10-16",
    bus: "Bus 2",
    driver: "Khalid Al-Otaibi",
    route: "Riyadh → AlUla",
  },
  passengers: [
    {
      seat: "12A",
      name: "Sara Al-Qahtani",
      phone: "+966500000000",
      checkedIn: true,
    },
    { seat: "12B", name: "Omar Al-Qahtani", checkedIn: false },
  ],
  counts: { adults: 2, children: 0 },
  locale: "en" as const,
};

const creditNoteData = {
  type: "credit_note" as const,
  meta: {
    reference: "CN-2026-0007",
    issueDate: "2026-10-08",
    notes: ["Credits invoice INV-ST-2026-004812."],
  },
  seller: { name: "Sunrise Tours Co.", taxId: "310245678900003" },
  buyer: { name: "Sara Al-Qahtani" },
  creditedReference: "INV-ST-2026-004812",
  lines: [
    {
      description: "Seats · adults · full refund",
      total: 2500,
      isCredit: true,
    },
  ],
  totals: {
    currency: "SAR",
    subtotal: -2173.91,
    vat: -326.09,
    total: -2500,
    adjustments: [],
  },
  locale: "en" as const,
};

const planInvoiceData = {
  type: "plan_invoice" as const,
  meta: { reference: "PI-2026-10-0011", issueDate: "2026-10-01", notes: [] },
  seller: { name: "Trips Enjoy Co.", taxId: "311098765400003" },
  buyer: { name: "Sunrise Tours Co." },
  period: "Oct 2026",
  lines: [
    { description: "Explorer plan · monthly", total: 499 },
    { description: "Booking commission · 12 bookings", total: 2400 },
  ],
  totals: {
    currency: "SAR",
    subtotal: 2899,
    vat: 434.85,
    total: 3333.85,
    adjustments: [],
  },
  locale: "en" as const,
};

function dataForType(type: (typeof DOCUMENT_TYPES)[number]): Record<string, unknown> {
  switch (type) {
    case "ticket":
      return ticketData;
    case "itinerary":
      return itineraryData;
    case "manifest":
      return manifestData;
    case "credit_note":
      return creditNoteData;
    case "plan_invoice":
      return planInvoiceData;
    case "provider_statement":
    case "settlement":
      return { ...providerStatementData, type };
    default:
      return { ...invoiceData, type };
  }
}

describe("validation schemas", () => {
  test("accepts every document type", () => {
    expect(DOCUMENT_TYPES).toHaveLength(10);
    for (const type of DOCUMENT_TYPES) {
      const result = documentDataSchema.safeParse(dataForType(type));
      if (!result.success) throw new Error(`${type}: ${result.error.issues[0]?.message}`);
      expect(result.success).toBe(true);
    }
  });

  test("rejects empty lines and bad currency", () => {
    const result = documentDataSchema.safeParse({
      ...invoiceData,
      lines: [],
      totals: { ...invoiceData.totals, currency: "SARR" },
    });
    expect(result.success).toBe(false);
  });

  test("requires a valid recipient email", () => {
    expect(emailDocumentSchema.safeParse({ data: invoiceData, to: "nope" }).success).toBe(false);
    expect(
      emailDocumentSchema.safeParse({
        data: invoiceData,
        to: "client@example.com",
      }).success,
    ).toBe(true);
  });
});

describe("templates", () => {
  test("escapeHtml neutralizes markup", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  test("formats amounts with two decimals", () => {
    expect(formatAmount(4592)).toBe("4,592.00");
    expect(formatAmount(1234.5)).toBe("1,234.50");
  });

  test("builds a filesystem-safe filename", () => {
    expect(documentFilename("invoice_b2c", "INV-ST-2026-004812")).toBe(
      "invoice_b2c-INV-ST-2026-004812.pdf",
    );
    expect(documentFilename("ticket", "TE 48213/§")).toBe("ticket-TE-48213.pdf");
  });

  test("renders a self-contained invoice document", () => {
    const html = renderDocumentHtml({ data: invoiceData });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Simplified Tax Invoice");
    expect(html).toContain("فاتورة ضريبية مبسطة");
    expect(html).toContain("INV-ST-2026-004812");
    expect(html).toContain("2,500.00");
    expect(html).toContain("Sunrise Tours Co.");
    expect(html).not.toContain("<script");
  });

  test("renders a ticket with the passenger list", () => {
    const html = renderDocumentHtml({ data: ticketData });
    expect(html).toContain("E-Ticket");
    expect(html).toContain("Sara Al-Qahtani");
    expect(html).toContain("12A");
  });

  test("escapes untrusted text in templates", () => {
    const evil = {
      ...invoiceData,
      buyer: { name: "<img src=x onerror=alert(1)>" },
    };
    const html = renderDocumentHtml({ data: evil });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});

describe("documents service", () => {
  test("previews HTML without any renderer", () => {
    const svc = createDocumentsService({
      renderer: createHtmlPassthroughRenderer(),
    });
    const preview = svc.previewHtml(invoiceData);
    expect(preview.type).toBe("invoice_b2c");
    expect(preview.filename).toBe("invoice_b2c-INV-ST-2026-004812.html");
    expect(preview.html).toContain("INV-ST-2026-004812");
  });

  test("generatePdf returns base64 through the passthrough renderer", async () => {
    const svc = createDocumentsService({
      renderer: createHtmlPassthroughRenderer(),
    });
    const result = await svc.generatePdf(invoiceData);
    expect(result.filename).toBe("invoice_b2c-INV-ST-2026-004812.pdf");
    expect(result.byteSize).toBeGreaterThan(0);
    expect(Buffer.from(result.base64, "base64").toString()).toContain("INV-ST-2026-004812");
  });

  test("emailDocument reports skipped when no mailer is configured", async () => {
    const svc = createDocumentsService({
      renderer: createHtmlPassthroughRenderer(),
    });
    const result = await svc.emailDocument({
      data: invoiceData,
      to: "client@example.com",
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("no email provider configured");
  });

  test("emailDocument attaches the generated document", async () => {
    const sent: Array<{
      to: string;
      subject: string;
      attachmentFilename: string;
      byteLength: number;
    }> = [];
    const mailer = async (input: DocumentEmailInput) => {
      sent.push({
        to: input.to,
        subject: input.subject,
        attachmentFilename: input.attachment.filename,
        byteLength: input.attachment.content.byteLength,
      });
      return { ok: true, provider: "email", messageId: "m-1" };
    };
    const svc = createDocumentsService({
      renderer: createHtmlPassthroughRenderer(),
      mailer,
    });
    const result = await svc.emailDocument({
      data: ticketData,
      to: "client@example.com",
    });
    expect(result.ok).toBe(true);
    expect(result.filename).toBe("ticket-TE-48213.pdf");
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("client@example.com");
    expect(sent[0]!.subject).toContain("TE-48213");
    expect(sent[0]!.attachmentFilename).toBe("ticket-TE-48213.pdf");
    expect(sent[0]!.byteLength).toBeGreaterThan(0);
  });
});

describe("document mailer adapter", () => {
  test("returns undefined without an email provider", () => {
    expect(createDocumentMailer(undefined, ["fcm"])).toBeUndefined();
  });

  test("sends through the notifykit email provider with a PDF attachment", async () => {
    const calls: unknown[] = [];
    const source = {
      async provider(name: string) {
        expect(name).toBe("email");
        return {
          async send(
            message: {
              native: { attachments: readonly { filename: string }[] };
            },
            options?: { timeout?: number },
          ) {
            calls.push({ message, options });
            return { ok: true, messageId: "abc" };
          },
        };
      },
    };
    const mailer = createDocumentMailer(source, ["email", "fcm"])!;
    const result = await mailer({
      to: "client@example.com",
      subject: "E-Ticket TE-48213",
      body: "Attached is your ticket.",
      attachment: {
        filename: "ticket.pdf",
        content: new TextEncoder().encode("pdf-bytes"),
      },
    });
    expect(result.ok).toBe(true);
    expect(result.messageId).toBe("abc");
    expect(calls).toHaveLength(1);
    const call = calls[0] as {
      message: { native: { attachments: readonly { filename: string }[] } };
      options?: { timeout?: number };
    };
    expect(call.message.native.attachments[0]!.filename).toBe("ticket.pdf");
    expect(call.options?.timeout).toBeGreaterThan(0);
  });

  test("maps transport throws to a failed, retryable result", async () => {
    const source = {
      async provider() {
        throw new Error("smtp down");
      },
    };
    const mailer = createDocumentMailer(source, ["email"])!;
    const result = await mailer({
      to: "client@example.com",
      subject: "s",
      body: "b",
      attachment: { filename: "t.pdf", content: new Uint8Array([1]) },
    });
    expect(result.ok).toBe(false);
    expect(result.retryable).toBe(true);
    expect(result.reason).toBe("smtp down");
  });
});

describe("error mapping", () => {
  test("maps renderer unavailability to SERVICE_UNAVAILABLE", () => {
    const error = new DocumentsServiceError("SERVICE_UNAVAILABLE", "no chrome");
    const mapped = mapDocumentsError(error);
    expect(mapped).toBeInstanceOf(DocumentsServiceError);
  });
});
