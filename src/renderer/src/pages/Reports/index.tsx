import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  CalendarIcon, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import DailySalesReport from './DailySalesReport';
import MonthlySalesReport from './MonthlySalesReport';
import ProductPerformanceReport from './ProductPerformanceReport';
import CashierPerformanceReport from './CashierPerformanceReport';
import InventoryReport from './InventoryReport';
import FinancialSummaryReport from './FinancialSummaryReport';

const ReportsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [activeTab, setActiveTab] = useState('daily-sales');
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    {
      id: 'daily-sales',
      title: 'تقرير المبيعات اليومي',
      description: 'تقرير شامل للمبيعات اليومية والأداء',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      id: 'monthly-sales',
      title: 'تقرير المبيعات الشهري',
      description: 'تحليل المبيعات الشهرية والاتجاهات',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'product-performance',
      title: 'تقرير أداء المنتجات',
      description: 'أداء المنتجات والمبيعات حسب الصنف',
      icon: Package,
      color: 'text-purple-600'
    },
    {
      id: 'cashier-performance',
      title: 'تقرير أداء الكاشيرات',
      description: 'أداء الموظفين والإنتاجية',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      id: 'inventory',
      title: 'تقرير المخزون',
      description: 'حالة المخزون والمنتجات المنخفضة',
      icon: Activity,
      color: 'text-red-600'
    },
    {
      id: 'financial-summary',
      title: 'التقرير المالي',
      description: 'ملخص مالي شامل للإيرادات والمصروفات',
      icon: DollarSign,
      color: 'text-emerald-600'
    }
  ];

  const handleExportPDF = async (reportType: string, reportData: any) => {
    setIsExporting(true);
    try {
      const result = await window.electronAPI.invoke('pdf:generate-report', reportData, reportType);
      
      if (result.success) {
        // Create blob and download
        const blob = new Blob([new Uint8Array(result.data.data)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('تم تصدير التقرير بنجاح');
      } else {
        toast.error('فشل في تصدير التقرير');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    } finally {
      setIsExporting(false);
    }
  };

  const renderDatePicker = (date: Date, onDateChange: (date: Date) => void, placeholder: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMMM yyyy", { locale: ar }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onDateChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
          <p className="text-gray-600 mt-2">تقارير شاملة لأداء المبيعات والمخزون</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {format(new Date(), "dd MMMM yyyy", { locale: ar })}
        </Badge>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <TabsTrigger
                key={report.id}
                value={report.id}
                className="flex flex-col items-center gap-2 p-4 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className={cn("h-5 w-5", report.color)} />
                <span className="text-xs font-medium text-center leading-tight">
                  {report.title}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="daily-sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                تقرير المبيعات اليومي
              </CardTitle>
              <CardDescription>
                تقرير شامل للمبيعات اليومية مع تحليل الأداء والاتجاهات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {renderDatePicker(selectedDate, setSelectedDate, "اختر التاريخ")}
                <Button
                  onClick={() => setSelectedDate(new Date())}
                  variant="outline"
                  size="sm"
                >
                  اليوم
                </Button>
              </div>
              <DailySalesReport 
                selectedDate={selectedDate} 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                تقرير المبيعات الشهري
              </CardTitle>
              <CardDescription>
                تحليل شامل للمبيعات الشهرية والاتجاهات طويلة المدى
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {renderDatePicker(selectedMonth, setSelectedMonth, "اختر الشهر")}
                <Button
                  onClick={() => setSelectedMonth(new Date())}
                  variant="outline"
                  size="sm"
                >
                  هذا الشهر
                </Button>
              </div>
              <MonthlySalesReport 
                selectedMonth={selectedMonth} 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                تقرير أداء المنتجات
              </CardTitle>
              <CardDescription>
                تحليل أداء المنتجات والمبيعات حسب الفئات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {renderDatePicker(dateRange.from, (date) => setDateRange({...dateRange, from: date}), "من تاريخ")}
                {renderDatePicker(dateRange.to, (date) => setDateRange({...dateRange, to: date}), "إلى تاريخ")}
                <Button
                  onClick={() => setDateRange({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date())
                  })}
                  variant="outline"
                  size="sm"
                >
                  هذا الشهر
                </Button>
              </div>
              <ProductPerformanceReport 
                dateRange={dateRange} 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashier-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                تقرير أداء الكاشيرات
              </CardTitle>
              <CardDescription>
                تحليل أداء الموظفين والإنتاجية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {renderDatePicker(dateRange.from, (date) => setDateRange({...dateRange, from: date}), "من تاريخ")}
                {renderDatePicker(dateRange.to, (date) => setDateRange({...dateRange, to: date}), "إلى تاريخ")}
                <Button
                  onClick={() => setDateRange({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date())
                  })}
                  variant="outline"
                  size="sm"
                >
                  هذا الشهر
                </Button>
              </div>
              <CashierPerformanceReport 
                dateRange={dateRange} 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                تقرير المخزون
              </CardTitle>
              <CardDescription>
                حالة المخزون الحالية والمنتجات المنخفضة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryReport 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                التقرير المالي
              </CardTitle>
              <CardDescription>
                ملخص مالي شامل للإيرادات والمصروفات والأرباح
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                {renderDatePicker(dateRange.from, (date) => setDateRange({...dateRange, from: date}), "من تاريخ")}
                {renderDatePicker(dateRange.to, (date) => setDateRange({...dateRange, to: date}), "إلى تاريخ")}
                <Button
                  onClick={() => setDateRange({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date())
                  })}
                  variant="outline"
                  size="sm"
                >
                  هذا الشهر
                </Button>
              </div>
              <FinancialSummaryReport 
                dateRange={dateRange} 
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;

