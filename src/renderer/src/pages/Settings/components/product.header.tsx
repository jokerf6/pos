import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store";
import { Input } from "../../../components/ui/input";
import {
  getByDomain,
  updateSetting,
} from "../../../store/slices/settingsSlice";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "../../../components/ui/sonner";
import { Save, Package, Settings, CheckCircle, AlertCircle, Hash, Type, ToggleLeft, ToggleRight } from "lucide-react";

export default function ProductHeader() {
  const dispatch = useAppDispatch();
  const { settings } = useSelector((state: any) => state.settings);
  const [localSettings, setLocalSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getByDomain("products"));
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings.data);
    }
  }, [settings]);

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await dispatch(updateSetting(localSettings));
      if ((result as any)?.meta?.requestStatus === "fulfilled") {
        showSuccess("تم تحديث الاعدادات بنجاح");
      } else {
        showError((result as any)?.payload || "حدث خطأ أثناء تحديث الاعدادات");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, newValue: any) => {
    const updated = [...localSettings];
    const base =
      typeof updated[index] === "object" && updated[index] !== null
        ? updated[index]
        : {};
    const updatedItem = { ...base, value: newValue };
    (updated as any[])[index] = updatedItem;
    setLocalSettings(updated);
  };

  const getFieldIcon = (inputType: string) => {
    switch (inputType) {
      case "number":
        return <Hash className="w-4 h-4" />;
      case "checkbox":
        return <Settings className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const renderInput = (item: any, index: number) => {
    const value = item.value;
    const isNumber = !isNaN(value) && value !== "" && value !== null;
    const isBoolean = value === "true" || value === "false";
    const inputType = isBoolean ? "checkbox" : isNumber ? "number" : "text";

    return (
      <div key={item.key} className="group">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              {getFieldIcon(inputType)}
            </div>
            <div className="flex-1">
              <label className="block text-base font-medium text-slate-900 dark:text-white mb-2">
                {item.name}
              </label>
              
              {inputType === "checkbox" ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange(index, value === "true" ? "false" : "true")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      value === "true"
                        ? "bg-blue-600"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value === "true" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {value === "true" ? "مفعل" : "غير مفعل"}
                  </span>
                  {value === "true" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type={inputType}
                    value={value}
                    min={0}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 rounded-lg transition-all duration-200"
                    placeholder={`أدخل ${item.name}`}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <div className="w-1 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {localSettings &&
          localSettings.map((item, index) => renderInput(item, index))}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 -mx-6 -mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Package className="w-4 h-4" />
            <span>{localSettings.length} إعداد متاح</span>
          </div>
          
          <button
            type="submit"
            onClick={handelSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

