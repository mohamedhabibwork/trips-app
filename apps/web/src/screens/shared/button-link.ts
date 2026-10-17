import type { TeButtonSize, TeButtonVariant } from "@trips-app/ui/components/te-button";
import { cn } from "@trips-app/ui/lib/utils";

/** TeButton renders a <button>, so a router link borrows its classes to look the same. */
export function buttonLinkClass(
  variant: TeButtonVariant = "primary",
  size: TeButtonSize = "default",
): string {
  return cn("te-button", `te-button--${variant}`, size === "lg" && "te-button--lg");
}
