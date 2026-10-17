import { cn } from "@trips-app/ui/lib/utils";
import type { ComponentProps } from "react";

/** One `primary` per view. `destructive` for irreversible actions. `lg` for hero CTAs. */
export const TE_BUTTON_VARIANTS = ["primary", "secondary", "ghost", "destructive"] as const;
export const TE_BUTTON_SIZES = ["default", "lg"] as const;

export type TeButtonVariant = (typeof TE_BUTTON_VARIANTS)[number];
export type TeButtonSize = (typeof TE_BUTTON_SIZES)[number];

export interface TeButtonProps extends ComponentProps<"button"> {
  variant?: TeButtonVariant;
  size?: TeButtonSize;
}

export function TeButton({
  variant = "primary",
  size = "default",
  type = "button",
  className,
  ...props
}: TeButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        "te-button",
        `te-button--${variant}`,
        size === "lg" && "te-button--lg",
        className,
      )}
    />
  );
}
