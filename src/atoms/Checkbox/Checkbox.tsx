import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { classNames } from "../../utils/classNames";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, id, label, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        className={classNames("ds-checkbox", disabled && "ds-checkbox--disabled", className)}
        htmlFor={inputId}
      >
        <input
          {...props}
          ref={ref}
          className="ds-checkbox__control"
          disabled={disabled}
          id={inputId}
          type="checkbox"
        />
        {label ? <span className="ds-checkbox__label">{label}</span> : null}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
