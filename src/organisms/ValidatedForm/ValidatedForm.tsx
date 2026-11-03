import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../atoms/Button";
import { TextInput } from "../../atoms/TextInput";
import { TextArea } from "../../atoms/TextArea";
import { FormField } from "../../molecules/FormField";

export type FormValues = Record<string, string>;
export interface FormFieldDefinition {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  required?: boolean;
  helpText?: string;
  validate?: (value: string, values: FormValues) => string | true;
  visibleWhen?: (values: FormValues) => boolean;
}
export interface ValidatedFormProps {
  fields: FormFieldDefinition[];
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void | Promise<void>;
  submitLabel?: string;
  label?: string;
}
export function ValidatedForm({
  fields,
  defaultValues = {},
  onSubmit,
  submitLabel = "Save",
  label = "Details",
}: ValidatedFormProps) {
  const id = useId();
  const [saving, setSaving] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues, shouldUnregister: true });
  const values = useWatch({ control }) as FormValues;
  return (
    <form
      className="ds-validated-form"
      aria-label={label}
      noValidate
      onSubmit={handleSubmit(async (data) => {
        clearErrors("root");
        setSaving(true);
        try {
          await onSubmit(data);
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Unable to save. Please try again.",
          });
        } finally {
          setSaving(false);
        }
      })}
    >
      {fields
        .filter((field) => !field.visibleWhen || field.visibleWhen(values))
        .map((field) => {
          const props = register(field.name, {
            required: field.required ? `${field.label} is required` : false,
            validate: field.validate,
            pattern:
              field.type === "email"
                ? {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  }
                : undefined,
          });
          return (
            <FormField
              key={field.name}
              id={`${id}-${field.name}`}
              label={field.label}
              helpText={field.helpText}
              error={errors[field.name]?.message as string | undefined}
            >
              {field.type === "textarea" ? (
                <TextArea {...props} disabled={saving} />
              ) : (
                <TextInput
                  {...props}
                  type={field.type ?? "text"}
                  disabled={saving}
                />
              )}
            </FormField>
          );
        })}
      {errors.root?.message && (
        <p role="alert" className="ds-form-field__message--error">
          {errors.root.message}
        </p>
      )}
      <div className="ds-form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
