import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "../../utils/classNames";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ "aria-invalid": ariaInvalid, className, isInvalid = false, type = "text", ...props }, ref) => {
    const invalid = isInvalid || ariaInvalid === true || ariaInvalid === "true";

    return (
      <input
        {...props}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={classNames("ds-text-input", className)}
        type={type}
      />
    );
  }
);

TextInput.displayName = "TextInput";
