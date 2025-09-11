const { ipcMain } = require("electron");
const { getDatabase } = require("../../database/connection");
const log = require("electron-log");

const getAll = async (event, args) => {
  try {
    const db = getDatabase();
    const units = await db.all("SELECT * FROM units WHERE deleted_at IS NULL");
    return { success: true,  units };
  } catch (error) {
    log.error("Failed to get all units:", error);
    return { success: false, error: error.message };
  }
};

const create = async (event, unit) => {
  try {
    const db = getDatabase();
    console.log(unit);
    if(unit.is_default && unit.is_default==="1"){    
    const found = await db.get("SELECT * FROM units WHERE is_default = 1 LIMIT 1");
    if(found){
      throw new Error("لا يمكن إضافة وحدة جديدة كافتراضية");
    }
  }
    const result = await db.run(
      "INSERT INTO units (name) VALUES (?)",
      unit.name
    );
    return { success: true, data: { id: result.lastID, ...unit } };
  } catch (error) {
    log.error("Failed to create unit:", error);
    return { success: false, error: error.message };
  }
};

const update = async (event, unit) => {
  try {
    const db = getDatabase();
    const result = await db.run(
      "UPDATE units SET name = ? WHERE id = ?",
      unit.name,
      unit.id
    );
    if (result.changes > 0) {
      return { success: true, data: unit };
    } else {
      return { success: false, error: "Unit not found or no changes made" };
    }
  } catch (error) {
    log.error("Failed to update unit:", error);
    return { success: false, error: error.message };
  }
};

const deleteUnit = async (event, id) => {
  try {
    const db = getDatabase();

    const unit = await db.get("SELECT * FROM units WHERE id = ? LIMIT 1", id);
    console.log(unit);
   if(unit.is_default && unit.is_default==="1"){
    throw new Error("لا يمكن حذف الوحدة الافتراضية");
   }
    await db.run(
      "UPDATE units SET name = ?, deleted_at = ? WHERE id = ?",
      `deleted_unit_${id}`,
      new Date(),
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


