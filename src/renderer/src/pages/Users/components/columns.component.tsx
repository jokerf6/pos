import { ColumnDef } from "@tanstack/react-table";

export type User = {
  id: string;
  username: string;
  role: string;
  permissions: string[];
  createdAt: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "اسم المستخدم",
  },
  {
    accessorKey: "role",
    header: "الدور",
  },
  {
    accessorKey: "permissions",
    header: "الصلاحيات",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      return permissions.length > 0 ? permissions.join(", ") : "لا توجد صلاحيات";
    },
  },
  {
    accessorKey: "createdAt",
    header: "تاريخ الإنشاء",
  },
];
export default columns;


