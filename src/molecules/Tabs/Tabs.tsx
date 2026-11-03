import {
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanel,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import type { ReactNode } from "react";
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}
export interface TabsProps extends Omit<
  AriaTabsProps,
  "children" | "className"
> {
  label: string;
  items: TabItem[];
  keepMounted?: boolean;
}
export function Tabs({
  label,
  items,
  keepMounted = false,
  ...props
}: TabsProps) {
  return (
    <AriaTabs {...props} className="ds-tabs">
      <TabList aria-label={label} className="ds-tab-list">
        {items.map((item) => (
          <Tab
            className="ds-tab"
            id={item.id}
            key={item.id}
            isDisabled={item.disabled}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      {items.map((item) => (
        <TabPanel
          className="ds-tab-panel"
          id={item.id}
          key={item.id}
          shouldForceMount={keepMounted}
        >
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
