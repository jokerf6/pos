import { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { AlertTriangle } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  title?: string;
  message?: string;
  children?: ReactNode;
}

const Modal = ({
  open,
  onClose,
  onConfirm,
  itemLabel,
  confirmLabel = "نعم، احذف",
  cancelLabel = "إلغاء",
  title = "تأكيد الحذف",
  message,
  children,
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[400px] rounded-xl text-center"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-center font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        {children ? (
          children
        ) : (
          <p className="text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: message }}
          />
        )}

        <DialogFooter className="mt-6 flex flex-row w-fit justify-center gap-4">
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
