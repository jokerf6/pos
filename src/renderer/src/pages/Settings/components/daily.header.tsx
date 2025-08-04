import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store";
import { Input } from "../../../components/ui/input";
import {
  getByDomain,
  updateSetting,
} from "../../../store/slices/settingsSlice";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "../../../components/ui/sonner";

export default function DailyHeader() {
  const dispatch = useAppDispatch();
  const { settings } = useSelector((state: any) => state.settings);

  const [localSettings, setLocalSettings] = useState([]);

  useEffect(() => {
    dispatch(getByDomain("daily"));
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      console.log("settings", settings);
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (index: number, newValue: any) => {
    const updated = [...localSettings];
    // Create a shallow copy of the object to avoid mutating a frozen one
    const base =
      typeof updated[index] === "object" && updated[index] !== null
        ? updated[index]
        : {};
    const updatedItem = { ...base, value: newValue };
    (updated as any[])[index] = updatedItem;
    setLocalSettings(updated);
  };

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateSetting(localSettings));
    if ((result as any)?.meta?.requestStatus === "fulfilled") {
      showSuccess("تم تحديث الاعدادات بنجاح");
    } else {
      showError((result as any)?.payload || "حدث خطأ أثناء تحديث الاعدادات");
    }
  };
  const renderInput = (item: any, index: number) => {
    const value = item.value;

    // Detect type automatically
    const isNumber = !isNaN(value) && value !== "" && value !== null;
    const isBoolean = value === "true" || value === "false";
    const inputType = isBoolean ? "checkbox" : isNumber ? "number" : "text";

    return (
      <div
        key={item.key}
        className={`mb-4 w-fit ${inputType === "checkbox" ? "flex flex-row-reverse gap-1 " : ""}`}
      >
        <label className={`block mb-1 text-sm font-medium text-gray-700`}>
          {item.name}
        </label>

        {inputType === "checkbox" ? (
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) =>
              handleChange(index, e.target.checked ? "true" : "false")
            }
            className="w-5 h-5"
          />
        ) : (
          <Input
            type={inputType}
            value={value}
            min={0}
            onChange={(e) => handleChange(index, e.target.value)}
            className="border-blue-600"
          />
        )}
      </div>
    );
  };

  return (
    <form className="flex flex-col p-4 bg-gray-100 rounded-md">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl font-bold">إعدادات اليومية</h1>
        <button
          onClick={handelSubmit}
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          حفظ التغييرات
        </button>
      </div>

      <div className="my-4">
        {localSettings &&
          localSettings.map((item, index) => renderInput(item, index))}
      </div>
    </form>
  );
}
