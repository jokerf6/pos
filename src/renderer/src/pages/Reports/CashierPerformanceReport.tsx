import React, {  useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Download, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { cashierPerformance } from 'store/slices/reportSlice';

interface CashierPerformanceReportProps {
  dateRange: { from: Date; to: Date };
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const CashierPerformanceReport: React.FC<CashierPerformanceReportProps> = ({
  dateRange,
  onExportPDF,
  isExporting
}) => {
  const { cashierPerformance: reportData, loading, error } = useSelector(
    (state: RootState) => state.reports
  );
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(cashierPerformance({from: dateRange.from, to: dateRange.to}));
  }, [dispatch, dateRange]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      'admin': 'مدير',
      'manager': 'مشرف',
      'cashier': 'كاشير'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <p className="text-gray-500">لا توجد بيانات متاحة لهذه الفترة</p>
      </div>
    );
  }

  const cashiers = reportData.cashiers || [];
  const activeCashiers = cashiers?.filter((c:any) => (c.total_transactions || 0) > 0);

  // Calculate summary statistics
  const totalSales = cashiers?.reduce((sum:any, cashier:any) => sum + (cashier.total_sales || 0), 0);
  const totalTransactions = cashiers?.reduce((sum:any, cashier:any) => sum + (cashier.total_transactions || 0), 0);
  const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Prepare chart data
  const chartData = activeCashiers
    .sort((a:any, b:any) => (b.total_sales || 0) - (a.total_sales || 0))
    .slice(0, 10)
    .map((cashier:any) => ({
      name: cashier.cashier_name,
      sales: cashier.total_sales || 0,
      transactions: cashier.total_transactions || 0
    }));

  // Find top performer
  const topPerformer = activeCashiers.reduce((top:any, current:any) => 
    (current.total_sales || 0) > (top.total_sales || 0) ? current : top
  , activeCashiers[0] || {});

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
                  {formatCurrency(totalSales)}
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
                <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalTransactions.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">متوسط قيمة المعاملة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(averageTransactionValue)}
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
                <p className="text-sm font-medium text-gray-600">الكاشيرات النشطة</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeCashiers.length} / {cashiers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer Card */}
      {topPerformer.cashier_name && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="h-5 w-5" />
              أفضل أداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-yellow-900">{topPerformer.cashier_name}</p>
                <p className="text-sm text-yellow-700">
                  {getRoleName(topPerformer.role)} • {topPerformer.total_transactions} معاملة
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(topPerformer.total_sales)}
                </p>
                <p className="text-sm text-yellow-700">إجمالي المبيعات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            مقارنة أداء الكاشيرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value:any, name:any) => [
                  name === 'sales' ? formatCurrency(Number(value)) : value,
                  name === 'sales' ? 'المبيعات' : 'المعاملات'
                ]}
              />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            تقرير أداء الكاشيرات التفصيلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">الترتيب</th>
                  <th className="text-right p-3">اسم الكاشير</th>
                  <th className="text-right p-3">الدور</th>
                  <th className="text-right p-3">عدد المعاملات</th>
                  <th className="text-right p-3">إجمالي المبيعات</th>
                  <th className="text-right p-3">متوسط المعاملة</th>
                  <th className="text-right p-3">أيام العمل</th>
                  <th className="text-right p-3">الخصومات الممنوحة</th>
                </tr>
              </thead>
              <tbody>
                {cashiers
                  .sort((a:any, b:any) => (b.total_sales || 0) - (a.total_sales || 0))
                  .map((cashier:any, index:number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500">#{index + 1}</span>
                          {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{cashier.cashier_name}</div>
                          <div className="text-sm text-gray-500">{cashier.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getRoleBadgeColor(cashier.role)}>
                          {getRoleName(cashier.role)}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">
                        {cashier.total_transactions || 0}
                      </td>
                      <td className="p-3 font-semibold text-green-600">
                        {formatCurrency(cashier.total_sales)}
                      </td>
                      <td className="p-3">
                        {formatCurrency(cashier.average_transaction)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {cashier.working_days || 0}
                        </div>
                      </td>
                      <td className="p-3 text-orange-600">
                        {formatCurrency(cashier.total_discounts_given)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {cashiers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد بيانات كاشيرات لهذه الفترة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onExportPDF('cashier-performance', reportData)}
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

export default CashierPerformanceReport;
