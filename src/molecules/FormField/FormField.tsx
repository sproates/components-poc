import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { classNames } from "../../utils/classNames";

type FieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
  id?: string;
};

export interface FormFieldProps {
  children: ReactElement<FieldControlProps>;
  className?: string;
  error?: ReactNode;
  helpText?: ReactNode;
  id?: string;
  label: ReactNode;
}

export function FormField({ children, className, error, helpText, id, label }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? children.props.id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasError = Boolean(error);
  const hasMessage = hasError || Boolean(helpText);
  const childProps = children.props;

  const control = cloneElement(children, {
    "aria-describedby": [childProps["aria-describedby"], hasMessage ? messageId : undefined].filter(Boolean).join(" ") || undefined,
    "aria-invalid": hasError || childProps["aria-invalid"] || undefined,
    id: fieldId
  });

  return (
    <div className={classNames("ds-form-field", className)}>
      <label className="ds-form-field__label" htmlFor={fieldId}>
        {label}
      </label>
      {control}
      {hasMessage ? (
        <p
          className={classNames(
            "ds-form-field__message",
            hasError && "ds-form-field__message--error"
          )}
          id={messageId}
        >
          {error || helpText}
        </p>
      ) : null}
    </div>
  );
}
