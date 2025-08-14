import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import { 
  Download, 
  Package, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryReportProps {
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const InventoryReport: React.FC<InventoryReportProps> = ({
  onExportPDF,
  isExporting
}) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [showLowStockOnly]);

  useEffect(() => {
    if (reportData?.products) {
      const filtered = reportData.products.filter((product: any) => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
      });
      setFilteredProducts(filtered);
    }
  }, [reportData, searchTerm]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.invoke('reports:inventory', showLowStockOnly);
      if (result.success) {
        setReportData(result.data);
      } else {
        toast.error('فشل في جلب بيانات التقرير');
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error);
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

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'نفد':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'منخفض':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'متوفر':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'نفد':
        return 'bg-red-100 text-red-800';
      case 'منخفض':
        return 'bg-yellow-100 text-yellow-800';
      case 'متوفر':
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
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد بيانات مخزون متاحة</p>
      </div>
    );
  }

  const summary = reportData.summary || {};
  const products = filteredProducts;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.total_products || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">قيمة المخزون</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_inventory_value)}
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
                <p className="text-sm font-medium text-gray-600">منتجات منخفضة المخزون</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.low_stock_count || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">منتجات نفدت</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.out_of_stock_count || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="low-stock-filter"
                checked={showLowStockOnly}
                onCheckedChange={setShowLowStockOnly}
              />
              <label htmlFor="low-stock-filter" className="text-sm font-medium">
                عرض المنتجات منخفضة المخزون فقط
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            تقرير المخزون ({products.length} منتج)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">اسم المنتج</th>
                  <th className="text-right p-3">الفئة</th>
                  <th className="text-right p-3">المخزون الحالي</th>
                  <th className="text-right p-3">الحد الأدنى</th>
                  <th className="text-right p-3">السعر</th>
                  <th className="text-right p-3">التكلفة</th>
                  <th className="text-right p-3">قيمة المخزون</th>
                  <th className="text-right p-3">حالة المخزون</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                        {product.barcode && (
                          <div className="text-sm text-gray-500">{product.barcode}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {product.category || 'غير محدد'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        product.stock_quantity === 0 ? 'text-red-600' :
                        product.stock_quantity <= product.min_stock_level ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {product.min_stock_level}
                    </td>
                    <td className="p-3 font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-3 text-gray-600">
                      {formatCurrency(product.cost)}
                    </td>
                    <td className="p-3 font-semibold text-green-600">
                      {formatCurrency(product.inventory_value)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStockStatusIcon(product.stock_status)}
                        <Badge className={getStockStatusColor(product.stock_status)}>
                          {product.stock_status}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {showLowStockOnly 
                  ? 'لا توجد منتجات منخفضة المخزون' 
                  : 'لا توجد منتجات تطابق البحث'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      {(summary.low_stock_count > 0 || summary.out_of_stock_count > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.out_of_stock_count > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  <span>{summary.out_of_stock_count} منتج نفد من المخزون</span>
                </div>
              )}
              {summary.low_stock_count > 0 && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{summary.low_stock_count} منتج منخفض المخزون</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onExportPDF('inventory', reportData)}
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

export default InventoryReport;

