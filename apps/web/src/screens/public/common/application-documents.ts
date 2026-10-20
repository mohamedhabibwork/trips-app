// Uploads the files picked on an application form through the media service and returns the
// document rows the onboarding procedures expect. Every storage key and size comes from the upload
// response, so a review always points at a file that exists. Needs a signed-in session.
import { orpc } from "@/utils/orpc";
import { serverRpc } from "@/utils/server-rpc";

import type { OnboardingDocumentType } from "../../onboarding-state";

export const APPLICATION_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ApplicationMimeType = (typeof APPLICATION_MIME_TYPES)[number];

/** Media upload purpose for each onboarding document type (limits are enforced per purpose). */
const MEDIA_PURPOSE = {
  commercial_registry: "commercial_register",
  tax_certificate: "tax_card",
  national_id: "national_id",
  driver_license: "driver_license",
  vehicle_registration: "vehicle_license",
  insurance_certificate: "insurance",
  lab_test_result: "document",
  portfolio_sample: "portfolio_photo",
  drone_permit: "document",
  appeal_evidence: "document",
  other: "document",
} as const satisfies Record<OnboardingDocumentType, string>;

const EXTENSION_MIME: Readonly<Record<string, ApplicationMimeType>> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface ApplicationDocument {
  documentType: OnboardingDocumentType;
  storageKey: string;
  mimeType: ApplicationMimeType;
  fileSizeBytes: number;
}

function isApplicationMimeType(value: string): value is ApplicationMimeType {
  return (APPLICATION_MIME_TYPES as readonly string[]).includes(value);
}

/** The accepted MIME type of a picked file, from the browser's type or the extension; else null. */
export function applicationMimeType(file: Pick<File, "name" | "type">): ApplicationMimeType | null {
  if (isApplicationMimeType(file.type)) return file.type;
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  return EXTENSION_MIME[extension] ?? null;
}

/** The file content as base64, without the data-URL prefix. */
export function readFileAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

/** Uploads each file in turn and returns its document row. Throws on the first failed upload. */
export async function uploadApplicationDocuments(
  files: readonly File[],
  documentType: OnboardingDocumentType,
): Promise<ApplicationDocument[]> {
  const documents: ApplicationDocument[] = [];
  for (const file of files) {
    const mimeType = applicationMimeType(file);
    if (!mimeType) throw new Error(`Unsupported file type: ${file.name}`);
    const { file: uploaded } = await serverRpc<
      Awaited<ReturnType<typeof orpc.media.uploadFile.call>>
    >("media/uploadFile", {
      originalFilename: file.name,
      mimeType,
      contentBase64: await readFileAsBase64(file),
      purpose: MEDIA_PURPOSE[documentType],
    });
    documents.push({
      documentType,
      storageKey: uploaded.storageKey,
      mimeType,
      fileSizeBytes: uploaded.fileSizeBytes,
    });
  }
  return documents;
}
