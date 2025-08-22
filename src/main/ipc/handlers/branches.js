const bcrypt = require("bcryptjs");
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

/**
 * Branch handler
 */
async function createBranch(event, data) {
  const {
    name,
    address
  } = data;


  if (
    !name ||
    !address
  ) {
    throw new Error(
      "برجاء إدخال اسم الفرع والعنوان"
    );
  }

  
  try {
    const db = getDatabase();
    const existingBranch = await db.get(
      "SELECT * FROM branches WHERE name = ?",
      [name]
    );
    if (existingBranch) {
      throw new Error("هذا الفرع موجود بالفعل");
    }
    await db.run(
      "INSERT INTO branches (name, address) VALUES (?, ?)",
      [
        name,
        address
        ]
      );
    return {
      success: true,
      message: "Branch created successfully",
    };
  } catch (error) {
    log.error("Branch creation error:", error.message);
    throw error;
  }
}

async function getAll(
  event,
  { page=1, limit = 10 } = { page: 1, limit: 10 }
) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // Find user in database
    const branches = await db.all(
      "SELECT * FROM branches ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const rows = await db.all("SELECT COUNT(*) as total FROM branches");
    return {
      success: true,
      branches,
      total: rows[0].total,
    };
  } catch (error) {
    log.error("branches error:", error.message);
    throw error;
  }
}

async function getAllWithoutPagination(
  event,
) {
  try {
    const db = getDatabase();

    // Find user in database
    const branches = await db.all(
      "SELECT * FROM branches ORDER BY id DESC"
    );
    return {
      success: true,
      branches,
    };
  } catch (error) {
    log.error("branches error:", error.message);
    throw error;
  }
}


async function search(
  event,
  {
    name = "",
    page = 1,
    limit = 10,
 
  } = {}
) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const params = [];

    if (name) {
      whereClauses.push("(name LIKE ?)");
      params.push(`%${name}%`);
    }

    const whereSQL = whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

    const rows = await db.all(
      `SELECT * FROM branches WHERE ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const search = await db.all(
      `SELECT COUNT(*) as total FROM branches WHERE ${whereSQL}`,
      params
    );

    return {
      success: true,
      branches: rows,
      total: search[0].total,
    };
  } catch (error) {
    log.error("branches error:", error.message);
    throw error;
  }
}

async function deleteBranch(event, id) {
  // Validate input
  if (!id) {
    throw new Error("الفرع غير موجود");
  }

  try {
    const db = getDatabase();
    const rows = await db.all("SELECT * FROM branches WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("الفرع غير موجود");
    }
    await db.run("DELETE FROM branches WHERE id LIKE ?", [`%${id}%`]);

    return {
      success: true,
      message: "Branch deleted successfully",
    };
  } catch (error) {
    log.error("Branch deleted error:", error.message);
    throw error;
  }
}


async function switchBranch(event, id) {
  // Validate input
  if (!id) {
    throw new Error("الفرع غير موجود");
  }

  try {
    const db = getDatabase();
    const rows = await db.all("SELECT * FROM branches WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("الفرع غير موجود");
    }
    const store = new Store();
    store.set("branch.id", rows[0].id);


    return {
      success: true,
      data: rows[0],
      message: "Branch switched successfully",
    };
  } catch (error) {
    log.error("Branch switch error:", error.message);
    throw error;
  }
}

module.exports = {
  createBranch,
  getAllWithoutPagination,
  getAll,
  search,
  deleteBranch,
  switchBranch,
};



