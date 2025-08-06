import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser, UserById } from "../../store/slices/usersSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { showError, showSuccess } from "../../components/ui/sonner";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "../../components/ui/checkbox";

const availablePermissions = [
  { id: "manage_invoices", name: "إدارة الفواتير" },
  { id: "manage_products", name: "إدارة المنتجات" },
  { id: "manage_users", name: "إدارة المستخدمين" },
  { id: "view_reports", name: "عرض التقارير" },
  { id: "manage_expenses", name: "إدارة المصروفات" },
  { id: "manage_categories", name: "إدارة الأقسام" },
];

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
    permissions: [] as string[],
  });

  // Fetch user by ID
  useEffect(() => {
    if (id !== undefined) {
      dispatch(UserById(Number(id)) as any);
    }
  }, [dispatch, id]);

  // Fill form when selectedUser is ready
  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.user.role || "");
      setFormData({
        username: selectedUser.user.username || "",
        role: selectedUser.user.role || "",
        password: "",
        permissions: selectedUser.user.permissions || [],
      });
    }
  }, [selectedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => {
      const newPermissions = checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((id) => id !== permissionId);
      return { ...prev, permissions: newPermissions };
    });
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
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">تعديل المستخدم</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (اتركها فارغة لعدم التغيير)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">الدور</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedRole === "admin" ? "مدير" : "كاشير"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] bg-white text-right shadow-lg rounded-md">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRole("admin");
                  setFormData((prev) => ({ ...prev, role: "admin", permissions: [] })); // Clear permissions if admin
                }}
                className="cursor-pointer hover:bg-gray-100 py-2 px-3"
              >
                مدير
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRole("cashier");
                  setFormData((prev) => ({ ...prev, role: "cashier" }));
                }}
                className="cursor-pointer hover:bg-gray-100 py-2 px-3"
              >
                كاشير
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedRole === "cashier" && (
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-md border border-gray-200">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-3 space-x-reverse">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked: boolean) =>
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={permission.id}
                    className="text-sm font-medium text-gray-800 cursor-pointer"
                  >
                    {permission.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="px-6 py-2">
            إلغاء
          </Button>
          <Button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditUserPage;


