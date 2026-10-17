import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeLink } from "@trips-app/ui/components/te-link";
import type { ReactNode } from "react";

export interface TePageHeaderBreadcrumb {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

export interface TePageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: readonly TePageHeaderBreadcrumb[];
  breadcrumbLabel?: string;
  className?: string;
}

/** Page title block. Actions wrap under the text at phone width. */
export function TePageHeader({
  title,
  description,
  actions,
  breadcrumbs = [],
  breadcrumbLabel = "Breadcrumb",
  className,
}: TePageHeaderProps) {
  return (
    <header className={cn("te-page-header", className)}>
      {breadcrumbs.length > 0 ? (
        <nav aria-label={breadcrumbLabel} className="te-page-header__breadcrumbs">
          <ol className="te-page-header__crumbs">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${index}-${crumb.label}`} className="te-page-header__crumb">
                  {index > 0 ? (
                    <TeIcon name="arrow" flipInRtl className="te-page-header__separator" />
                  ) : null}
                  {crumb.href && !isLast ? (
                    <TeLink href={crumb.href}>{crumb.label}</TeLink>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
      <div className="te-page-header__row">
        <div className="te-page-header__text">
          <h1 className="te-page-header__title">{title}</h1>
          {description ? <p className="te-page-header__description">{description}</p> : null}
        </div>
        {actions ? <div className="te-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
