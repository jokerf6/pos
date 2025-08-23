import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError } from "../../../components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import { getBranches, searchBranches } from "store/slices/branchesSlice";

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  visible?: boolean;
}

interface DataTableProps<T> {
  columns: any;
  data: T[];
  dataTotal: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

const PAGE_SIZE = 10;

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  dataTotal,
  onEdit,
  onDelete,
}: DataTableProps<T>) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [visibleColumns] = useState(() =>
    columns.map((col: Column<T>) => ({
      ...col,
      visible: col.visible !== false,
    }))
  );

  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [currentData, setCurrentData] = useState<T[]>(data || []);
  const { user } = useSelector((state: any) => state.auth);
  useEffect(() => {
    setTotal(dataTotal || 0);
    setCurrentData(data);
  }, [data, dataTotal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        e.preventDefault();
        navigate("/units/create");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  // useEffect(() => {
  //   setPage(1);
  // }, [search]);

  

 

  const filteredData = useMemo(() => {
    if (!search) return currentData;
    return currentData?.filter((row) =>
      visibleColumns.some(
        (col: Column<T>) =>
          col.visible &&
          String(row[col.accessorKey] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [search, currentData, visibleColumns]);


  return (
    <div className="flex flex-col w-full gap-4 p-4 text-right" dir="rtl">
      {/* شريط البحث والأزرار */}
      <div className="flex items-center justify-between gap-4">
      
        {(user.role === "admin" || user?.permissions?.includes("units.create")) && <Button onClick={() => navigate("/units/create")}>
          <span className="flex items-center gap-2">
            <Pencil size={16} />
            إنشاء
          </span>
        </Button>}
      </div>

      {/* جدول البيانات */}
      <div className="overflow-auto rounded-md border">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow>
              {visibleColumns.map(
                (column: Column<T>, index: number) =>
                  column.visible && (
                    <TableHead
                      key={index}
                      className="border-r px-4 py-2 text-right"
                    >
                      {column.header}
                    </TableHead>
                  )
              )}
           {(user.role === "admin" ||
                    user?.permissions?.includes("units.delete") ||
                    user?.permissions?.includes("units.edit")) &&   <TableHead className="w-[1%] border-r text-center p-0">
                الإجراءات
              </TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map(
                    (column: Column<T>, colIndex: number) =>
                      column.visible && (
                        <TableCell
                          key={colIndex}
                          className="border-r px-4 py-2 text-right"
                        >
                          {row[column.accessorKey]}
                        </TableCell>
                      )
                  )}
                  {(user.role === "admin" ||
                   ( user?.permissions?.includes("units.delete") &&
                    user?.permissions?.includes("units.delete"))) && (
                    <TableCell className="px-4 py-2 border-r text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1">
                        {(user.role === "admin" ||
                          user?.permissions?.includes("units.delete")) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => onDelete?.(row)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  className="text-center h-24"
                >
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

   
    </div>
  );
};

export default DataTable;
