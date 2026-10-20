// Client-side receipt PDF export (SCR-SHR-12), following docs/design/pdf/PdfInvoiceB2C.dc.html:
// a 794×1123 (A4 @96dpi) bilingual invoice sheet — brand header, meta strip, billed-to, lines
// table, totals and footer. The template node is rendered offscreen, rasterized with
// html2canvas-pro (it handles the design's oklch-free inline colors; rasterization also keeps
// Arabic shaping intact, which jsPDF cannot do on its own) and saved through jsPDF.
import { html2canvas } from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export type ReceiptPdfData = {
  invoiceNumber: string;
  issuedAt: string;
  billedToName: string;
  currencyCode: string;
  /** Pre-formatted rows, already in reader order (charges first, then discounts). */
  lines: Array<{ label: string; amount: string; negative: boolean }>;
  subtotal: string;
  total: string;
  refunded: string | null;
};

const FONT_LINK_ID = "receipt-pdf-fonts";
const FONT_LINK_HREF =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Cairo:wght@400;600;700&display=swap";

/** Load the design fonts (Outfit + Cairo) once so the offscreen sheet renders with them. */
async function ensureDesignFonts(): Promise<void> {
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = FONT_LINK_HREF;
  document.head.appendChild(link);
  try {
    await document.fonts.load('15px "Outfit"');
    await document.fonts.load('15px "Cairo"');
  } catch {
    // Offline: the template falls back to system-ui and still renders.
  }
}

const BRAND = "#262a67";
const MUTED = "#5b5f86";
const HAIRLINE = "#e3dfc9";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linesRows(data: ReceiptPdfData): string {
  const row = (label: string, amount: string) => `
<tr style="border-bottom: 1px solid ${HAIRLINE}">
  <td style="padding: 8px 8px 8px 0">${escapeHtml(label)}</td>
  <td style="padding: 8px; text-align: right; white-space: nowrap">${escapeHtml(amount)}</td>
</tr>`;
  return data.lines.map((line) => row(line.label, line.amount)).join("");
}

function totalRow(labelEn: string, labelAr: string, value: string, strong = false): string {
  const base = "display: flex; justify-content: space-between; gap: 12px; padding: 6px 0;";
  const style = strong
    ? `${base} border-bottom: 2px solid ${BRAND}; font-size: 18px; font-weight: 700;`
    : `${base} border-bottom: 1px solid ${HAIRLINE};`;
  return `<div style="${style}"><span>${labelEn} <span style="font-family: Cairo, sans-serif; color: ${MUTED}">${labelAr}</span></span><span>${escapeHtml(value)}</span></div>`;
}

function buildTemplate(data: ReceiptPdfData): string {
  return `
<div id="receipt-pdf-sheet" style="width: ${A4_WIDTH}px; height: ${A4_HEIGHT}px; box-sizing: border-box; padding: 48px; background: #ffffff; color: ${BRAND}; font-family: Outfit, system-ui, sans-serif; font-size: 15px; line-height: 1.45; display: flex; flex-direction: column; gap: 20px">
  <header style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 16px; border-bottom: 2px solid ${BRAND}">
    <img src="/brand/trips-enjoy-horizontal-fullcolor.svg" alt="Trips Enjoy" style="height: 40px; width: auto; display: block">
    <div style="text-align: right">
      <div style="font-size: 24px; font-weight: 700; line-height: 1.15">Receipt</div>
      <div style="font-family: Cairo, sans-serif; font-size: 18px; font-weight: 700" dir="rtl" lang="ar">إيصال</div>
      <div style="font-size: 16px; font-weight: 600">${escapeHtml(data.invoiceNumber)}</div>
    </div>
  </header>
  <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid ${HAIRLINE}; border-radius: 8px">
    <div style="padding: 10px 14px; border-right: 1px solid ${HAIRLINE}">
      <div style="font-size: 13px; color: ${MUTED}">Issue date · <span style="font-family: Cairo, sans-serif">تاريخ الإصدار</span></div>
      <div style="font-weight: 600">${escapeHtml(data.issuedAt)}</div>
    </div>
    <div style="padding: 10px 14px">
      <div style="font-size: 13px; color: ${MUTED}">Billed to · <span style="font-family: Cairo, sans-serif">صادرة إلى</span></div>
      <div style="font-weight: 600">${escapeHtml(data.billedToName)}</div>
    </div>
  </section>
  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr style="font-size: 13px; color: ${MUTED}; border-bottom: 1px solid ${BRAND}">
        <th style="padding: 6px 8px 6px 0; text-align: left; font-weight: 600">Item · <span style="font-family: Cairo, sans-serif">البند</span></th>
        <th style="padding: 6px 0 6px 8px; text-align: right; font-weight: 600">Amount (${escapeHtml(data.currencyCode)}) · <span style="font-family: Cairo, sans-serif">المبلغ</span></th>
      </tr>
    </thead>
    <tbody>${linesRows(data)}</tbody>
  </table>
  <section style="display: flex; justify-content: flex-end">
    <div style="flex: 0 1 320px">
      ${totalRow("Subtotal", "المجموع الفرعي", data.subtotal)}
      ${data.lines
        .filter((line) => line.negative)
        .map((line) => totalRow("Discount", "خصم", line.amount))
        .join("")}
      ${totalRow("Total", "الإجمالي", data.total, true)}
      ${data.refunded ? totalRow("Refunded", "المبلغ المسترد", data.refunded) : ""}
    </div>
  </section>
  <footer style="margin-top: auto; padding-top: 12px; border-top: 1px solid ${HAIRLINE}; display: flex; justify-content: space-between; gap: 16px; font-size: 13px; color: ${MUTED}">
    <span>Trips Enjoy</span>
    <span style="white-space: nowrap">${escapeHtml(data.invoiceNumber)}</span>
  </footer>
</div>`;
}

export async function downloadReceiptPdf(data: ReceiptPdfData): Promise<void> {
  await ensureDesignFonts();

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.innerHTML = buildTemplate(data);
  document.body.appendChild(host);

  try {
    await document.fonts.ready;
    const sheet = host.firstElementChild as HTMLElement;
    const canvas = await html2canvas(sheet, {
      scale: 2,
      backgroundColor: "#ffffff",
      windowWidth: A4_WIDTH,
      windowHeight: A4_HEIGHT,
    });

    // Map the 794×1123 sheet onto a full A4 page (1pt = 1/72in, A4 = 595×842pt).
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight(),
    );
    pdf.save(`receipt-${data.invoiceNumber || "download"}.pdf`);
  } finally {
    host.remove();
  }
}
