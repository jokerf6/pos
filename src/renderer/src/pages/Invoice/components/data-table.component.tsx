import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../store";
import { afterInvoice, beforeInvoice, updateInvoice } from "../../../store/slices/invoice";
import { Button } from "../../../components/ui/button";
import FilterSection from "./filterSection";
import { ChevronLeft, ChevronRight, Printer, FileText, Loader2 } from "lucide-react";
import { showSuccess } from "components/ui/sonner";

export default function AllInvoicesFixed() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const fetchData = async () => {
      searchInputRef.current?.focus();
      await fetchFirstInvoice();
    };
    fetchData();
  }, []);
  
  const [products, setProducts] = useState([]);
  const [beforeInvoiceData, setBeforeInvoiceData] = useState(undefined);
  const [afterInvoiceData, setAfterInvoiceData] = useState<any>(undefined);
  const [canGoBefore, setCanGoBefore] = useState(true);
  const [canGoAfter, setCanGoAfter] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [invoiceType, setInvoiceType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState({
    customerName: "",
    customerPhone: "",
    journal: "",
    date: new Date().toISOString().slice(0, 10),
    paymentType: "خالص",
    invoiceDiscount: 0,
  });
  
  // Enhanced useEffect to handle filter changes properly
  useEffect(() => {
    const applyFilters = async () => {
      // Reset navigation state when filters change
      setBeforeInvoiceData(undefined);
      setAfterInvoiceData(undefined);
      setCanGoBefore(true);
      setCanGoAfter(false);
      // Fetch first invoice with new filters
      await fetchFirstInvoice();
    };
    // Apply filters whenever any filter value changes
    applyFilters();
  }, [from, to, invoiceType]);
  
  const updateInvoiceUI = (data: any) => {
    console.log("Updating invoice UI with data:", data);
    if (!data) {
      setInvoiceDetails({
        customerName: "",
        customerPhone: "",
        journal: "",
        date: new Date().toISOString().slice(0, 10),
        paymentType: "خالص",
        invoiceDiscount: 0,
      });
      setProducts([]);
      setBeforeInvoiceData(undefined);
      setAfterInvoiceData(null as any);
      setCanGoBefore(false);
      setCanGoAfter(false);
      return;
    }
    
    setBeforeInvoiceData(data.id);
    setAfterInvoiceData(data.id);
    setInvoiceDetails({
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      journal: data.journal || "",
      date: data.date || new Date().toISOString().slice(0, 10),
      paymentType: data.paymentType || "خالص",
      invoiceDiscount: data.discount || 0,
    });
    setProducts(
      data.items.map((p: any) => ({
        id: p.itemId,
        name: p.name,
        totalQuantity: p.totalQuantity,
        quantity: p.quantity,
        price: p.pricePerUnit,
        discount: p.discount,
      }))
    );
  };
  
  // New function to fetch the first invoice with current filters
  const fetchFirstInvoice = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        beforeInvoice({
          id: undefined, // Start from beginning
          filter: { to, from, invoiceType },
          all: true, // Fetch all matching invoices
        })
      );
      
      if (!result.payload.data) {
        // No data found with current filters - clear UI immediately
        updateInvoiceUI(null);
      } else {
        updateInvoiceUI(result.payload.data);
        // Check if there are more invoices after this one
        setCurrentInvoiceId(result.payload.data.id)
        checkIfMoreInvoicesAfter(result.payload.data.id);
      }
    } catch (error) {
      console.error("Error fetching first invoice:", error);
      // Clear UI on error
      updateInvoiceUI(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to check if there are more invoices after the current one
  const checkIfMoreInvoicesAfter = async (currentId: number) => {
    try {
      const result = await dispatch(
        afterInvoice({
          id: currentId,
          filter: { to, from, invoiceType },
        })
      );
      setCanGoAfter(!!result.payload.data);
    } catch (error) {
      console.error("Error checking for more invoices:", error);
      setCanGoAfter(false);
    }
  };
  
  // Helper function to check if there are more invoices before the current one
  const checkIfMoreInvoicesBefore = async (currentId: number) => {
    try {
      const result = await dispatch(
        beforeInvoice({
          id: currentId,
          filter: { to, from, invoiceType },
          all: true,
        })
      );
      setCanGoBefore(!!result.payload.data);
    } catch (error) {
      console.error("Error checking for more invoices:", error);
      setCanGoBefore(false);
    }
  };
  
  const previous = async () => {
    if (!canGoBefore || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await dispatch(
        beforeInvoice({
          id: beforeInvoiceData,
          filter: { to, from, invoiceType },
          all: true,
        })
      );
      
      if (!result.payload.data) {
        setCanGoBefore(false);
      } else {
        updateInvoiceUI(result.payload.data);
        setCanGoAfter(true);
        // Check if there are more invoices before this one
        await checkIfMoreInvoicesBefore(result.payload.data.id);
      }
    } catch (error) {
      console.error("Error fetching previous invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const after = async () => {
    if (!canGoAfter || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await dispatch(
        afterInvoice({
          id: afterInvoiceData,
          filter: { to, from, invoiceType },
        })
      );
      
      if (!result.payload.data) {
        setCanGoAfter(false);
      } else {
        updateInvoiceUI(result.payload.data);
        setCanGoBefore(true);
        // Check if there are more invoices after this one
        setCurrentInvoiceId(result.payload.data.id);
        await checkIfMoreInvoicesAfter(result.payload.data.id);
      }
    } catch (error) {
      console.error("Error fetching next invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateRowTotal = (product: any) =>
    product.quantity * product.price - product.discount;
  const total = products.reduce((sum, p) => sum + calculateRowTotal(p), 0);
  const netTotal = total - invoiceDetails.invoiceDiscount;
  
  const handleClearFilters = () => {
    // Clear all filters - this will trigger the useEffect to refetch data
    setFrom("");
    setTo("");
    setInvoiceType("");
  };
  
  const handlePrintInvoice = () => {
    // Add print functionality here
    window.print();
  };
  
  return (
    <div className="w-full mx-auto p-6 space-y-6 flex flex-col h-full overflow-hidden bg-gray-50" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">سجل الفواتير</h2>
        </div>
        <p className="text-gray-600">تصفح الفواتير السابقة وراجع تفاصيلها.</p>
      </div>
      
      {/* Professional Filter Section */}
      <FilterSection
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        invoiceType={invoiceType}
        setInvoiceType={setInvoiceType}
        onClearFilters={handleClearFilters}
      />
      
      {/* Navigation Controls */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <Button
          onClick={previous}
          disabled={!canGoBefore || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        <div className="text-center">
          <span className="text-sm text-gray-600">تصفح الفواتير</span>
          {(from || to || invoiceType) && (
            <div className="text-xs text-blue-600 mt-1">
              {!products.length && !isLoading
                ? "لا توجد فواتير مطابقة للفلتر"
                : "مفلتر"}
            </div>
          )}
        </div>
        <Button
          disabled={!canGoAfter || isLoading}
          onClick={after}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </Button>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">منتجات الفاتورة</h3>
        </div>
        <div className="overflow-y-auto max-h-[300px]">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b border-gray-200">اسم المنتج</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">الكمية</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">السعر</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p: any, index: number) => (
                <tr
                  key={p.id}
                  className={`text-center transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                >
                  <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{parseFloat(p.price).toFixed(2)} ج</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{calculateRowTotal(p).toFixed(2)} ج</td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 text-gray-300" />
                      <p className="font-medium">لا توجد منتجات في هذه الفاتورة</p>
                      <p className="text-sm text-gray-400">
                        {from || to || invoiceType
                          ? "لا توجد فواتير مطابقة للفلتر المحدد"
                          : ""}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Invoice Details and Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information and Payment Type */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
            <input
              type="text"
              placeholder="اسم العميل"
              value={invoiceDetails.customerName}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  customerName: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50"
              readOnly
              disabled={!products.length}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم تليفون العميل</label>
            <input
              type="text"
              placeholder="رقم تليفون العميل"
              value={invoiceDetails.customerPhone}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  customerPhone: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50"
              readOnly
              disabled={!products.length}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">نوع الدفع</label>
            <div className="flex gap-4">
              {["خالص", "أجل", "مرتجع"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value={type}
                    checked={invoiceDetails.paymentType === type}
                    onChange={async(e) => {
                      if (type === "خالص") {
                        setInvoiceDetails({
                          ...invoiceDetails,
                          paymentType: e.target.value,
                        });
                        await dispatch(updateInvoice({invoiceId:currentInvoiceId, paymentType:e.target.value}));
                        showSuccess("تم تحديث الفاتورة بنجاح");
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 bg-gray-50"
                    disabled={!products.length}
                    readOnly
                  />
                  <span
                    className={`text-sm ${!products.length ? "text-gray-400" : "text-gray-700"}`}
                  >
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="space-y-4 bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-700">الإجمالي:</span>
            <span className="text-xl font-semibold text-gray-900">{total.toFixed(2)} ج</span>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-base font-medium text-gray-700">الخصم:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={invoiceDetails.invoiceDiscount}
                onChange={(e) =>
                  setInvoiceDetails({
                    ...invoiceDetails,
                    invoiceDiscount: Number(e.target.value) || 0,
                  })
                }
                className="w-24 p-2 border border-gray-300 rounded-md text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                readOnly
                disabled={!products.length}
              />
              <span className="text-sm text-gray-700">ج</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">الصافي:</span>
            <span className="text-2xl font-bold text-green-600">{netTotal.toFixed(2)} ج</span>
          </div>
        </div>
      </div>
      
      {/* Print Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={handlePrintInvoice}
          disabled={!products.length}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Printer className="h-5 w-5 ml-2" />
          طباعة الفاتورة
        </Button>
      </div>
    </div>
  );
}