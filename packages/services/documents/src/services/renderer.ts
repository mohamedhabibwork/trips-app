// PDF rendering through headless Chrome. Uses puppeteer-core so no browser is
// downloaded at install time; the executable is resolved from an explicit path,
// PDF_CHROME_PATH, or the well-known system install locations. One browser instance
// is reused across renders.
import type { Browser } from "puppeteer-core";

import { DocumentsServiceError } from "../errors";

const CHROME_CANDIDATES =
  process.platform === "darwin"
    ? [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      ]
    : [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        "/usr/bin/headless_shell",
      ];

export interface PdfRenderOptions {
  /** Rendered HTML document. Must be fully self-contained (fonts and images inline or remote). */
  html: string;
  filename?: string;
}

export interface PdfRenderer {
  render(options: PdfRenderOptions): Promise<Uint8Array>;
  close(): Promise<void>;
}

export interface RendererLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
}

export interface PdfRendererDeps {
  /** Explicit Chrome/Chromium executable path. Falls back to PDF_CHROME_PATH, then system locations. */
  executablePath?: string;
  logger?: RendererLogger;
}

async function resolveExecutablePath(explicit?: string): Promise<string> {
  const candidates = [explicit ?? process.env.PDF_CHROME_PATH, ...CHROME_CANDIDATES].filter(
    (candidate): candidate is string => Boolean(candidate),
  );
  const { access, constants } = await import("node:fs/promises");
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  throw new DocumentsServiceError(
    "SERVICE_UNAVAILABLE",
    "No Chrome/Chromium executable found for PDF rendering",
    {
      candidates,
      hint: "Set PDF_CHROME_PATH to a Chrome or Chromium executable",
    },
  );
}

export async function createPdfRenderer(deps: PdfRendererDeps = {}): Promise<PdfRenderer> {
  const executablePath = await resolveExecutablePath(deps.executablePath);
  const puppeteer = await import("puppeteer-core");
  const browser: Browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  deps.logger?.info("PDF renderer ready", { executablePath });

  return {
    async render({ html, filename }: PdfRenderOptions): Promise<Uint8Array> {
      const page = await browser.newPage();
      try {
        await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });
        return new Uint8Array(pdf);
      } catch (error) {
        throw new DocumentsServiceError("INTERNAL_ERROR", "PDF rendering failed", {
          cause: error instanceof Error ? error.message : String(error),
          filename,
        });
      } finally {
        await page.close();
      }
    },

    async close(): Promise<void> {
      await browser.close();
    },
  };
}

/**
 * Fallback renderer for tests and dry-run environments without Chrome: returns the HTML
 * bytes so callers exercise the full pipeline. The output is NOT a PDF; production must
 * configure PDF_CHROME_PATH.
 */
export function createHtmlPassthroughRenderer(): PdfRenderer {
  return {
    async render({ html }: PdfRenderOptions): Promise<Uint8Array> {
      return new TextEncoder().encode(html);
    },
    async close(): Promise<void> {},
  };
}
