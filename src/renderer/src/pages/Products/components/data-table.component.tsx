import { useEffect, useMemo, useRef, useState } from "react";
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
import { Pencil, Trash2, Search, Plus, Package, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError } from "../../../components/ui/sonner";
import { useDispatch } from "react-redux";
import {
  searchProducts,
  getProducts,
} from "../../../store/slices/productsSlice";

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentData(data);
    setTotal(dataTotal);
  }, [data, dataTotal]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.key);
      if (e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        e.preventDefault();
        navigate("/products/create");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    try {
      const result = await dispatch(
        searchProducts({ name: value, page }) as any
      );
      if (!result.error) {
        const formatedProducts = result?.payload?.products?.map((item: T) => ({
          ...item,
          createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
        }));
        setTotal(result?.payload?.total || 0);
        setCurrentData(formatedProducts || []);
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
      const result = await dispatch(getProducts({ page }) as any);
      if (!result.error) {
        const formatedProducts = result?.payload?.products?.map((item: T) => ({
          ...item,
          createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
        }));
        setTotal(result?.payload?.total || 0);
        setCurrentData(formatedProducts || []);
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
        (col: { visible: boolean; accessorKey: string }) =>
          col.visible &&
          String(row[col.accessorKey] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [search, currentData, visibleColumns]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-gray-50/50 min-h-full" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
              <p className="text-sm text-gray-500">
                إجمالي المنتجات: {total.toLocaleString('ar-EG')}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/products/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="ابحث عن المنتجات بالاسم أو الكود..."
              value={search}
              onChange={handleSearch}
              className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 ml-2" />
            تصفية
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                {visibleColumns.map(
                  (column: { visible: boolean; header: string }, index: number) =>
                    column.visible && (
                      <TableHead
                        key={index}
                        className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200 last:border-l-0"
                      >
                        {column.header}
                      </TableHead>
                    )
                )}
                <TableHead className="px-6 py-4 text-center font-semibold text-gray-700 w-32">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <TableRow 
                    key={rowIndex}
                    className="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                  >
                    {visibleColumns.map(
                      (column: { visible: boolean; accessorKey: string }, colIndex: number) =>
                        column.visible && (
                          <TableCell
                            key={colIndex}
                            className="px-6 py-4 text-right text-gray-900 border-l border-gray-100 last:border-l-0"
                          >
                            {column.accessorKey === 'price' || column.accessorKey === 'buy_price' ? (
                              <span className="font-medium text-green-600">
                                {Number(row[column.accessorKey]).toLocaleString('ar-EG')} ج.م
                              </span>
                            ) : column.accessorKey === 'quantity' ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                row[column.accessorKey] > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : row[column.accessorKey] > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {row[column.accessorKey]}
                              </span>
                            ) : column.accessorKey === 'barcode' ? (
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {row[column.accessorKey]}
                              </span>
                            ) : (
                              row[column.accessorKey]
                            )}
                          </TableCell>
                        )
                    )}

                    <TableCell className="px-6 py-4 text-center border-l border-gray-100">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                          onClick={() => onEdit?.(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                          onClick={() => onDelete?.(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-gray-500 font-medium">لا توجد منتجات</p>
                        <p className="text-gray-400 text-sm">قم بإضافة منتج جديد للبدء</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            عرض {Math.min((page - 1) * PAGE_SIZE + 1, total)} إلى {Math.min(page * PAGE_SIZE, total)} من {total.toLocaleString('ar-EG')} منتج
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePage(page - 1)}
              className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePage(pageNum)}
                    className={`w-8 h-8 p-0 ${
                      page === pageNum 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => handlePage(page + 1)}
              className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
