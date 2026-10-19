// SCR-SHR-16 Document and photo upload: pick photos, each uploads with its own status, and the
// step continues once at least eight are complete and none is still uploading.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { DropZone, buttonClass } from "@/components/kit/controls";
import { PhoneColumn } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

import { SignInRequired } from "./sign-in-required";

const MIN_PHOTOS = 8;
const MB = 1024 * 1024;
const MAX_PHOTO_BYTES = 15 * MB;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"] as const;

type UploadStatus = "uploading" | "done" | "tooLarge" | "wrongType" | "failed";

interface UploadRow {
  name: string;
  status: UploadStatus;
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

function acceptedType(type: string): type is (typeof ACCEPTED_TYPES)[number] {
  return (ACCEPTED_TYPES as readonly string[]).includes(type);
}

export function ScrShr16DocumentAndPhotoUpload() {
  const { t, status } = useAuth();
  const queryClient = useQueryClient();
  const signedIn = status === "authenticated";
  const filesQuery = useQuery({
    ...orpc.media.listFiles.queryOptions({ input: {} }),
    enabled: signedIn,
  });
  const uploadMutation = useMutation(
    orpc.media.uploadFile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.media.key() });
      },
    }),
  );
  const [rows, setRows] = useState<readonly UploadRow[]>([]);

  const setStatus = (name: string, status: UploadStatus) =>
    setRows((current) => current.map((row) => (row.name === name ? { ...row, status } : row)));

  async function upload(file: File) {
    if (!acceptedType(file.type)) return setStatus(file.name, "wrongType");
    if (file.size > MAX_PHOTO_BYTES) return setStatus(file.name, "tooLarge");
    try {
      await uploadMutation.mutateAsync({
        originalFilename: file.name,
        mimeType: file.type,
        contentBase64: await readBase64(file),
        purpose: "portfolio_photo",
      });
      setStatus(file.name, "done");
    } catch {
      setStatus(file.name, "failed");
    }
  }

  function handleFiles(files: readonly File[]) {
    const known = new Set(rows.map((row) => row.name));
    const fresh = files.filter((file) => !known.has(file.name));
    setRows((current) => [
      ...current,
      ...fresh.map((file): UploadRow => ({ name: file.name, status: "uploading" })),
    ]);
    for (const file of fresh) void upload(file);
  }

  const savedImages = (filesQuery.data?.files ?? []).filter(
    (file) => file.mimeType.startsWith("image/") && file.status === "linked",
  ).length;
  const complete = savedImages + rows.filter((row) => row.status === "done").length;
  const uploading = rows.some((row) => row.status === "uploading");
  const ready = complete >= MIN_PHOTOS && !uploading;

  return (
    <PhoneColumn className="gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-[22px] leading-[30px] font-bold">
          {t("screen.shared.upload.title")}
        </h1>
        <span className="text-sm font-semibold">
          {t("screen.shared.upload.count", { count: complete, required: MIN_PHOTOS })}
        </span>
      </div>
      {signedIn ? null : <SignInRequired message={t("screen.shared.upload.signIn")} />}
      <DropZone
        centered
        disabled={!signedIn}
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        title={t("screen.shared.upload.choose")}
        hint={t("screen.shared.upload.hint")}
        onFiles={handleFiles}
      />
      {rows.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {rows.map((row) => (
            <UploadItem
              key={row.name}
              row={row}
              onRemove={() =>
                setRows((current) => current.filter((item) => item.name !== row.name))
              }
            />
          ))}
        </ul>
      ) : null}
      <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
        {t("screen.shared.upload.privacy")}
      </p>
      {ready ? (
        <Link to="/" className={cn(buttonClass("primary"), "mt-auto")}>
          {t("screen.shared.upload.continue")}
        </Link>
      ) : (
        <button type="button" disabled className={cn(buttonClass("primary"), "mt-auto")}>
          {t("screen.shared.upload.waiting")}
        </button>
      )}
    </PhoneColumn>
  );
}

function UploadItem({ row, onRemove }: { row: UploadRow; onRemove: () => void }) {
  const { t } = useAuth();
  const failed = row.status === "tooLarge" || row.status === "wrongType" || row.status === "failed";
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-[var(--te-radius-md)] p-3",
        failed
          ? "bg-[var(--te-danger-soft)] text-[var(--te-danger)]"
          : "bg-[var(--te-surface-raised)] shadow-[var(--te-card-shadow)]",
      )}
    >
      <span
        className={cn(
          "size-12 flex-none rounded-[var(--te-radius-sm)]",
          failed ? "bg-[var(--te-surface-raised)]" : "bg-[var(--te-hairline)]",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        <span dir="auto" className="truncate font-semibold text-[var(--te-ink)]">
          {row.name}
        </span>
        {row.status === "uploading" ? (
          <>
            <span
              role="progressbar"
              aria-label={t("screen.shared.upload.uploadingFile", { name: row.name })}
              className="block h-1.5 overflow-hidden rounded-[var(--te-radius-pill)] bg-[var(--te-hairline)]"
            >
              <span className="block h-full w-2/5 animate-pulse bg-[var(--te-primary)]" />
            </span>
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.shared.upload.uploading")}
            </span>
          </>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[13px] font-semibold",
              failed ? "" : "text-[var(--te-success)]",
            )}
          >
            <TeIcon name={failed ? "alert" : "check"} className="size-4" />
            {t(`screen.shared.upload.status.${row.status}`)}
          </span>
        )}
      </span>
      <button
        type="button"
        aria-label={t("screen.public.common.documentDrop.removeFile", { name: row.name })}
        onClick={onRemove}
        className="min-h-11 min-w-11 cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[var(--te-ink)]"
      >
        {row.status === "uploading"
          ? t("screen.shared.upload.cancel")
          : t("screen.public.common.documentDrop.remove")}
      </button>
    </li>
  );
}
