import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  Package,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface MonthlySalesReportProps {
  selectedMonth: Date;
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const MonthlySalesReport: React.FC<MonthlySalesReportProps> = ({
  selectedMonth,
  onExportPDF,
  isExporting
}) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.invoke(
        'reports:monthly-sales', 
        selectedMonth.getFullYear(), 
        selectedMonth.getMonth() + 1
      );
      if (result.success) {
        setReportData(result.data);
      } else {
        toast.error('فشل في جلب بيانات التقرير');
      }
    } catch (error) {
      console.error('Error fetching monthly sales report:', error);
      toast.error('حدث خطأ أثناء جلب التقرير');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد بيانات متاحة لهذا الشهر</p>
      </div>
    );
  }

  const summary = reportData.summary || {};
  const dailyBreakdown = reportData.dailyBreakdown || [];
  const topProducts = reportData.topProducts || [];
  const categoryPerformance = reportData.categoryPerformance || [];

  // Prepare daily chart data
  const dailyChartData = dailyBreakdown.map(day => ({
    date: format(new Date(day.date), 'dd/MM'),
    sales: day.sales,
    transactions: day.transactions
  }));

  // Prepare category chart data
  const categoryChartData = categoryPerformance.map(category => ({
    name: category.category || 'غير محدد',
    sales: category.total_sales,
    quantity: category.total_quantity
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_sales)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المعاملات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.total_transactions || 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط المعاملة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(summary.average_transaction)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الضرائب</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.total_tax)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              اتجاه المبيعات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'المبيعات' : 'المعاملات'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              أداء الفئات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="sales" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">الترتيب</th>
                    <th className="text-right p-2">اسم المنتج</th>
                    <th className="text-right p-2">الكمية المباعة</th>
                    <th className="text-right p-2">إجمالي المبيعات</th>
                    <th className="text-right p-2">عدد المعاملات</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 15).map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-500">#{index + 1}</td>
                      <td className="p-2 font-medium">{product.product_name}</td>
                      <td className="p-2">{product.total_quantity}</td>
                      <td className="p-2 font-semibold text-green-600">
                        {formatCurrency(product.total_sales)}
                      </td>
                      <td className="p-2">{product.transaction_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Performance Table */}
      {categoryPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              أداء الفئات التفصيلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">الفئة</th>
                    <th className="text-right p-2">عدد المنتجات</th>
                    <th className="text-right p-2">الكمية المباعة</th>
                    <th className="text-right p-2">إجمالي المبيعات</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerformance.map((category, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        {category.category || 'غير محدد'}
                      </td>
                      <td className="p-2">{category.product_count}</td>
                      <td className="p-2">{category.total_quantity}</td>
                      <td className="p-2 font-semibold text-green-600">
                        {formatCurrency(category.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onExportPDF('monthly-sales', reportData)}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
        </Button>
      </div>
    </div>
  );
};

export default MonthlySalesReport;

