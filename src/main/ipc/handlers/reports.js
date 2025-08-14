import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Reports handler for POS system
 */

/**
 * Get daily sales report
 */
async function getDailySalesReport(event, date) {
  try {
    const db = getDatabase();
    const reportDate = date ? new Date(date) : new Date();
    const startDate = startOfDay(reportDate);
    const endDate = endOfDay(reportDate);

    // Get daily summary
    const [summaryRows] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as total_sales,
        SUM(tax_amount) as total_tax,
        SUM(discount_amount) as total_discount,
        AVG(total_amount) as average_transaction,
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
        SUM(CASE WHEN payment_method = 'digital' THEN total_amount ELSE 0 END) as digital_sales
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
    `, [startDate, endDate]);

    // Get hourly breakdown
    const [hourlyRows] = await db.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as transactions,
        SUM(total_amount) as sales
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `, [startDate, endDate]);

    // Get top products
    const [topProductsRows] = await db.execute(`
      SELECT 
        p.name as product_name,
        p.barcode,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.total_price) as total_sales,
        COUNT(DISTINCT t.id) as transaction_count
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.created_at BETWEEN ? AND ? 
      AND t.status = 'completed'
      GROUP BY p.id, p.name, p.barcode
      ORDER BY total_sales DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Get cashier performance
    const [cashierRows] = await db.execute(`
      SELECT 
        u.username as cashier_name,
        COUNT(*) as transactions,
        SUM(t.total_amount) as total_sales
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.created_at BETWEEN ? AND ? 
      AND t.status = 'completed'
      GROUP BY u.id, u.username
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    // Get payment method breakdown
    const [paymentRows] = await db.execute(`
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
      GROUP BY payment_method
    `, [startDate, endDate]);

    return {
      success: true,
      data: {
        date: format(reportDate, 'yyyy-MM-dd'),
        dateFormatted: format(reportDate, 'dd MMMM yyyy', { locale: ar }),
        summary: summaryRows[0] || {},
        hourlyBreakdown: hourlyRows,
        topProducts: topProductsRows,
        cashierPerformance: cashierRows,
        paymentMethods: paymentRows
      }
    };

  } catch (error) {
    log.error("Error getting daily sales report:", error);
    throw new Error("فشل في جلب التقرير اليومي");
  }
}

/**
 * Get monthly sales report
 */
async function getMonthlySalesReport(event, year, month) {
  try {
    const db = getDatabase();
    const reportDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const startDate = startOfMonth(reportDate);
    const endDate = endOfMonth(reportDate);

    // Get monthly summary
    const [summaryRows] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_amount) as total_sales,
        SUM(tax_amount) as total_tax,
        SUM(discount_amount) as total_discount,
        AVG(total_amount) as average_transaction,
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
        SUM(CASE WHEN payment_method = 'digital' THEN total_amount ELSE 0 END) as digital_sales
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
    `, [startDate, endDate]);

    // Get daily breakdown for the month
    const [dailyRows] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(total_amount) as sales
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [startDate, endDate]);

    // Get top products for the month
    const [topProductsRows] = await db.execute(`
      SELECT 
        p.name as product_name,
        p.barcode,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.total_price) as total_sales,
        COUNT(DISTINCT t.id) as transaction_count
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.created_at BETWEEN ? AND ? 
      AND t.status = 'completed'
      GROUP BY p.id, p.name, p.barcode
      ORDER BY total_sales DESC
      LIMIT 20
    `, [startDate, endDate]);

    // Get category performance
    const [categoryRows] = await db.execute(`
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.total_price) as total_sales
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.created_at BETWEEN ? AND ? 
      AND t.status = 'completed'
      GROUP BY p.category
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    return {
      success: true,
      data: {
        year: reportDate.getFullYear(),
        month: reportDate.getMonth() + 1,
        monthFormatted: format(reportDate, 'MMMM yyyy', { locale: ar }),
        summary: summaryRows[0] || {},
        dailyBreakdown: dailyRows,
        topProducts: topProductsRows,
        categoryPerformance: categoryRows
      }
    };

  } catch (error) {
    log.error("Error getting monthly sales report:", error);
    throw new Error("فشل في جلب التقرير الشهري");
  }
}

/**
 * Get product performance report
 */
async function getProductPerformanceReport(event, startDate, endDate, limit = 50) {
  try {
    const db = getDatabase();
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const [productRows] = await db.execute(`
      SELECT 
        p.id,
        p.name as product_name,
        p.barcode,
        p.category,
        p.price as current_price,
        p.cost as current_cost,
        p.stock_quantity as current_stock,
        SUM(ti.quantity) as total_sold,
        SUM(ti.total_price) as total_revenue,
        AVG(ti.unit_price) as average_selling_price,
        COUNT(DISTINCT t.id) as transaction_count,
        COUNT(DISTINCT DATE(t.created_at)) as days_sold,
        SUM(ti.total_price) - (SUM(ti.quantity) * p.cost) as estimated_profit
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.status = 'completed'
        AND t.created_at BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.barcode, p.category, p.price, p.cost, p.stock_quantity
      ORDER BY total_revenue DESC
      LIMIT ?
    `, [start, end, limit]);

    return {
      success: true,
      data: {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        products: productRows
      }
    };

  } catch (error) {
    log.error("Error getting product performance report:", error);
    throw new Error("فشل في جلب تقرير أداء المنتجات");
  }
}

/**
 * Get cashier performance report
 */
async function getCashierPerformanceReport(event, startDate, endDate) {
  try {
    const db = getDatabase();
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const [cashierRows] = await db.execute(`
      SELECT 
        u.id,
        u.username as cashier_name,
        u.email,
        u.role,
        COUNT(t.id) as total_transactions,
        SUM(t.total_amount) as total_sales,
        AVG(t.total_amount) as average_transaction,
        SUM(t.tax_amount) as total_tax_collected,
        SUM(t.discount_amount) as total_discounts_given,
        COUNT(DISTINCT DATE(t.created_at)) as working_days,
        MIN(t.created_at) as first_transaction,
        MAX(t.created_at) as last_transaction
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
        AND t.created_at BETWEEN ? AND ?
      WHERE u.role IN ('cashier', 'manager', 'admin')
      GROUP BY u.id, u.username, u.email, u.role
      ORDER BY total_sales DESC
    `, [start, end]);

    return {
      success: true,
      data: {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        cashiers: cashierRows
      }
    };

  } catch (error) {
    log.error("Error getting cashier performance report:", error);
    throw new Error("فشل في جلب تقرير أداء الكاشيرات");
  }
}

/**
 * Get inventory report
 */
async function getInventoryReport(event, lowStockOnly = false) {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT 
        p.id,
        p.name as product_name,
        p.barcode,
        p.category,
        p.price,
        p.cost,
        p.stock_quantity,
        p.min_stock_level,
        p.stock_quantity * p.cost as inventory_value,
        CASE 
          WHEN p.stock_quantity <= p.min_stock_level THEN 'منخفض'
          WHEN p.stock_quantity = 0 THEN 'نفد'
          ELSE 'متوفر'
        END as stock_status,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.active = 1
    `;

    if (lowStockOnly) {
      query += ` AND p.stock_quantity <= p.min_stock_level`;
    }

    query += ` ORDER BY p.stock_quantity ASC, p.name ASC`;

    const [inventoryRows] = await db.execute(query);

    // Get summary statistics
    const [summaryRows] = await db.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity * cost) as total_inventory_value,
        SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM products 
      WHERE active = 1
    `);

    return {
      success: true,
      data: {
        summary: summaryRows[0] || {},
        products: inventoryRows,
        lowStockOnly
      }
    };

  } catch (error) {
    log.error("Error getting inventory report:", error);
    throw new Error("فشل في جلب تقرير المخزون");
  }
}

/**
 * Get financial summary report
 */
async function getFinancialSummaryReport(event, startDate, endDate) {
  try {
    const db = getDatabase();
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    // Get sales summary
    const [salesRows] = await db.execute(`
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(tax_amount) as total_tax,
        SUM(discount_amount) as total_discounts,
        COUNT(*) as total_transactions,
        AVG(total_amount) as average_transaction
      FROM transactions 
      WHERE created_at BETWEEN ? AND ? 
      AND status = 'completed'
    `, [start, end]);

    // Get expenses (credits)
    const [expensesRows] = await db.execute(`
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as expense_count
      FROM credit 
      WHERE created_at BETWEEN ? AND ?
    `, [start, end]);

    // Get estimated profit (simplified calculation)
    const [profitRows] = await db.execute(`
      SELECT 
        SUM(ti.total_price - (ti.quantity * p.cost)) as estimated_gross_profit
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      JOIN products p ON ti.product_id = p.id
      WHERE t.created_at BETWEEN ? AND ? 
      AND t.status = 'completed'
    `, [start, end]);

    const sales = salesRows[0] || {};
    const expenses = expensesRows[0] || {};
    const profit = profitRows[0] || {};

    const netProfit = (profit.estimated_gross_profit || 0) - (expenses.total_expenses || 0);

    return {
      success: true,
      data: {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        revenue: {
          total: sales.total_revenue || 0,
          tax: sales.total_tax || 0,
          discounts: sales.total_discounts || 0,
          net: (sales.total_revenue || 0) - (sales.total_tax || 0)
        },
        expenses: {
          total: expenses.total_expenses || 0,
          count: expenses.expense_count || 0
        },
        profit: {
          gross: profit.estimated_gross_profit || 0,
          net: netProfit
        },
        transactions: {
          count: sales.total_transactions || 0,
          average: sales.average_transaction || 0
        }
      }
    };

  } catch (error) {
    log.error("Error getting financial summary report:", error);
    throw new Error("فشل في جلب التقرير المالي");
  }
}

export {
  getDailySalesReport,
  getMonthlySalesReport,
  getProductPerformanceReport,
  getCashierPerformanceReport,
  getInventoryReport,
  getFinancialSummaryReport
};

