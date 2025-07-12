import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCategory,
  CategoryById,
} from "../../store/slices/categoriesSlice"; // Adjust the import path as necessary
// import toast from "react-hot-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

import { showError, showSuccess } from "../../components/ui/sonner";

function EditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state: any) => state.categories);

  const [formData, setFormData] = useState({
    name: "",
  });

  // Fetch user by ID
  useEffect(() => {
    if (id) {
      dispatch(CategoryById({ id: Number(id) }));
    }
  }, [dispatch, id]);

  // Fill form when selectedUser is ready
  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name || "",
      });
      console.log("Selected Category:", selectedCategory);
    }
  }, [selectedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("Form Data Change:", { name, value });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { id: Number(id), ...formData };
    console.log("Updated User Data:", updatedUser);
    const result = await dispatch(updateCategory(updatedUser) as any);
    if (!result.error) {
      showSuccess("تم تحديث القسم بنجاح");
      navigate("/users");
    } else {
      showError(result.payload || "حدث خطأ أثناء تحديث المستخدم");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-semibold">تعديل القسم</h2>
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
          <Button type="submit">حفظ</Button>
        </div>
      </form>
    </div>
  );
}

export default EditCategoryPage;
