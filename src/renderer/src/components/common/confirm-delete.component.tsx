// components/common/confirm-delete.component.tsx

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string;
}

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  itemLabel,
}: ConfirmDeleteModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[400px] rounded-xl text-center"
        dir="rtl"
      >
        <DialogHeader>
          <div className="flex justify-center mb-2 text-red-600">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <DialogTitle className="text-lg text-center font-semibold">
            تأكيد الحذف
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground">
          هل أنت متأكد أنك تريد حذف{" "}
          <span className="font-bold text-red-600">
            {itemLabel || "هذا العنصر"}
          </span>
          ؟ هذا الإجراء لا يمكن التراجع عنه.
        </p>

        <DialogFooter className="mt-6 flex flex-row  w-fit justify-center gap-4">
          <Button variant="destructive" onClick={onConfirm}>
            نعم، احذف
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
