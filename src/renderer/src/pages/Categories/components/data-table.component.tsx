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
import {
  getCategories,
  searchCategories,
} from "../../../store/slices/categoriesSlice"; // Adjust the import path as necessary
import { showImageModal } from "../../../store/slices/imageModal";

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

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map((col: any) => ({ ...col, visible: col.visible !== false }))
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentData, setCurrentData] = useState<T[]>(data || []);

  useEffect(() => {
    setTotal(dataTotal || 0);
    setCurrentData(data);
  }, [data]);

  // useEffect(() => {
  //   setPage(1);
  // }, [search]);

  const handleImage = (image: string) => {
    dispatch(showImageModal(image));
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    try {
      const result = await dispatch(searchCategories(value) as any);
      if (!result.error) {
        const formatedCategories = result?.payload?.categories?.map(
          (item: any) => ({
            ...item,
            created_at: item.created_at?.toString(), // أو `.toISOString()`
          })
        );
        setCurrentData(formatedCategories || []);
      } else {
        showError(result?.payload || "حدث خطأ في البحث");
      }
    } catch {
      showError("فشل الاتصال بالخادم");
    }
  };

  const handlePage = async (page: number) => {
    setPage((prev) => page);

    try {
      const result = await dispatch(getCategories() as any);
      if (!result.error) {
        const formatedCategories = result?.payload?.categories?.map(
          (item: any) => ({
            ...item,
          })
        );
        setCurrentData(formatedCategories || []);
      } else {
        showError(result?.payload || "حدث خطأ في البحث");
      }
    } catch {
      showError("فشل الاتصال بالخادم");
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return currentData;
    return currentData?.filter((row) =>
      visibleColumns.some(
        (col: any) =>
          col.visible &&
          String(row[col.accessorKey] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [search, currentData, visibleColumns]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
   const {user} = useSelector((state: any) => state.auth);
  return (
    <div className="flex flex-col w-full gap-4 p-4 text-right" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="ابحث..."
          value={search}
          onChange={handleSearch}
          className="max-w-sm"
        />
       { (user.role === "admin" || user?.permissions?.includes("category.create")) && <Button className="bg-[#1B67B3]" onClick={() => navigate("/categories/create")}>
          <span className="flex items-center gap-2">
            <Pencil size={16} />
            إنشاء
          </span>
        </Button>}
      </div>

      <div className="overflow-auto rounded-md border">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow>
              {visibleColumns.map(
                (column: any, index: number) =>
                  column.visible && (
                    <TableHead
                      key={index}
                      className="border-r px-4 py-2 text-right"
                    >
                      {column.header}
                    </TableHead>
                  )
              )}
            {(user.role === "admin" || (user?.permissions?.includes("category.delete") && user?.permissions?.includes("category.edit"))) &&  <TableHead className="w-[1%] border-r text-center p-0">
                الإجراءات
              </TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map((column: any, colIndex: number) =>
                    column.visible && column.accessorKey !== "image" ? (
                      <TableCell
                        key={colIndex}
                        className="border-r px-4 py-2 text-right"
                      >
                        {row[column.accessorKey]}
                      </TableCell>
                    ) : (
                      column.visible &&
                      column.accessorKey === "image" && (
                        <TableCell
                          key={colIndex}
                          className="border-r px-4 py-2 text-right"
                        >
                          <img
                            src={`file://${encodeURI(row[column.accessorKey])}`}
                            alt=""
                            onClick={() =>
                              handleImage(
                                `file://${encodeURI(row[column.accessorKey])}`
                              )
                            }
                            className="cursor-pointer"
                            style={{ width: "50px", height: "50px" }}
                          />
                        </TableCell>
                      )
                    )
                  )}
                  <TableCell className="px-4 py-2 border-r text-center whitespace-nowrap">
                    <div className="flex justify-center items-center gap-1">
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => onEdit?.(row)}
                      >
                        <Pencil size={16} />
                      </Button> */}
                     {(user.role === "admin" || (user?.permissions?.includes("category.edit"))) && <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => onDelete?.(row)}
                      >
                        <Trash2 size={16} />
                      </Button>}
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => handlePage(page - 1)}
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
          onClick={() => handlePage(page + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
