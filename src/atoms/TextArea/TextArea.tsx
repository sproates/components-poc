import { forwardRef, type TextareaHTMLAttributes } from "react";
import { classNames } from "../../utils/classNames";
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
}
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, isInvalid, rows = 4, ...props }, ref) => (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      aria-invalid={isInvalid || props["aria-invalid"]}
      className={classNames("ds-text-input", "ds-text-area", className)}
    />
  ),
);
TextArea.displayName = "TextArea";
