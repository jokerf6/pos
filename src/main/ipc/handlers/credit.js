const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");

/**
 * Product handler
 */
async function createCredit(event, data) {
  const { receiver, reason, price } = data;

  // Validate input
  if (!reason || !price) {
    throw new Error("برجاء إدخال سبب القرض والمبلغ");
  }
  const store = new Store();
  const branchId = store.get("branch.id");
  if(!branchId){
    throw new Error("برجاء إختيار فرع");
  }
  let x = receiver;
  if (!x || x === null) {
    x = "";
  }
  
  try {
    const db = getDatabase();
    const rows = await db.all(
      "SELECT * FROM daily WHERE closed_at IS NULL AND branchId = ? AND deleted_at IS NULL LIMIT 1",
      [branchId]
    );
    console.log(rows);
    if (rows.length === 0) {
      throw new Error("برجاء فتح يومية جديدة");
    }

    await db.run(
      "INSERT INTO credit (reciever, reason, price,daily_id, branchId) VALUES (?, ?, ?, ?, ?)",
      [x, reason, price, rows[0].id, branchId]
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
 event, args = {}
) {
try {
  const db = getDatabase();
    const name = typeof args?.name === "string" && args.name.trim() ? args.name.trim() : null;
    const page = Number.isInteger(args?.page) && args.page > 0 ? args.page : 1;
    const limit = Number.isInteger(args?.limit) && args.limit > 0 ? args.limit : 10;
    const offset = (page - 1) * limit;

    // build WHERE and parameters for filtering (without pagination)
    let whereString = "";
    const whereParams = [];
    const store = new Store();
    const branchId = store.get("branch.id");
    if(branchId){
    whereString += "WHERE branchId = ?";
      whereParams.push(branchId);

    }
    
    if (name) {
      // search in reason (text) and price (cast to char so LIKE works on numbers)
      whereString = `WHERE reason LIKE ? OR CAST(price AS CHAR) LIKE ?`;
      whereParams.push(`%${name}%`, `%${name}%`);
    }

    // params for SELECT (where params + limit + offset)
    const selectParams = [...whereParams, limit, offset];
    if(whereString === ""){
      whereString = "WHERE deleted_at IS NULL";
    }
    else {
      whereString += " AND deleted_at IS NULL";
    }
    // run select (with pagination)
    const dataRows = await db.all(
      `SELECT * FROM credit ${whereString} ORDER BY id DESC LIMIT ? OFFSET ?`,
      selectParams
    );

    // run count (only where params)
    const countRows = await db.all(
      `SELECT COUNT(*) as total FROM credit ${whereString}`,
      whereParams
    );
   
    const total = (Array.isArray(countRows) && countRows[0] && Number(countRows[0].total)) || 0;

    return { data:dataRows || [], total };
  } catch (err) {
    console.error("Error in credit:getAll handler:", err);
    // return a shape the frontend expects (or throw/ reject depending on your IPC conventions)
    return { data: [], total: 0, error: err?.message || "unknown error" };
  }
}

async function getCreditByDaily(
  event,
  { name, page = 1, limit = 10 } = { page: 1, limit: 10 }
) {
  try {
    const db = getDatabase();

        const store = new Store();
    const branchId = store.get("branch.id");

    
    const rows = await db.all(
      "SELECT * FROM daily WHERE closed_at IS NULL AND branchId = ? AND deleted_at IS NULL LIMIT 1",
      [branchId]
    );
    if (rows.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
      };
    }

    const offset = (page - 1) * limit;

    // تجهيز شروط البحث
    let whereClause = "WHERE daily_id = ?";
    let params = [rows[0].id];

    if (branchId) {
      whereClause += " AND branchId = ?";
      params.push(branchId);
    }

    if (name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    whereClause += " AND deleted_at IS NULL";

    // جلب البيانات مع الباجي ناشن
    const data = await db.all(
      `SELECT * FROM credit ${whereClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // جلب العدد الكلي
    const countRows = await db.all(
      `SELECT COUNT(*) as total FROM credit ${whereClause}`,
      params
    );

    return {
      success: true,
      data,
      total: countRows[0].total,
      page,
      limit,
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
    const rows = await db.all("SELECT * FROM credit WHERE id LIKE ? AND deleted_at IS NULL", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("منتج غير موجود");
    }

      await db.run("UPDATE credit SET  deleted_at = ? WHERE id = ?", [
      new Date(),
      id,
    ]);


    return {
      success: true,
      message: "Credit deleted successfully",
    };
  } catch (error) {
    log.error("Credit deleted error:", error.message);
    throw error;
  }
}
module.exports = { createCredit, getAllCredit, deleteCredit, getCreditByDaily };
