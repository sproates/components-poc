import type { ReactNode } from "react";
import {
  ModalOverlay,
  Modal,
  Dialog as AriaDialog,
  Heading,
} from "react-aria-components";
import { X } from "lucide-react";
import { IconButton } from "../../atoms/IconButton";

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}
export function Dialog({
  title,
  children,
  isDismissable = true,
  ...props
}: DialogProps) {
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      className="ds-modal-overlay"
    >
      <Modal className="ds-modal">
        <AriaDialog className="ds-dialog">
          {({ close }) => (
            <>
              <header className="ds-dialog__header">
                <Heading slot="title">{title}</Heading>
                <IconButton label="Close dialog" onClick={close}>
                  <X size={18} />
                </IconButton>
              </header>
              {children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
