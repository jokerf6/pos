import { useMemo, useState } from "react";
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

interface DataTableProps<T> {
  columns: any;
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

const PAGE_SIZE = 10;

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) => {
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map((col) => ({ ...col, visible: true }))
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const filteredData = useMemo(() => {
    return data?.filter((row) =>
      visibleColumns.some(
        (col) =>
          col.visible &&
          String(row[col.accessorKey])
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [data, visibleColumns, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  return (
    <div className="flex flex-col w-full gap-4 p-4 text-right" dir="rtl">
      {/* البحث */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="ابحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => navigate("/users/create")}>
          <span className="flex items-center gap-2">
            <Pencil size={16} />
            انشاء
          </span>
        </Button>
      </div>

      {/* الجدول */}
      <div className="overflow-auto rounded-md border">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow>
              {visibleColumns.map(
                (column, index) =>
                  column.visible && (
                    <TableHead
                      key={index}
                      className="border-r px-4 py-2 text-right"
                    >
                      {column.header}
                    </TableHead>
                  )
              )}
              <TableHead className="w-[1%] border-r  whitespace-nowrap text-center p-0">
                الإجراءات
              </TableHead>{" "}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map(
                    (column, colIndex) =>
                      column.visible && (
                        <TableCell
                          key={colIndex}
                          className="border-r px-4 py-2 text-right"
                        >
                          {row[column.accessorKey]}
                        </TableCell>
                      )
                  )}
                  {/* الأكشنات */}
                  <TableCell className="px-4 py-2 border-r  text-center whitespace-nowrap">
                    <div className="flex justify-center  items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => onEdit?.(row)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8  w-8 text-red-600"
                        onClick={() => onDelete?.(row)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
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

      {/* التحكم في الصفحات */}
      <div className="flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          السابق
        </Button>
        <span>
          الصفحة {page} من {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
