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
        hover:border-blue-200 group relative overflow-hidden`}
      onClick={onClick}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50`}></div>
      
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 
          group-hover:bg-blue-200 transition-colors duration-200`}>
          <div className={`text-blue-600 group-hover:text-blue-700`}>
            {icon}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        {shortcut && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">اختصار</span>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border text-gray-600">
              {shortcut}
            </kbd>
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
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm text-${color}-600 flex items-center gap-1 mt-1`}>
            <TrendingUp size={14} />
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

export default function HomePage() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "إنشاء فاتورة جديدة",
      description: "إنشاء فاتورة بيع جديدة للعملاء",
      icon: <Receipt size={24} />,
      onClick: () => navigate("/invoice/create"),
      shortcut: "Ctrl + N",
      color: "blue"
    },
    {
      title: "إدارة المنتجات",
      description: "عرض وإدارة المنتجات والمخزون",
      icon: <Package size={24} />,
      onClick: () => navigate("/products"),
      shortcut: "Ctrl + P",
      color: "green"
    },
    {
      title: "إدارة المصروفات",
      description: "تسجيل وإدارة المصروفات اليومية",
      icon: <CreditCard size={24} />,
      onClick: () => navigate("/credit"),
      shortcut: "Ctrl + E",
      color: "orange"
    },
    {
      title: "إدارة المستخدمين",
      description: "إضافة وإدارة مستخدمي النظام",
      icon: <Users size={24} />,
      onClick: () => navigate("/users"),
      shortcut: "Ctrl + U",
      color: "purple"
    },
    {
      title: "التقارير والإحصائيات",
      description: "عرض تقارير المبيعات والأرباح",
      icon: <BarChart3 size={24} />,
      onClick: () => navigate("/reports"),
      shortcut: "Ctrl + R",
      color: "cyan"
    },
    {
      title: "إعدادات النظام",
      description: "تخصيص إعدادات النظام والتفضيلات",
      icon: <Settings size={24} />,
      onClick: () => navigate("/settings"),
      shortcut: "Ctrl + S",
      color: "gray"
    }
  ];

  const stats = [
    {
      title: "مبيعات اليوم",
      value: "12,450 ج.م",
      change: "+12.5% من أمس",
      icon: <DollarSign size={24} />,
      color: "green"
    },
    {
      title: "عدد الفواتير",
      value: "48",
      change: "+8.2% من أمس",
      icon: <Receipt size={24} />,
      color: "blue"
    },
    {
      title: "المنتجات المباعة",
      value: "156",
      change: "+15.3% من أمس",
      icon: <Package size={24} />,
      color: "purple"
    },
    {
      title: "متوسط الفاتورة",
      value: "259 ج.م",
      change: "+4.1% من أمس",
      icon: <TrendingUp size={24} />,
      color: "orange"
    }
  ];

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              مرحباً بك في نظام نقاط البيع
            </h1>
            <p className="text-gray-600">إدارة شاملة لمتجرك ومخزونك بكل سهولة</p>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock size={16} />
              <span className="text-sm font-medium">{getCurrentTime()}</span>
            </div>
            <div className="text-sm text-gray-500">{getCurrentDate()}</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">إحصائيات اليوم</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">النشاط الأخير</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">فاتورة جديدة #1234</p>
                <p className="text-sm text-gray-600">تم إنشاء فاتورة بقيمة 450 ج.م</p>
              </div>
              <span className="text-xs text-gray-500">منذ 5 دقائق</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">تحديث المخزون</p>
                <p className="text-sm text-gray-600">تم إضافة 50 قطعة من المنتج ABC</p>
              </div>
              <span className="text-xs text-gray-500">منذ 15 دقيقة</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="text-orange-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">مصروف جديد</p>
                <p className="text-sm text-gray-600">تم تسجيل مصروف بقيمة 200 ج.م</p>
              </div>
              <span className="text-xs text-gray-500">منذ 30 دقيقة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

