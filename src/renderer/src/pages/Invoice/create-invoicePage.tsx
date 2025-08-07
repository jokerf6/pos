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
import { beforeInvoice, createInvoice } from "store/slices/invoice";

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
  handleDetailChange: (field: string, value: string | number) => void;
  isReadOnly: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
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
  handleDetailChange,
  isReadOnly,
}) => (
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
          onChange={(e) => handleDetailChange("paymentType", e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 read-only:bg-gray-100 read-only:cursor-not-allowed appearance-none"
          disabled={isReadOnly}
        >
          <option value="خالص">خالص</option>
          <option value="آجل">آجل</option>
          <option value="نقدي">نقدي</option>
          <option value="بطاقة ائتمان">بطاقة ائتمان</option>
        </select>
      </div>
    </div>
  </div>
);

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveProduct,
  isReadOnly,
}) => (
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
                      value={product.quantity}
                      onChange={(e) => onUpdateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      readOnly={isReadOnly}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(index, product.quantity + 1)}
                      disabled={isReadOnly}
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
  const [canGoBefore, setCanGoBefore] = useState(true);
  const [canGoAfter, setCanGoAfter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const to = null;
  const from = null;
  const invoiceType = null;

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
      
      // Ctrl + A - Add sample product (for testing)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        if (!isViewingArchived) {
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
Ctrl + A : إضافة منتج تجريبي
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
    setCurrentInvoiceId(null);
    setIsViewingArchived(false);
    setIsInvoiceCreated(false);
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

  const addSampleProduct = () => {
    const sampleProduct: Product = {
      id: Date.now(),
      name: `منتج تجريبي ${products.length + 1}`,
      price: 10.00,
      quantity: 1,
      barcode: `${Date.now()}`,
    };
    setProducts(prev => [...prev, sampleProduct]);
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
        items: products.map(product => ({
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
          total: product.quantity * product.price,
        })),
        total_amount: total,
        customer_info: {
          name: invoiceDetails.customerName,
          phone: invoiceDetails.customerPhone,
        },
        payment_method: invoiceDetails.paymentType,
      };

      const result = await dispatch(createInvoice(invoiceData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        alert("تم حفظ الفاتورة بنجاح!");
        setIsInvoiceCreated(true);
        setCurrentInvoiceId(result.payload?.id || null);
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

  const [afterInvoiceData, setAfterInvoiceData] = useState<any>(undefined);

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
    setAfterInvoiceData(data.id);
    setIsViewingArchived(true);
    setIsInvoiceCreated(true);
  };

  const previous = async () => {
    console.log("inv->", currentInvoiceId);

    setIsLoading(true);
    try {
      const result = await dispatch(
        beforeInvoice({ id: currentInvoiceId })
      );
      console.log(result);
      const data = result?.payload?.data;
      if (!data) {
        setCanGoBefore(false);
      } else {
        updateInvoiceUI(data);
        setCanGoAfter(true);
      }
    } catch (error) {
      console.error("Error fetching previous invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const next = async () => {
    if (!currentInvoiceId) return;
    setIsLoading(true);
    try {
      const result = await dispatch(
        afterInvoiceData({
          id: currentInvoiceId,
          filter: { to, from, invoiceType },
        })
      );
      const data = result?.payload?.data;
      if (!data) {
        setCanGoAfter(false);
      } else {
        updateInvoiceUI(data);
        setCanGoBefore(true);
      }
    } catch (error) {
      console.error("Error fetching next invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="container mx-auto max-w-7xl">
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
          handleDetailChange={handleDetailChange}
          isReadOnly={isViewingArchived}
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
              إضافة منتج تجريبي
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
                onClick={saveInvoice}
                disabled={isViewingArchived || isSaving || products.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "جاري الحفظ..." : "حفظ الفاتورة (Ctrl + S)"}
              </Button>
              
              <Button
                onClick={() => setOpenPrint(true)}
                disabled={products.length === 0}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                طباعة الفاتورة (Ctrl + P)
              </Button>
              
              <Button
                onClick={resetInvoice}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                إلغاء الفاتورة (Ctrl + N)
              </Button>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">اختصارات سريعة:</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl + /</kbd> البحث</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl + A</kbd> إضافة منتج</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F1</kbd> عرض جميع الاختصارات</p>
                  <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> إلغاء</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        <Modal
          onConfirm={() => {}}
          open={openPrint}
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
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
