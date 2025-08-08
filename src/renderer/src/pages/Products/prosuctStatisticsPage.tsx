import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Search,
  Package,
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { AppDispatch, useAppDispatch } from "store";
import { getTransaction } from "store/slices/transactionSlice";
import { useSelector } from "react-redux";

interface FilterState {
  productName: string;
  movementType: string;
  dateFrom: string;
  dateTo: string;
  quantityFrom: string;
  quantityTo: string;
}

const PAGE_SIZE = 10;

type ProductMovement = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  movementType: string;
  movementTypeAr: string;
  movementIcon: string;
  quantity: number;
  date: string;
  dateAr: string;
  notes: string;
  unitPrice: number;
  totalValue: number;
};

type ProductStatisticsData = {
  product: {
    id: number;
    name: string;
    code: string;
  };
  transactions: ProductMovement[];
  statistics: {
    totalMovements: number;
    totalSales: number;
    totalPurchases: number;
    totalValue: number;
  };
};

const ProductStatistics = () => {
  const { productId } = useParams<{ productId: string }>();
  const [data, setData] = useState<ProductStatisticsData | null>(null);
  const [filteredData, setFilteredData] = useState<ProductMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    productName: "",
    movementType: "",
    dateFrom: "",
    dateTo: "",
    quantityFrom: "",
    quantityTo: "",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const transactionState = useSelector((state: any) => state.transaction);

  useEffect(() => {
      const fetchData = async () => {
        await dispatch(getTransaction({ productId,page }));

      };
  
      fetchData();
    }, [page, dispatch]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (!productId) {
          setError("معرف المنتج مطلوب");
          setLoading(false);
          return;
        }

        await dispatch(getTransaction({ productId }));
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dispatch, productId]);

  // تحديث البيانات المحلية عند تغيير حالة Redux
  useEffect(() => {
    if (transactionState) {
      // التحقق من هيكل البيانات المتوقع
      if (
        transactionState.product &&
        transactionState.transactions &&
        transactionState.statistics
      ) {
        setData(transactionState);
      } else if (transactionState.transactions) {
        // إذا كانت البيانات في صيغة مختلفة
        const formattedData: ProductStatisticsData = {
          product: transactionState.product || {
            id: 0,
            name: "غير محدد",
            code: "N/A",
          },
          transactions: transactionState.transactions,
          statistics: transactionState.statistics || {
            totalMovements: transactionState.transactions?.length || 0,
            totalSales: 0,
            totalPurchases: 0,
            totalValue: 0,
          },
        };

        setData(formattedData);
      }
    } else if (transactionState?.error) {
      setError(transactionState.error);
    }
  }, [transactionState]);

  // تصفية البيانات بناءً على البحث والمرشحات
  useEffect(() => {
    if (!data?.transactions) {
      setFilteredData([]);
      return;
    }

    let filtered = data.transactions;

    // تصفية البحث
    if (search.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.productName?.toLowerCase().includes(search.toLowerCase()) ||
          item.productCode?.toLowerCase().includes(search.toLowerCase()) ||
          item.movementTypeAr?.toLowerCase().includes(search.toLowerCase()) ||
          item.notes?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // المرشحات المتقدمة
    if (filters.productName.trim()) {
      filtered = filtered.filter((item) =>
        item.productName
          ?.toLowerCase()
          .includes(filters.productName.toLowerCase())
      );
    }

    if (filters.movementType) {
      filtered = filtered.filter(
        (item) => item.movementType === filters.movementType
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((item) => item.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((item) => item.date <= filters.dateTo);
    }

    if (filters.quantityFrom) {
      const minQuantity = parseInt(filters.quantityFrom);
      if (!isNaN(minQuantity)) {
        filtered = filtered.filter((item) => item.quantity >= minQuantity);
      }
    }

    if (filters.quantityTo) {
      const maxQuantity = parseInt(filters.quantityTo);
      if (!isNaN(maxQuantity)) {
        filtered = filtered.filter((item) => item.quantity <= maxQuantity);
      }
    }

    setFilteredData(filtered);
    setPage(1); // إعادة تعيين الصفحة الأولى عند التصفية
  }, [search, filters, data]);

  // عد المرشحات النشطة
  useEffect(() => {
    const count = Object.values(filters).filter(
      (value) => value.trim() !== ""
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  // الترقيم
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // خيارات نوع الحركة
  const movementTypes = [
    { value: "sale", label: "مبيعات" },
    { value: "purchase", label: "مشتريات" },
    { value: "return", label: "مرتجع" },
    { value: "adjustment", label: "تسوية" },
    { value: "damage", label: "تلف" },
  ];

  // حالة التحميل
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  // في حالة عدم وجود بيانات
  if (!transactionState) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <pre>{JSON.stringify(transactionState, null, 2)}</pre>
        <div className="text-gray-500 mb-2">📊 لا توجد بيانات متاحة</div>
        <div className="text-sm text-gray-400">
          {!productId
            ? "معرف المنتج مطلوب"
            : "لم يتم العثور على بيانات لهذا المنتج"}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full gap-6 p-6 bg-gray-50/50 min-h-full"
      dir="rtl"
    >
      {/* Debug Info - إزالة هذا في الإنتاج */}

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إحصائيات المنتج وحركة المخزون
              </h1>
              <p className="text-sm text-gray-500">
                {transactionState.product?.name
                  ? `${transactionState.product.name} (#${transactionState.product.code})`
                  : "تتبع جميع حركات المخزون والمبيعات والمشتريات"}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  إجمالي الحركات
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {(
                    transactionState.transaction.statistics?.totalMovements ||
                    transactionState.transaction.transactions?.length ||
                    0
                  ).toLocaleString("ar-EG")}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  إجمالي المشتريات
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {(
                    transactionState.transaction.statistics?.totalPurchases || 0
                  ).toLocaleString("ar-EG")}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  إجمالي المبيعات
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {(
                    transactionState.transaction.statistics?.totalSales || 0
                  ).toLocaleString("ar-EG")}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  القيمة الإجمالية
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {(
                    transactionState.transaction.statistics?.totalValue || 0
                  ).toLocaleString("ar-EG")}{" "}
                  ج.م
                </p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Movement History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            سجل حركات المخزون
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  التاريخ
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  المنتج
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  نوع الحركة
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  الكمية
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  سعر الوحدة
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-gray-700 border-l border-gray-200">
                  القيمة الإجمالية
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionState.transaction.transactions.length > 0 ? (
                transactionState.transaction.transactions.map((row: any) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-purple-50/50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                  >
                    <TableCell className="px-6 py-4 text-right text-gray-900 border-l border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {row.date_ar || row.date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right border-l border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transactionState.transaction.product.name ||
                            "غير محدد"}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          #{transactionState.transaction.product.code || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right border-l border-gray-100">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.transaction_type === "sale"
                            ? "bg-red-100 text-red-800"
                            : row.transaction_type === "purchase"
                              ? "bg-green-100 text-green-800"
                              : row.transaction_type === "return"
                                ? "bg-blue-100 text-blue-800"
                                : row.transaction_type === "damage"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.movement_icon === "up" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {row.movement_type_ar || row.movementType}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right border-l border-gray-100">
                      <span
                        className={`font-bold ${
                          row.movement_icon === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {row.movement_icon === "up" ? "+" : "-"}
                        {(row.quantity || 0).toLocaleString("ar-EG")}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right border-l border-gray-100">
                      <span className="font-medium text-blue-600">
                        {(row.unit_price || 0).toLocaleString("ar-EG")} ج.م
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right border-l border-gray-100">
                      <span className="font-bold text-purple-600">
                        {(row.total_value || 0).toLocaleString("ar-EG")} ج.م
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-gray-500 font-medium">
                          {search || activeFiltersCount > 0
                            ? "لا توجد حركات مطابقة"
                            : "لا توجد حركات مخزون"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {search || activeFiltersCount > 0
                            ? "جرب تعديل معايير البحث أو التصفية"
                            : "ستظهر حركات المخزون هنا عند حدوثها"}
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

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            عرض{" "}
            {(transactionState.transaction.pagination.currentPage - 1) *
              transactionState.transaction.pagination.itemsPerPage +
              1}{" "}
            إلى{" "}
            {Math.min(
              transactionState.transaction.pagination.currentPage *
                transactionState.transaction.pagination.itemsPerPage,
              transactionState.transaction.pagination.totalItems
            )}{" "}
            من {transactionState.transaction.pagination.totalItems} حركة
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
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
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "border-gray-300 hover:bg-gray-50"
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
              onClick={() => setPage(page + 1)}
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

export default ProductStatistics;
