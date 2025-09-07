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
import { Pencil, Trash2, Search, Plus, Package, Filter, X, ChevronDown, Info } from "lucide-react";
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

const DataTable = <T extends Record<string, any>>({
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
    category: ""
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const categories = useSelector((state: any) => state.categories);
  const { selectedBranch } = useSelector((state: any) => state.branches);
  const {products} = useSelector((state: any) => state.products);
  // Main useEffect for fetching products with search and filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await dispatch(searchProducts({ name: search, page, filters }) as any);
        if (!result.error) {
          console.log("fetched2");
          const formattedProducts = result?.payload?.products?.map((item: T) => ({
            ...item,
            createdAt: new Date(item.created_at).toISOString().split("T")[0],
          }));
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
  }, [search, filters]); // Reset page when search or filters change

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handlePage = async (newPage: number) => {
    setPage(newPage);
    // The useEffect will handle the API call when page changes
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      quantityFrom: "",
      quantityTo: "",
      priceFrom: "",
      priceTo: "",
      category: ""
    });
  };

  const clearSingleFilter = (key: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: ""
    }));
  };

  // Remove local filtering since we're filtering on the server
  const filteredData = currentData;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const ActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.quantityFrom || filters.quantityTo) {
      const label = filters.quantityFrom && filters.quantityTo 
        ? `الكمية: ${filters.quantityFrom} - ${filters.quantityTo}`
        : filters.quantityFrom 
          ? `الكمية من: ${filters.quantityFrom}`
          : `الكمية إلى: ${filters.quantityTo}`;
      activeFilters.push({ key: 'quantity', label });
    }

    if (filters.priceFrom || filters.priceTo) {
      const label = filters.priceFrom && filters.priceTo 
        ? `السعر: ${filters.priceFrom} - ${filters.priceTo} ج.م`
        : filters.priceFrom 
          ? `السعر من: ${filters.priceFrom} ج.م`
          : `السعر إلى: ${filters.priceTo} ج.م`;
      activeFilters.push({ key: 'price', label });
    }

    if (filters.category) {
      // Find category name by ID
      const categoryName = categories.categories.find((cat: any) => cat.id == filters.category)?.name || filters.category;
      activeFilters.push({ key: 'category', label: `الفئة: ${categoryName}` });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-600 ml-2">المرشحات النشطة:</span>
        {activeFilters.map((filter) => (
          <div 
            key={filter.key}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => {
                if (filter.key === 'quantity') {
                  setFilters(prev => ({ ...prev, quantityFrom: "", quantityTo: "" }));
                } else if (filter.key === 'price') {
                  setFilters(prev => ({ ...prev, priceFrom: "", priceTo: "" }));
                } else {
                  clearSingleFilter(filter.key as keyof FilterState);
                }
              }}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 h-auto text-sm"
        >
          مسح الكل
        </Button>
      </div>
    );
  };

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
       {(user.role === "admin" || user?.permissions?.includes("inventory.create")) &&   <Button 
            onClick={() => navigate("/products/create")}
            className="bg-[#1B67B3] hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج جديد
          </Button>}
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="ابحث عن المنتجات بالاسم أو الكود..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={`relative border-gray-300 hover:bg-gray-50 transition-all duration-200 ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
              }`}
            >
              <Filter className="h-4 w-4 ml-2" />
              تصفية متقدمة
              <ChevronDown className={`h-3 w-3 mr-1 transition-transform duration-200 ${
                showFilters ? 'rotate-180' : ''
              }`} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-[#1B67B3] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الكمية</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="من"
                      value={filters.quantityFrom}
                      onChange={(e) => handleFilterChange('quantityFrom', e.target.value)}
                      className="text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-500 text-sm">إلى</span>
                    <Input
                      type="number"
                      placeholder="إلى"
                      value={filters.quantityTo}
                      onChange={(e) => handleFilterChange('quantityTo', e.target.value)}
                      className="text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">السعر (ج.م)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="من"
                      value={filters.priceFrom}
                      onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                      className="text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-500 text-sm">إلى</span>
                    <Input
                      type="number"
                      placeholder="إلى"
                      value={filters.priceTo}
                      onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                      className="text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الفئة</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="">جميع الفئات</option>
                    {categories.categories?.map((category:any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  النتائج المطابقة: {total.toLocaleString('ar-EG')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    مسح المرشحات
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="border-gray-300"
                  >
                    إخفاء التصفية
                  </Button>
                </div>
              </div>
            </div>
          )}

          <ActiveFilters />
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
               {(user.role === "admin" ||
                               ( user?.permissions.includes("inventory.edit") &&
                                user?.permissions.includes("inventory.delete")&&
                                user?.permissions.includes("inventory.statistics")
               )
                                ) &&   <TableHead className="w-[1%] border-r text-center p-0">
                            الإجراءات
                          </TableHead>}
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
                                row[column.accessorKey] > +limit 
                                  ? 'bg-green-100 text-green-800' 
                                  : row[column.accessorKey] > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {row[column.accessorKey]}
                                {row[column.accessorKey] > +limit ? ' ' : row[column.accessorKey] > 0 ? <MdWarning className="mr-1" /> : ''}
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

            {  ( !selectedBranch &&(( user.role === "admin") ||
                               ( user?.permissions?.includes("inventory.edit") &&
                                user?.permissions?.includes("inventory.delete")
                              &&
                               user?.permissions?.includes("inventory.statistics")
                              )
                                ))&&     <TableCell className="px-6 py-4 text-center border-l border-gray-100">
                      <div className="flex justify-center items-center gap-2">
                   {(user.role === "admin" ||
                          user?.permissions?.includes("inventory.statistics")) && <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                          onClick={() => onInfo?.(row)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>}
                       {(user.role === "admin" ||
                          user?.permissions?.includes("inventory.edit")) && <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                          onClick={() => onEdit?.(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>}
                    {(user.role === "admin" ||
                          user?.permissions?.includes("inventory.delete")) &&    <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                          onClick={() => onDelete?.(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>}
                      </div>
                    </TableCell>}
                    {
                      selectedBranch && (user?.permissions?.includes("inventory.create.branch")) && <TableCell className="px-6 py-4 text-center border-l border-gray-100">

                        <Button
                        onClick={() => navigate(`/products/${row.barcode}/create/branch`)}
                        >
                          إضافة مخزون
                        </Button>
                      </TableCell>
                    }
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
                          {search || activeFiltersCount > 0 ? "لا توجد نتائج مطابقة" : "لا توجد منتجات"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {search || activeFiltersCount > 0 
                            ? "جرب تعديل معايير البحث أو التصفية" 
                            : "قم بإضافة منتج جديد للبدء"
                          }
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
                        ? 'bg-[#1B67B3] text-white hover:bg-blue-700' 
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