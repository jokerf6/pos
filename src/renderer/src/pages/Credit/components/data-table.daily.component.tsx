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
import { Pencil, Trash2, Search, Plus, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { CreditByDaily } from "store/slices/creditSlice";
import { AppDispatch } from "store";

interface DataTableProps<T> {
  columns: any;
  data: T[];
  dataTotal: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

const PAGE_SIZE = 10;

const DataDailyTable = <T extends Record<string, any>>({
  columns,
  data,
  dataTotal,
  onEdit,
  onDelete,
}: DataTableProps<T>) => {
  const navigate = useNavigate();

  const [visibleColumns] = useState(() =>
    columns.map((col: any) => ({ ...col, visible: col.visible !== false }))
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentData, setCurrentData] = useState<T[]>(data || []);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setCurrentData(data);
    setTotal(dataTotal);
  }, [data, dataTotal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        navigate("/credit/create");
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
    const searchValue = e.target.value;
    setSearch(searchValue);
    setIsLoading(true);
    
    try {
      const action = await dispatch(
        CreditByDaily({ name: searchValue, page: 1 })
      );
      const result = unwrapResult(action);
      console.log("Search result:", result);
      setTotal(result.total);
      setCurrentData(result.data);
      setPage(1);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePage = async (newPage: number) => {
    if (newPage === page || isLoading) return;
    
    setPage(newPage);
    setIsLoading(true);
    
    try {
      const action = await dispatch(
        CreditByDaily({ name: search, page: newPage })
      );
      const result = unwrapResult(action);
      console.log("Page result:", result);
      setCurrentData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error("Page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // إزالة الـ pagination المحلي لأن البيانات تأتي مقسمة من الـ API
  const filteredData = useMemo(() => {
    // إذا كانت البيانات تأتي مقسمة من الـ API، نعرضها كما هي
    return currentData || [];
  }, [currentData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col w-full gap-4 p-6 text-right" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">مصروفات اليومية</h2>
        </div>
        <p className="text-gray-600">تسجيل ومراجعة المصروفات اليومية.</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="ابحث عن مصروف... (Ctrl + K)"
            value={search}
            onChange={handleSearch}
            disabled={isLoading}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
          />
        </div>
        <Button
          onClick={() => navigate("/credit/create")}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          <Plus className="w-5 h-5" />
          إضافة مصروف جديد
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Table className="min-w-full table-auto">
            <TableHeader className="bg-gray-50">
              <TableRow>
                {visibleColumns.map(
                  (column: any, index: number) =>
                    column.visible && (
                      <TableHead
                        key={index}
                        className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-200"
                      >
                        {column.header}
                      </TableHead>
                    )
                )}
           { user.role === "admin" && user?.permissions?.includes("credit.delete") &&     <TableHead className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200 w-[1%]">
                  الإجراءات
                </TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <span>جاري التحميل...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={`transition-colors duration-150 ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50`}
                  >
                    {visibleColumns.map(
                      (column: any, colIndex: number) =>
                        column.visible && (
                          <TableCell
                            key={colIndex}
                            className="px-4 py-3 text-right text-sm text-gray-900"
                          >
                            {row[column.accessorKey]} {column.accessorKey === "price" && "ج.م"}
                          </TableCell>
                        )
                    )}

                 {user.role === "admin" && user?.permissions?.includes("credit.delete") &&   <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
               
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                          onClick={() => onDelete?.(row)}
                          disabled={isLoading}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 text-gray-300" />
                      <p className="font-medium">لا توجد مصروفات لعرضها</p>
                      <p className="text-sm text-gray-400">ابدأ بإضافة مصروف جديد أو عدّل معايير البحث.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-between items-center mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            عرض {startIndex}-{endIndex} من {total} مصروفات
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => handlePage(page - 1)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm font-medium text-gray-700">
              صفحة {page} من {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading || totalPages === 0}
              onClick={() => handlePage(page + 1)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDailyTable;