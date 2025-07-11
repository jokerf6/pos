import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "الاسم",
  },
  {
    accessorKey: "image",
    header: "الصورة",
  },
];
export default columns;
