import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUser } from "../../store/slices/usersSlice";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    price: 0,
    buy_price: 0,
    barcode: "",
    category_id: "",
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);
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
    searchInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createUser(formData) as any);
    if (!result.error) {
      showSuccess("تم إنشاء المنتج بنجاح");
      navigate(-1); // بدل من reload
    } else {
      showError(result?.payload || "فشل في إنشاء المنتج");
    }
  };

  const fields = [
    { name: "barcode", placeholder: "الباركود" },
    { name: "name", placeholder: "اسم المنتج" },
    { name: "description", placeholder: "الوصف", type: "area" },
    { name: "quantity", placeholder: "الكمية", type: "number" },
    { name: "price", placeholder: "سعر البيع", type: "number" },
    { name: "buy_price", placeholder: "سعر الشراء", type: "number" },
    { name: "category_id", placeholder: "الفئة", type: "select" }, // Assuming you will handle categories separately
  ];

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-semibold">إنشاء منتج</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div>
            <span className=" text-sm">{field.placeholder}</span>
            <Input
              ref={field.name === "barcode" ? searchInputRef : null}
              key={field.name}
              name={field.name}
              min={field.type === "number" ? 0 : undefined}
              max={field.type === "number" ? 1000000 : undefined}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={(formData as any)[field.name]}
              onChange={handleChange}
            />
          </div>
        ))}
        {/* 
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full border p-2 rounded-md text-right"
            >
              {formData.category_id || "اختر الفئه"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] bg-white text-right"
          >
            {["admin", "cashier"].map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setFormData((prev) => ({ ...prev, role }))}
                className="cursor-pointer capitalize"
              >
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button type="submit">إنشاء</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
