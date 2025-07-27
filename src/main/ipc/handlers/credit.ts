import log from "electron-log";
import { getDatabase } from "../../database/connection.js";

/**
 * Product handler
 */
async function createCredit(event, data) {
  const { receiver, reason, price } = data;

  // Validate input
  if (!reason || !price) {
    throw new Error("برجاء إدخال سبب القرض والمبلغ");
  }
  let x = receiver;
  if (!x || x === null) {
    x = "";
  }
  console.log(x, reason, price);

  try {
    const db = getDatabase();
    const [rows] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );
    console.log(rows);
    if (rows.length === 0) {
      throw new Error("برجاء فتح يومية جديدة");
    }

    await db.execute(
      "INSERT INTO credit (reciever, reason, price,daily_id) VALUES (?, ?, ?,?)",
      [x, reason, price, rows[0].id]
    );
    return {
      success: true,
      message: "Credit created successfully",
    };
  } catch (error) {
    log.error("Credit creation error:", error.message);
    throw error;
  }
}

async function getAllCredit(
  event,
  { page = 1, limit = 10 } = { page: 1, limit: 10 }
) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // Find credit in database
    const [data] = await db.execute("SELECT * FROM credit LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM credit");
    return {
      success: true,
      data,
      total: rows[0].total,
    };
  } catch (error) {
    log.error("credit error:", error.message);
    throw error;
  }
}

async function getCreditByDaily() {
  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );
    if (rows.length === 0) {
      return {
        success: true,
        users: [],
      };
    }
    console.log("helllo");

    const [data] = await db.execute("SELECT * FROM credit WHERE daily_id = ?", [
      rows[0].id,
    ]);
    console.log(data);

    return {
      success: true,
      users: data,
    };
  } catch (error) {
    throw error;
  }
}

async function deleteCredit(event, id) {
  // Validate input
  if (!id) {
    throw new Error("يوميه غير موجود");
  }

  try {
    const db = getDatabase();
    const [rows] = await db.execute("SELECT * FROM credit WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("منتج غير موجود");
    }
    await db.execute("DELETE FROM credit WHERE id LIKE ?", [`%${id}%`]);

    return {
      success: true,
      message: "Credit deleted successfully",
    };
  } catch (error) {
    log.error("Credit deleted error:", error.message);
    throw error;
  }
}
export { createCredit, getAllCredit, deleteCredit, getCreditByDaily };
