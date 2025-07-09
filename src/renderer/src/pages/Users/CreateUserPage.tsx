import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createUser } from "../../store/slices/usersSlice";
import { toast } from "sonner";

// import toast from "react-hot-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";

function CreateUserPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createUser(formData) as any);
    if (!result.error) {
      showSuccess("تم انشاء المستخدم بنجاح");
      navigate("/users");
    } else {
      showError(result?.payload);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-semibold">انشاء مستخدم</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="اسم المستخدم"
        />

        <Input
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="الدور (admin/user)"
        />

        <Input
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="password"
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

export default CreateUserPage;
