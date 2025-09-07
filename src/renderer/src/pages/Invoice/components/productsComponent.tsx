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
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  Package,
  Filter,
  X,
  ChevronDown,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError } from "../../../components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  searchProducts,
  getProducts,
} from "../../../store/slices/productsSlice";
import { getByKey } from "store/slices/settingsSlice";
import { MdWarning } from "react-icons/md";
import { getCategories } from "store/slices/categoriesSlice";

interface DataTableProps<T> {
  columns: any;
  searchValue: string;
  data: T[];
  dataTotal: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onInfo?: (item: T) => void;
}

interface FilterState {
  quantityFrom: string;
  quantityTo: string;
  priceFrom: string;
  priceTo: string;
  category: string;
}

const PAGE_SIZE = 10;

const ProductsDataTable = <T extends Record<string, any>>({
  searchValue,
  columns,
  data,
  dataTotal,
  onEdit,
  onDelete,
  onInfo,
}: DataTableProps<T>) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map((col: any) => ({ ...col, visible: col.visible !== false }))
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(0);
  const [currentData, setCurrentData] = useState<T[]>(data || []);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [filters, setFilters] = useState<FilterState>({
    quantityFrom: "",
    quantityTo: "",
    priceFrom: "",
    priceTo: "",
    category: "",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const categories = useSelector((state: any) => state.categories);
  const { selectedBranch } = useSelector((state: any) => state.branches);
  const { products } = useSelector((state: any) => state.products);
  // Main useEffect for fetching products with search and filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await dispatch(
          searchProducts({ name: searchValue, page, filters }) as any
        );
        if (!result.error) {
          console.log("fetched2");
          const formattedProducts = result?.payload?.products?.map(
            (item: T) => ({
              ...item,
              createdAt: new Date(item.created_at).toISOString().split("T")[0],
            })
          );
          setTotal(result?.payload?.total || 0);
          setCurrentData(formattedProducts || []);
        } else {
          showError(result?.payload || "حدث خطأ في البحث");
        }
      } catch (error) {
        showError("فشل الاتصال بالخادم");
      }
    };

    fetchProducts();
  }, [search, page, filters, dispatch, selectedBranch, products]);

  useEffect(() => {
    dispatch(getCategories() as any);
  }, [dispatch]);

  useEffect(() => {
    async function fetchData() {
      const data = await dispatch(getByKey("warning") as any);
      setLimit(data?.payload?.data.value || 0);
    }
    fetchData();
  }, [dispatch]);

  // Remove the local data override since we're fetching from API
  // useEffect(() => {
  //   setCurrentData(data);
  //   setTotal(dataTotal);
  // }, [data, dataTotal]);

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
    setPage(1);
  }, [search, filters]); // Reset page when search or filters change

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter((value) => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handlePage = async (newPage: number) => {
    setPage(newPage);
    // The useEffect will handle the API call when page changes
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      quantityFrom: "",
      quantityTo: "",
      priceFrom: "",
      priceTo: "",
      category: "",
    });
  };

  const clearSingleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  // Remove local filtering since we're filtering on the server
  const filteredData = currentData;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div
      className="flex flex-col w-full gap-6 p-6 bg-gray-50/50 min-h-full"
      dir="rtl"
    >
      {/* Header Section */}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                {visibleColumns.map(
                  (
                    column: { visible: boolean; header: string },
                    index: number
                  ) =>
                    column.visible && (
                      <TableHead
                        key={index}
                        className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200 last:border-l-0"
                      >
                        {column.header}
                      </TableHead>
                    )
                )}

                <TableHead className="w-[1%] border-r text-center p-0">
                  الاجراءات
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
                      (
                        column: { visible: boolean; accessorKey: string },
                        colIndex: number
                      ) =>
                        column.visible && (
                          <TableCell
                            key={colIndex}
                            className="px-6 py-4 text-right text-gray-900 border-l border-gray-100 last:border-l-0"
                          >
                            {column.accessorKey === "price" ||
                            column.accessorKey === "buy_price" ? (
                              <span className="font-medium text-green-600">
                                {Number(row[column.accessorKey]).toLocaleString(
                                  "ar-EG"
                                )}{" "}
                                ج.م
                              </span>
                            ) : column.accessorKey === "quantity" ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  row[column.accessorKey] > +limit
                                    ? "bg-green-100 text-green-800"
                                    : row[column.accessorKey] > 0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {row[column.accessorKey]}
                                {row[column.accessorKey] > +limit ? (
                                  " "
                                ) : row[column.accessorKey] > 0 ? (
                                  <MdWarning className="mr-1" />
                                ) : (
                                  ""
                                )}
                              </span>
                            ) : column.accessorKey === "barcode" ? (
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {row[column.accessorKey]}
                              </span>
                            ) : (
                              row[column.accessorKey]
                            )}
                          </TableCell>
                        )
                    )}

                    <TableCell>
                      <Button onClick={() => onInfo?.(row)}>
                        إضافة للفاتورة
                      </Button>
                    </TableCell>
                    {selectedBranch &&
                      user?.permissions?.includes(
                        "inventory.create.branch"
                      ) && (
                        <TableCell className="px-6 py-4 text-center border-l border-gray-100">
                          <Button
                            onClick={() =>
                              navigate(`/products/${row.barcode}/create/branch`)
                            }
                          >
                            إضافة مخزون
                          </Button>
                        </TableCell>
                      )}
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
                        <p className="text-gray-500 font-medium">
                          {search || activeFiltersCount > 0
                            ? "لا توجد نتائج مطابقة"
                            : "لا توجد منتجات"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {search || activeFiltersCount > 0
                            ? "جرب تعديل معايير البحث أو التصفية"
                            : "قم بإضافة منتج جديد للبدء"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProductsDataTable;
