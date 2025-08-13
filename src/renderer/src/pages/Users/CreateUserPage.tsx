import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../store/slices/usersSlice";
import { RootState } from "../../store";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import PermissionsSelector from "../../components/users/PermissionsSelector";
import { UserPlus, ArrowLeft } from "lucide-react";

function CreateUserPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.length < 3) {
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 1) {
      newErrors.password = "كلمة المرور يجب أن تكون 1 أحرف على الأقل";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = "يجب اختيار صلاحية واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.username.trim(),
      password: formData.password,
      permissions: selectedPermissions,
      createdBy: currentUser?.id,
    };

    const result = await dispatch(createUser(userData) as any);
    if (!result.error) {
      showSuccess("تم إنشاء المستخدم بنجاح");
      navigate("/users");
    } else {
      showError(result?.payload || "حدث خطأ أثناء إنشاء المستخدم");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إنشاء مستخدم جديد</h1>
              <p className="text-gray-600">إضافة مستخدم جديد وتحديد صلاحياته</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات المستخدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم *
                </label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="أدخل اسم المستخدم"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الصلاحيات</CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionsSelector
                selectedPermissions={selectedPermissions}
                onPermissionsChange={setSelectedPermissions}
                disabled={loading}
              />
              {errors.permissions && (
                <p className="text-red-500 text-sm mt-2">{errors.permissions}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                إنشاء المستخدم
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserPage;
