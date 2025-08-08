"use client";
import * as React from "react";
import ProductHeader from "./product.header";
import DailyHeader from "./daily.header";
import { Settings, Package, Calendar, ChevronRight } from "lucide-react";

interface HeaderItem {
  title: string;
  component: React.ReactElement;
  icon: React.ReactElement;
  description: string;
}

export default function SettingsHeader() {
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  
  const headers: HeaderItem[] = [
    {
      title: "المنتجات",
      component: <ProductHeader />,
      icon: <Package className="w-5 h-5" />,
      description: "إدارة إعدادات المنتجات والمخزون"
    },
    {
      title: "اليومية",
      component: <DailyHeader />,
      icon: <Calendar className="w-5 h-5" />,
      description: "إعدادات العمليات اليومية والتقارير"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              الإعدادات
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            قم بتخصيص وإدارة إعدادات النظام حسب احتياجاتك
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  أقسام الإعدادات
                </h2>
              </div>
              <nav className="p-2">
                {headers.map((header, idx) => (
                  <button
                    key={header.title}
                    className={`w-full text-right p-4 rounded-lg transition-all duration-200 group ${
                      currentTab === idx
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setCurrentTab(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          currentTab === idx
                            ? "bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                        }`}>
                          {header.icon}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-base">
                            {header.title}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {header.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        currentTab === idx ? "rotate-90" : ""
                      }`} />
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {headers[currentTab].icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {headers[currentTab].title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {headers[currentTab].description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="animate-fadeIn">
                  {headers[currentTab] && headers[currentTab].component}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

