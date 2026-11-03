import type { HTMLAttributes } from "react";
import { classNames } from "../../utils/classNames";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger";
}
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={classNames("ds-badge", `ds-badge--${tone}`, className)}
    />
  );
}
