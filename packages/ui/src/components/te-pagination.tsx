import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { t } from "@trips-app/i18n";

export interface TePaginationLabels {
  previous: string;
  next: string;
  /** Status pattern. {page} and {pageCount} are replaced with numbers. */
  current: string;
}

export const TE_PAGINATION_DEFAULT_LABELS: TePaginationLabels = {
  get previous() {
    return t("ui.tePagination.labels.previousPage");
  },
  get next() {
    return t("ui.tePagination.labels.nextPage");
  },
  get current() {
    return t("ui.tePagination.labels.pageOf");
  },
};

export function formatPageStatus(pattern: string, page: number, pageCount: number): string {
  return pattern.replaceAll("{page}", String(page)).replaceAll("{pageCount}", String(pageCount));
}

export interface TePaginationProps {
  /** One-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  labels?: Partial<TePaginationLabels>;
  className?: string;
}

export function TePagination({
  page,
  pageCount,
  onPageChange,
  labels: labelOverrides,
  className,
}: TePaginationProps) {
  const labels = { ...TE_PAGINATION_DEFAULT_LABELS, ...labelOverrides };
  const lastPage = Math.max(1, pageCount);
  const currentPage = Math.min(Math.max(1, page), lastPage);

  return (
    <nav className={cn("te-pagination", className)}>
      <TeButton
        variant="secondary"
        aria-label={labels.previous}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <TeIcon name="back" flipInRtl />
      </TeButton>
      <span className="te-pagination__status" aria-live="polite">
        {formatPageStatus(labels.current, currentPage, lastPage)}
      </span>
      <TeButton
        variant="secondary"
        aria-label={labels.next}
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <TeIcon name="arrow" flipInRtl />
      </TeButton>
    </nav>
  );
}
