import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";
import type { ComponentProps } from "react";

export interface TeLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer" and an announced "(opens in a new tab)". */
  external?: boolean;
}

const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function TeLink({ href, external = false, className, children, ...props }: TeLinkProps) {
  return (
    <a
      {...props}
      {...(external ? EXTERNAL_LINK_PROPS : undefined)}
      href={href}
      className={cn("te-link", className)}
    >
      {children}
      {external ? (
        <span className="te-visually-hidden"> {t("ui.teLink.opensInANewTab")}</span>
      ) : null}
    </a>
  );
}
