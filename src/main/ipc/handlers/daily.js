import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import Store from "electron-store";

async function openDaily(event, openPrice = 0) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const [data] = await db.execute(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    if (data.length > 0) {
      return {
        success: false,
        message: "هناك يوم مفتوح بالفعل",
      };
    }
    await db.execute("INSERT INTO daily (userId, openPrice) VALUES (?, ?)", [
      userId,
      openPrice,
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
    const [data] = await db.execute(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    if (data.length === 0) {
      return {
        success: false,
        message: "لا يوجد يوم مفتوح لإغلاقه",
      };
    }
    const closedAt = formatDateForMySQL(); // e.g. "2025-07-17 10:15:05"

    await db.execute(
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

    const [dailyRows] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );

    if (dailyRows.length === 0) {
      return { success: false, message: "لا توجد يومية مفتوحة" };
    }

 

    const daily = dailyRows[0];
    const dailyId = daily.id;

    const [[{ total_sales }]] = await db.execute(
      "SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_sales FROM invoices WHERE dailyId = ? AND paymentType = 'خالص'",
      [dailyId]
    );

    const [[{ total_returns }]] = await db.execute(
      "SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_returns FROM invoices WHERE dailyId = ? AND paymentType = 'مرتجع'",
      [dailyId]
    );

    const [[{ count_sales }]] = await db.execute(
      "SELECT COUNT(*) AS count_sales FROM invoices WHERE dailyId = ? AND paymentType = 'خالص'",
      [dailyId]
    );

    const [[{ total_products_sold }]] = await db.execute(
      `SELECT COALESCE(SUM(ii.quantity), 0) AS total_products_sold
       FROM invoiceItems ii
       JOIN invoices i ON ii.invoiceId = i.id
       WHERE i.dailyId = ? AND i.paymentType = 'خالص'`,
      [dailyId]
    );

    const [[{ total_expenses }]] = await db.execute(
      "SELECT COALESCE(SUM(price), 0) AS total_expenses FROM credit WHERE daily_id = ?",
      [dailyId]
    );

    const average_invoice = count_sales > 0 ? total_sales / count_sales : 0;

    const [[yesterday]] = await db.execute(
      "SELECT id FROM daily WHERE closed_at IS NOT NULL ORDER BY closed_at DESC LIMIT 1"
    );

    let yesterdayStats = {
      total_sales: 0,
      count_sales: 0,
      total_products_sold: 0,
      average_invoice: 0,
    };

    if (yesterday) {
      const [[{ total_sales: y_sales }]] = await db.execute(
        "SELECT COALESCE(SUM(totalAfterDiscount), 0) AS total_sales FROM invoices WHERE dailyId = ? AND paymentType = 'خالص'",
        [yesterday.id]
      );

      const [[{ count_sales: y_count }]] = await db.execute(
        "SELECT COUNT(*) AS count_sales FROM invoices WHERE dailyId = ? AND paymentType = 'خالص'",
        [yesterday.id]
      );

      const [[{ total_products_sold: y_products }]] = await db.execute(
        `SELECT COALESCE(SUM(ii.quantity), 0) AS total_products_sold
         FROM invoiceItems ii
         JOIN invoices i ON ii.invoiceId = i.id
         WHERE i.dailyId = ? AND i.paymentType = 'خالص'`,
        [yesterday.id]
      );

      yesterdayStats = {
        total_sales: +y_sales,
        count_sales: +y_count,
        total_products_sold: +y_products,
        average_invoice: +y_count > 0 ? +y_sales / +y_count : 0,
      };
    }

    function calcChange(current, previous) {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    }

    let cashInDrawer = +total_sales - (+total_returns + +total_expenses);
    cashInDrawer += +daily.openPrice || 0;

    const result = {
      ...daily,
      cashInDrawer: +cashInDrawer.toFixed(2),
      total_sales: +parseFloat(+total_sales).toFixed(2),
      total_returns: +parseFloat(+total_returns).toFixed(2),
      total_expenses: +parseFloat(+total_expenses).toFixed(2),
      count_sales,
      total_products_sold,
      average_invoice: +parseFloat(+average_invoice).toFixed(2),

      average_invoice_change: calcChange(+average_invoice, +yesterdayStats.average_invoice),
      count_sales_change: calcChange(+count_sales, +yesterdayStats.count_sales),
      total_products_sold_change: calcChange(+total_products_sold, +yesterdayStats.total_products_sold),
      total_sales_change: calcChange(+total_sales, +yesterdayStats.total_sales),
    };

    console.log("Daily data:", result);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error("daily error:", error.message);
    throw error;
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
export { openDaily, closeDaily, getDaily };
