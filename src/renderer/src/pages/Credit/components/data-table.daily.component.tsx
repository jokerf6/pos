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
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../../../components/ui/sonner";
import { useDispatch } from "react-redux";
import { getCredit, createCredit } from "../../../store/slices/creditSlice";
import Modal from "../../../components/common/dynamic-modal.component";
import { getUsers } from "store/slices/usersSlice";
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
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map((col: any) => ({ ...col, visible: col.visible !== false }))
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentData, setCurrentData] = useState<T[]>(data || []);
  const [openCreate, setOpenCreate] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [reciever, setReciever] = useState<string | null>(null);

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
        setOpenCreate(true);
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

  const handlePage = async (page: number) => {
    setPage((prev) => page);

    try {
      try {
        const result = dispatch(getUsers({})) as any;
        const formatedCredit = result?.data?.map((item: any) => ({
          ...item,
          createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
        }));
        setTotal(result?.total || 0);
        setCurrentData(formatedCredit || []);
      } catch (error: any) {
        showError(error || "حدث خطأ في البحث");
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
  const handelCreate = async () => {
    const result = await dispatch(
      createCredit({ price, reason, reciever }) as any
    );
    if (!result.error) {
      showSuccess("تم إضافه المصروف بنجاح");
      setPrice(0);
      setReason(null);
      setReciever(null);

      setOpenCreate(false);
    } else {
      showError(result?.payload || "فشل في إضافه المصروف");
    }
  };
  return (
    <div className="flex flex-col w-full gap-4 p-4 text-right" dir="rtl">
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onConfirm={() => {
          handelCreate();
          setOpenCreate(false);
        }}
        title="إنشاء مصروف"
        confirmLabel="إنشاء"
        cancelLabel="إلغاء"
      >
        <div className="flex gap-2 flex-col items-center">
          <Input
            key={"reason"}
            name={"reason"}
            type="string"
            value={reason || ""}
            placeholder="السبب"
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <Input
            key={"reciever"}
            name={"reciever"}
            type="string"
            value={reciever || ""}
            placeholder="المستلم"
            onChange={(e) => setReciever(e.target.value)}
          />
          <Input
            required
            key={"price"}
            name={"price"}
            min={1}
            max={100}
            type="number"
            value={price}
            placeholder="السعر"
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
      </Modal>
      <div className="flex items-center justify-between gap-4">
        <Button onClick={() => setOpenCreate(true)}>
          <span className="flex items-center gap-2">
            <Pencil size={16} />
            إضافة
          </span>
        </Button>
      </div>

      {/* جدول البيانات */}
      <div className="overflow-auto rounded-md border">
        <Table className="min-w-full table-auto">
          <TableHeader>
            <TableRow>
              {visibleColumns.map(
                (column: { visible: boolean; header: string }, index: number) =>
                  column.visible && (
                    <TableHead
                      key={index}
                      className="border-r px-4 py-2 text-right"
                    >
                      {column.header}
                    </TableHead>
                  )
              )}
              <TableHead className="w-[1%] border-r text-center p-0">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumns.map(
                    (
                      column: { visible: boolean; accessorKey: string },
                      colIndex: number
                    ) =>
                      column.visible && (
                        <TableCell
                          key={colIndex}
                          className="border-r px-4 py-2 text-right"
                        >
                          {row[column.accessorKey]}
                        </TableCell>
                      )
                  )}

                  <TableCell className="px-4 py-2 border-r text-center whitespace-nowrap">
                    <div className="flex justify-center items-center gap-1">
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
                        className="h-8 w-8 text-red-600"
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

export default DataDailyTable;
