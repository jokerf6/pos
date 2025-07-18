import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "price",
    header: "السعر",
  },
  {
    accessorKey: "reciever",
    header: "المستلم",
  },
  {
    accessorKey: "reason",
    header: "الاسم",
  },

  {
    accessorKey: "createdAt",
    header: "التاريخ",
  },
];
export default columns;
