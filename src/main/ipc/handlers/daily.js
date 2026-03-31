const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

async function openDaily(event, openPrice = 0) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    if (data.length > 0) {
      return {
        success: false,
        message: "هناك يوم مفتوح بالفعل",
      };
    }
    await db.run("INSERT INTO daily (userId, openPrice) VALUES (?, ?)", [
      userId,
      openPrice
    ]);
    return {
      success: true,
      message: "Daily created successfully",
    };
  } catch (error) {
    log.error("Daily creation error:", error.message);
    throw error;
  }
}

async function closeDaily(event, closePrice = 0) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    if (data.length === 0) {
      return {
        success: false,
        message: "لا يوجد يوم مفتوح لإغلاقه",
      };
    }
    const closedAt = formatDateForMySQL(); // e.g. "2025-07-17 10:15:05"

    await db.run(
      "UPDATE daily SET closed_at = ?,closePrice=? WHERE id = ?",
      [closedAt, closePrice, data[0].id]
    );
    return {
      success: true,
      message: "Daily closed successfully",
    };
  } catch (error) {
    log.error("Daily creation error:", error.message);
    throw error;
  }
}
async function getDaily(event) {
  try {
    const db = getDatabase();
    const store = new Store();
    
    let dailyRows;
    dailyRows = await db.all(
      "SELECT * FROM daily WHERE closed_at IS NULL",
    );
    

    if (dailyRows.length === 0) {
      return { success: false, message: "لا توجد يومية مفتوحة" };
    }

    const dailyIds = dailyRows.map(d => d.id);

    const placeholders = dailyIds.map(() => "?").join(",");
    // إجمالي مبيعات "كاش"
    const { total_cash_sales } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_cash_sales 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'خالص' AND paymentMethod = 'كاش'`,
      dailyIds
    );

    // إجمالي مبيعات "فيزا"
    const { total_visa_sales } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_visa_sales 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'خالص' AND paymentMethod = 'فيزا'`,
      dailyIds
    );

    // إجمالي المرتجعات كاش
    const { total_cash_returns } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_cash_returns 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'مرتجع' AND paymentMethod = 'كاش'`,
      dailyIds
    );

    // إجمالي المرتجعات فيزا
    const { total_visa_returns } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_visa_returns 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'مرتجع' AND paymentMethod = 'فيزا'`,
      dailyIds
    );

    const total_returns = total_cash_returns + total_visa_returns;

    // عدد الفواتير
    const { count_sales } = await db.get(
      `SELECT COUNT(*) AS count_sales 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'خالص'`,
      dailyIds
    );

    // إجمالي المنتجات المباعة
    const { total_products_sold } = await db.get(
      `SELECT COALESCE(SUM(ii.quantity), 0) AS total_products_sold
       FROM invoiceItems ii
       JOIN invoices i ON ii.invoiceId = i.id
       WHERE i.dailyId IN (${placeholders}) AND i.paymentType = 'خالص'`,
      dailyIds
    );

    // المصروفات (مع استبعاد المحذوف)
    const { total_expenses } = await db.get(
      `SELECT COALESCE(SUM(price), 0) AS total_expenses 
       FROM credit 
       WHERE daily_id IN (${placeholders}) AND deleted_at IS NULL`,
      dailyIds
    );
    
    // المبلغ الافتتاحي
    const open_price = dailyRows.reduce((sum, d) => sum + (d.openPrice || 0), 0);
    
    // المبلغ الكلي في الدرج (المبلع الافتتاحي + مبيعات الكاش - مرتجعات الكاش - المصروفات)
    const cashInDrawer = (open_price + total_cash_sales) - (total_cash_returns + total_expenses);
    
    // إجمالي المبيعات الصافي
    const net_sales = (total_cash_sales + total_visa_sales) - total_returns;
    
    const average_invoice = count_sales > 0 ? (total_cash_sales + total_visa_sales) / count_sales : 0;
    
    return {
      success: true,
      data: {
        total_sales: net_sales,
        total_cash_sales,
        total_visa_sales,
        total_returns,
        total_cash_returns,
        total_visa_returns,
        count_sales,
        total_products_sold,
        total_expenses,
        average_invoice,
        open_price,
        cashInDrawer,
        opened_at: dailyRows[0].opened_at,
      },
    };

  } catch (err) {
    console.error("getDaily error:", err);
    return { success: false, message: "خطأ في جلب اليومية" };
  }
}

function formatDateForMySQL(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
module.exports = { openDaily, closeDaily, getDaily };
