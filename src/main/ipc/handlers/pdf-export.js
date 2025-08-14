import puppeteer from "puppeteer";
import log from "electron-log";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF report from HTML template
 */
async function generatePDFReport(event, reportData, reportType, options = {}) {
  let browser = null;
  
  try {
    log.info("Starting PDF generation for report type:", reportType);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate HTML content based on report type
    const htmlContent = await generateReportHTML(reportData, reportType);
    
    // Set content and wait for load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      ...options
    };
    
    const pdfBuffer = await page.pdf(pdfOptions);
    
    log.info("PDF generated successfully");
    
    return {
      success: true,
      data: pdfBuffer,
      filename: generateFilename(reportType, reportData)
    };
    
  } catch (error) {
    log.error("Error generating PDF report:", error);
    throw new Error("فشل في إنشاء تقرير PDF");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate filename for the report
 */
function generateFilename(reportType, reportData) {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  switch (reportType) {
    case 'daily-sales':
      return `تقرير_المبيعات_اليومي_${reportData.date}_${timestamp}.pdf`;
    case 'monthly-sales':
      return `تقرير_المبيعات_الشهري_${reportData.year}-${reportData.month}_${timestamp}.pdf`;
    case 'product-performance':
      return `تقرير_أداء_المنتجات_${timestamp}.pdf`;
    case 'cashier-performance':
      return `تقرير_أداء_الكاشيرات_${timestamp}.pdf`;
    case 'inventory':
      return `تقرير_المخزون_${timestamp}.pdf`;
    case 'financial-summary':
      return `التقرير_المالي_${timestamp}.pdf`;
    default:
      return `تقرير_${timestamp}.pdf`;
  }
}

/**
 * Generate HTML content for different report types
 */
async function generateReportHTML(reportData, reportType) {
  const baseCSS = await getBaseCSS();
  
  switch (reportType) {
    case 'daily-sales':
      return generateDailySalesHTML(reportData, baseCSS);
    case 'monthly-sales':
      return generateMonthlySalesHTML(reportData, baseCSS);
    case 'product-performance':
      return generateProductPerformanceHTML(reportData, baseCSS);
    case 'cashier-performance':
      return generateCashierPerformanceHTML(reportData, baseCSS);
    case 'inventory':
      return generateInventoryHTML(reportData, baseCSS);
    case 'financial-summary':
      return generateFinancialSummaryHTML(reportData, baseCSS);
    default:
      throw new Error("نوع التقرير غير مدعوم");
  }
}

/**
 * Get base CSS styles for reports
 */
async function getBaseCSS() {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Cairo', Arial, sans-serif;
        direction: rtl;
        text-align: right;
        line-height: 1.6;
        color: #333;
        background: white;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        border-bottom: 3px solid #2563eb;
      }
      
      .header h1 {
        color: #1e40af;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .header .date {
        color: #6b7280;
        font-size: 16px;
      }
      
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      }
      
      .card h3 {
        color: #475569;
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .card .value {
        color: #1e40af;
        font-size: 24px;
        font-weight: 700;
      }
      
      .section {
        margin-bottom: 40px;
      }
      
      .section h2 {
        color: #1e40af;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      th, td {
        padding: 12px;
        text-align: right;
        border-bottom: 1px solid #e2e8f0;
      }
      
      th {
        background: #f1f5f9;
        color: #475569;
        font-weight: 600;
        font-size: 14px;
      }
      
      td {
        font-size: 14px;
      }
      
      tr:hover {
        background: #f8fafc;
      }
      
      .number {
        font-family: 'Cairo', monospace;
        font-weight: 600;
      }
      
      .positive {
        color: #059669;
      }
      
      .negative {
        color: #dc2626;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        color: #6b7280;
        font-size: 12px;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  `;
}

/**
 * Generate Daily Sales Report HTML
 */
function generateDailySalesHTML(data, baseCSS) {
  const summary = data.summary || {};
  
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير المبيعات اليومي</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>تقرير المبيعات اليومي</h1>
        <div class="date">${data.dateFormatted || data.date}</div>
      </div>
      
      <div class="summary-cards">
        <div class="card">
          <h3>إجمالي المبيعات</h3>
          <div class="value number">${formatCurrency(summary.total_sales || 0)}</div>
        </div>
        <div class="card">
          <h3>عدد المعاملات</h3>
          <div class="value number">${summary.total_transactions || 0}</div>
        </div>
        <div class="card">
          <h3>متوسط المعاملة</h3>
          <div class="value number">${formatCurrency(summary.average_transaction || 0)}</div>
        </div>
        <div class="card">
          <h3>إجمالي الضرائب</h3>
          <div class="value number">${formatCurrency(summary.total_tax || 0)}</div>
        </div>
      </div>
      
      ${data.paymentMethods && data.paymentMethods.length > 0 ? `
      <div class="section">
        <h2>طرق الدفع</h2>
        <table>
          <thead>
            <tr>
              <th>طريقة الدفع</th>
              <th>عدد المعاملات</th>
              <th>المبلغ الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${data.paymentMethods.map(payment => `
              <tr>
                <td>${getPaymentMethodName(payment.payment_method)}</td>
                <td class="number">${payment.transaction_count}</td>
                <td class="number">${formatCurrency(payment.total_amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${data.topProducts && data.topProducts.length > 0 ? `
      <div class="section">
        <h2>أفضل المنتجات مبيعاً</h2>
        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الكمية المباعة</th>
              <th>إجمالي المبيعات</th>
              <th>عدد المعاملات</th>
            </tr>
          </thead>
          <tbody>
            ${data.topProducts.map(product => `
              <tr>
                <td>${product.product_name}</td>
                <td class="number">${product.total_quantity}</td>
                <td class="number">${formatCurrency(product.total_sales)}</td>
                <td class="number">${product.transaction_count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${data.cashierPerformance && data.cashierPerformance.length > 0 ? `
      <div class="section">
        <h2>أداء الكاشيرات</h2>
        <table>
          <thead>
            <tr>
              <th>اسم الكاشير</th>
              <th>عدد المعاملات</th>
              <th>إجمالي المبيعات</th>
            </tr>
          </thead>
          <tbody>
            ${data.cashierPerformance.map(cashier => `
              <tr>
                <td>${cashier.cashier_name}</td>
                <td class="number">${cashier.transactions}</td>
                <td class="number">${formatCurrency(cashier.total_sales)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Monthly Sales Report HTML
 */
function generateMonthlySalesHTML(data, baseCSS) {
  const summary = data.summary || {};
  
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير المبيعات الشهري</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>تقرير المبيعات الشهري</h1>
        <div class="date">${data.monthFormatted}</div>
      </div>
      
      <div class="summary-cards">
        <div class="card">
          <h3>إجمالي المبيعات</h3>
          <div class="value number">${formatCurrency(summary.total_sales || 0)}</div>
        </div>
        <div class="card">
          <h3>عدد المعاملات</h3>
          <div class="value number">${summary.total_transactions || 0}</div>
        </div>
        <div class="card">
          <h3>متوسط المعاملة</h3>
          <div class="value number">${formatCurrency(summary.average_transaction || 0)}</div>
        </div>
        <div class="card">
          <h3>إجمالي الضرائب</h3>
          <div class="value number">${formatCurrency(summary.total_tax || 0)}</div>
        </div>
      </div>
      
      ${data.topProducts && data.topProducts.length > 0 ? `
      <div class="section">
        <h2>أفضل المنتجات مبيعاً</h2>
        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الكمية المباعة</th>
              <th>إجمالي المبيعات</th>
              <th>عدد المعاملات</th>
            </tr>
          </thead>
          <tbody>
            ${data.topProducts.slice(0, 15).map(product => `
              <tr>
                <td>${product.product_name}</td>
                <td class="number">${product.total_quantity}</td>
                <td class="number">${formatCurrency(product.total_sales)}</td>
                <td class="number">${product.transaction_count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${data.categoryPerformance && data.categoryPerformance.length > 0 ? `
      <div class="section">
        <h2>أداء الفئات</h2>
        <table>
          <thead>
            <tr>
              <th>الفئة</th>
              <th>عدد المنتجات</th>
              <th>الكمية المباعة</th>
              <th>إجمالي المبيعات</th>
            </tr>
          </thead>
          <tbody>
            ${data.categoryPerformance.map(category => `
              <tr>
                <td>${category.category || 'غير محدد'}</td>
                <td class="number">${category.product_count}</td>
                <td class="number">${category.total_quantity}</td>
                <td class="number">${formatCurrency(category.total_sales)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Product Performance Report HTML
 */
function generateProductPerformanceHTML(data, baseCSS) {
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير أداء المنتجات</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>تقرير أداء المنتجات</h1>
        <div class="date">من ${data.startDate} إلى ${data.endDate}</div>
      </div>
      
      <div class="section">
        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الفئة</th>
              <th>الكمية المباعة</th>
              <th>إجمالي الإيرادات</th>
              <th>الربح المقدر</th>
              <th>المخزون الحالي</th>
            </tr>
          </thead>
          <tbody>
            ${data.products.map(product => `
              <tr>
                <td>${product.product_name}</td>
                <td>${product.category || 'غير محدد'}</td>
                <td class="number">${product.total_sold || 0}</td>
                <td class="number">${formatCurrency(product.total_revenue || 0)}</td>
                <td class="number ${(product.estimated_profit || 0) >= 0 ? 'positive' : 'negative'}">
                  ${formatCurrency(product.estimated_profit || 0)}
                </td>
                <td class="number">${product.current_stock}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Cashier Performance Report HTML
 */
function generateCashierPerformanceHTML(data, baseCSS) {
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير أداء الكاشيرات</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>تقرير أداء الكاشيرات</h1>
        <div class="date">من ${data.startDate} إلى ${data.endDate}</div>
      </div>
      
      <div class="section">
        <table>
          <thead>
            <tr>
              <th>اسم الكاشير</th>
              <th>الدور</th>
              <th>عدد المعاملات</th>
              <th>إجمالي المبيعات</th>
              <th>متوسط المعاملة</th>
              <th>أيام العمل</th>
            </tr>
          </thead>
          <tbody>
            ${data.cashiers.map(cashier => `
              <tr>
                <td>${cashier.cashier_name}</td>
                <td>${getRoleName(cashier.role)}</td>
                <td class="number">${cashier.total_transactions || 0}</td>
                <td class="number">${formatCurrency(cashier.total_sales || 0)}</td>
                <td class="number">${formatCurrency(cashier.average_transaction || 0)}</td>
                <td class="number">${cashier.working_days || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Inventory Report HTML
 */
function generateInventoryHTML(data, baseCSS) {
  const summary = data.summary || {};
  
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير المخزون</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>تقرير المخزون</h1>
        <div class="date">${format(new Date(), 'dd MMMM yyyy', { locale: ar })}</div>
      </div>
      
      <div class="summary-cards">
        <div class="card">
          <h3>إجمالي المنتجات</h3>
          <div class="value number">${summary.total_products || 0}</div>
        </div>
        <div class="card">
          <h3>قيمة المخزون</h3>
          <div class="value number">${formatCurrency(summary.total_inventory_value || 0)}</div>
        </div>
        <div class="card">
          <h3>منتجات منخفضة المخزون</h3>
          <div class="value number">${summary.low_stock_count || 0}</div>
        </div>
        <div class="card">
          <h3>منتجات نفدت</h3>
          <div class="value number">${summary.out_of_stock_count || 0}</div>
        </div>
      </div>
      
      <div class="section">
        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الفئة</th>
              <th>المخزون الحالي</th>
              <th>الحد الأدنى</th>
              <th>قيمة المخزون</th>
              <th>حالة المخزون</th>
            </tr>
          </thead>
          <tbody>
            ${data.products.map(product => `
              <tr>
                <td>${product.product_name}</td>
                <td>${product.category || 'غير محدد'}</td>
                <td class="number">${product.stock_quantity}</td>
                <td class="number">${product.min_stock_level}</td>
                <td class="number">${formatCurrency(product.inventory_value || 0)}</td>
                <td class="${getStockStatusClass(product.stock_status)}">${product.stock_status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Financial Summary Report HTML
 */
function generateFinancialSummaryHTML(data, baseCSS) {
  return `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>التقرير المالي</title>
      ${baseCSS}
    </head>
    <body>
      <div class="header">
        <h1>التقرير المالي</h1>
        <div class="date">من ${data.startDate} إلى ${data.endDate}</div>
      </div>
      
      <div class="summary-cards">
        <div class="card">
          <h3>إجمالي الإيرادات</h3>
          <div class="value number positive">${formatCurrency(data.revenue.total || 0)}</div>
        </div>
        <div class="card">
          <h3>إجمالي المصروفات</h3>
          <div class="value number negative">${formatCurrency(data.expenses.total || 0)}</div>
        </div>
        <div class="card">
          <h3>الربح الإجمالي</h3>
          <div class="value number ${(data.profit.gross || 0) >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(data.profit.gross || 0)}
          </div>
        </div>
        <div class="card">
          <h3>صافي الربح</h3>
          <div class="value number ${(data.profit.net || 0) >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(data.profit.net || 0)}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>تفاصيل الإيرادات</h2>
        <table>
          <tbody>
            <tr>
              <td>إجمالي المبيعات</td>
              <td class="number">${formatCurrency(data.revenue.total || 0)}</td>
            </tr>
            <tr>
              <td>الضرائب المحصلة</td>
              <td class="number">${formatCurrency(data.revenue.tax || 0)}</td>
            </tr>
            <tr>
              <td>الخصومات الممنوحة</td>
              <td class="number negative">${formatCurrency(data.revenue.discounts || 0)}</td>
            </tr>
            <tr>
              <td>صافي الإيرادات</td>
              <td class="number positive">${formatCurrency(data.revenue.net || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2>إحصائيات المعاملات</h2>
        <table>
          <tbody>
            <tr>
              <td>عدد المعاملات</td>
              <td class="number">${data.transactions.count || 0}</td>
            </tr>
            <tr>
              <td>متوسط قيمة المعاملة</td>
              <td class="number">${formatCurrency(data.transactions.average || 0)}</td>
            </tr>
            <tr>
              <td>عدد المصروفات</td>
              <td class="number">${data.expenses.count || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        تم إنشاء هذا التقرير في ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}
      </div>
    </body>
    </html>
  `;
}

/**
 * Helper functions
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

function getPaymentMethodName(method) {
  const methods = {
    'cash': 'نقدي',
    'card': 'بطاقة',
    'digital': 'رقمي'
  };
  return methods[method] || method;
}

function getRoleName(role) {
  const roles = {
    'admin': 'مدير',
    'manager': 'مشرف',
    'cashier': 'كاشير'
  };
  return roles[role] || role;
}

function getStockStatusClass(status) {
  switch (status) {
    case 'نفد':
      return 'negative';
    case 'منخفض':
      return 'negative';
    case 'متوفر':
      return 'positive';
    default:
      return '';
  }
}

export {
  generatePDFReport
};

