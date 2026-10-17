import { cn } from "@trips-app/ui/lib/utils";
import type { ComponentProps } from "react";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export interface TeChipProps extends ComponentProps<"button"> {
  selected?: boolean;
}

/** Selected state uses accent fill and a check icon, so it never relies on colour alone. */
export function TeChip({
  selected = false,
  type = "button",
  className,
  children,
  ...props
}: TeChipProps) {
  return (
    <button {...props} type={type} aria-pressed={selected} className={cn("te-chip", className)}>
      {selected ? <TeIcon name="check" /> : null}
      {children}
    </button>
  );
}
