import React, {  useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Clock,
  Package
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { dailySales } from 'store/slices/reportSlice';

interface DailySalesReportProps {
  selectedDate: Date;
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const DailySalesReport: React.FC<DailySalesReportProps> = ({
  selectedDate,
  onExportPDF,
  isExporting
}) => {
    const { dailySales: reportData, loading, error } = useSelector(
    (state: RootState) => state.reports
  );
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(dailySales());
  }, [dispatch]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash': 'نقدي',
      'card': 'بطاقة',
      'digital': 'رقمي'
    };
    return methods[method] || method;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        <p className="text-gray-500">لا توجد بيانات متاحة لهذا التاريخ</p>
      </div>
    );
  }

  const summary = reportData.summary || {};
  const hourlyData = reportData.hourlyBreakdown || [];
  const paymentData = reportData.paymentMethods || [];
  const topProducts = reportData.topProducts || [];
  const cashierPerformance = reportData.cashierPerformance || [];

  // Prepare hourly chart data
  const hourlyChartData = Array.from({ length: 24 }, (_, hour) => {
    const data = hourlyData.find((h:any) => h.hour === hour);
    return {
      hour: `${hour}:00`,
      sales: data?.sales || 0,
      transactions: data?.transactions || 0
    };
  });

  // Prepare payment methods pie chart data
  const paymentChartData = paymentData.map((payment:any, index:any) => ({
    name: getPaymentMethodName(payment.payment_method),
    value: payment.total_amount,
    color: COLORS[index % COLORS.length]
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
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              المبيعات حسب الساعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'المبيعات' : 'المعاملات'
                  ]}
                />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              طرق الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentChartData.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
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
                    <th className="text-right p-2">اسم المنتج</th>
                    <th className="text-right p-2">الكمية المباعة</th>
                    <th className="text-right p-2">إجمالي المبيعات</th>
                    <th className="text-right p-2">عدد المعاملات</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 10).map((product:any, index:number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
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

      {/* Cashier Performance */}
      {cashierPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أداء الكاشيرات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">اسم الكاشير</th>
                    <th className="text-right p-2">عدد المعاملات</th>
                    <th className="text-right p-2">إجمالي المبيعات</th>
                  </tr>
                </thead>
                <tbody>
                  {cashierPerformance.map((cashier:any, index:number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{cashier.cashier_name}</td>
                      <td className="p-2">{cashier.transactions}</td>
                      <td className="p-2 font-semibold text-green-600">
                        {formatCurrency(cashier.total_sales)}
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
          onClick={() => onExportPDF('daily-sales', reportData)}
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

export default DailySalesReport;