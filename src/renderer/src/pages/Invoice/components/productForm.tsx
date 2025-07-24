import { useRef, useEffect } from "react";

import { showError } from "../../../components/ui/sonner";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import CategorySelector from "./CategorySelector";

const ProductForm = ({
  formData,
  setFormData,
  categories,
  onSubmit,
  onBarcodeSearch,
  onGenerateBarcode,
  isLoading,
}) => {
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("price") || name === "quantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // التحقق من صحة البيانات قبل الإرسال
    if (!formData.name || !formData.price) {
      showError("يرجى ملء اسم المنتج وسعر البيع.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* حقل الباركود مع البحث والتوليد */}
      <div>
        <label
          htmlFor="barcode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          الباركود (امسح الباركود للبحث)
        </label>
        <div className="flex gap-2">
          <Input
            id="barcode"
            name="barcode"
            ref={barcodeInputRef}
            value={formData.barcode}
            onChange={handleChange}
            onBlur={(e) => onBarcodeSearch(e.target.value)} // البحث عند الخروج من الحقل
            placeholder="امسح أو أدخل الباركود"
          />
          <Button
            type="button"
            onClick={onGenerateBarcode}
            disabled={isLoading}
          >
            {isLoading ? "جاري..." : "توليد"}
          </Button>
        </div>
      </div>

      {/* بقية الحقول */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name">اسم المنتج</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>الفئة</label>
          <CategorySelector
            categories={categories}
            selectedId={formData.category_id}
            onSelect={(id) =>
              setFormData((prev) => ({ ...prev, category_id: id }))
            }
          />
        </div>
        <div>
          <label htmlFor="buy_price">سعر الشراء</label>
          <Input
            id="buy_price"
            name="buy_price"
            type="number"
            value={formData.buy_price}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="price">سعر البيع</label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="quantity">الكمية</label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description">الوصف</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "جاري الحفظ..." : "حفظ وإضافة المنتج"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
