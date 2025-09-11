import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "store";
import { getByKey } from "store/slices/settingsSlice";
import { backupDatabase, closeDaily, getDaily, openDaily } from "store/slices/dailySlice";
import { SidebarTrigger } from "./ui/sidebar";
import Modal from "./common/dynamic-modal.component";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { HeaderActions } from "./common/headerAction.component";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MainHeader() {
  const [openSettings, setOpenSettings] = useState(false);
  const [openPrice, setOpenPrice] = useState(0);
  const [closePrice, setClosePrice] = useState(0);
  const [open, setOpen] = useState(false);
    const { user } = useSelector((state: any) => state.auth);

  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isDailyOpen, setIsDailyOpen] = useState(false); // حالة محلية لتتبع حالة اليومية
  const [dailyData, setDailyData] = useState<any>(null); // حالة محلية لتخزين بيانات اليومية
  
  const dispatch = useDispatch<AppDispatch>();
  const { daily } = useSelector((state: RootState) => state.daily) as any;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const openResult = await dispatch(getByKey("open")).unwrap();
        setOpenSettings(openResult.data.value === "true");
        dispatch(getDaily());
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchData();
  }, [dispatch]);
  
  // تحديث الحالة المحلية عند تغيير بيانات اليومية في Redux
  useEffect(() => {
    if (daily?.data) {
      setIsDailyOpen(true);
      setDailyData(daily.data);
    } else {
      setIsDailyOpen(false);
      setDailyData(null);
    }
  }, [daily]);
  
  const navigate = useNavigate();
  
  const handleOpen = async () => {
    try {
      await dispatch(openDaily(openPrice)).unwrap();
      // تحديث الحالة المحلية مباشرة بعد الفتح
      setIsDailyOpen(true);
      // جلب البيانات المحدثة
      const result = await dispatch(getDaily()).unwrap();
      setDailyData(Array.isArray(result) ? result[0] : result);
      setOpenPrice(0);
      setClosePrice(0);
      setOpen(false);
    } catch (error) {
      console.error("Failed to open daily:", error);
    }
  };
  
  const handleClose = async () => {
    try {
      await dispatch(closeDaily(closePrice)).unwrap();
      await dispatch(backupDatabase()).unwrap();
      await dispatch(getDaily()).unwrap();
      // تحديث الحالة المحلية مباشرة بعد الإغلاق
      setIsDailyOpen(false);
      setDailyData(null);
      setOpenPrice(0);
      setClosePrice(0);
      setOpen(false);
    } catch (error) {
      console.error("Failed to close daily:", error);
    }
  };

  return (
    <div className="flex justify-between w-full sticky right-0 rounded-t-2xl top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 h-20 shrink-0 items-center gap-4 border-b border-gray-200 px-6 py-4 z-50 shadow-sm">
      <SidebarTrigger className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors">
        <Menu size={24} />
      </SidebarTrigger>
    
      <Modal
        confirmLabel={!isDailyOpen ? "فتح" : "غلق"}
        cancelLabel="إلغاء"
        onConfirm={!isDailyOpen ? handleOpen : handleClose}
        title={!isDailyOpen ? "فتح اليومية" : "غلق اليومية"}
        open={open}
        onClose={() => setOpen(false)}
      >
        {!isDailyOpen && openSettings === true && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              المبلغ الافتتاحي
            </label>
            <Input
              type="number"
              min={0}
              placeholder="أدخل المبلغ الافتتاحي"
              value={openPrice}
              onChange={(e) => setOpenPrice(+e.target.value)}
              className="w-full"
            />
          </div>
        )}
        {isDailyOpen && openSettings && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              المبلغ المسحوب
            </label>
            <Input
              type="number"
              min={0}
              placeholder="أدخل المبلغ المسحوب"
              value={closePrice}
              onChange={(e) => setClosePrice(+e.target.value)}
              className="w-full"
            />
          </div>
        )}
        {isDailyOpen && dailyData && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">ملخص اليومية</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">المبلغ الكلي:</span>
                <span className="font-semibold">
                  {Number(dailyData?.cashInDrawer || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">إجمالي المبيعات:</span>
                <span className="font-semibold">
                  {Number(dailyData?.total_sales || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">إجمالي المصروفات:</span>
                <span className="font-semibold">
                  {Number(dailyData?.total_expenses || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">إجمالي المرتجعات:</span>
                <span className="font-semibold">
                  {Number(dailyData?.total_returns || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      <div className="flex items-center justify-between w-full">
        {/* Date and Time Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">{getCurrentDate()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium font-mono">{currentTime}</span>
          </div>
        </div>
        
        {/* Daily Status Section */}
      {   <div className="flex items-center gap-4">
          {isDailyOpen ? (
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <span className="text-green-800 font-medium">
                  اليومية مفتوحة
                </span>
                <div className="text-green-600 text-xs">
                  بدأت في:{" "}
                  {formatDate(dailyData?.opened_at || new Date().toISOString())}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium text-sm">
                اليومية مغلقة
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            {!isDailyOpen && (user?.role === "admin" || user?.permissions?.includes("cashier.open")) && (
              <Button
                onClick={() => setOpen(true)}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                بدء اليومية
              </Button>
            )}
            {isDailyOpen && (user?.role === "admin" || user?.permissions?.includes("cashier.close")) && (
              <Button
                onClick={() => setOpen(true)}
                type="button"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                غلق اليومية
              </Button>
            )}
          </div>
        </div>}
        
        {/* User Actions Section */}
        <div className="flex items-center">
          <HeaderActions />
        </div>
      </div>
    </div>
  );
}