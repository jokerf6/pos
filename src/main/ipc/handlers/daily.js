const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

async function openDaily(event, openPrice = 0) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const store = new Store();
    const branchId = store.get("branch.id");
    if(!branchId){
      throw new Error("برجاء اختيار الفرع");
    }
    const data = await db.all(
      "SELECT * FROM daily where closed_at IS NULL AND branchId = ? Limit 1",
      [branchId]
    );
    if (data.length > 0) {
      return {
        success: false,
        message: "هناك يوم مفتوح بالفعل",
      };
    }
    await db.run("INSERT INTO daily (userId, openPrice, branchId) VALUES (?, ?, ?)", [
      userId,
      openPrice,
      branchId
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
    const branchId = store.get("branch.id");
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM daily where closed_at IS NULL AND branchId = ?  Limit 1",
      [branchId]
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
    const branchId = store.get("branch.id");

    let dailyRows;
    if (branchId) {
      dailyRows = await db.all(
        "SELECT * FROM daily WHERE closed_at IS NULL AND branchId = ?",
        [branchId]
      );
    } else {
      dailyRows = await db.all(
        "SELECT * FROM daily WHERE closed_at IS NULL"
      );
    }

    if (dailyRows.length === 0) {
      return { success: false, message: "لا توجد يومية مفتوحة" };
    }

    const dailyIds = dailyRows.map(d => d.id);

    const placeholders = dailyIds.map(() => "?").join(",");
    console.log("---1--->", branchId)
    console.log("------->", dailyIds);
    const { total_sales } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_sales 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'خالص'`,
      dailyIds
    );

    // إجمالي المرتجعات
    const { total_returns } = await db.get(
      `SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_returns 
       FROM invoices 
       WHERE dailyId IN (${placeholders}) AND paymentType = 'مرتجع'`,
      dailyIds
    );

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

    // المصروفات
    const { total_expenses } = await db.get(
      `SELECT COALESCE(SUM(price), 0) AS total_expenses 
       FROM credit 
       WHERE daily_id IN (${placeholders})`,
      dailyIds
    );

    const average_invoice = count_sales > 0 ? total_sales / count_sales : 0;
    console.log(   total_sales,
        total_returns,
        count_sales,
        total_products_sold,
        total_expenses,
        average_invoice,)

    return {
      success: true,
      data: {
        total_sales,
        total_returns,
        count_sales,
        total_products_sold,
        total_expenses,
        average_invoice,
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
