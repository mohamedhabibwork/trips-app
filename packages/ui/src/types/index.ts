// Shared TypeScript interfaces and types for @trips-app/ui.
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import type { ToasterProps } from "sonner";

import type { buttonVariants } from "../components/button";

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;
export type UiToasterProps = ToasterProps;
export type { ToasterProps } from "sonner";
