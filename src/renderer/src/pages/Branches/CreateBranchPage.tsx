import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { createBranch } from "store/slices/branchesSlice";

function CreateBranchPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.branches);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
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

    if (!formData.name.trim()) {
      newErrors.name = "اسم الفرع مطلوب";
    } else if (formData.name.length < 3) {
      newErrors.name = "اسم الفرع يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    } else if (formData.address.length < 3) {
      newErrors.address = "العنوان يجب أن يكون 3 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const branchData = {
      name: formData.name.trim(),
      address: formData.address.trim(),
    };

    const result = await dispatch(createBranch(branchData) as any);
    if (!result.error) {
      showSuccess("تم إنشاء الفرع بنجاح");
      navigate("/branches");
    } else {
      showError(result?.payload || "حدث خطأ أثناء إنشاء الفرع");
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
              <h1 className="text-2xl font-bold text-gray-900">إنشاء فرع جديد</h1>
              {/* <p className="text-gray-600">إضافة فرع جديد وتحديد صلاحياته</p> */}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الفرع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الفرع *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسم الفرع"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="أدخل عنوان الفرع"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

            </CardContent>
          </Card>
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
                إنشاء فرع
              </>
            )}
          </Button>
        </div>
      </form>
    </div>

  );
}
export default CreateBranchPage;
