import { Button as RootButton } from "@poc/design-system-components";
import { Button } from "@poc/design-system-components/atoms/Button";
import { Checkbox } from "@poc/design-system-components/atoms/Checkbox";
import { TextInput } from "@poc/design-system-components/atoms/TextInput";
import { FormField } from "@poc/design-system-components/molecules/FormField";
import { LoginForm } from "@poc/design-system-components/molecules/LoginForm";
import { Label } from "@poc/design-system-components/atoms/Label";
import { Badge } from "@poc/design-system-components/atoms/Badge";
import { IconButton } from "@poc/design-system-components/atoms/IconButton";
import { Spinner } from "@poc/design-system-components/atoms/Spinner";
import { Switch } from "@poc/design-system-components/atoms/Switch";
import { RadioGroup } from "@poc/design-system-components/atoms/RadioGroup";
import { TextArea } from "@poc/design-system-components/atoms/TextArea";
import { Dialog } from "@poc/design-system-components/molecules/Dialog";
import { Combobox } from "@poc/design-system-components/molecules/Combobox";
import { Tabs } from "@poc/design-system-components/molecules/Tabs";
import { Toast } from "@poc/design-system-components/molecules/Toast";
import { DataTable } from "@poc/design-system-components/organisms/DataTable";
import { ValidatedForm } from "@poc/design-system-components/organisms/ValidatedForm";

export const consumer = (
  <>
    <RootButton>Root export</RootButton>
    <Button variant="secondary">Save</Button>
    <Checkbox label="Remember" />
    <FormField label="Name">
      <TextInput />
    </FormField>
    <LoginForm
      onSubmit={(credentials) => {
        const email: string = credentials.email;
        void email;
      }}
    />
    <Label htmlFor="notes">Notes</Label>
    <TextArea id="notes" />
    <Badge tone="success">Active</Badge>
    <IconButton label="Edit">E</IconButton>
    <Spinner />
    <Switch label="Enabled" />
    <RadioGroup
      label="Access"
      options={[{ value: "reader", label: "Reader" }]}
    />
    <Dialog title="Example" isOpen={false} onOpenChange={() => undefined}>
      Content
    </Dialog>
    <Combobox label="Team" options={[{ id: "design", label: "Design" }]} />
    <Tabs
      label="Views"
      items={[{ id: "main", label: "Main", content: "Content" }]}
    />
    <Toast messages={[]} onDismiss={() => undefined} />
    <DataTable
      label="Example"
      data={[{ id: "1", name: "Example" }]}
      columns={[{ id: "name", label: "Name", value: (row) => row.name }]}
      getRowId={(row) => row.id}
    />
    <ValidatedForm
      fields={[{ name: "email", label: "Email" }]}
      onSubmit={(values) => {
        const email: string = values.email;
        void email;
      }}
    />
  </>
);

// @ts-expect-error: subpath imports must retain prop types, not silently become any.
export const invalid = <Button variant="not-a-variant" />;
