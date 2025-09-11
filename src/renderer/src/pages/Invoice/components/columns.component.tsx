import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "paymentType",
    header: "نوع الفاتورة",
  },
  {
    accessorKey: "products_total",
    header: "عدد المنتجات",
  },
  {
    accessorKey: "discount",
    header: "الخصم",
  },
  {
    accessorKey: "totalAfterDiscount",
    header: "السعر بعد الخصم",
  },
  {
    accessorKey: "created_at",
    header: "تاريخ الفاتورة",
  },
];
export default columns;
