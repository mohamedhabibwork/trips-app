import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";
import { toPendingItems, withoutItem } from "./upload-items";

const MIN_PHOTOS = 8;

// Placeholder file names showing each status. Real names come from the picker.
const INITIAL_DOCUMENTS: readonly TeFileUploadItem[] = [
  { name: "registration.pdf", status: "uploading" },
  { name: "insurance.pdf", status: "done" },
  { name: "scan-2.pdf", status: "failed", message: "File type not allowed" },
];

const INITIAL_PHOTOS: readonly TeFileUploadItem[] = [
  { name: "photo-1.jpg", status: "done" },
  { name: "photo-2.jpg", status: "uploading" },
];

function UploadViews() {
  const [documents, setDocuments] = useState<readonly TeFileUploadItem[]>(INITIAL_DOCUMENTS);
  const [photos, setPhotos] = useState<readonly TeFileUploadItem[]>(INITIAL_PHOTOS);
  const uploadedPhotos = photos.filter((file) => file.status === "done").length;

  return (
    <div className="flex flex-col gap-8">
      <TeFileUpload
        label="Documents"
        accept="image/*,application/pdf"
        multiple
        files={documents}
        onFilesSelected={(files) => setDocuments([...documents, ...toPendingItems(files)])}
        onRemove={(name) => setDocuments(withoutItem(documents, name))}
        hint="Choose a file or take a photo."
      />
      <section className="flex flex-col gap-4" aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="te-h3">
          Portfolio photos
        </h2>
        <TeInlineAlert tone="info" title="Minimum count">
          Upload at least {MIN_PHOTOS} photos. Uploaded: {uploadedPhotos} of {MIN_PHOTOS}.
        </TeInlineAlert>
        <TeFileUpload
          label="Portfolio photos"
          accept="image/*"
          multiple
          files={photos}
          onFilesSelected={(files) => setPhotos([...photos, ...toPendingItems(files)])}
          onRemove={(name) => setPhotos(withoutItem(photos, name))}
          hint="Photos are stripped of location data before they are stored."
        />
      </section>
    </div>
  );
}

/** Document and photo upload with per-file status, validation, and the required minimum count. */
export function ScrShr16DocumentAndPhotoUpload() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <TePageHeader
        title="Document and photo upload"
        description="Files are checked for type, size and count. An interrupted upload resumes without starting again."
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <StatePreview
        main={<UploadViews />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="File refused">
            This file type is not allowed. Choose a PDF or an image.
          </TeInlineAlert>
        }
      />
    </div>
  );
}
