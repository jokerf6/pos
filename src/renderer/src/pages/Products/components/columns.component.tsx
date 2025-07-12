import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "barcode",
    header: "الكود",
  },
  {
    accessorKey: "name",
    header: "الاسم",
  },
  {
    accessorKey: "quantity",
    header: "الكميه",
  },
  {
    accessorKey: "price",
    header: "السعر",
  },
  {
    accessorKey: "buy_price",
    header: "التكلفه",
  },
];
export default columns;
