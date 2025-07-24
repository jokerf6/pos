import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { searchProducts } from "../../store/slices/productsSlice";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../components/ui/sonner";
import {
  afterInvoice,
  beforeInvoice,
  createInvoice,
  updateInvoice,
} from "../../store/slices/invoice";
import { getByKey } from "../../store/slices/settingsSlice";
import { Button } from "../../components/ui/button";
import Modal from "../../components/common/dynamic-modal.component";
import {
  Loader2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Printer,
} from "lucide-react";

const InvoiceHeader = ({ onPrevious, onNext, canGoBefore, onNewInvoice }) => (
  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
    <Button onClick={onPrevious} disabled={!canGoBefore} variant="outline">
      <ArrowLeft className="mr-2 h-4 w-4" /> فاتورة سابقة
    </Button>
    <Button onClick={onNewInvoice} variant="secondary">
      <PlusCircle className="mr-2 h-4 w-4" /> فاتورة جديدة
    </Button>
    <Button onClick={onNext} variant="outline">
      فاتورة تالية <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

const InvoiceDetailsForm = ({ details, setDetails, isReadOnly }) => {
  const handleDetailChange = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="اسم العميل (اختياري)"
        value={details.customerName}
        onChange={(e) => handleDetailChange("customerName", e.target.value)}
        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
        readOnly={isReadOnly}
      />
      <input
        type="text"
        placeholder="رقم هاتف العميل (اختياري)"
        value={details.customerPhone}
        onChange={(e) => handleDetailChange("customerPhone", e.target.value)}
        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default function CreateInvoicePage() {
  const searchInputRef = useRef(null);
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    customerName: "",
    customerPhone: "",
    paymentType: "خالص",
    invoiceDiscount: 0,
  });

  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [isViewingArchived, setIsViewingArchived] = useState(false);
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);
  const [canGoBefore, setCanGoBefore] = useState(true);

  const focusSearchInput = () => {
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    focusSearchInput();
  }, []);

  const resetInvoice = useCallback(() => {
    setProducts([]);
    setInvoiceDetails({
      customerName: "",
      customerPhone: "",
      paymentType: "خالص",
      invoiceDiscount: 0,
    });
    setSearchValue("");
    setCurrentInvoiceId(null);
    setIsViewingArchived(false);
    setIsInvoiceCreated(false);
    setCanGoBefore(true);
    focusSearchInput();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (openPrint) {
          setOpenPrint(false);
          if (isInvoiceCreated) resetInvoice();
        } else if (
          searchValue.trim() &&
          !isViewingArchived &&
          !isInvoiceCreated
        ) {
          addProduct();
        } else if (products.length > 0) {
          handleMainButtonClick();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    searchValue,
    products,
    openPrint,
    resetInvoice,
    isViewingArchived,
    isInvoiceCreated,
  ]);

  const addProduct = async () => {
    if (!searchValue.trim()) return;
    const result = await dispatch(
      searchProducts({ name: searchValue, page: 1, limit: 1 })
    );
    if (result.payload.products.length > 0) {
      const product = result.payload.products[0];
      if (product.quantity > 0) {
        const existingProduct = products.find((p) => p.id === product.id);
        if (existingProduct) {
          updateProduct(product.id, "quantity", existingProduct.quantity + 1);
        } else {
          setProducts((prev) => [
            ...prev,
            {
              id: product.id,
              name: product.name,
              totalQuantity: product.quantity,
              quantity: 1,
              price: product.price,
              discount: 0,
            },
          ]);
        }
        setSearchValue("");
        focusSearchInput(); // -- تعديل: إعادة التركيز بعد إضافة المنتج
      } else {
        showWarning("المنتج غير متوفر في المخزن");
      }
    } else {
      showError("المنتج غير موجود");
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newValue = Number(value) || 0;
          if (field === "quantity" && newValue > p.totalQuantity) {
            showWarning(`الكمية القصوى المتاحة هي ${p.totalQuantity}`);
            return { ...p, [field]: p.totalQuantity };
          }
          return { ...p, [field]: newValue };
        }
        return p;
      })
    );
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    focusSearchInput(); // -- تعديل: إعادة التركيز بعد حذف المنتج
  };

  const calculateRowTotal = (product) =>
    product.quantity * product.price - product.discount;
  const total = products.reduce((sum, p) => sum + calculateRowTotal(p), 0);
  const netTotal = total - invoiceDetails.invoiceDiscount;

  const updateInvoiceUI = useCallback(
    (data) => {
      if (!data) {
        resetInvoice();
        return;
      }
      setIsViewingArchived(true);
      setIsInvoiceCreated(false);
      setCurrentInvoiceId(data.id);
      setInvoiceDetails({
        customerName: data.customerName || "",
        customerPhone: data.customerPhone || "",
        paymentType: data.paymentType || "خالص",
        invoiceDiscount: data.discount || 0,
      });
      setProducts(
        data.items.map((p) => ({
          id: p.itemId,
          name: p.name,
          totalQuantity: p.totalQuantity,
          quantity: p.quantity,
          price: p.pricePerUnit,
          discount: p.discount,
        }))
      );
      focusSearchInput();
    },
    [resetInvoice]
  );

  const previous = async () => {
    const result = await dispatch(beforeInvoice({ id: currentInvoiceId }));
    if (result.payload.data) {
      console.log("Previous invoice data:", result.payload.data);
      updateInvoiceUI(result.payload.data);
    } else {
      setCanGoBefore(false);
      showWarning("لا توجد فواتير سابقة.");
    }
  };

  const after = async () => {
    if (!currentInvoiceId) {
      resetInvoice();
      return;
    }
    const result = await dispatch(afterInvoice({ id: currentInvoiceId }));
    if (result.payload.data) {
      updateInvoiceUI(result.payload.data);

      setCanGoBefore(true);
    } else {
      showWarning("وصلت إلى آخر فاتورة، سيتم الآن إنشاء فاتورة جديدة.");
      resetInvoice();
    }
  };

  const handleCreateInvoice = async () => {
    if (products.length === 0) {
      showError("يجب إضافة منتجات أولاً.");
      return;
    }
    setIsLoading(true);
    const warningResult = await dispatch(getByKey("warning"));
    const warningThreshold = warningResult.payload.data.value;
    products.forEach((p) => {
      if (+warningThreshold >= p.totalQuantity - p.quantity) {
        showWarning(
          `الكمية المتبقية من ${p.name} (${p.totalQuantity - p.quantity}) تقترب من النفاذ.`
        );
      }
    });
    const invoiceData = { ...invoiceDetails, products, total, netTotal };
    const result = await dispatch(createInvoice(invoiceData));
    setIsLoading(false);
    if (result.error) {
      showError("حدث خطأ أثناء إنشاء الفاتورة.");
    } else {
      showSuccess("تم إنشاء الفاتورة بنجاح!");
      setIsInvoiceCreated(true);
      setOpenPrint(true);
    }
  };

  const handleMainButtonClick = () => {
    if (isViewingArchived || isInvoiceCreated) {
      setOpenPrint(true);
    } else {
      handleCreateInvoice();
    }
  };

  const isReadOnly = isViewingArchived || isInvoiceCreated;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 space-y-4 bg-white">
      <InvoiceHeader
        onPrevious={previous}
        onNext={after}
        canGoBefore={canGoBefore}
        onNewInvoice={resetInvoice}
      />

      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <InvoiceDetailsForm
          details={invoiceDetails}
          setDetails={setInvoiceDetails}
          isReadOnly={isReadOnly}
        />
      </div>

      <div className="flex gap-2">
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          placeholder={
            isReadOnly
              ? "لا يمكن التعديل على هذه الفاتورة"
              : "ابحث بالاسم أو الباركود..."
          }
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          disabled={isReadOnly}
        />
        <Button
          onClick={addProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isReadOnly}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> إضافة
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">
                اسم المنتج
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                الكمية
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                السعر
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                الخصم
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                الإجمالي
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                حذف
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      min={1}
                      max={p.totalQuantity}
                      value={p.quantity}
                      onChange={(e) =>
                        updateProduct(p.id, "quantity", e.target.value)
                      }
                      className="w-20 p-1 border rounded-md text-center read-only:bg-gray-100"
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      value={p.price}
                      className="w-24 p-1 border rounded-md text-center read-only:bg-gray-100"
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      value={p.discount}
                      onChange={(e) =>
                        updateProduct(p.id, "discount", e.target.value)
                      }
                      className="w-24 p-1 border rounded-md text-center read-only:bg-gray-100"
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {calculateRowTotal(p).toFixed(2)} ج
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(p.id)}
                      disabled={isReadOnly}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  لم تتم إضافة أي منتجات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t">
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold">نوع السداد:</span>
          {["خالص", "أجل", "مرتجع"].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-2 ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name="paymentType"
                value={type}
                checked={invoiceDetails.paymentType === type}
                onChange={async (e) => {
                  if (!isReadOnly) {
                    setInvoiceDetails({
                      ...invoiceDetails,
                      paymentType: e.target.value,
                    });
                  } else {
                    setInvoiceDetails({
                      ...invoiceDetails,
                      paymentType: e.target.value,
                    });
                    await dispatch(
                      updateInvoice({
                        invoiceId: currentInvoiceId,
                        invoiceType: e.target.value,
                      })
                    );
                  }
                }}
                className="form-radio h-4 w-4 text-blue-600"
                disabled={isReadOnly && invoiceDetails.paymentType !== "أجل"}
              />
              {type}
            </label>
          ))}
        </div>
        <div className="space-y-2 text-right font-medium">
          <div className="flex justify-between items-center">
            <span>الإجمالي:</span> <span>{total.toFixed(2)} ج</span>
          </div>
          <div className="flex justify-between items-center">
            <span>الخصم على الفاتورة:</span>
            <input
              type="number"
              value={invoiceDetails.invoiceDiscount}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  invoiceDiscount: Number(e.target.value) || 0,
                })
              }
              className="p-1 border rounded-md w-28 text-right read-only:bg-gray-100"
              readOnly={isReadOnly}
            />
          </div>
          <div className="flex justify-between items-center text-xl font-bold text-blue-600 border-t pt-2">
            <span>الصافي:</span>
            <span>{netTotal.toFixed(2)} ج</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleMainButtonClick}
        disabled={isLoading || products.length === 0}
        className="w-full py-3 text-lg text-white transition-colors duration-300"
        style={{ backgroundColor: isReadOnly ? "#3b82f6" : "#16a34a" }}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> جاري العمل...
          </>
        ) : isReadOnly ? (
          <>
            <Printer className="mr-2 h-5 w-5" /> طباعة الفاتورة
          </>
        ) : (
          "حفظ وإنشاء الفاتورة"
        )}
      </Button>

      <Modal
        open={openPrint}
        onClose={() => {
          setOpenPrint(false);
          if (isInvoiceCreated) resetInvoice();
        }}
        onConfirm={() => {
          /* handelPrint(); */ setOpenPrint(false);
          if (isInvoiceCreated) resetInvoice();
        }}
        title="طباعة الفاتورة"
        confirmLabel="طباعة"
        cancelLabel="إغلاق"
      >
        <div>محتوى طباعة الفاتورة يوضع هنا...</div>
      </Modal>
    </div>
  );
}
