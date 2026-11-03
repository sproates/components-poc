import {
  RadioGroup as AriaRadioGroup,
  Radio,
  Label,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface RadioGroupProps extends Omit<
  AriaRadioGroupProps,
  "children" | "className"
> {
  label: string;
  options: RadioOption[];
}
export function RadioGroup({ label, options, ...props }: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className="ds-radio-group">
      <Label className="ds-label">{label}</Label>
      <div className="ds-radio-options">
        {options.map((option) => (
          <Radio
            className="ds-radio"
            key={option.value}
            value={option.value}
            isDisabled={option.disabled}
          >
            <span className="ds-radio__indicator" aria-hidden="true" />
            {option.label}
          </Radio>
        ))}
      </div>
    </AriaRadioGroup>
  );
}
