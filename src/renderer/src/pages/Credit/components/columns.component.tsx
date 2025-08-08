import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
    {
    accessorKey: "reason",
    header: "الاسم",
  },
  {
    accessorKey: "price",
    header: "السعر",
  },
  {
    accessorKey: "reciever",
    header: "المستلم",
  },


  {
    accessorKey: "createdAt",
    header: "التاريخ",
  },
];
export default columns;
