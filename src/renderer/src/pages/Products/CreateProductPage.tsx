import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createProduct,
  ProductByBarcode,
  generateBarCode,
} from "../../store/slices/productsSlice";
import {
  getCategories,
  CategoryById,
} from "../../store/slices/categoriesSlice";
import * as JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import Modal from "../../components/common/dynamic-modal.component";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories);
  const [categoryData, setCategoryData] = useState(null);
  const [barcodeNumber, setBarcodeNumber] = useState(0);
  const [openPrint, setOpenPrint] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    price: 0,
    buy_price: 0,
    barcode: undefined,
    generated_code: undefined,
    category_id: "",
  });
  const handleSearch = async (name: string) => {
    try {
      if (name.length === 0) {
        setFormData({
          name: "",
          description: "",
          quantity: 1,
          price: 0,
          buy_price: 0,
          barcode: undefined,
          generated_code: undefined,
          category_id: "",
        });
        setCategoryData(null);
        return;
      }
      const result = await dispatch(ProductByBarcode({ name }));
      if (!result.error) {
        const data = result.payload || {};
        // setCategoryData(
        //   categories?.filter((item) => item.id === data.category_id) || null
        // );
        if (!data) {
          setFormData({
            name: "",
            description: "",
            quantity: 1,
            price: 0,
            generated_code: undefined,
            buy_price: 0,
            barcode: undefined,
            category_id: "",
          });
        }
        if (data.category_id) {
          const categoryResult = await dispatch(
            CategoryById(data.category_id) as any
          );
          console.log("categoryResult", categoryResult);
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
          quantity: data.quantity || 1,
          price: data.price || 0,
          buy_price: data.buy_price || 0,
          category_id: data.category_id || "",
        }));
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
      console.log(e.key);
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
    const result = await dispatch(generateBarCode() as any);
    console.log("generateBarCode result", result);
    const data = result?.payload || null;
    console.log("generateBarCode data", data);
    setFormData((prev) => ({
      ...prev,
      generated_code: data || undefined,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createProduct(formData) as any);
    if (!result.error) {
      showSuccess("تم إضافه المنتج بنجاح");
      setCategoryData(null);
      setFormData({
        name: "",
        description: "",
        quantity: 1,
        price: 0,
        buy_price: 0,
        barcode: undefined,
        generated_code: undefined,
        category_id: "",
      });
      setOpenPrint(true);
    } else {
      showError(result?.payload || "فشل في إضافه المنتج");
    }
  };
  useEffect(() => {
    if ((formData.generated_code || formData.barcode) && barcodeNumber > 0) {
      for (let i = 0; i < barcodeNumber; i++) {
        const svg = document.getElementById(`barcode-${i}`);
        if (svg) {
          JsBarcode(svg, formData.generated_code || formData.barcode, {
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
    { name: "barcode", placeholder: "الباركود" },
    { name: "name", placeholder: "اسم المنتج" },
    { name: "description", placeholder: "الوصف", type: "area" },
    { name: "category_id", placeholder: "الفئة", type: "select" }, // Assuming you will handle categories separately

    { name: "quantity", placeholder: "الكمية", type: "number" },
    { name: "price", placeholder: "سعر البيع", type: "number" },
    { name: "buy_price", placeholder: "سعر الشراء", type: "number" },
  ];

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 text-right" dir="rtl">
      <Modal
        open={openPrint}
        onClose={() => {
          setOpenPrint(false);
          setTimeout(() => {
            setFormData({
              name: "",
              description: "",
              quantity: 1,
              price: 0,
              buy_price: 0,
              barcode: undefined,
              generated_code: undefined,
              category_id: "",
            });
          }, 1000);
        }}
        onConfirm={() => {
          handelPrint();
          setTimeout(() => {
            setFormData({
              name: "",
              description: "",
              quantity: 1,
              price: 0,
              buy_price: 0,
              barcode: undefined,
              generated_code: undefined,
              category_id: "",
            });
          }, 1000);

          setOpenPrint(false);
        }}
        title="طباعة باركود"
        confirmLabel="طباعة"
        cancelLabel="إلغاء"
      >
        <div className="flex items-center gap-2 flex-row-reverse">
          <label htmlFor="barcodeCount" className="text-sm whitespace-nowrap">
            عدد الباركود
          </label>
          <Input
            id="barcodeCount"
            name="barcode"
            min={1}
            max={100}
            type="number"
            value={barcodeNumber}
            onChange={(e) => setBarcodeNumber(Number(e.target.value))}
          />
        </div>
      </Modal>

      <h2 className="text-2xl font-bold text-right border-b pb-2">
        إضافة منتج
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label htmlFor={field.name} className="text-sm block font-medium">
              {field.placeholder}
            </label>

            {field.type === "select" ? (
              <div className="space-y-1">
                <label
                  htmlFor="category_id"
                  className="text-sm block text-right"
                >
                  اختر الفئة
                </label>
                <select
                  name="category_id"
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedCategory = categories?.categories?.find(
                      (cat) => cat.id === selectedId
                    );
                    setCategoryData(selectedCategory || null);
                    setFormData((prev) => ({
                      ...prev,
                      category_id: selectedId,
                    }));
                  }}
                  className="w-full border p-2 rounded-md bg-white text-right"
                >
                  <option value="">اختر الفئة</option>
                  {categories?.categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-row-reverse gap-2">
                {field.name === "barcode" && (
                  <Button
                    type="button"
                    onClick={GenerateBarCode}
                    className="whitespace-nowrap"
                  >
                    توليد
                  </Button>
                )}
                <Input
                  ref={field.name === "barcode" ? searchInputRef : null}
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  min={field.type === "number" ? 0 : undefined}
                  value={
                    field.name === "barcode"
                      ? formData.barcode || formData.generated_code
                      : (formData as any)[field.name]
                  }
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between gap-4 mt-6">
          <Button type="submit" className="flex-1">
            إضافة المنتج
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            إلغاء
          </Button>
        </div>
      </form>

      <div className="hidden">
        <div ref={printRef}>
          {Array.from({ length: barcodeNumber }).map((_, idx) => (
            <div
              key={idx}
              className="mb-4 flex flex-col items-center text-center"
            >
              <h1 className="font-bold">
                {process.env.REACT_APP_COMPANY_NAME}
              </h1>
              <h2>{formData.name || "اسم المنتج"}</h2>
              <div className="flex items-center justify-center gap-2">
                <span
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    fontSize: "1rem",
                  }}
                >
                  {formData.price.toFixed(2)}
                </span>
                <svg id={`barcode-${idx}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;
