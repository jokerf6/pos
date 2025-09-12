import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createProduct,
  ProductByBarcode,
  generateBarCode,
  printBarcode,
} from "../../store/slices/productsSlice";
import {
  getCategories,
  CategoryById,
} from "../../store/slices/categoriesSlice";
import * as JsBarcode from "jsbarcode";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import Modal from "../../components/common/dynamic-modal.component";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";
import { getAll } from "store/slices/unitSlice";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories);

  // مؤقتاً - لحد ما تجيب الـ units من الـ API
  const {units} = useSelector((state:any) => state.units);
  const [categoryData, setCategoryData] = useState<{ id: number; name: string } | null>(null);
  const [barcodeNumber, setBarcodeNumber] = useState(0);
  const [openPrint, setOpenPrint] = useState(false);
  const [isExistingProduct, setIsExistingProduct] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [printData, setPrintData] = useState<any>(null);
  const printRef = useRef(null);

  useEffect(() => {
    GenerateBarCode();
  }, []);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getAll({}));
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    new_quantity: 0,
    price: 0,
    buy_price: 0,
    barcode: "",
    generated_code: "",
    category_id: 0,
    unitId: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quantity: 1,
      new_quantity: 0,
      price: 0,
      buy_price: 0,
      barcode: "",
      generated_code: "",
      category_id: 0,
      unitId: 0,
    });
    setCategoryData(null);
    setIsExistingProduct(false);
    setOriginalQuantity(0);
    // Generate new barcode after reset
    setTimeout(() => {
      GenerateBarCode();
    }, 100);
  };

  const handleSearch = async (name: string) => {
    try {
      if (name.length === 0) {
        resetForm();
        return;
      }
      const result = await dispatch(ProductByBarcode({ name }));
      if (!result.payload.error) {
        const data = result.payload || {};

        if (!data || !data.id) {
          // منتج جديد
          setIsExistingProduct(false);
          setOriginalQuantity(0);
          setFormData(prev => ({
            ...prev,
            name: "",
            description: "",
            quantity: 1,
            new_quantity: 0,
            price: 0,
            buy_price: 0,
            category_id: 0,
            unitId: 0,
            // Keep the current barcode/generated_code when it's a new product
            barcode: name,
          }));
          setCategoryData(null);
        } else {
          // منتج موجود
          setIsExistingProduct(true);
          setOriginalQuantity(data.quantity || 0);

          if (data.category_id) {
            const categoryResult = await dispatch(
              CategoryById(data.category_id) as any
            );
            if (!categoryResult.error) {
              setCategoryData(categoryResult.payload.user);
            } else {
              showError(categoryResult?.payload || "فشل في جلب الفئة");
            }
          } else {
            setCategoryData(null);
          }

          setFormData((prev) => ({
            ...prev,
            name: data.name || "",
            description: data.description || "",
            quantity: data.quantity || 0,
            new_quantity: 0,
            price: data.price || 0,
            buy_price: data.buy_price || 0,
            category_id: data.category_id || 0,
            unitId: data.unitId || 0,
            barcode: name,
            generated_code: "", // Clear generated code for existing products
          }));
        }
      } else {
        showError(result?.payload || "حدث خطأ في البحث");
      }
    } catch {
      showError("فشل الاتصال بالخادم");
    }
  };

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      if (name === "barcode") {
        await handleSearch(value);
      }
      
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

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
        GenerateBarCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const GenerateBarCode = async () => {
    try {
      const result = await dispatch(generateBarCode({}) as any);
      const data = result?.payload || "";
      console.log("Generated barcode:", data);
      
      // Update form data with the new generated code
      setFormData((prev) => ({
        ...prev,
        generated_code: data,
        barcode: data, // Set barcode to the generated code
      }));
      
      // Update print data
      setPrintData((prev:any) => ({
        ...prev,
        generated_code: data,
        barcode: data,
      }));
      
      // Reset to new product state
      setIsExistingProduct(false);
      setOriginalQuantity(0);
    } catch (error) {
      showError("فشل في توليد الباركود");
      console.error("Error generating barcode:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showError("يرجى إدخال اسم المنتج");
      return;
    }

    if (!formData.barcode && !formData.generated_code) {
      showError("يرجى إدخال باركود أو توليد باركود جديد");
      return;
    }

    const submitData = { 
      ...formData,
      // Use the current barcode (either scanned or generated)
      barcode: formData.barcode || formData.generated_code,
    };

    if (isExistingProduct) {
      submitData.quantity = originalQuantity + Number(formData.new_quantity);
    } else {
      submitData.quantity = Number(formData.new_quantity);
    }

    console.log("submitData", submitData);
    
    try {
      const result = await dispatch(createProduct(submitData) as any);
      if (!result.error) {
        showSuccess("تم إضافه المنتج بنجاح");
        setPrintData({
          ...formData,
          barcode: formData.barcode || formData.generated_code,
        });

        if (!isExistingProduct && (formData.generated_code || formData.barcode)) {
          setOpenPrint(true);
        } else {
          resetForm();
        }
      } else {
        showError(result?.payload || "فشل في إضافه المنتج");
      }
    } catch (error) {
      showError("حدث خطأ أثناء إضافة المنتج");
      console.error("Error creating product:", error);
    }
  };

  useEffect(() => {
    const currentBarcode = formData.barcode || formData.generated_code;
    if (currentBarcode && barcodeNumber > 0) {
      for (let i = 0; i < barcodeNumber; i++) {
        const svg = document.getElementById(`barcode-${i}`);
        if (svg) {
          JsBarcode.default(svg, currentBarcode, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
          });
        }
      }
    }
  }, [formData.generated_code, formData.barcode, barcodeNumber]);

  async function handelPrint(){
    const printedBarcode = printData?.barcode || printData?.generated_code;
    if (printedBarcode) {
      await dispatch(printBarcode({...printData, barcode: printedBarcode, copies: barcodeNumber}));
    }
  }

  const fields = [
    { name: "barcode", placeholder: "الباركود", disabled: true },
    { name: "name", placeholder: "اسم المنتج" },
    { name: "category_id", placeholder: "الفئة", type: "select" },
    { name: "unitId", placeholder: "الوحدة", type: "select" },  
    ...(isExistingProduct ? [
      { name: "quantity", placeholder: "الكمية الموجودة", type: "number", disabled: true },
      { name: "new_quantity", placeholder: "الكمية الجديدة", type: "number" }
    ] : [
      { name: "new_quantity", placeholder: "الكمية", type: "number" },
    ]),
    { name: "price", placeholder: "سعر البيع", type: "number" },
    { name: "buy_price", placeholder: "سعر الشراء", type: "number" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-6">
        {/* Modal */}
        <Modal
          open={openPrint}
          onClose={() => {
            setOpenPrint(false);
            setTimeout(() => {
              resetForm();
            }, 100);
          }}
          onConfirm={() => {
            handelPrint();
            setTimeout(() => {
              resetForm();
            }, 100);
            setOpenPrint(false);
          }}
          title="طباعة باركود"
          confirmLabel="طباعة"
          cancelLabel="إلغاء"
        >
          
        </Modal>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isExistingProduct ? "تحديث منتج موجود" : "إضافة منتج جديد"}
            </h2>
          </div>
          <p className="text-gray-600">
            {isExistingProduct 
              ? "قم بتعديل بيانات المنتج أو إضافة كمية جديدة" 
              : "قم بملء البيانات التالية لإضافة منتج جديد إلى المخزون"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium text-gray-700 block">
                  {field.placeholder}
                  {field.disabled && <span className="text-gray-500 text-xs"> (تلقائي)</span>}
                  {field.name === "barcode" && (
                    <span className="text-green-600 text-xs mr-2">
                      يتم إنشاؤه تلقائياً
                    </span>
                  )}
                </label>

                {field.type === "select" && field.name === "category_id" ? (
                  <select
                    name="category_id"
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedCategory = categories?.categories?.find(
                        (cat) => cat.id === Number(selectedId)
                      );
                      setCategoryData(selectedCategory || null);
                      setFormData((prev) => ({
                        ...prev,
                        category_id: Number(selectedId),
                      }));
                    }}
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="">اختر الفئة</option>
                    {categories?.categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : field.type === "select" && field.name === "unitId" ? (
                  <select
                    name="unitId"
                    id="unitId"
                    value={formData.unitId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        unitId: Number(selectedId),
                      }));
                    }}
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="">اختر الوحدة</option>
                    {units.map((unit:any) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <Input
                      ref={field.name === "name" ? searchInputRef : null}
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      min={field.type === "number" ? 0 : undefined}
                      disabled={field.disabled}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className={`flex-1 border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        field.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                      }`}
                    />
                    {field.name === "barcode" && !field.disabled && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={GenerateBarCode}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 px-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700 text-xs"
                      >
                        جديد
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* مجموع الكمية */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">
                <p><strong>الكمية الحالية:</strong> {originalQuantity}</p>
                <p><strong>الكمية الجديدة:</strong> {formData.new_quantity}</p>
                <p className="text-lg font-semibold text-blue-600 mt-2">
                  <strong>إجمالي الكمية:</strong> {originalQuantity + Number(formData.new_quantity)}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Package className="h-4 w-4 ml-2" />
                {isExistingProduct ? "تحديث المنتج" : "إضافة المنتج"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium transition-all duration-200"
                onClick={() => navigate(-1)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;