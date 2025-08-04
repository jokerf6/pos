import { Calendar, Filter, X, Search } from "lucide-react";
import React from "react";

interface FilterSectionProps {
  from: string;
  setFrom: React.Dispatch<React.SetStateAction<string>>;
  to: string;
  setTo: React.Dispatch<React.SetStateAction<string>>;
  invoiceType: string;
  setInvoiceType: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters?: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  from,
  setFrom,
  to,
  setTo,
  invoiceType,
  setInvoiceType,
  onClearFilters,
}) => {
  const handleClearFilters = () => {
    setFrom("");
    setTo("");
    setInvoiceType("");
    if (onClearFilters) onClearFilters();
  };

  const hasActiveFilters = from || to || invoiceType;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            تصفية الفواتير
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date From Filter */}
        <div className="space-y-2">
          <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            من تاريخ
          </label>
          <div className="relative">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
              placeholder="اختر التاريخ"
            />
          </div>
        </div>

        {/* Date To Filter */}
        <div className="space-y-2">
          <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            إلى تاريخ
          </label>
          <div className="relative">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
              placeholder="اختر التاريخ"
            />
          </div>
        </div>

        {/* Invoice Type Filter */}
        <div className="space-y-2">
          <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
            <Search className="w-4 h-4" />
            نوع الفاتورة
          </label>
          <div className="relative">
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm appearance-none bg-white"
            >
              <option value="">كل الأنواع</option>
              <option value="خالص">خالص</option>
              <option value="آجل">آجل</option>
              <option value="مرتجع">مرتجع</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
            {from && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                من: {from}
                <button
                  onClick={() => setFrom("")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                إلى: {to}
                <button
                  onClick={() => setTo("")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {invoiceType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                النوع: {invoiceType}
                <button
                  onClick={() => setInvoiceType("")}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
