import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";

/** Rows for files the user just picked. The real upload runs in the app, so the rows stay pending here. */
export function toPendingItems(files: readonly File[]): TeFileUploadItem[] {
  return files.map((file): TeFileUploadItem => ({
    name: file.name,
    status: "pending",
  }));
}

/** A new list without the named file, so state updates stay immutable. */
export function withoutItem(items: readonly TeFileUploadItem[], name: string): TeFileUploadItem[] {
  return items.filter((item) => item.name !== name);
}
