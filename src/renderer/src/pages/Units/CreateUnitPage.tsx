import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { showError, showSuccess } from "../../components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { createUnit } from "store/slices/unitSlice";

function CreateUnitPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.units);

  const [formData, setFormData] = useState({
    name: "",
    is_default:0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, checked } = e.target;
    if(name === "is_default" && checked){
      value="1";
    }
    else if(name === "is_default" && !checked){
      value="0";
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الوحدة مطلوب";
    } else if (formData.name.length < 3) {
      newErrors.name = "اسم الوحدة يجب أن يكون 3 أحرف على الأقل";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const unitData = {
      name: formData.name.trim(),
      is_default: formData.is_default
    };
    console.log("Creating unit:", unitData);

    const result = await dispatch(createUnit(unitData) as any);
    console.log("fuck u", result);
    if (!result.payload.error) {
      showSuccess("تم إنشاء الوحدة بنجاح");
      navigate("/units");
    } else {
      showError(result?.payload.error || "حدث خطأ أثناء إنشاء الوحدة");
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
              <h1 className="text-2xl font-bold text-gray-900">إنشاء وحدة جديدة</h1>
              {/* <p className="text-gray-600">إضافة فرع جديد وتحديد صلاحياته</p> */}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الوحدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الوحدة *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسم الوحدة"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
               <div className="  w-fit">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوحدة افتراضية *
                </label>
                <Input
                  name="is_default"
                  value={formData.is_default}
                  onChange={handleChange}
                  type="checkbox"
                  defaultValue={0}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
                إنشاء وحدة
              </>
            )}
          </Button>
        </div>
      </form>
    </div>

  );
}
export default CreateUnitPage;
