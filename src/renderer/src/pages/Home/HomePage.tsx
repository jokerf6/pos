import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Receipt, 
  CreditCard, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  shortcut,
  color
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer 
        hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out
        hover:border-${color}-200 group relative overflow-hidden`}
      onClick={onClick}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-50 rounded-full -mr-10 -mt-10 opacity-50`}></div>
      
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4 
          group-hover:bg-${color}-200 transition-colors duration-200`}>
          <div className={`text-${color}-600 group-hover:text-${color}-700`}>
            {icon}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        
        {shortcut && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">اختصار</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
              {shortcut}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm text-${color}-600 flex items-center mt-1`}>
            <TrendingUp className="w-4 h-4 ml-1" />
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        navigate("/invoice/create");
      } else if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        navigate("/credit/daily");
      } else if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        navigate("/products");
      } else if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        navigate("/users");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  const quickActions = [
    {
      title: "إنشاء فاتورة جديدة",
      description: "إنشاء فاتورة بيع جديدة للعملاء",
      icon: <Receipt className="w-6 h-6" />,
      onClick: () => navigate("/invoice/create"),
      shortcut: "Ctrl + F",
      color: "blue"
    },
    {
      title: "إدارة المنتجات",
      description: "عرض وإدارة المنتجات والمخزون",
      icon: <Package className="w-6 h-6" />,
      onClick: () => navigate("/products"),
      shortcut: "Ctrl + P",
      color: "green"
    },
    {
      title: "المصروفات اليومية",
      description: "تسجيل وإدارة المصروفات اليومية",
      icon: <CreditCard className="w-6 h-6" />,
      onClick: () => navigate("/credit/daily"),
      shortcut: "Ctrl + M",
      color: "orange"
    },
    {
      title: "إدارة المستخدمين",
      description: "إضافة وإدارة مستخدمي النظام",
      icon: <Users className="w-6 h-6" />,
      onClick: () => navigate("/users"),
      shortcut: "Ctrl + U",
      color: "purple"
    },
    {
      title: "التقارير والإحصائيات",
      description: "عرض تقارير المبيعات والأرباح",
      icon: <BarChart3 className="w-6 h-6" />,
      onClick: () => navigate("/invoice"),
      color: "indigo"
    },
    {
      title: "إعدادات النظام",
      description: "تخصيص إعدادات النظام والتطبيق",
      icon: <Settings className="w-6 h-6" />,
      onClick: () => navigate("/settings"),
      color: "gray"
    }
  ];

  const stats = [
    {
      title: "مبيعات اليوم",
      value: "12,450 ج.م",
      change: "+12.5%",
      icon: <DollarSign className="w-6 h-6" />,
      color: "green"
    },
    {
      title: "عدد الفواتير",
      value: "48",
      change: "+8.2%",
      icon: <Receipt className="w-6 h-6" />,
      color: "blue"
    },
    {
      title: "المنتجات المباعة",
      value: "156",
      change: "+15.3%",
      icon: <Package className="w-6 h-6" />,
      color: "purple"
    },
    {
      title: "متوسط الفاتورة",
      value: "259 ج.م",
      change: "+4.1%",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "orange"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              مرحباً بك في نظام نقاط البيع
            </h1>
            <p className="text-gray-600">
              إدارة شاملة لمبيعاتك ومخزونك بكل سهولة
            </p>
          </div>
          <div className="text-left">
            <div className="flex items-center text-gray-600 mb-1">
              <Clock className="w-4 h-4 ml-2" />
              <span className="text-sm">الوقت الحالي</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('ar-EG')}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          إحصائيات اليوم
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          الإجراءات السريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          النشاط الأخير
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center ml-3">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">فاتورة جديدة #1234</p>
                <p className="text-sm text-gray-600">منذ 5 دقائق</p>
              </div>
            </div>
            <span className="text-green-600 font-semibold">+450 ج.م</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">تم إضافة منتج جديد</p>
                <p className="text-sm text-gray-600">منذ 15 دقيقة</p>
              </div>
            </div>
            <span className="text-blue-600 font-semibold">جديد</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center ml-3">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">مصروف جديد</p>
                <p className="text-sm text-gray-600">منذ 30 دقيقة</p>
              </div>
            </div>
            <span className="text-orange-600 font-semibold">-120 ج.م</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          اختصارات لوحة المفاتيح
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
          <div>Ctrl + F: فاتورة جديدة</div>
          <div>Ctrl + M: مصروف جديد</div>
          <div>Ctrl + P: المنتجات</div>
          <div>Ctrl + U: المستخدمين</div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;

