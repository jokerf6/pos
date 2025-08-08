import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";
import { createCredit } from "store/slices/creditSlice";
import { showError, showSuccess } from "components/ui/sonner";
import { Card } from "components/card.component";
import { CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";

const CreateCreditPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Form state
  const [reason, setReason] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [reciever, setReciever] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    if (!reason.trim()) {
      newErrors.reason = "يرجى إدخال سبب المصروف";
    }
    
    if (!reciever.trim()) {
      newErrors.reciever = "يرجى إدخال اسم المستلم";
    }
    
    if (price <= 0) {
      newErrors.price = "يرجى إدخال سعر صحيح أكبر من صفر";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [reason, reciever, price]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await dispatch(
        createCredit({ price, reason, reciever })
      ).unwrap();
      
      if (result.error) {
        throw new Error(result.payload || "فشل في إضافة المصروف");
      }
      
      showSuccess("تم إضافة المصروف بنجاح");
      navigate("/credit/daily"); // Redirect to credits list page
      
    } catch (err: any) {
      console.error("خطأ في إنشاء المصروف:", err);
      const errorMessage = err?.message || "فشل في إضافة المصروف";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, price, reason, reciever, validateForm, navigate]);

  // Handle input changes with error clearing
  const handleInputChange = (field: string, value: string | number) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Update field value
    switch (field) {
      case 'reason':
        setReason(value as string);
        break;
      case 'price':
        setPrice(Number(value));
        break;
      case 'reciever':
        setReciever(value as string);
        break;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl" dir="rtl">
      <Card
        title="إضافة مصروف جديد"
        description="املأ البيانات التالية لإضافة مصروف جديد"
      >

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-[20px]">
            {/* Reason Field */}
            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                سبب المصروف <span className="text-red-500">*</span>
              </label>
              <Input
                id="reason"
                name="reason"
                type="text"
                value={reason}
                placeholder="أدخل سبب المصروف"
                onChange={(e:any) => handleInputChange('reason', e.target.value)}
                disabled={isLoading}
                className={errors.reason ? "border-red-500" : ""}
              />
              {errors.reason && (
                <p className="text-red-500 text-sm">{errors.reason}</p>
              )}
            </div>
            
            {/* Receiver Field */}
            <div className="space-y-2">
              <label htmlFor="reciever" className="block text-sm font-medium text-gray-700">
                المستلم <span className="text-red-500">*</span>
              </label>
              <Input
                id="reciever"
                name="reciever"
                type="text"
                value={reciever}
                placeholder="أدخل اسم المستلم"
                onChange={(e:any) => handleInputChange('reciever', e.target.value)}
                disabled={isLoading}
              />
            
            </div>
            
            {/* Price Field */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                السعر <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={price}
                placeholder="أدخل السعر"
                onChange={(e:any) => handleInputChange('price', e.target.value)}
                disabled={isLoading}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/credits")}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "جاري الحفظ..." : "حفظ المصروف"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCreditPage;