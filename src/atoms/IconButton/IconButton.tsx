import { forwardRef, type ButtonHTMLAttributes } from "react";
import { classNames } from "../../utils/classNames";
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, type = "button", ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={classNames("ds-icon-button", className)}
    />
  ),
);
IconButton.displayName = "IconButton";
