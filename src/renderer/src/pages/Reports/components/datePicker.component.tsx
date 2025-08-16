import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "components/ui/button";
import Modal from "components/common/dynamic-modal.component";
import { Calendar } from "components/ui/calender";

const DatePickerModal = ({
  date,
  onDateChange,
  placeholder,
}: {
  date: Date | null;
  onDateChange: (date: Date) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* الزرار اللي بيفتح المودال */}
      <Button
        variant="outline"
        className="w-[240px] justify-start text-right font-normal"
        dir="rtl"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="ml-2 h-4 w-4" />
        {date ? format(date, "dd MMMM yyyy", { locale: ar }) : placeholder}
      </Button>

      {/* المودال */}
      <Modal
        title="اختر التاريخ"
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <div dir="rtl" className="p-2 flex items-center justify-center">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(selectedDate: any) =>
              selectedDate && onDateChange(selectedDate)
            }
            initialFocus
            locale={ar}
            dir="rtl"
            weekStartsOn={6}
          />
        </div>
      </Modal>
    </>
  );
};

export default DatePickerModal;
