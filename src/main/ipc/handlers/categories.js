const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const path = require("path");
const fs = require("fs");
async function createCategory(event, data) {
  const { name } = data;
if (!name) {
  throw new Error("برجاء إدخال اسم القسم");
}
  try {
    const db = getDatabase();

    const rows = await db.all(
      "SELECT * FROM categories WHERE name LIKE ? AND deleted_at IS NULL",
      [`%${name}%`]
    );
    if (rows.length > 0) {
      throw new Error("اسم القسم موجود بالفعل");
    }
    await db.run("INSERT INTO categories (name) VALUES (?)", [
      name,
    ]);

    return {
      success: true,
      message: "Category created successfully",
    };
  } catch (error) {
    log.error("Category creation error:", error.message);
    throw error;
  }
}

async function getAll(event) {
  try {
    const db = getDatabase();

    // Find user in database
    const data = await db.all("SELECT * FROM categories WHERE deleted_at IS NULL");
    return {
      success: true,
      data,
    };
  } catch (error) {
    log.error("categories error:", error.message);
    throw error;
  }
}

async function getByName(name) {
  try {
    const db = getDatabase();

    const rows = await db.all(
      "SELECT * FROM categories WHERE username LIKE ? AND deleted_at IS NULL",
      [`%${name}%`]
    );

    return {
      success: true,
      users: rows,
    };
  } catch (error) {
    log.error("categories error:", error.message);
    throw error;
  }
}

async function findById(event, id) {
  console.log("findById id:", id);
  try {
    const db = getDatabase();
    // Find user in database
    const rows = await db.all("SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL", [
      id,
    ]);
    if (rows.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      user: rows[0],
    };
  } catch (error) {
    log.error("categories error:", error.message);
    throw error;
  }
}

async function search(event, name) {
  try {
    const db = getDatabase();

    // Find user in database
    const rows = await db.all(
      "SELECT * FROM categories WHERE name LIKE ? AND deleted_at IS NULL",
      [`%${name}%`]
    );

    return {
      success: true,
      categories: rows,
    };
  } catch (error) {
    log.error("users error:", error.message);
    throw error;
  }
}

async function update(event, user) {
  const { id, name } = user;

  if (!name) {
    throw new Error("برجاء إدخال اسم  القسم");
  }

  try {
    const db = getDatabase();

    const rows = await db.all(
      "SELECT * FROM categories WHERE username LIKE ? AND deleted_at IS NULL",
      [`%${name}%`]
    );
    if (rows.length > 0 && rows[0].id !== id) {
      throw new Error("اسم القسم موجود بالفعل");
    }

    await db.run("UPDATE categories SET name = ?,  WHERE id = ?", [
      name,
      id,
    ]);

    return {
      success: true,
      message: "categories updated successfully",
    };
  } catch (error) {
    log.error("categories updated error:", error.message);
    throw error;
  }
}

async function deleteCategory(event, id) {
  // Validate input
  if (!id) {
    throw new Error("قسم غير موجود");
  }

  try {
    const db = getDatabase();
    const rows = await db.all(
      "SELECT * FROM categories WHERE id LIKE ? AND deleted_at IS NULL",
      [`%${id}%`]
    );
    if (rows.length === 0) {
      throw new Error("قسم غير موجود");
    }

    await db.run("UPDATE categories SET name = ?, deleted_at = ? WHERE id = ?", [
      `deleted_${rows[0].name}_${id}`,
      new Date(),
      id,
    ]);

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    log.error("Category deleted error:", error.message);
    throw error;
  }
}
module.exports = {
  createCategory,
  getAll,
  findById,
  getByName,
  search,
  update,
  deleteCategory,
};
