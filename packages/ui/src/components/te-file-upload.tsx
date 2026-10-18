import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { useId } from "react";
import { t } from "@trips-app/i18n";

export const TE_FILE_STATUSES = ["pending", "uploading", "done", "failed"] as const;
export type TeFileStatus = (typeof TE_FILE_STATUSES)[number];

export interface TeFileUploadItem {
  name: string;
  status: TeFileStatus;
  /** Reason for a failure, or a note such as "Too large". */
  message?: string;
}

export interface TeFileStatusPresentation {
  icon: TeIconName;
  label: string;
}

/** Status is always word plus icon. */
export const TE_FILE_STATUS_PRESENTATION: Record<TeFileStatus, TeFileStatusPresentation> = {
  pending: {
    icon: "clock",
    get label() {
      return t("ui.teFileUpload.labels.waiting");
    },
  },
  uploading: {
    icon: "refresh",
    get label() {
      return t("ui.teFileUpload.labels.uploading");
    },
  },
  done: {
    icon: "check",
    get label() {
      return t("ui.teFileUpload.labels.uploaded");
    },
  },
  failed: {
    icon: "alert",
    get label() {
      return t("ui.teFileUpload.labels.failed");
    },
  },
};

export interface TeFileUploadProps {
  /** Visible heading of the upload area. Names the file input. */
  label: string;
  browseLabel?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  files: readonly TeFileUploadItem[];
  onRemove?: (name: string) => void;
  removeLabel?: string;
  hint?: string;
  /** Overrides the English status words. */
  statusLabels?: Partial<Record<TeFileStatus, string>>;
  className?: string;
}

export function TeFileUpload({
  label,
  browseLabel = "Choose files",
  accept,
  multiple = false,
  onFilesSelected,
  files,
  onRemove,
  removeLabel = "Remove",
  hint,
  statusLabels,
  className,
}: TeFileUploadProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  return (
    <div className={cn("te-file-upload", className)}>
      <label className="te-file-upload__area">
        <TeIcon name="upload" />
        <span className="te-file-upload__label">{label}</span>
        <span className="te-file-upload__browse">{browseLabel}</span>
        <input
          id={inputId}
          type="file"
          className="te-file-upload__input"
          accept={accept}
          multiple={multiple}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => {
            const selected = Array.from(event.currentTarget.files ?? []);
            if (selected.length > 0) onFilesSelected(selected);
          }}
        />
      </label>
      {hint ? (
        <p id={hintId} className="te-file-upload__hint">
          {hint}
        </p>
      ) : null}
      {files.length > 0 ? (
        <ul className="te-file-upload__list">
          {files.map((file) => {
            const presentation = TE_FILE_STATUS_PRESENTATION[file.status];
            const statusWord = statusLabels?.[file.status] ?? presentation.label;
            return (
              <li
                key={file.name}
                className={cn("te-file-upload__item", `te-file-upload__item--${file.status}`)}
              >
                <span className="te-file-upload__name">{file.name}</span>
                <span className="te-file-upload__status">
                  <TeIcon name={presentation.icon} />
                  <span>{statusWord}</span>
                </span>
                {onRemove ? (
                  <button
                    type="button"
                    className="te-file-upload__remove"
                    aria-label={`${removeLabel} ${file.name}`}
                    onClick={() => onRemove(file.name)}
                  >
                    <TeIcon name="close" />
                  </button>
                ) : null}
                {file.message ? <p className="te-file-upload__message">{file.message}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
