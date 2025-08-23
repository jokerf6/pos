const { ipcMain } = require("electron");
const { getDatabase } = require("../../database/connection");
const log = require("electron-log");

const getAll = async (event, args) => {
  try {
    const db = getDatabase();
    const units = await db.all("SELECT * FROM units WHERE deleted_at IS NULL ORDER BY is_default DESC, name ASC");
    return { success: true, units };
  } catch (error) {
    log.error("Failed to get all units:", error);
    return { success: false, error: error.message };
  }
};

const create = async (event, unit) => {
  try {
    const db = getDatabase();
    console.log("Creating unit:", unit);
    
    // Validate input
    if (!unit.name || unit.name.trim() === "") {
      throw new Error("اسم الوحدة مطلوب");
    }

    // Check if setting as default
    if (unit.is_default && (unit.is_default === "1" || unit.is_default === 1)) {
      // Check if there's already a default unit
      const existingDefault = await db.get("SELECT * FROM units WHERE is_default = 1 AND deleted_at IS NULL LIMIT 1");
      if (existingDefault) {
        // Remove default from existing unit
        await db.run("UPDATE units SET is_default = 0 WHERE id = ?", existingDefault.id);
      }
    }

    // Generate abbreviation if not provided
    const abbreviation = unit.abbreviation || unit.name.substring(0, 3);

    const result = await db.run(
      "INSERT INTO units (name, abbreviation, is_default) VALUES (?, ?, ?)",
      unit.name.trim(),
      abbreviation,
      unit.is_default === "1" || unit.is_default === 1 ? 1 : 0
    );

    const newUnit = {
      id: result.lastID,
      name: unit.name.trim(),
      abbreviation: abbreviation,
      is_default: unit.is_default === "1" || unit.is_default === 1 ? 1 : 0
    };

    return { success: true, data: newUnit };
  } catch (error) {
    log.error("Failed to create unit:", error);
    return { success: false, error: error.message };
  }
};

const update = async (event, unit) => {
  try {
    const db = getDatabase();
    
    // Validate input
    if (!unit.name || unit.name.trim() === "") {
      throw new Error("اسم الوحدة مطلوب");
    }

    // Check if setting as default
    if (unit.is_default && (unit.is_default === "1" || unit.is_default === 1)) {
      // Check if there's already a default unit (other than this one)
      const existingDefault = await db.get("SELECT * FROM units WHERE is_default = 1 AND id != ? AND deleted_at IS NULL LIMIT 1", unit.id);
      if (existingDefault) {
        // Remove default from existing unit
        await db.run("UPDATE units SET is_default = 0 WHERE id = ?", existingDefault.id);
      }
    }

    const abbreviation = unit.abbreviation || unit.name.substring(0, 3);

    const result = await db.run(
      "UPDATE units SET name = ?, abbreviation = ?, is_default = ? WHERE id = ? AND deleted_at IS NULL",
      unit.name.trim(),
      abbreviation,
      unit.is_default === "1" || unit.is_default === 1 ? 1 : 0,
      unit.id
    );

    if (result.changes > 0) {
      return { success: true, data: unit };
    } else {
      return { success: false, error: "الوحدة غير موجودة أو لم يتم إجراء أي تغييرات" };
    }
  } catch (error) {
    log.error("Failed to update unit:", error);
    return { success: false, error: error.message };
  }
};

const deleteUnit = async (event, id) => {
  try {
    const db = getDatabase();

    // Check if unit exists and get its details
    const unit = await db.get("SELECT * FROM units WHERE id = ? AND deleted_at IS NULL LIMIT 1", id);
    if (!unit) {
      throw new Error("الوحدة غير موجودة");
    }

    console.log("Deleting unit:", unit);

    // Check if it's the default unit
    if (unit.is_default && unit.is_default === 1) {
      throw new Error("لا يمكن حذف الوحدة الافتراضية");
    }

    // Check if unit is being used by any products
    const productsUsingUnit = await db.get("SELECT COUNT(*) as count FROM items WHERE unit_id = ?", id);
    if (productsUsingUnit.count > 0) {
      throw new Error(`لا يمكن حذف هذه الوحدة لأنها مستخدمة في ${productsUsingUnit.count} منتج`);
    }

    // Soft delete the unit
    await db.run(
      "UPDATE units SET deleted_at = ? WHERE id = ?",
      new Date().toISOString(),
      id
    );

    return { success: true, data: { id } };
  } catch (error) {
    log.error("Failed to delete unit:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getAll,
  create,
  update,
  delete: deleteUnit
};


