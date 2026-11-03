import type { LabelHTMLAttributes } from "react";
import { classNames } from "../../utils/classNames";
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}
export function Label({ required, children, className, ...props }: LabelProps) {
  return (
    <label {...props} className={classNames("ds-label", className)}>
      {children}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
}
