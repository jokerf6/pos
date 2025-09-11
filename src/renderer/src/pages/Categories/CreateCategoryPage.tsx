import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch } from "../../store";
import { createCategory } from "../../store/slices/categoriesSlice"; // Adjust the import path as necessary

// import toast from "react-hot-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";

function CreateCategoryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<{
    name: string;
    image: string | File;
  }>({
    name: "",
    image: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
 
      const payload = {
        name: formData.name,
      };

      const result = await dispatch(createCategory(payload));

      if (result.meta.requestStatus === "fulfilled") {
        showSuccess("تم انشاء القسم بنجاح");
        navigate("/categories");
      } else {
        showError((result.payload as string) || "حدث خطأ");
      }
    } catch (err) {
      console.error("Error uploading category", err);
      showError("فشل إنشاء القسم");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file, // Store the File object
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-semibold">انشاء قسم</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="اسم القسم"
        />
     
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button type="submit">انشاء</Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCategoryPage;
