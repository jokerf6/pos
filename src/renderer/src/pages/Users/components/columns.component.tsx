import { ColumnDef } from "@tanstack/react-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "username",
    header: "الاسم",
  },
 
  {
    accessorKey: "createdAt",
    header: "تاريخ الإنشاء",
  },
];
export default columns;
