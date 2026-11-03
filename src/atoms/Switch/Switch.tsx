import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import type { ReactNode } from "react";
export interface SwitchProps extends Omit<
  AriaSwitchProps,
  "children" | "className"
> {
  label: ReactNode;
}
export function Switch({ label, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className="ds-switch">
      <span className="ds-switch__track" aria-hidden="true">
        <span />
      </span>
      {label}
    </AriaSwitch>
  );
}
