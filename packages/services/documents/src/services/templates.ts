// Pure HTML rendering for the documents service. No I/O: every template is a function
// from validated data to a self-contained A4 HTML string, styled after the artboards in
// docs/design/pdf/ (794x1123, Outfit + Cairo, ink #262a67, hairline #e3dfc9).
import type {
  DocumentData,
  DocumentLocale,
  DocumentMeta,
  DocumentType,
  LineItem,
  Party,
  Totals,
} from "../schemas";

export const DOCUMENT_DEFAULT_TITLES: Record<DocumentType, { en: string; ar: string }> = {
  invoice_b2c: { en: "Simplified Tax Invoice", ar: "فاتورة ضريبية مبسطة" },
  invoice_b2b: { en: "Tax Invoice", ar: "فاتورة ضريبية" },
  invoice_eg: { en: "Tax Invoice", ar: "فاتورة ضريبية" },
  credit_note: { en: "Credit Note", ar: "إشعار دائن" },
  plan_invoice: {
    en: "Plan & Commission Invoice",
    ar: "فاتورة الاشتراك والعمولة",
  },
  ticket: { en: "E-Ticket", ar: "تذكرة إلكترونية" },
  itinerary: { en: "Trip Itinerary", ar: "برنامج الرحلة" },
  manifest: { en: "Passenger Manifest", ar: "بيان الركاب" },
  provider_statement: { en: "Provider Statement", ar: "كشف حساب مزود الخدمة" },
  settlement: { en: "Settlement Statement", ar: "كيفية التسوية" },
};

export interface DocumentRenderInput {
  data: DocumentData;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatAmount(value: number, locale: DocumentLocale = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string, locale: DocumentLocale = "en"): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(value);
  return parsed.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function documentFilename(type: DocumentType, reference: string): string {
  const safeRef = reference.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "document";
  return `${type}-${safeRef}.pdf`;
}

function ar(text: string | undefined): string {
  if (!text) return "";
  return ` <span class="ar" lang="ar" dir="rtl">${escapeHtml(text)}</span>`;
}

function optionalLine(value: string | undefined): string {
  return value ? `<div>${escapeHtml(value)}</div>` : "";
}

function qrBlock(meta: DocumentMeta): string {
  if (!meta.qrPayload) return "";
  return `<div class="qr-wrap">
  <div class="qr" title="${escapeHtml(meta.qrPayload)}"><span>QR</span></div>
  <div class="qr-note">ZATCA QR · scan with the Fatoora app to verify</div>
</div>`;
}

function totalsBlock(totals: Totals, locale: DocumentLocale): string {
  const cur = escapeHtml(totals.currency);
  const rows = [
    `<div class="trow"><span>Total excl. VAT${ar("الإجمالي غير شامل")}</span><span>${formatAmount(totals.subtotal, locale)}</span></div>`,
    ...totals.adjustments.map(
      (adj) =>
        `<div class="trow"><span>${escapeHtml(adj.label)}${ar(adj.labelAr)}</span><span>${formatAmount(adj.amount, locale)}</span></div>`,
    ),
    `<div class="trow"><span>VAT${ar("الضريبة")}</span><span>${formatAmount(totals.vat, locale)}</span></div>`,
    `<div class="trow total"><span>Total incl. VAT</span><span>${formatAmount(totals.total, locale)} ${cur}</span></div>`,
  ];
  return `<div class="totals">
  ${rows.join("\n  ")}
  ${totals.paymentNote ? `<div class="pay-note">${escapeHtml(totals.paymentNote)}</div>` : ""}
</div>`;
}

function partyBlock(label: string, party: Party): string {
  return `<div class="party">
  <div class="party-label">${escapeHtml(label)}</div>
  <div class="party-name">${escapeHtml(party.name)}${ar(party.nameAr)}</div>
  ${optionalLine(party.taxId ? `VAT ${party.taxId}` : undefined)}
  ${optionalLine(party.registrationNumber ? `CR ${party.registrationNumber}` : undefined)}
  ${optionalLine(party.address)}
  ${optionalLine(party.contact)}
</div>`;
}

function lineRows(lines: LineItem[], locale: DocumentLocale): string {
  return lines
    .map((line) => {
      const qty =
        line.quantity !== undefined
          ? `${formatAmount(line.quantity, locale)}${line.unitPrice !== undefined ? ` × ${formatAmount(line.unitPrice, locale)}` : ""}`
          : "";
      return `<tr>
  <td>${escapeHtml(line.description)}${ar(line.descriptionAr)}${qty ? ` <span class="qty">${escapeHtml(qty)}</span>` : ""}</td>
  <td class="num ${line.isCredit ? "credit" : ""}">${formatAmount(line.total, locale)}</td>
</tr>`;
    })
    .join("\n");
}

const TWO_COLUMN_TABLE = `<table class="lines">
  <thead>
    <tr><th>Item${ar("البند")}</th><th class="num">Amount</th></tr>
  </thead>
  <tbody>
    {{ROWS}}
  </tbody>
</table>`;

function shell(doc: {
  type: DocumentType;
  meta: DocumentMeta;
  logoUrl?: string;
  body: string;
  footer: string;
}): string {
  const titles = DOCUMENT_DEFAULT_TITLES[doc.type] ?? {
    en: "Document",
    ar: "مستند",
  };
  const title = doc.meta.title ?? titles.en;
  const titleAr = doc.meta.titleAr ?? titles.ar;
  const logo = doc.logoUrl
    ? `<img src="${escapeHtml(doc.logoUrl)}" alt="Trips Enjoy" class="logo">`
    : `<div class="logo logo-text">Trips Enjoy<span>.com</span></div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} · ${escapeHtml(doc.meta.reference)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&amp;family=Cairo:wght@400;600;700&amp;display=swap">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; color: #262a67; font-family: Outfit, Nunito, system-ui, sans-serif; font-size: 15px; line-height: 1.45; }
  .ar { font-family: Cairo, sans-serif; }
  .page { width: 794px; min-height: 1123px; padding: 48px; background: #ffffff; display: flex; flex-direction: column; gap: 20px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 16px; border-bottom: 2px solid #262a67; }
  .logo { height: 40px; width: auto; display: block; }
  .logo-text { font-size: 26px; font-weight: 700; color: #262a67; }
  .logo-text span { color: #d8a13a; }
  .doc-title { text-align: right; }
  .doc-title .en { font-size: 24px; font-weight: 700; line-height: 1.15; }
  .doc-title .ar { font-size: 18px; font-weight: 700; display: block; }
  .doc-title .ref { font-size: 16px; font-weight: 600; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; border: 1px solid #e3dfc9; border-radius: 8px; }
  .meta-grid > div { padding: 10px 14px; }
  .meta-grid > div + div { border-left: 1px solid #e3dfc9; }
  .meta-label { font-size: 13px; color: #5b5f86; }
  .meta-value { font-weight: 600; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .party-label { font-size: 13px; font-weight: 600; color: #5b5f86; }
  .party-name { font-size: 17px; font-weight: 700; }
  table.lines { width: 100%; border-collapse: collapse; }
  table.lines th { padding: 6px 8px 6px 0; text-align: left; font-size: 13px; color: #5b5f86; font-weight: 600; border-bottom: 1px solid #262a67; }
  table.lines th.num, table.lines td.num { text-align: right; padding: 6px 0 6px 8px; white-space: nowrap; }
  table.lines td { padding: 8px 8px 8px 0; border-bottom: 1px solid #e3dfc9; }
  td .qty { color: #5b5f86; font-size: 13px; }
  td.credit::before { content: "− "; }
  .totals { flex: 0 1 320px; margin-left: auto; }
  .trow { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e3dfc9; }
  .trow.total { border-bottom: 2px solid #262a67; font-size: 18px; font-weight: 700; padding: 8px 0; }
  .pay-note { padding-top: 8px; font-size: 14px; }
  .split { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
  .notes { font-size: 14px; color: #5b5f86; }
  .qr-wrap { display: flex; gap: 14px; align-items: center; }
  .qr { width: 120px; height: 120px; border: 2px solid #262a67; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; letter-spacing: 2px; }
  .qr-note { font-size: 13px; color: #5b5f86; max-width: 220px; }
  footer { margin-top: auto; padding-top: 12px; border-top: 1px solid #e3dfc9; display: flex; justify-content: space-between; gap: 16px; font-size: 13px; color: #5b5f86; }
</style>
</head>
<body>
<div class="page">
  <header>
    ${logo}
    <div class="doc-title">
      <div class="en">${escapeHtml(title)}</div>
      <div class="ar" dir="rtl">${escapeHtml(titleAr)}</div>
      <div class="ref">${escapeHtml(doc.meta.reference)}</div>
    </div>
  </header>
  ${doc.body}
  <footer>${doc.footer}</footer>
</div>
</body>
</html>`;
}

function footerFor(party: Party, meta: DocumentMeta): string {
  const left = [
    party.name,
    party.registrationNumber ? `CR ${party.registrationNumber}` : "",
    party.taxId ? `VAT ${party.taxId}` : "",
  ]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join(" · ");
  const right = [meta.statusLine, `Issued ${formatDate(meta.issueDate)}`]
    .filter((part): part is string => Boolean(part))
    .map(escapeHtml)
    .join(" · ");
  return `<span>${left}</span><span style="white-space:nowrap">${right}</span>`;
}

function metaGrid(cells: Array<{ label: string; value: string }>): string {
  return `<section class="meta-grid">
  ${cells.map((cell) => `<div><div class="meta-label">${escapeHtml(cell.label)}</div><div class="meta-value">${escapeHtml(cell.value)}</div></div>`).join("\n  ")}
</section>`;
}

/** Structural shape shared by the invoice-family documents (b2c/b2b/eg/credit/plan/statement/settlement). */
interface InvoiceLikeData {
  meta: DocumentMeta;
  seller: Party;
  buyer: Party;
  supplyDate?: string;
  lines: LineItem[];
  totals: Totals;
  locale: DocumentLocale;
}

function renderInvoiceLike(data: InvoiceLikeData): {
  body: string;
  footer: string;
} {
  const meta = data.meta;
  const body = `
  ${metaGrid(
    [
      {
        label: "Issue date · تاريخ الإصدار",
        value: formatDate(meta.issueDate, data.locale),
      },
      ...(data.supplyDate
        ? [
            {
              label: "Supply date · تاريخ التوريد",
              value: formatDate(data.supplyDate, data.locale),
            },
          ]
        : []),
      ...(meta.statusLine ? [{ label: "ZATCA status", value: meta.statusLine }] : []),
      ...(meta.dueDate
        ? [{ label: "Due date", value: formatDate(meta.dueDate, data.locale) }]
        : []),
    ].slice(0, 3),
  )}
  <section class="parties">
    ${partyBlock("SELLER · البائع", data.seller)}
    ${partyBlock("BUYER · المشتري", data.buyer)}
  </section>
  ${TWO_COLUMN_TABLE.replace("{{ROWS}}", lineRows(data.lines, data.locale))}
  <section class="split">
    ${qrBlock(meta)}
    ${totalsBlock(data.totals, data.locale)}
  </section>
  ${meta.notes.length ? `<div class="notes">${meta.notes.map(escapeHtml).join(" ")}</div>` : ""}`;
  return { body, footer: footerFor(data.seller, meta) };
}

function renderTicket(data: Extract<DocumentData, { type: "ticket" }>): {
  body: string;
  footer: string;
} {
  const p = data.passengers
    .map(
      (passenger) => `<tr>
  <td>${escapeHtml(passenger.name)}</td>
  <td class="num">${escapeHtml(passenger.seat ?? "—")}</td>
  <td class="num">${escapeHtml(passenger.kind ?? "adult")}</td>
</tr>`,
    )
    .join("\n");
  const body = `
  ${metaGrid([
    {
      label: "Departure · المغادرة",
      value: formatDate(data.trip.departure, data.locale),
    },
    ...(data.trip.return
      ? [
          {
            label: "Return · العودة",
            value: formatDate(data.trip.return, data.locale),
          },
        ]
      : []),
    { label: "Booking · الحجز", value: data.meta.reference },
  ])}
  <section class="parties">
    ${partyBlock("OPERATOR · المنظم", data.seller)}
    ${partyBlock("TRAVELER · المسافر", data.traveler)}
  </section>
  ${metaGrid(
    [
      { label: "Trip · الرحلة", value: data.trip.name },
      ...(data.trip.route ? [{ label: "Route", value: data.trip.route }] : []),
      ...(data.trip.bus ? [{ label: "Bus", value: data.trip.bus }] : []),
      ...(data.trip.boardingPoint
        ? [
            {
              label: "Boarding",
              value: `${data.trip.boardingPoint}${data.trip.boardingTime ? ` · ${data.trip.boardingTime}` : ""}`,
            },
          ]
        : []),
    ].slice(0, 3),
  )}
  <table class="lines">
    <thead><tr><th>Passenger · الراكب</th><th class="num">Seat</th><th class="num">Type</th></tr></thead>
    <tbody>${p}</tbody>
  </table>
  <section class="split">
    ${qrBlock(data.meta)}
    ${totalsBlock(data.totals, data.locale)}
  </section>
  ${data.meta.notes.length ? `<div class="notes">${data.meta.notes.map(escapeHtml).join(" ")}</div>` : ""}`;
  return { body, footer: footerFor(data.seller, data.meta) };
}

function renderItinerary(data: Extract<DocumentData, { type: "itinerary" }>): {
  body: string;
  footer: string;
} {
  const days = data.days
    .map(
      (day) => `<section class="party">
  <div class="party-label">${escapeHtml(day.heading)}${day.date ? ` · ${escapeHtml(formatDate(day.date, data.locale))}` : ""}</div>
  <ul style="margin:6px 0 0; padding-left:18px">${day.activities.map((activity) => `<li>${escapeHtml(activity)}</li>`).join("")}</ul>
</section>`,
    )
    .join("\n");
  const lists = (title: string, items: string[]) =>
    items.length
      ? `<div><div class="party-label">${escapeHtml(title)}</div><div>${items.map((item) => escapeHtml(item)).join(" · ")}</div></div>`
      : "";
  const body = `
  ${metaGrid([
    {
      label: "Departure · المغادرة",
      value: formatDate(data.trip.departure, data.locale),
    },
    ...(data.trip.return
      ? [
          {
            label: "Return · العودة",
            value: formatDate(data.trip.return, data.locale),
          },
        ]
      : []),
    ...(data.trip.destination ? [{ label: "Destination", value: data.trip.destination }] : []),
  ])}
  <section class="parties">
    ${partyBlock("OPERATOR · المنظم", data.seller)}
    ${partyBlock("TRAVELER · المسافر", data.traveler)}
  </section>
  ${days}
  ${lists("Included · يشمل", data.inclusions)}
  ${lists("Not included · غير يشمل", data.exclusions)}
  ${data.meta.notes.length ? `<div class="notes">${data.meta.notes.map((note) => escapeHtml(note)).join(" ")}</div>` : ""}`;
  return { body, footer: footerFor(data.seller, data.meta) };
}

function renderManifest(data: Extract<DocumentData, { type: "manifest" }>): {
  body: string;
  footer: string;
} {
  const rows = data.passengers
    .map(
      (passenger) => `<tr>
  <td class="num">${escapeHtml(passenger.seat ?? "—")}</td>
  <td>${escapeHtml(passenger.name)}</td>
  <td class="num">${escapeHtml(passenger.phone ?? "—")}</td>
  <td class="num">${passenger.checkedIn ? "✓" : "—"}</td>
  <td>${escapeHtml(passenger.notes ?? "")}</td>
</tr>`,
    )
    .join("\n");
  const body = `
  ${metaGrid([
    {
      label: "Departure · المغادرة",
      value: formatDate(data.trip.departure, data.locale),
    },
    ...(data.trip.bus ? [{ label: "Bus · الحافلة", value: data.trip.bus }] : []),
    ...(data.trip.driver ? [{ label: "Driver · السائق", value: data.trip.driver }] : []),
  ])}
  <section class="parties">
    ${partyBlock("OPERATOR · المنظم", data.seller)}
    <div class="party">
      <div class="party-label">Headcount</div>
      <div class="party-name">${data.counts.adults} adults · ${data.counts.children} children</div>
      ${data.trip.route ? `<div>${escapeHtml(data.trip.route)}</div>` : ""}
    </div>
  </section>
  <table class="lines">
    <thead><tr><th class="num">Seat</th><th>Passenger · الراكب</th><th class="num">Phone</th><th class="num">Checked in</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${data.meta.notes.length ? `<div class="notes">${data.meta.notes.map((note) => escapeHtml(note)).join(" ")}</div>` : ""}`;
  return { body, footer: footerFor(data.seller, data.meta) };
}

/**
 * Render one document to a complete, self-contained HTML string. Pure: no I/O,
 * every interpolated value escaped. Templates mirror docs/design/pdf/ artboards.
 */
export function renderDocumentHtml(input: DocumentRenderInput): string {
  const data = input.data;
  const logoUrl = "seller" in data ? data.seller.logoUrl : undefined;

  let rendered: { body: string; footer: string };
  switch (data.type) {
    case "invoice_b2c":
    case "invoice_b2b":
    case "invoice_eg":
    case "credit_note":
    case "plan_invoice":
    case "provider_statement":
    case "settlement":
      rendered = renderInvoiceLike(data);
      break;
    case "ticket":
      rendered = renderTicket(data);
      break;
    case "itinerary":
      rendered = renderItinerary(data);
      break;
    case "manifest":
      rendered = renderManifest(data);
      break;
  }

  return shell({
    type: data.type,
    meta: data.meta,
    logoUrl,
    body: rendered.body,
    footer: rendered.footer,
  });
}
