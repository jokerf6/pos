const { getDatabase } = require("../../database/connection.js");
const {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
} = require("date-fns");
const { ar } = require("date-fns/locale");
const log = require("electron-log");

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
    const start = toSqliteDate(startDate ? new Date(startDate) : startOfDay(reportDate));
const end = toSqliteDate(endDate ? new Date(endDate) : endOfDay(reportDate));


    // Get daily summary
    const all= await db.all(
      `SELECT * FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع' -- Exclude returns`,[start, end]
    )
    const summaryRows = await db.all(
      `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(totalAfterDiscount) as total_sales,
        0 as total_tax, -- Tax not implemented in schema
        SUM(discount) as total_discount,
        AVG(totalAfterDiscount) as average_transaction,
        SUM(CASE WHEN paymentType = 'خالص' THEN totalAfterDiscount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN paymentType = 'أجل' THEN totalAfterDiscount ELSE 0 END) as credit_sales,
        0 as digital_sales -- Digital payments not implemented
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع' -- Exclude returns
    `,
      [start, end]
    );

    console.log("Daily Summary Rows:", summaryRows);
    console.log("Daily All Rows:", all);

    // Get hourly breakdown - using strftime for SQLite
    const hourlyRows = await db.all(
      `
      SELECT 
        CAST(strftime('%H', createdAt) AS INTEGER) as hour,
        COUNT(*) as transactions,
        SUM(totalAfterDiscount) as sales
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع'
      GROUP BY strftime('%H', createdAt)
      ORDER BY hour
    `,
      [start, end]
    );

    // Get top products
    const topProductsRows = await db.all(
      `
      SELECT 
        i.name as product_name,
        i.barcode,
        SUM(ii.quantity) as total_quantity,
        SUM(ii.totalPriceAfterDiscount) as total_sales,
        COUNT(DISTINCT inv.id) as transaction_count
      FROM invoiceItems ii
      JOIN invoices inv ON ii.invoiceId = inv.id
      JOIN items i ON ii.itemId = i.id
      WHERE inv.createdAt BETWEEN ? AND ? 
      AND inv.paymentType != 'مرتجع'
      GROUP BY i.id, i.name, i.barcode
      ORDER BY total_sales DESC
      LIMIT 10
    `,
      [start, end]
    );

    // Get cashier performance (using daily table since invoices don't have user_id)
    const cashierRows = await db.all(
      `
      SELECT 
        u.username as cashier_name,
        COUNT(DISTINCT d.id) as sessions,
        COUNT(DISTINCT inv.id) as transactions,
        SUM(inv.totalAfterDiscount) as total_sales
      FROM daily d
      JOIN users u ON d.userId = u.id
      LEFT JOIN invoices inv ON inv.dailyId = d.id 
        AND inv.createdAt BETWEEN ? AND ?
        AND inv.paymentType != 'مرتجع'
      WHERE d.opened_at BETWEEN ? AND ?
      GROUP BY u.id, u.username
      ORDER BY total_sales DESC
    `,
      [start, end, start, end]
    );

    // Get payment method breakdown
    const paymentRows = await db.all(
      `
      SELECT
        paymentType as payment_method,
        COUNT(*) as transaction_count,
        SUM(totalAfterDiscount) as total_amount
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع'
      GROUP BY paymentType
    `,
      [start, end]
    );

    return {
      success: true,
      data: {
        date: format(reportDate, "yyyy-MM-dd"),
        dateFormatted: format(reportDate, "dd MMMM yyyy", { locale: ar }),
        summary: summaryRows[0] || {
          total_transactions: 0,
          total_sales: 0,
          total_tax: 0,
          total_discount: 0,
          average_transaction: 0,
          cash_sales: 0,
          credit_sales: 0,
          digital_sales: 0
        },
        hourlyBreakdown: hourlyRows,
        topProducts: topProductsRows,
        cashierPerformance: cashierRows,
        paymentMethods: paymentRows,
      },
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
    const reportDate = new Date(
      year || new Date().getFullYear(),
      month || new Date().getMonth(),
      1
    );
    const startDate = startOfMonth(reportDate);
    const endDate = endOfMonth(reportDate);

    // Get monthly summary
    const summaryRows = await db.all(
      `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(totalAfterDiscount) as total_sales,
        0 as total_tax, -- Tax not implemented in your schema
        SUM(discount) as total_discount,
        AVG(totalAfterDiscount) as average_transaction,
        SUM(CASE WHEN paymentType = 'خالص' THEN totalAfterDiscount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN paymentType = 'أجل' THEN totalAfterDiscount ELSE 0 END) as credit_sales,
        0 as digital_sales -- Digital payments not implemented
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع' -- Exclude returns
    `,
      [startDate, endDate]
    );

    // Get daily breakdown for the month
    const dailyRows = await db.all(
      `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as transactions,
        SUM(totalAfterDiscount) as sales
      FROM invoices 
      WHERE createdAt BETWEEN ? AND ? 
      AND paymentType != 'مرتجع'
      GROUP BY DATE(createdAt)
      ORDER BY date
    `,
      [startDate, endDate]
    );

    // Get top products for the month
    const topProductsRows = await db.all(
      `
      SELECT 
        i.name as product_name,
        i.barcode,
        SUM(ii.quantity) as total_quantity,
        SUM(ii.totalPriceAfterDiscount) as total_sales,
        COUNT(DISTINCT inv.id) as transaction_count
      FROM invoiceItems ii
      JOIN invoices inv ON ii.invoiceId = inv.id
      JOIN items i ON ii.itemId = i.id
      WHERE inv.createdAt BETWEEN ? AND ? 
      AND inv.paymentType != 'مرتجع'
      GROUP BY i.id, i.name, i.barcode
      ORDER BY total_sales DESC
      LIMIT 20
    `,
      [startDate, endDate]
    );

    // Get category performance
    const categoryRows = await db.all(
      `
      SELECT 
        c.name as category,
        COUNT(DISTINCT i.id) as product_count,
        SUM(ii.quantity) as total_quantity,
        SUM(ii.totalPriceAfterDiscount) as total_sales
      FROM invoiceItems ii
      JOIN invoices inv ON ii.invoiceId = inv.id
      JOIN items i ON ii.itemId = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE inv.createdAt BETWEEN ? AND ? 
      AND inv.paymentType != 'مرتجع'
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `,
      [startDate, endDate]
    );

    return {
      success: true,
      data: {
        year: reportDate.getFullYear(),
        month: reportDate.getMonth() + 1,
        monthFormatted: format(reportDate, "MMMM yyyy", { locale: ar }),
        summary: summaryRows[0] || {
          total_transactions: 0,
          total_sales: 0,
          total_tax: 0,
          total_discount: 0,
          average_transaction: 0,
          cash_sales: 0,
          credit_sales: 0,
          digital_sales: 0
        },
        dailyBreakdown: dailyRows,
        topProducts: topProductsRows,
        categoryPerformance: categoryRows,
      },
    };
  } catch (error) {
    log.error("Error getting monthly sales report:", error);
    throw new Error("فشل في جلب التقرير الشهري");
  }
}
/**
 * Get product performance report
 */
async function getProductPerformanceReport(
  event,
  { from: startDate, to: endDate,page = 1, limit=10 }={page:1,limit:10},
) {
  try {
    const db = getDatabase();
            const offset = (page - 1) * limit;
const start = toSqliteDate(startDate ? new Date(startDate) : startOfMonth(new Date()));
const end = toSqliteDate(endDate ? new Date(endDate) : endOfMonth(new Date()));

    const productRows = await db.all(
      `
     SELECT
    i.id,
    i.name as product_name,
    i.barcode,
    c.name as category,
    i.price as current_price,
    i.buy_price as current_cost,
    i.quantity as current_stock,
    SUM(ii.quantity) as total_sold,
    SUM(ii.totalPriceAfterDiscount) as total_revenue,
    AVG(ii.pricePerUnit) as average_selling_price,
    COUNT(DISTINCT inv.id) as transaction_count,
    COUNT(DISTINCT DATE(inv.createdAt)) as days_sold,
    SUM(ii.totalPriceAfterDiscount) - (SUM(ii.quantity) * i.buy_price) as estimated_profit
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN invoiceItems ii ON i.id = ii.itemId
LEFT JOIN invoices inv ON ii.invoiceId = inv.id 
    AND inv.paymentType != 'مرتجع' -- Exclude returns
    AND inv.createdAt BETWEEN ? AND ?
GROUP BY i.id, i.name, i.barcode, c.name, i.price, i.buy_price, i.stock
ORDER BY total_revenue DESC
LIMIT ? OFFSET ?
    `,
      [start, end, limit, offset]
    );
    const settings = await db.get(`
  SELECT 
    *
  FROM settings
  WHERE key = 'warning'
  LIMIT 1
`);
const totalRows = await db.get(
  `
  SELECT COUNT(*) AS total
  FROM (
    SELECT i.id
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN invoiceItems ii ON i.id = ii.itemId
    LEFT JOIN invoices inv ON ii.invoiceId = inv.id 
      AND inv.paymentType != 'مرتجع'
      AND inv.createdAt BETWEEN ? AND ?
    GROUP BY i.id
  ) AS subquery
  `,
  [start, end]
);

const activeRows = await db.get(
  `
  SELECT COUNT(*) AS total
  FROM (
    SELECT i.id
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN invoiceItems ii ON i.id = ii.itemId
    LEFT JOIN invoices inv ON ii.invoiceId = inv.id 
      AND inv.paymentType != 'مرتجع'
      AND inv.createdAt BETWEEN ? AND ?
    WHERE i.quantity > 0
    GROUP BY i.id
  ) AS subquery
  `,
  [start, end]
);
    return {
      success: true,
      data: {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        products: productRows,
        total: totalRows.total || 0,
        limit: settings.value || 0,
        active: activeRows.total || 0
      },
    };
  } catch (error) {
    log.error("Error getting product performance report:", error);
    throw new Error("فشل في جلب تقرير أداء المنتجات");
  }
}

/**
 * Get cashier performance report
 */
async function getCashierPerformanceReport(event, {from:startDate, to:endDate,page = 1, limit=10}={page:1,limit:10}) {
  try {
    const db = getDatabase();
        const offset = (page - 1) * limit;
const start = toSqliteDate(startDate ? new Date(startDate) : startOfMonth(new Date()));
const end = toSqliteDate(endDate ? new Date(endDate) : endOfMonth(new Date()));
    const all = await db.all(
      `select * from invoices`);
    console.log("All Invoices:", all);
    const cashierRows = await db.all(
      `
SELECT 
  u.id,
  u.username AS cashier_name,
  u.role,
  COUNT(i.id) AS total_transactions,
  SUM(i.totalAfterDiscount) AS total_sales,
  AVG(i.totalAfterDiscount) AS average_transaction,
  SUM(i.discount) AS total_discounts_given,
  COUNT(DISTINCT DATE(i.createdAt)) AS working_days,
  MIN(i.createdAt) AS first_transaction,
  MAX(i.createdAt) AS last_transaction
FROM users u
LEFT JOIN invoices i ON i.userId = u.id
  AND i.createdAt BETWEEN ? AND ?
  AND i.paymentType IN ('خالص','أجل')
WHERE u.role IN ('cashier', 'manager', 'admin')
GROUP BY u.id, u.username, u.role
ORDER BY total_sales DESC
LIMIT ? OFFSET ?
    `,
      [start, end, limit, offset]
    );
  console.log(cashierRows);
const totalRows = await db.get(
  `
  SELECT COUNT(DISTINCT u.id) AS total
  FROM users u
  LEFT JOIN invoices i ON i.userId = u.id
    AND i.createdAt BETWEEN ? AND ?
    AND i.paymentType IN ('خالص','أجل')
  WHERE u.role IN ('cashier', 'manager', 'admin')
  `,
  [start, end]
);

    return {
      success: true,
      data: {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        cashiers: cashierRows,
        total: totalRows.total || 0,
      },
    };
  } catch (error) {
    log.error("Error getting cashier performance report:", error);
    throw new Error("فشل في جلب تقرير أداء الكاشيرات");
  }
}

/**
 * Get inventory report
 */
async function getInventoryReport(event,
  
    { page=1, limit = 10 ,lowStockOnly = false} = {lowStockOnly : false, page: 1, limit: 10 }

  ) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;

const settings = await db.get(`
  SELECT 
    *
  FROM settings
  WHERE key = 'warning'
  LIMIT 1
`);

      let query = `
  SELECT 
    i.id,
    i.name AS product_name,
    i.barcode,
    i.price,
    i.buy_price,
    i.quantity AS stock_quantity,
    (i.quantity * i.buy_price) AS inventory_value,
    CASE 
      WHEN i.quantity = 0 THEN 'نفد'
      WHEN i.quantity <= ${+settings.value} THEN 'منخفض'
      ELSE 'متوفر'
    END AS stock_status,
    c.name AS category_name,
    i.created_at
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
  `;


  if (lowStockOnly) {
    query += ` WHERE i.quantity <= ${+settings.value}`; // نفس الفكرة للحد الأدنى
  }


  query += ` ORDER BY i.quantity ASC, i.name ASC`;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

    const inventoryRows = await db.all(query);

let countQuery = `
  SELECT 
    COUNT(*) AS total_count
  FROM items i
  LEFT JOIN categories c ON i.category_id = c.id
`;

if (lowStockOnly) {
  query += ` WHERE i.quantity <= ${+settings.value}`;
}
    const count = await db.all(countQuery);

const summaryRows = await db.all(`
  SELECT 
    COUNT(*) as total_products,
    SUM(quantity * buy_price) as total_inventory_value,
    SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END) as low_stock_count,
    SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
  FROM items
`);
    return {
      success: true,
      data: {
        summary: summaryRows[0] || {},
        products: inventoryRows,
        count,
        lowStockOnly,
      },
    };
  } catch (error) {
    log.error("Error getting inventory report:", error);
    throw new Error("فشل في جلب تقرير المخزون");
  }
}

/**
 * Get financial summary report
 */
function toSqliteDate(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

async function getFinancialSummaryReport(event, {from:startDate, to:endDate}) {
  console.log(startDate, endDate);
  try {
    const db = getDatabase();
const start = toSqliteDate(startDate ? new Date(startDate) : startOfMonth(new Date()));
const end = toSqliteDate(endDate ? new Date(endDate) : endOfMonth(new Date()));

    // Get sales summary
    const salesRows = await db.get(
      `
   SELECT 
  COALESCE(SUM(totalAfterDiscount), 0) as total_revenue,
  COALESCE(SUM(discount), 0) as total_discounts,
  COUNT(*) as total_transactions,
  AVG(totalAfterDiscount) as average_transaction
FROM invoices 
WHERE createdAt BETWEEN ? AND ?
AND paymentType = 'خالص';
    `,
      [start, end]
    );

    // Get expenses (credits)

    const expensesRows = await db.get(
      `
SELECT 
  COALESCE(SUM(price), 0) as total_expenses,
  COUNT(*) as expense_count
FROM credit 
WHERE created_at BETWEEN ? AND ?;
    `,
      [start, end]
    );




    // Get estimated profit (simplified calculation)
    const profitRows = await db.get(
      `
SELECT 
  COALESCE(SUM(ii.totalPriceAfterDiscount - (ii.quantity * i.buy_price)), 0) as estimated_gross_profit
FROM invoiceItems ii
JOIN invoices inv ON ii.invoiceId = inv.id
JOIN items i ON ii.itemId = i.id
WHERE inv.createdAt BETWEEN ? AND ?
AND inv.paymentType = 'خالص';
    `,
      [start, end]
    );

    const sales = salesRows || {};
    const expenses = expensesRows || {};
    const profit = profitRows || {};

    const netProfit =
      (profit.estimated_gross_profit || 0) - (expenses.total_expenses || 0);

    return {
      success: true,
      data: {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        revenue: {
          total: sales.total_revenue || 0,
          tax: sales.total_tax || 0,
          discounts: sales.total_discounts || 0,
          net: (sales.total_revenue || 0) - (sales.total_tax || 0),
        },
        expenses: {
          total: expenses.total_expenses || 0,
          count: expenses.expense_count || 0,
        },
        profit: {
          gross: profit.estimated_gross_profit || 0,
          net: netProfit,
        },
        transactions: {
          count: sales.total_transactions || 0,
          average: sales.average_transaction || 0,
        },
      },
    };
  } catch (error) {
    log.error("Error getting financial summary report:", error);
    throw new Error("فشل في جلب التقرير المالي");
  }
}

module.exports = {
  getDailySalesReport,
  getMonthlySalesReport,
  getProductPerformanceReport,
  getCashierPerformanceReport,
  getInventoryReport,
  getFinancialSummaryReport,
};
