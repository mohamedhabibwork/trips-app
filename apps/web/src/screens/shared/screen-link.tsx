import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ScreenLinkProps {
  surface: "public" | "shared";
  slug: string;
  className?: string;
  children: ReactNode;
}

/** Links to another screen of this catalogue, at /screens/<surface>/<slug>. */
export function ScreenLink({ surface, slug, className = "te-link", children }: ScreenLinkProps) {
  return (
    <Link to="/screens/$surface/$slug" params={{ surface, slug }} className={className}>
      {children}
    </Link>
  );
}
