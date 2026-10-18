import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";
import { toPendingItems, withoutItem } from "./upload-items";

const MIN_PHOTOS = 8;
const PLACEHOLDER_BASE64 = "dHJpcHMtYXBwLWZpbGU=";

function UploadViews() {
  const queryClient = useQueryClient();
  const filesQuery = useQuery(orpc.media.listFiles.queryOptions({ input: {} }));
  const uploadMutation = useMutation(
    orpc.media.uploadFile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.media.key() });
      },
    }),
  );

  const [localDocs, setLocalDocs] = useState<readonly TeFileUploadItem[]>([]);
  const [localPhotos, setLocalPhotos] = useState<readonly TeFileUploadItem[]>([]);
  const [removedDocNames, setRemovedDocNames] = useState<ReadonlySet<string>>(new Set());
  const [removedPhotoNames, setRemovedPhotoNames] = useState<ReadonlySet<string>>(new Set());

  const remoteFiles = filesQuery.data?.files ?? [];
  const remoteDocs: TeFileUploadItem[] = [];
  const remotePhotos: TeFileUploadItem[] = [];
  for (const item of remoteFiles) {
    const uploadItem: TeFileUploadItem = {
      name: item.originalFilename,
      status:
        item.status === "linked"
          ? "done"
          : item.status === "expired" || item.status === "deleted"
            ? "failed"
            : "uploading",
    };
    if (item.mimeType.startsWith("image/")) {
      remotePhotos.push(uploadItem);
    } else {
      remoteDocs.push(uploadItem);
    }
  }

  const documents = [...remoteDocs, ...localDocs].filter((d) => !removedDocNames.has(d.name));
  const photos = [...remotePhotos, ...localPhotos].filter((p) => !removedPhotoNames.has(p.name));
  const uploadedPhotos = photos.filter((file) => file.status === "done").length;

  const handleDocumentsSelected = (files: readonly File[]) => {
    const pending = toPendingItems(files);
    setLocalDocs((prev) => [...prev, ...pending]);
    for (const file of files) {
      void uploadMutation
        .mutateAsync({
          originalFilename: file.name,
          mimeType: file.type === "application/pdf" ? "application/pdf" : "image/jpeg",
          contentBase64: PLACEHOLDER_BASE64,
          purpose: "document",
        })
        .catch(() => {});
    }
  };

  const handlePhotosSelected = (files: readonly File[]) => {
    const pending = toPendingItems(files);
    setLocalPhotos((prev) => [...prev, ...pending]);
    for (const file of files) {
      void uploadMutation
        .mutateAsync({
          originalFilename: file.name,
          mimeType: file.type === "image/png" ? "image/png" : "image/jpeg",
          contentBase64: PLACEHOLDER_BASE64,
          purpose: "general",
        })
        .catch(() => {});
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <TeFileUpload
        label={t("screen.shared.scrShr16DocumentAndPhotoUpload.documents")}
        accept="image/*,application/pdf"
        multiple
        files={documents}
        onFilesSelected={handleDocumentsSelected}
        onRemove={(name) => {
          setRemovedDocNames((prev) => new Set([...prev, name]));
          setLocalDocs((prev) => withoutItem(prev, name));
        }}
        hint={t("screen.shared.scrShr16DocumentAndPhotoUpload.chooseAFileOrTake")}
      />
      <section className="flex flex-col gap-4" aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="te-h3">
          {t("screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotos")}
        </h2>
        <TeInlineAlert
          tone="info"
          title={t("screen.shared.scrShr16DocumentAndPhotoUpload.minimumCount")}
        >
          {t("screen.shared.scrShr16DocumentAndPhotoUpload.uploadProgress", {
            min: MIN_PHOTOS,
            uploaded: uploadedPhotos,
          })}
        </TeInlineAlert>
        <TeFileUpload
          label={t("screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotosLabel")}
          accept="image/*"
          multiple
          files={photos}
          onFilesSelected={handlePhotosSelected}
          onRemove={(name) => {
            setRemovedPhotoNames((prev) => new Set([...prev, name]));
            setLocalPhotos((prev) => withoutItem(prev, name));
          }}
          hint={t("screen.shared.scrShr16DocumentAndPhotoUpload.photosAreStrippedOfLocation")}
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
        title={t("screen.shared.scrShr16DocumentAndPhotoUpload.documentAndPhotoUpload")}
        description={t("screen.shared.scrShr16DocumentAndPhotoUpload.filesAreCheckedForType")}
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            {t("screen.shared.scrShr16DocumentAndPhotoUpload.back")}
          </TeButton>
        }
      />
      <StatePreview
        main={<UploadViews />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.shared.scrShr16DocumentAndPhotoUpload.fileRefused")}
          >
            {t("screen.shared.scrShr16DocumentAndPhotoUpload.thisFileTypeIsNot")}
          </TeInlineAlert>
        }
      />
    </div>
  );
}
