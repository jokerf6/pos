import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Printer,
  Search,
  Trash2,
  Edit3,
  Calculator,
  ShoppingCart,
  User,
  Phone,
  CreditCard,
  Percent,
  Save,
  Package,
  Minus,
  Plus,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Modal from "../../components/common/dynamic-modal.component";
import { Button } from "../../components/ui/button";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "store";
import { afterInvoice, beforeInvoice, createInvoice, printInvoice, updateInvoice } from "store/slices/invoice";
import { ProductByBarcode } from "store/slices/productsSlice";
import { showSuccess, showWarning } from "components/ui/sonner";

// -------------------- Interfaces --------------------
interface InvoiceHeaderProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoBefore: boolean;
  canGoAfter: boolean;
  onNewInvoice: () => void;
  isLoading: boolean;
}
interface CustomerDetailsProps {
  details: InvoiceDetails;
  currentInvoiceId: number | null;
  handleDetailChange: (field: string, value: string | number) => void;
  isReadOnly: boolean;
  isPaymentTypeDisabled: boolean;
}
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number; // Invoice quantity
  availableQuantity: number; // Available stock quantity
  barcode?: string;
  total?: number;
  [key: string]: any;
}
interface InvoiceDetails {
  customerName: string;
  customerPhone: string;
  paymentType: string;
  invoiceDiscount: number;
}
interface ProductTableProps {
  products: Product[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdatePrice: (index: number, price: number) => void;
  onRemoveProduct: (index: number) => void;
  isReadOnly: boolean;
}
interface InvoiceSummaryProps {
  products: Product[];
  discount: number;
  onDiscountChange: (discount: number) => void;
  isReadOnly: boolean;
}

// -------------------- Components --------------------
const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  onPrevious,
  onNext,
  canGoBefore,
  canGoAfter,
  onNewInvoice,
  isLoading,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-100 rounded-lg">
        <ShoppingCart className="h-6 w-6 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">إنشاء فاتورة جديدة</h1>
    </div>
    
    <div className="flex justify-between items-center">
      <Button 
        onClick={onPrevious} 
        disabled={!canGoBefore || isLoading} 
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        فاتورة سابقة
      </Button>
      
      <Button 
        onClick={onNewInvoice} 
        variant="default"
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
      >
        <PlusCircle className="h-4 w-4" />
        فاتورة جديدة
      </Button>
      
      <Button 
        onClick={onNext} 
        disabled={!canGoAfter || isLoading} 
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        فاتورة تالية
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const CustomerDetailsSection: React.FC<CustomerDetailsProps> = ({
  details,
  currentInvoiceId,
  handleDetailChange,
  isReadOnly,
  isPaymentTypeDisabled,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  return(
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <User className="h-5 w-5 text-gray-600" />
      بيانات العميل
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="اسم العميل (اختياري)"
          value={details.customerName}
          onChange={(e) => handleDetailChange("customerName", e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 read-only:bg-gray-100 read-only:cursor-not-allowed"
          readOnly={isReadOnly}
        />
      </div>
      
      <div className="relative">
        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="رقم هاتف العميل (اختياري)"
          value={details.customerPhone}
          onChange={(e) => handleDetailChange("customerPhone", e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 read-only:bg-gray-100 read-only:cursor-not-allowed"
          readOnly={isReadOnly}
        />
      </div>
      
      <div className="relative">
        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          value={details.paymentType}
          onChange={async(e) => {handleDetailChange("paymentType", e.target.value);
          if(isReadOnly){
            console.log("Payment type is read-only, cannot update.", details,isPaymentTypeDisabled, currentInvoiceId);
            if(!isPaymentTypeDisabled){
              await dispatch(updateInvoice({invoiceId:currentInvoiceId, paymentType:e.target.value}));
              showSuccess("تم تحديث الفاتورة بنجاح");
            }
          }  

          }}
          className={`w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none cursor-pointer ${isPaymentTypeDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={isPaymentTypeDisabled}
        >
          <option value="خالص">خالص</option>
          <option value="أجل">أجل</option>
          <option value="مرتجع">مرتجع</option>
        </select>
      </div>
    </div>
  </div>
  
);
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveProduct,
  isReadOnly,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          المنتجات المضافة ({products.length})
        </h2>
      </div>
      
      {products.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">لا توجد منتجات مضافة</p>
          <p className="text-gray-400 text-sm mt-2">ابحث عن منتج وأضفه للفاتورة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المنتج</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">الكمية</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">السعر</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">الإجمالي</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.barcode && (
                        <p className="text-sm text-gray-500 font-mono">{product.barcode}</p>
                      )}
                      <p className="text-xs text-gray-400">المتوفر: {product.availableQuantity}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(index, Math.max(1, product.quantity - 1))}
                        disabled={isReadOnly || product.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="number"
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(product.availableQuantity, parseInt(e.target.value) || 1));
                          onUpdateQuantity(index, value);
                        }}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max={product.availableQuantity}
                        value={product.quantity}
                        readOnly={isReadOnly}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(index, Math.min(product.availableQuantity, product.quantity + 1))}
                        disabled={isReadOnly || product.quantity >= product.availableQuantity}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 0)}
                      className="w-24 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.01"
                      min="0"
                      disabled
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-green-600">
                      {(product.quantity * product.price).toFixed(2)} ج.م
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveProduct(index)}
                      disabled={isReadOnly}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  products,
  discount,
  onDiscountChange,
  isReadOnly,
}) => {
  const subtotal = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-gray-600" />
        ملخص الفاتورة
      </h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">الإجمالي الفرعي:</span>
          <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} ج.م</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">الخصم:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={discount}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
              step="0.1"
              readOnly={isReadOnly}
            />
            <span className="text-gray-600">%</span>
            <span className="font-medium text-red-600 ml-2">
              -{discountAmount.toFixed(2)} ج.م
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">الإجمالي النهائي:</span>
            <span className="text-xl font-bold text-green-600">{total.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Printable Invoice Component --------------------
const PrintableInvoice: React.FC<{
  products: Product[];
  invoiceDetails: InvoiceDetails;
  invoiceId: number | null;
}> = ({ products, invoiceDetails, invoiceId }) => {
  const subtotal = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
  const discountAmount = (subtotal * invoiceDetails.invoiceDiscount) / 100;
  const total = subtotal - discountAmount;

  // Format current date and time
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <div className="bg-white p-8 max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">مكتب خدمات الميكانيكا</h1>
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div>التاريخ: {formattedDateTime}</div>
          <div>رقم الفاتورة: {invoiceId || '3712'}</div>
        </div>
      </div>
      
      {/* Customer Info */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">العميل:</span> {invoiceDetails.customerName || "غير محدد"}
          </div>
          <div>
            <span className="font-medium">الهاتف:</span> {invoiceDetails.customerPhone || "-"}
          </div>
          <div className="col-span-2">
            <span className="font-medium">طريقة الدفع:</span> {invoiceDetails.paymentType}
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 text-right font-medium text-gray-700">الخدمة</th>
              <th className="py-2 text-center font-medium text-gray-700">الكمية</th>
              <th className="py-2 text-left font-medium text-gray-700">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2 text-right">{product.name}</td>
                <td className="py-2 text-center">{product.quantity}</td>
                <td className="py-2 text-left">{(product.quantity * product.price).toFixed(2)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span>الإجمالي الفرعي:</span>
          <span>{subtotal.toFixed(2)} ج.م</span>
        </div>
        {invoiceDetails.invoiceDiscount > 0 && (
          <div className="flex justify-between mb-1 text-red-600">
            <span>الخصم ({invoiceDetails.invoiceDiscount}%):</span>
            <span>-{discountAmount.toFixed(2)} ج.م</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
          <span>المجموع:</span>
          <span>{total.toFixed(2)} ج.م</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
        <p>جميع الحقوق محفوظة © 2025</p>
        <p>01092758520</p>
      </div>
    </div>
  );
};

// -------------------- Main Page Component --------------------
const CreateInvoicePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [openPrint, setOpenPrint] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    customerName: "",
    customerPhone: "",
    paymentType: "خالص",
    invoiceDiscount: 0,
  });
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [isViewingArchived, setIsViewingArchived] = useState(false);
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);
  const [canGoBefore, setCanGoBefore] = useState(false);
  const [canGoAfter, setCanGoAfter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isFirstInvoice, setIsFirstInvoice] = useState(false);
  const [isLastInvoice, setIsLastInvoice] = useState(false);
  const to = null;
  const from = null;
  const invoiceType = null;

  const showWarningFunc = (message: string) => {
    setWarningMessage(message);
    showWarning(message);
    setTimeout(() => setWarningMessage(null), 3000); // Auto-hide after 3 seconds
  };

  const focusSearchInput = () => {
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    focusSearchInput();
    
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + / - Focus search input
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        focusSearchInput();
      }
      
      // Ctrl + S - Save invoice
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (!isViewingArchived && products.length > 0) {
          saveInvoice();
        }
      }
      
      // Ctrl + P - Print invoice
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (products.length > 0) {
          setOpenPrint(true);
        }
      }
      
      // Ctrl + N - New invoice
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        resetInvoice();
      }
      
      // Enter - Add product
      if (e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        if (!isViewingArchived && searchValue.trim() !== "") {
          addSampleProduct();
        }
      }
      
      // Escape - Clear search or close modals
      if (e.key === 'Escape') {
        if (openPrint) {
          setOpenPrint(false);
        } else if (searchValue) {
          setSearchValue("");
        }
      }
      
      // F1 - Show shortcuts help
      if (e.key === 'F1') {
        e.preventDefault();
        alert(`اختصارات لوحة المفاتيح:
        
Ctrl + / : التركيز على البحث
Ctrl + S : حفظ الفاتورة
Ctrl + P : طباعة الفاتورة
Ctrl + N : فاتورة جديدة
Enter : إضافة منتج
Escape : إلغاء/إغلاق
F1 : عرض هذه المساعدة`);
      }
      
      // Arrow keys for navigation between invoices
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canGoBefore && !isLoading) {
          previous();
        }
      }
      
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (canGoAfter && !isLoading) {
          next();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, isViewingArchived, openPrint, searchValue, canGoBefore, canGoAfter, isLoading]);

  const resetInvoice = useCallback(() => {
    setProducts([]);
    setInvoiceDetails({
      customerName: "",
      customerPhone: "",
      paymentType: "خالص",
      invoiceDiscount: 0,
    });
    fetchPreviousInvoice(false);
    setCurrentInvoiceId(null);
    setIsViewingArchived(false);
    setIsInvoiceCreated(false);
    setCanGoBefore(false);
    setCanGoAfter(false);
    setIsFirstInvoice(false);
    setIsLastInvoice(false);
    focusSearchInput();
  }, []);

  const handleDetailChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, quantity } : product
    ));
  };

  const handleUpdatePrice = (index: number, price: number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, price } : product
    ));
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleDiscountChange = (discount: number) => {
    setInvoiceDetails(prev => ({ ...prev, invoiceDiscount: discount }));
  };

  const addSampleProduct = async() => {
    if (!searchValue.trim()) {
      showWarningFunc("الرجاء إدخال اسم المنتج أو الباركود");
      return;
    }
    
    const data = await dispatch(ProductByBarcode({name:searchValue}));
    console.log("returned products->", searchValue, data);
    
    // Check if product exists and has available quantity
    if (!data?.payload || data.payload.quantity <= 0) {
      showWarningFunc(`المنتج "${data?.payload?.name || searchValue}" غير متوفر في المخزون`);
      return;
    }
    
    const sampleProduct: Product = {
      id: data?.payload?.id,
      name: data?.payload?.name,
      price: +data?.payload?.price,
      quantity: 1, // Default to 1
      availableQuantity: data?.payload?.quantity, // Store available quantity separately
      barcode: data.payload.barcode,
    };
    setProducts(prev => [...prev, sampleProduct]);
    setSearchValue("");
  };

  const saveInvoice = async () => {
    if (products.length === 0) {
      alert("يجب إضافة منتج واحد على الأقل للفاتورة");
      return;
    }
    setIsSaving(true);
    try {
      const subtotal = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
      const discountAmount = (subtotal * invoiceDetails.invoiceDiscount) / 100;
      const total = subtotal - discountAmount;
      const invoiceData = {
        products: products.map(product => ({
          id: product.id,
          quantity: product.quantity,
          price: product.price,
          discount:0,
        })),
        total: subtotal,
        netTotal: total,
        customerName : invoiceDetails.customerName,
        customerPhone: invoiceDetails.customerPhone,
        invoiceDiscount: invoiceDetails.invoiceDiscount,
        paymentType: invoiceDetails.paymentType,
      };
      const result = await dispatch(createInvoice(invoiceData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess("تم حفظ الفاتورة بنجاح!");
        setIsInvoiceCreated(true);
        setCurrentInvoiceId(result.payload?.id || null);
        setIsViewingArchived(true);
        resetInvoice();
        
        // After saving, check if there are previous/next invoices
        if (result.payload?.id) {
          // Check if there's a previous invoice
          const prevResult = await dispatch(beforeInvoice({ id: result.payload.id }));
          setCanGoBefore(!!prevResult?.payload?.data);
          
          // Check if there's a next invoice
          const nextResult = await dispatch(afterInvoice({
            id: result.payload.id,
            filter: { to, from, invoiceType },
          }));
          setCanGoAfter(!!nextResult?.payload?.data);
        
        }
      } else {
        alert("حدث خطأ أثناء حفظ الفاتورة");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("حدث خطأ أثناء حفظ الفاتورة");
    } finally {
      setIsSaving(false);
    }
  };

const SaveAndPrintInvoice = async() =>{
    if (products.length === 0) {
      alert("يجب إضافة منتج واحد على الأقل للفاتورة");
      return;
    }
    setIsSaving(true);
    try {
      const subtotal = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
      const discountAmount = (subtotal * invoiceDetails.invoiceDiscount) / 100;
      const total = subtotal - discountAmount;
      const invoiceData = {
        products: products.map(product => ({
          id: product.id,
          quantity: product.quantity,
          price: product.price,
          discount:0,
        })),
        total: subtotal,
        netTotal: total,
        customerName : invoiceDetails.customerName,
        customerPhone: invoiceDetails.customerPhone,
        invoiceDiscount: invoiceDetails.invoiceDiscount,
        paymentType: invoiceDetails.paymentType,
      };
      const result = await dispatch(createInvoice(invoiceData));
       await dispatch(printInvoice(invoiceData));

      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess("تم حفظ الفاتورة بنجاح!");
        setIsInvoiceCreated(true);
        setCurrentInvoiceId(result.payload?.id || null);
        setIsViewingArchived(true);
        resetInvoice();
        
        // After saving, check if there are previous/next invoices
        if (result.payload?.id) {
          // Check if there's a previous invoice
          const prevResult = await dispatch(beforeInvoice({ id: result.payload.id }));
          setCanGoBefore(!!prevResult?.payload?.data);
          
          // Check if there's a next invoice
          const nextResult = await dispatch(afterInvoice({
            id: result.payload.id,
            filter: { to, from, invoiceType },
          }));
          setCanGoAfter(!!nextResult?.payload?.data);
        
        }
      } else {
        alert("حدث خطأ أثناء حفظ الفاتورة");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("حدث خطأ أثناء حفظ الفاتورة");
    } finally {
      setIsSaving(false);
    }
}
  
  const updateInvoiceUI = (data: any) => {
    console.log("Updating invoice UI with data:", data);
    setProducts(data.items || []);
    setInvoiceDetails({
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      paymentType: data.paymentType || "خالص",
      invoiceDiscount: data.invoiceDiscount || 0,
    });
    setCurrentInvoiceId(data.id);
    setIsViewingArchived(true);
    setIsInvoiceCreated(true);
    
    // Update navigation flags based on invoice position
    setIsFirstInvoice(!!data.first);
    setIsLastInvoice(!!data.last);
    setCanGoBefore(!data.first || data.first === data.id? false : true);
    setCanGoAfter( !data?false:true);
  };
   async function fetchPreviousInvoice(newInvoice = true) {
    console.log("Fetching previous invoice for ID:", currentInvoiceId);
    const result = await dispatch(beforeInvoice({ id: newInvoice? currentInvoiceId :null}));
    const data = result?.payload?.data;
    if (!data) {
      setCanGoBefore(false);
      setIsFirstInvoice(true);
    } else {
      setCanGoBefore(true);
    }
  }
useEffect(() => {
 
  fetchPreviousInvoice();
}, []);
  const previous = async () => {
    console.log("inv->", currentInvoiceId);
    setIsLoading(true);
    try {
      const result = await dispatch(beforeInvoice({ id: currentInvoiceId }));
      console.log(result);
      const data = result?.payload?.data;
      console.log("previous invoice data:", data);
      
      if (!data) {
        setCanGoBefore(false);
        setIsFirstInvoice(true);
      } else {
        updateInvoiceUI(data);
      }
    } catch (error) {
      console.error("Error fetching previous invoice:", error);
      showWarningFunc("حدث خطأ أثناء جلب الفاتورة السابقة");
    } finally {
      setIsLoading(false);
    }
  };

  const next = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(afterInvoice({
        id: currentInvoiceId,
        filter: { to, from, invoiceType },
      }));
      const data = result?.payload?.data;
      
      if (!data) {
        setCanGoAfter(false);
        setCurrentInvoiceId(null);
        resetInvoice();
        setIsLastInvoice(true);
        fetchPreviousInvoice(false);
      } else {
        updateInvoiceUI(data);
      }
    } catch (error) {
      console.error("Error fetching next invoice:", error);
      showWarningFunc("حدث خطأ أثناء جلب الفاتورة التالية");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine if payment type should be disabled
  const isPaymentTypeDisabled = isViewingArchived && 
    (invoiceDetails.paymentType === "خالص" || invoiceDetails.paymentType === "مرتجع");

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {warningMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <InvoiceHeader
          onPrevious={previous}
          onNext={next}
          canGoBefore={canGoBefore}
          canGoAfter={canGoAfter}
          onNewInvoice={resetInvoice}
          isLoading={isLoading}
        />
        <CustomerDetailsSection
          details={invoiceDetails}
          currentInvoiceId={currentInvoiceId}
          handleDetailChange={handleDetailChange}
          isReadOnly={isViewingArchived}
          isPaymentTypeDisabled={isPaymentTypeDisabled}
        />
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-600" />
            البحث عن المنتجات
          </h2>
          
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث عن منتج بالاسم أو الباركود... (Ctrl + /)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                disabled={isViewingArchived}
              />
            </div>
            <Button
              onClick={addSampleProduct}
              disabled={isViewingArchived}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        </div>
        <ProductTable
          products={products}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdatePrice={handleUpdatePrice}
          onRemoveProduct={handleRemoveProduct}
          isReadOnly={isViewingArchived}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InvoiceSummary
            products={products}
            discount={invoiceDetails.invoiceDiscount}
            onDiscountChange={handleDiscountChange}
            isReadOnly={isViewingArchived}
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات</h2>
            <div className="space-y-3">
              <Button
                onClick={SaveAndPrintInvoice}
                disabled={isViewingArchived || isSaving || products.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "جاري الحفظ..." : "حفظ وطباعة  الفاتورة (Ctrl + S)"}
              </Button>
              
              <Button
                onClick={saveInvoice}
                disabled={products.length === 0}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                حفظ الفاتورة (Ctrl + P)
              </Button>
              
              <Button
                onClick={resetInvoice}
                disabled={isViewingArchived}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                إلغاء الفاتورة (Ctrl + N)
              </Button>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">اختصارات سريعة:</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl + /</kbd> البحث</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> إضافة منتج</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F1</kbd> عرض جميع الاختصارات</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> إلغاء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Print Modal */}
 <Modal
          onConfirm={async () => {
            window.print();
            if (!isViewingArchived) {
              await saveInvoice();
            }
              setOpenPrint(false);
          }}
          open={openPrint}
          itemLabel="طباعة الفاتورة"
          title="طباعة الفاتورة"
          confirmLabel="طباعة"
          onClose={() => setOpenPrint(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Printer className="h-5 w-5" />
              طباعة الفاتورة
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">سيتم طباعة الفاتورة مع التفاصيل التالية:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>عدد المنتجات:</strong> {products.length}</p>
                <p><strong>الإجمالي:</strong> {products.reduce((sum, product) => sum + (product.quantity * product.price), 0).toFixed(2)} ج.م</p>
                <p><strong>العميل:</strong> {invoiceDetails.customerName || "غير محدد"}</p>
                <p><strong>طريقة الدفع:</strong> {invoiceDetails.paymentType}</p>
              </div>
              
              {/* Printable Invoice Preview */}
              <div className="border hidden border-gray-300 rounded-lg p-4 bg-white">
                <PrintableInvoice 
                  products={products}
                  invoiceDetails={invoiceDetails}
                  invoiceId={currentInvoiceId}
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateInvoicePage;