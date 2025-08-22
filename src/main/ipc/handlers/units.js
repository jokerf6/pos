const { ipcMain } = require("electron");
const { getDatabase } = require("../../database/connection");
const log = require("electron-log");

const getAll = async (event, args) => {
  try {
    const db = getDatabase();
    const units = await db.all("SELECT * FROM units");
    return { success: true, data: units };
  } catch (error) {
    log.error("Failed to get all units:", error);
    return { success: false, error: error.message };
  }
};

const create = async (event, unit) => {
  try {
    const db = getDatabase();
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
    const result = await db.run("DELETE FROM units WHERE id = ?", id);
    if (result.changes > 0) {
      return { success: true, data: { id } };
    } else {
      return { success: false, error: "Unit not found" };
    }
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


