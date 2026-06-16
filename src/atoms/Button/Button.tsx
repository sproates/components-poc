import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { classNames } from "../../utils/classNames";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      endIcon,
      fullWidth = false,
      isLoading = false,
      size = "medium",
      startIcon,
      type = "button",
      variant = "primary",
      ...props
    },
    ref
  ) => {
    return (
      <button
        {...props}
        ref={ref}
        className={classNames(
          "ds-button",
          `ds-button--${variant}`,
          `ds-button--${size}`,
          fullWidth && "ds-button--full",
          className
        )}
        data-loading={isLoading}
        disabled={disabled || isLoading}
        type={type}
      >
        {isLoading ? <span aria-hidden="true" className="ds-spinner" /> : startIcon}
        <span>{children}</span>
        {endIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
