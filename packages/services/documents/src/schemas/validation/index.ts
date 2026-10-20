// Zod schemas that validate input at the boundary.
// Document payloads mirror the PDF artboards in docs/design/pdf/: amounts are numbers
// formatted at render time, every text field is escaped by the templates.
import { z } from "zod";

export const DOCUMENT_TYPES = [
  "invoice_b2c",
  "invoice_b2b",
  "invoice_eg",
  "credit_note",
  "plan_invoice",
  "ticket",
  "itinerary",
  "manifest",
  "provider_statement",
  "settlement",
] as const;

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

const localeSchema = z.enum(["en", "ar"]).default("en");
export type DocumentLocale = z.infer<typeof localeSchema>;

export const partySchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  logoUrl: z.string().url().optional(),
});
export type Party = z.infer<typeof partySchema>;

export const lineItemSchema = z.object({
  description: z.string().min(1),
  descriptionAr: z.string().optional(),
  quantity: z.number().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional(),
  total: z.number(),
  /** True on credit-note-style documents where the line reduces the balance. */
  isCredit: z.boolean().optional(),
});
export type LineItem = z.infer<typeof lineItemSchema>;

export const totalsSchema = z.object({
  currency: z.string().min(3).max(3).default("SAR"),
  subtotal: z.number(),
  vat: z.number().default(0),
  total: z.number(),
  /** Extra rows between subtotal and total, for example discounts or withholding. */
  adjustments: z
    .array(
      z.object({
        label: z.string(),
        labelAr: z.string().optional(),
        amount: z.number(),
      }),
    )
    .default([]),
  /** Free-form line under the totals, for example "Paid · Visa •• 4421 · Ref PAY-88213041". */
  paymentNote: z.string().optional(),
});
export type Totals = z.infer<typeof totalsSchema>;

export const documentMetaSchema = z.object({
  reference: z.string().min(1),
  /** Overrides the default per-type title, for example "Simplified Tax Invoice". */
  title: z.string().optional(),
  titleAr: z.string().optional(),
  statusLine: z.string().optional(),
  issueDate: z.string().min(1),
  dueDate: z.string().optional(),
  /** TLV payload rendered as a ZATCA-style QR block on invoice-family documents. */
  qrPayload: z.string().optional(),
  /** Notes rendered above the footer. */
  notes: z.array(z.string()).default([]),
});
export type DocumentMeta = z.infer<typeof documentMetaSchema>;

const invoiceDataShape = {
  meta: documentMetaSchema,
  seller: partySchema,
  buyer: partySchema,
  supplyDate: z.string().optional(),
  lines: z.array(lineItemSchema).min(1),
  totals: totalsSchema,
  locale: localeSchema,
} as const;

export const documentDataSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("invoice_b2c"), ...invoiceDataShape }),
  z.object({ type: z.literal("invoice_b2b"), ...invoiceDataShape }),
  z.object({ type: z.literal("invoice_eg"), ...invoiceDataShape }),
  z.object({
    type: z.literal("credit_note"),
    ...invoiceDataShape,
    /** Invoice reference this note credits, shown under the buyer block. */
    creditedReference: z.string().optional(),
  }),
  z.object({
    type: z.literal("plan_invoice"),
    ...invoiceDataShape,
    /** Billing period, for example "Oct 2026". */
    period: z.string().optional(),
  }),
  z.object({
    type: z.literal("ticket"),
    meta: documentMetaSchema,
    seller: partySchema,
    traveler: partySchema,
    trip: z.object({
      name: z.string().min(1),
      nameAr: z.string().optional(),
      departure: z.string().min(1),
      return: z.string().optional(),
      route: z.string().optional(),
      bus: z.string().optional(),
      boardingPoint: z.string().optional(),
      boardingTime: z.string().optional(),
    }),
    passengers: z
      .array(
        z.object({
          name: z.string().min(1),
          seat: z.string().optional(),
          kind: z.string().optional(),
        }),
      )
      .min(1),
    lines: z.array(lineItemSchema).min(1),
    totals: totalsSchema,
    locale: localeSchema,
  }),
  z.object({
    type: z.literal("itinerary"),
    meta: documentMetaSchema,
    seller: partySchema,
    traveler: partySchema,
    trip: z.object({
      name: z.string().min(1),
      nameAr: z.string().optional(),
      departure: z.string().min(1),
      return: z.string().optional(),
      destination: z.string().optional(),
    }),
    days: z
      .array(
        z.object({
          heading: z.string().min(1),
          date: z.string().optional(),
          activities: z.array(z.string()).min(1),
        }),
      )
      .min(1),
    inclusions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    locale: localeSchema,
  }),
  z.object({
    type: z.literal("manifest"),
    meta: documentMetaSchema,
    seller: partySchema,
    trip: z.object({
      name: z.string().min(1),
      nameAr: z.string().optional(),
      departure: z.string().min(1),
      bus: z.string().optional(),
      driver: z.string().optional(),
      route: z.string().optional(),
    }),
    passengers: z
      .array(
        z.object({
          seat: z.string().optional(),
          name: z.string().min(1),
          phone: z.string().optional(),
          checkedIn: z.boolean().default(false),
          notes: z.string().optional(),
        }),
      )
      .min(1),
    counts: z
      .object({
        adults: z.number().int().nonnegative().default(0),
        children: z.number().int().nonnegative().default(0),
      })
      .default({ adults: 0, children: 0 }),
    locale: localeSchema,
  }),
  z.object({
    type: z.literal("provider_statement"),
    ...invoiceDataShape,
    provider: partySchema,
    period: z.string().optional(),
  }),
  z.object({
    type: z.literal("settlement"),
    ...invoiceDataShape,
    provider: partySchema,
    period: z.string().optional(),
  }),
]);

export type DocumentData = z.infer<typeof documentDataSchema>;

const emailSchema = z.string().email();

export const previewDocumentSchema = z.object({
  data: documentDataSchema,
});

export const generateDocumentSchema = z.object({
  data: documentDataSchema,
});

export const emailDocumentSchema = z.object({
  data: documentDataSchema,
  to: emailSchema,
  cc: z.array(emailSchema).max(10).optional(),
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
});

export type EmailDocumentInput = z.infer<typeof emailDocumentSchema>;
