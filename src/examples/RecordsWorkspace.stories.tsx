import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Pencil, Users } from "lucide-react";
import {
  Label,
  Badge,
  IconButton,
  Spinner,
  TextInput,
  Switch,
  RadioGroup,
} from "../atoms";
import { Dialog, Combobox, Tabs, Toast, type ToastMessage } from "../molecules";
import { DataTable, ValidatedForm, type DataColumn } from "../organisms";

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  status: string;
  access: string;
  notes: string;
}
const names = [
  "Alex Morgan",
  "Bea Jones",
  "Casey Williams",
  "Drew Patel",
  "Eden Taylor",
  "Frankie Chen",
  "Harper Smith",
  "Jamie Davis",
];
const initialMembers: Member[] = Array.from({ length: 28 }, (_, i) => ({
  id: `member-${i + 1}`,
  name: `${names[i % names.length]}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""}`,
  email: `member${i + 1}@example.com`,
  team: ["Design", "Engineering", "Operations"][i % 3],
  status: i % 5 === 4 ? "Invited" : "Active",
  access: "viewer",
  notes: "",
}));
function RecordsWorkspace() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [access, setAccess] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const filtered = members.filter(
    (member) =>
      (!team || member.team === team) &&
      (!activeOnly || member.status === "Active") &&
      `${member.name} ${member.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const columns: DataColumn<Member>[] = [
    {
      id: "name",
      label: "Member",
      value: (row) => row.name,
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <div style={{ color: "#586477", fontSize: 12 }}>{row.email}</div>
        </div>
      ),
    },
    { id: "team", label: "Team", value: (row) => row.team },
    { id: "access", label: "Access", value: (row) => row.access },
    {
      id: "status",
      label: "Status",
      value: (row) => row.status,
      render: (row) => (
        <Badge tone={row.status === "Active" ? "success" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      value: (row) => row.id,
      sortable: false,
      render: (row) => (
        <IconButton
          label={`Edit ${row.name}`}
          onClick={() => {
            setEditing(row);
            setAccess(row.access);
          }}
        >
          <Pencil size={16} />
        </IconButton>
      ),
    },
  ];
  return (
    <main className="ds-workspace">
      <header>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#147b5f",
              fontSize: 13,
            }}
          >
            <Users size={18} />
            DIRECTORY
          </div>
          <h1>Members</h1>
          <p>People, teams and access</p>
        </div>
        <Badge>{members.length} members</Badge>
        {saving && <Spinner label="Saving member" />}
      </header>
      <Tabs
        label="Directory views"
        items={[
          {
            id: "members",
            label: "Members",
            content: (
              <>
                <div className="ds-workspace-toolbar">
                  <div>
                    <Label htmlFor="member-search">Search members</Label>
                    <TextInput
                      id="member-search"
                      placeholder="Name or email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Combobox
                    label="Team"
                    options={["Design", "Engineering", "Operations"].map(
                      (label) => ({ id: label, label }),
                    )}
                    selectedKey={team}
                    onSelectionChange={(key) =>
                      setTeam(key === null ? null : String(key))
                    }
                  />
                  <Switch
                    label="Active only"
                    isSelected={activeOnly}
                    onChange={setActiveOnly}
                  />
                </div>
                <DataTable
                  label="Member directory"
                  data={filtered}
                  columns={columns}
                  getRowId={(row) => row.id}
                  selectable
                />
              </>
            ),
          },
          {
            id: "activity",
            label: "Activity",
            content: activity.length ? (
              <ul>
                {activity.map((entry, i) => (
                  <li key={i}>{entry}</li>
                ))}
              </ul>
            ) : (
              <p>No recent changes</p>
            ),
          },
        ]}
      />
      <Dialog
        title="Edit member"
        isOpen={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open && !saving) setEditing(null);
        }}
        isDismissable={!saving}
        isKeyboardDismissDisabled={saving}
      >
        {editing && (
          <>
            <RadioGroup
              label="Access level"
              orientation="horizontal"
              value={access}
              onChange={setAccess}
              isDisabled={saving}
              options={[
                { value: "viewer", label: "Viewer" },
                { value: "editor", label: "Editor" },
              ]}
            />
            <div style={{ marginTop: 20 }}>
              <ValidatedForm
                key={editing.id}
                label="Member details"
                submitLabel="Save member"
                fields={[
                  { name: "name", label: "Name", required: true },
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                  },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                defaultValues={{
                  name: editing.name,
                  email: editing.email,
                  notes: editing.notes,
                }}
                onSubmit={async (values) => {
                  setSaving(true);
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 250));
                    setMembers((items) =>
                      items.map((member) =>
                        member.id === editing.id
                          ? {
                              ...member,
                              name: values.name,
                              email: values.email,
                              notes: values.notes,
                              access,
                            }
                          : member,
                      ),
                    );
                    setActivity((items) => [
                      `Updated ${values.name}`,
                      ...items,
                    ]);
                    setMessages((items) => [
                      ...items,
                      {
                        id: crypto.randomUUID(),
                        title: "Member updated",
                        description: `${values.name} has been saved.`,
                      },
                    ]);
                    setEditing(null);
                  } finally {
                    setSaving(false);
                  }
                }}
              />
            </div>
          </>
        )}
      </Dialog>
      <Toast
        messages={messages}
        onDismiss={(id) =>
          setMessages((items) => items.filter((message) => message.id !== id))
        }
      />
    </main>
  );
}
const meta = {
  title: "Examples/Records Workspace",
  component: RecordsWorkspace,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RecordsWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EditMemberJourney: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Search narrows the real table", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Search members" }),
        "Alex Morgan",
      );
      await expect(canvas.getByRole("table")).not.toHaveTextContent(
        "Bea Jones",
      );
    });
    await step(
      "Edit with validation inside the focus-trapped dialog",
      async () => {
        await userEvent.click(
          canvas.getByRole("button", { name: "Edit Alex Morgan" }),
        );
        const dialog = within(
          await body.findByRole("dialog", { name: "Edit member" }),
        );
        await userEvent.clear(dialog.getByLabelText("Name"));
        await userEvent.click(
          dialog.getByRole("button", { name: "Save member" }),
        );
        await expect(await dialog.findByText("Name is required")).toBeVisible();
        await userEvent.type(
          dialog.getByLabelText("Name"),
          "Alex Morgan Updated",
        );
        await userEvent.click(dialog.getByRole("radio", { name: "Editor" }));
        await userEvent.click(
          dialog.getByRole("button", { name: "Save member" }),
        );
        await waitFor(() =>
          expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
        );
      },
    );
    await step(
      "Table, notification and activity reflect the same change",
      async () => {
        await expect(canvas.getByRole("table")).toHaveTextContent(
          "Alex Morgan Updated",
        );
        await expect(body.getByText("Member updated")).toBeVisible();
        await userEvent.click(canvas.getByRole("tab", { name: "Activity" }));
        await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
          "Updated Alex Morgan Updated",
        );
        await userEvent.click(
          body.getByRole("button", { name: "Dismiss Member updated" }),
        );
      },
    );
  },
};
