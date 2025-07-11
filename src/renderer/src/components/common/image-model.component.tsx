// components/common/confirm-delete.component.tsx

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmImageModalProps {
  open: boolean;
  onClose: () => void;
  image: string;
}

const ConfirmImageModal = ({
  open,
  image,
  onClose,
}: ConfirmImageModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[400px] rounded-xl text-center"
        dir="rtl"
      >
        <img
          src={image}
          alt="Preview"
          className="w-full h-auto rounded-lg mb-4"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmImageModal;
