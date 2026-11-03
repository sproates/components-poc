import * as Primitive from "@radix-ui/react-toast";
import { X, CheckCircle2 } from "lucide-react";
import { IconButton } from "../../atoms/IconButton";
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}
export interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
  duration?: number;
  label?: string;
}
export function Toast({
  messages,
  onDismiss,
  duration = 5000,
  label = "Notifications",
}: ToastProps) {
  return (
    <Primitive.Provider duration={duration} label={label}>
      {messages.map((message) => (
        <Primitive.Root
          className="ds-toast"
          key={message.id}
          open
          onOpenChange={(open) => {
            if (!open) onDismiss(message.id);
          }}
        >
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <Primitive.Title className="ds-toast__title">
              {message.title}
            </Primitive.Title>
            {message.description && (
              <Primitive.Description>
                {message.description}
              </Primitive.Description>
            )}
          </div>
          <Primitive.Close asChild>
            <IconButton label={`Dismiss ${message.title}`}>
              <X size={16} />
            </IconButton>
          </Primitive.Close>
        </Primitive.Root>
      ))}
      <Primitive.Viewport className="ds-toast-viewport" label={label} />
    </Primitive.Provider>
  );
}
