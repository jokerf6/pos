import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser, UserById } from "../../store/slices/usersSlice";
// import toast from "react-hot-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { showError, showSuccess } from "../../components/ui/sonner";

function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state: any) => state.users);
  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    password: "",
  });

  // Fetch user by ID
  useEffect(() => {
    if (id) {
      dispatch(UserById({ id: Number(id) }));
    }
  }, [dispatch, id]);

  // Fill form when selectedUser is ready
  useEffect(() => {
    if (selectedUser) {
      console.log("Selected User:", selectedUser);
      setSelectedRole(selectedUser.user.role || "");
      setFormData({
        username: selectedUser.user.username || "",
        role: selectedUser.user.role || "",
        password: "",
      });
    }
  }, [selectedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { id: Number(id), ...formData };
    const result = await dispatch(updateUser(updatedUser) as any);
    if (!result.error) {
      showSuccess("تم تحديث المستخدم بنجاح");
      navigate("/users");
    } else {
      showError(result.payload || "حدث خطأ أثناء تحديث المستخدم");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 text-right" dir="rtl">
      <h2 className="text-xl font-semibold">تعديل المستخدم</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="اسم المستخدم"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full border p-2 rounded-md text-right">
              {selectedRole || "اختر الصلاحيات"}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] mt-[-10px] shadow  bg-white border gap-2  text-right"
          >
            {["admin", "cashier"].map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setFormData((prev) => ({ ...prev, role }));
                }}
                className="cursor-pointer p-2"
              >
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
          <Button type="submit">حفظ</Button>
        </div>
      </form>
    </div>
  );
}

export default EditUserPage;
