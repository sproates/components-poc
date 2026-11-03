import {
  ComboBox as AriaComboBox,
  Label,
  Input,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  Virtualizer,
  ListLayout,
  type ComboBoxProps,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";
export interface ComboboxOption {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface ComboboxProps extends Omit<
  ComboBoxProps<ComboboxOption>,
  "children" | "items" | "defaultItems" | "className"
> {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  virtualized?: boolean;
}
export function Combobox({
  label,
  options,
  placeholder = "Select an option",
  emptyMessage = "No matching options",
  virtualized = options.length > 100,
  ...props
}: ComboboxProps) {
  const list = (
    <ListBox
      className="ds-listbox"
      style={virtualized ? { height: 256, padding: 0 } : undefined}
      renderEmptyState={() => <div className="ds-empty">{emptyMessage}</div>}
    >
      {(item: ComboboxOption) => (
        <ListBoxItem id={item.id} textValue={item.label} className="ds-option">
          {item.label}
        </ListBoxItem>
      )}
    </ListBox>
  );
  return (
    <AriaComboBox
      {...props}
      defaultItems={options}
      disabledKeys={options.filter((o) => o.disabled).map((o) => o.id)}
      allowsEmptyCollection
      className="ds-combobox"
    >
      <Label className="ds-label">{label}</Label>
      <div className="ds-combobox__input">
        <Input className="ds-text-input" placeholder={placeholder} />
        <Button className="ds-icon-button" aria-label={`Show ${label} options`}>
          <ChevronDown size={18} />
        </Button>
      </div>
      <Popover className="ds-popover">
        {virtualized ? (
          <Virtualizer layout={ListLayout} layoutOptions={{ rowSize: 40 }}>
            {list}
          </Virtualizer>
        ) : (
          list
        )}
      </Popover>
    </AriaComboBox>
  );
}
