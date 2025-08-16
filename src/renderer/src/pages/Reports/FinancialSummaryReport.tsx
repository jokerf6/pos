import React, {  useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Download, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  CreditCard,
  PieChart,
  BarChart3
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { financialSummary } from 'store/slices/reportSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';

interface FinancialSummaryReportProps {
  dateRange: { from: Date; to: Date };
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const FinancialSummaryReport: React.FC<FinancialSummaryReportProps> = ({
  dateRange,
  onExportPDF,
  isExporting
}) => {
  const { financialSummary: reportData, loading, error } = useSelector(
    (state: RootState) => state.reports
  );
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(financialSummary(dateRange));
    };
    fetchData();
  }, [dispatch, dateRange]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد بيانات مالية متاحة لهذه الفترة</p>
      </div>
    );
  }

  const { revenue, expenses, profit, transactions } = reportData;

  // Prepare pie chart data for revenue breakdown
  const revenueBreakdownData = [
    { name: 'صافي الإيرادات', value: revenue.net, color: '#10B981' },
    { name: 'الضرائب', value: revenue.tax, color: '#3B82F6' },
    { name: 'الخصومات', value: revenue.discounts, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  // Prepare comparison chart data
  const comparisonData = [
    {
      category: 'الإيرادات',
      amount: revenue.total,
      color: '#10B981'
    },
    {
      category: 'المصروفات',
      amount: expenses.total,
      color: '#EF4444'
    },
    {
      category: 'الربح الإجمالي',
      amount: profit.gross,
      color: '#8B5CF6'
    },
    {
      category: 'صافي الربح',
      amount: profit.net,
      color: profit.net >= 0 ? '#059669' : '#DC2626'
    }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenue.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {transactions.count} معاملة
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
                <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenses.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses.count} مصروف
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الربح الإجمالي</p>
                <p className={`text-2xl font-bold ${profit.gross >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit.gross)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercentage(profit.gross, revenue.total)} من الإيرادات
                </p>
              </div>
              {profit.gross >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">صافي الربح</p>
                <p className={`text-2xl font-bold ${profit.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit.net)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPercentage(profit.net, revenue.total)} من الإيرادات
                </p>
              </div>
              {profit.net >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              تفصيل الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={revenueBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              المقارنة المالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              تفاصيل الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">إجمالي المبيعات</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(revenue.total)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">الضرائب المحصلة</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(revenue.tax)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">الخصومات الممنوحة</span>
                <span className="font-semibold text-orange-600">
                  -{formatCurrency(revenue.discounts)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-4 border-t-2">
                <span className="font-bold">صافي الإيرادات</span>
                <span className="font-bold text-green-700 text-lg">
                  {formatCurrency(revenue.net)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <ShoppingCart className="h-5 w-5" />
              إحصائيات المعاملات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">عدد المعاملات</span>
                <span className="font-bold text-blue-600">
                  {transactions.count.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">متوسط قيمة المعاملة</span>
                <span className="font-semibold">
                  {formatCurrency(transactions.average)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">عدد المصروفات</span>
                <span className="font-semibold text-red-600">
                  {expenses.count.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-4 border-t-2">
                <span className="font-bold">إجمالي المصروفات</span>
                <span className="font-bold text-red-700 text-lg">
                  {formatCurrency(expenses.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Analysis */}
      <Card className={`border-2 ${profit.net >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${profit.net >= 0 ? 'text-green-800' : 'text-red-800'}`}>
            {profit.net >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            تحليل الربحية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">الربح الإجمالي</p>
              <p className={`text-2xl font-bold ${profit.gross >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit.gross)}
              </p>
              <p className="text-sm text-gray-500">
                {formatPercentage(profit.gross, revenue.total)} هامش ربح
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(expenses.total)}
              </p>
              <p className="text-sm text-gray-500">
                {formatPercentage(expenses.total, revenue.total)} من الإيرادات
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">صافي الربح</p>
              <p className={`text-2xl font-bold ${profit.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit.net)}
              </p>
              <p className="text-sm text-gray-500">
                {formatPercentage(profit.net, revenue.total)} صافي هامش
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onExportPDF('financial-summary', reportData)}
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

export default FinancialSummaryReport;
