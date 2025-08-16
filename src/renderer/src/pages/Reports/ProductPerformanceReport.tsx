import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Download, 
  Package, 
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { productPerformance } from 'store/slices/reportSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';

interface ProductPerformanceReportProps {
  dateRange: { from: Date; to: Date };
  onExportPDF: (reportType: string, reportData: any) => void;
  isExporting: boolean;
}

const ProductPerformanceReport: React.FC<ProductPerformanceReportProps> = ({
  dateRange,
  onExportPDF,
  isExporting
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);


    const { productPerformance: reportData, loading, error } = useSelector(
    (state: RootState) => state.reports
  );
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    console.log("Fetching product performance report for date range:", dateRange);
    dispatch(productPerformance(dateRange));
  }, [dispatch, dateRange]);


 
  useEffect(() => {
    if (reportData?.products) {
      const filtered = reportData.products.filter((product: any) =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [reportData, searchTerm]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStockStatus = (currentStock: number, minLevel: number) => {
    if (currentStock === 0) {
      return { text: 'نفد', color: 'bg-red-100 text-red-800' };
    } else if (currentStock <= minLevel) {
      return { text: 'منخفض', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'متوفر', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
        <p className="text-gray-500">لا توجد بيانات متاحة لهذه الفترة</p>
      </div>
    );
  }

  const products = filteredProducts;

  // Calculate summary statistics
  const totalRevenue = products.reduce((sum, product) => sum + (product.total_revenue || 0), 0);
  const totalSold = products.reduce((sum, product) => sum + (product.total_sold || 0), 0);
  const totalProfit = products.reduce((sum, product) => sum + (product.estimated_profit || 0), 0);
  const activeProducts = products.filter(p => (p.total_sold || 0) > 0).length;

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
                  {formatCurrency(totalRevenue)}
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
                <p className="text-sm font-medium text-gray-600">إجمالي الكمية المباعة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSold.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">الربح المقدر</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              {totalProfit >= 0 ? (
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
                <p className="text-sm font-medium text-gray-600">المنتجات النشطة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activeProducts} / {products.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            تقرير أداء المنتجات ({products.length} منتج)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">اسم المنتج</th>
                  <th className="text-right p-3">الفئة</th>
                  <th className="text-right p-3">الكمية المباعة</th>
                  <th className="text-right p-3">إجمالي الإيرادات</th>
                  <th className="text-right p-3">الربح المقدر</th>
                  <th className="text-right p-3">المخزون الحالي</th>
                  <th className="text-right p-3">حالة المخزون</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const stockStatus = getStockStatus(product.current_stock, 0);
                  return (
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
                      <td className="p-3 font-medium">
                        {product.total_sold || 0}
                      </td>
                      <td className="p-3 font-semibold text-green-600">
                        {formatCurrency(product.total_revenue)}
                      </td>
                      <td className={`p-3 font-semibold ${
                        (product.estimated_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(product.estimated_profit)}
                      </td>
                      <td className="p-3">
                        {product.current_stock}
                      </td>
                      <td className="p-3">
                        <Badge className={stockStatus.color}>
                          {stockStatus.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد منتجات تطابق البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => onExportPDF('product-performance', reportData)}
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

export default ProductPerformanceReport;
