import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct, generateBarCode, ProductByBarcode } from "../../store/slices/productsSlice";
import { getCategories, CategoryById } from "../../store/slices/categoriesSlice";
import * as JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import Modal from "../../components/common/dynamic-modal.component";
import { Package, Save, ArrowLeft } from "lucide-react";

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categories = useSelector((state: any) => state.categories);
  const [categoryData, setCategoryData] = useState<{ id: string; name: string } | null>(null);
  const [barcodeNumber, setBarcodeNumber] = useState(0);
  const [openPrint, setOpenPrint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    new_quantity: 0,
    price: 0,
    buy_price: 0,
    barcode: undefined as string | undefined,
    generated_code: undefined as string | undefined,
    category_id: 0,
  });

  // تحميل بيانات المنتج والفئات
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await dispatch(getCategories() as any);
        
        if (id) {
          const result = await dispatch(ProductByBarcode({name:id}) as any) as any;
          if (!result.error) {
            const productData = result.payload;
            
            if (productData.category_id) {
              const categoryResult = await dispatch(CategoryById(productData.category_id) as any);
              if (!categoryResult.error) {
                setCategoryData(categoryResult.payload.user);
              }
            }
            
            setFormData({
              name: productData.name || "",
              quantity: productData.quantity || 0,
              new_quantity: 0,
              price: productData.price || 0,
              buy_price: productData.buy_price || 0,
              barcode: productData.barcode || undefined,
              generated_code: undefined,
              category_id: productData.category_id || 0,
            });
          } else {
            showError(result?.payload || "فشل في جلب بيانات المنتج");
            navigate("/products");
          }
        }
      } catch (error) {
        showError("فشل في تحميل البيانات");
        navigate("/products");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, id, navigate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCategoryChange = (category: { id: string; name: string }) => {
    setCategoryData(category);
    setFormData((prev) => ({
      ...prev,
      category_id: Number(category.id),
    }));
  };

  const GenerateBarCode = async () => {
    try {
      const result = await dispatch(generateBarCode({}) as any);
      if (!result.error) {
        setFormData((prev) => ({
          ...prev,
          generated_code: result.payload || undefined,
        }));
      } else {
        showError(result?.payload || "فشل في توليد الباركود");
      }
    } catch (error) {
      showError("حدث خطأ أثناء توليد الباركود");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const updatedData = {
        ...formData,
        quantity: formData.quantity + Number(formData.new_quantity)
      };
      console.log("Submitting updated data:", updatedData);
      
      const result = await dispatch(updateProduct({
        id: Number(id),
        ...updatedData
      }) as any);
      
      if (!result.error) {
        showSuccess("تم تحديث المنتج بنجاح");
        navigate("/products");
      } else {
        showError(result?.payload || "فشل في تحديث المنتج");
      }
    } catch (error) {
      showError("حدث خطأ أثناء تحديث المنتج");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((formData.generated_code || formData.barcode) && barcodeNumber > 0) {
      for (let i = 0; i < barcodeNumber; i++) {
        const svg = document.getElementById(`barcode-${i}`);
        if (svg) {
          JsBarcode.default(svg, (formData.generated_code || formData.barcode) as string, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
          });
        }
      }
    }
  }, [formData.generated_code, formData.barcode, barcodeNumber]);

  const handelPrint = useReactToPrint({
    contentRef: printRef,
  });

  const fields = [
    { name: "barcode", placeholder: "الباركود", disabled: true },
    { name: "name", placeholder: "اسم المنتج" },
    { name: "price", placeholder: "سعر البيع", type: "number" },
    { name: "buy_price", placeholder: "سعر الشراء", type: "number" },
    { name: "new_quantity", placeholder: "إضافة كمية", type: "number" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" dir="rtl">
      <Modal
        open={openPrint}
        onClose={() => setOpenPrint(false)}
        onConfirm={() => {
          handelPrint();
          setOpenPrint(false);
        }}
        title="طباعة باركود"
        confirmLabel="طباعة"
        cancelLabel="إلغاء"
      >
        <div className="flex items-center gap-2 flex-row-reverse">
          <label className="text-sm whitespace-nowrap">عدد الباركود</label>
          <Input
            min={1}
            max={100}
            type="number"
            value={barcodeNumber}
            onChange={(e) => setBarcodeNumber(Number(e.target.value))}
          />
        </div>
      </Modal>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4 ml-1" />
          رجوع
        </Button>
        <h2 className="text-2xl font-bold">تعديل المنتج</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium">{field.placeholder}</label>
              <Input
                name={field.name}
                type={field.type || "text"}
                min={field.type === "number" ? 0 : undefined}
                disabled={field.disabled}
                value={(formData as any)[field.name] || ""}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-sm font-medium">الفئة</label>
            <select
              className="w-full border p-2 rounded-md"
              value={formData.category_id}
              onChange={(e) => {
                const selectedCategory = categories?.categories?.find(
                  (cat: any) => cat.id === Number(e.target.value)
                );
                if (selectedCategory) handleCategoryChange(selectedCategory);
              }}
            >
              <option value="">اختر الفئة</option>
              {categories?.categories?.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>الكمية الحالية:</strong> {formData.quantity}
            </p>
            {formData.new_quantity > 0 && (
              <p className="text-blue-800 text-sm mt-1">
                <strong>إجمالي الكمية بعد التحديث:</strong> {formData.quantity + Number(formData.new_quantity)}
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-1" />
                  حفظ التعديلات
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>

      <div className="hidden">
        <div ref={printRef}>
          {Array.from({ length: barcodeNumber }).map((_, idx) => (
            <div key={idx} className="mb-4 text-center">
              <h3 className="font-bold">{formData.name}</h3>
              <svg id={`barcode-${idx}`} />
              <p className="mt-1">{formData.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;