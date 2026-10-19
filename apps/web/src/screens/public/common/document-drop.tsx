// A dashed document area for the application forms (SCR-PUB-04, 06, 18). The picked files are
// listed under the hint; each can be removed before submitting. The files are uploaded when the
// form is submitted (application-documents.ts).
import { TeIcon } from "@trips-app/ui/components/te-icon";

import { useAuth } from "@/auth/auth-context";
import { DropZone } from "@/components/kit/controls";

import { applicationMimeType } from "./application-documents";

export const DOCUMENT_ACCEPT = "image/*,application/pdf";

interface DocumentDropProps {
  title: string;
  hint: string;
  files: readonly File[];
  onChange: (files: readonly File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export function DocumentDrop({
  title,
  hint,
  files,
  onChange,
  multiple = false,
  disabled = false,
}: DocumentDropProps) {
  const { t } = useAuth();
  return (
    <div className="flex flex-col gap-2">
      <DropZone
        title={title}
        hint={hint}
        accept={DOCUMENT_ACCEPT}
        multiple={multiple}
        disabled={disabled}
        onFiles={(picked) => {
          // Unsupported types are dropped here; the server checks type and size again.
          const accepted = picked.filter((file) => applicationMimeType(file) !== null);
          onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
        }}
        status={
          files.length > 0 ? (
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--te-success)]">
              <TeIcon name="check" className="size-4" />
              {t("screen.public.common.documentDrop.added", { count: files.length })}
            </span>
          ) : null
        }
      />
      {files.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 text-[13px] text-[var(--te-ink-muted)]"
            >
              <span dir="auto" className="min-w-0 truncate">
                {file.name}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, at) => at !== index))}
                aria-label={t("screen.public.common.documentDrop.removeFile", { name: file.name })}
                className="min-h-11 min-w-11 cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[var(--te-ink)]"
              >
                {t("screen.public.common.documentDrop.remove")}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
