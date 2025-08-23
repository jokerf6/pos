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
    accessorKey: "unitName",
    header: "الوحدات",
  },
  {
    accessorKey: "quantity",
    header: "الكميه",
  },
  {
    accessorKey: "price",
    header: "السعر",
  },
  
];
export default columns;
