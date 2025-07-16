import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import * as path from "path";
import * as fs from "fs";
import Store from "electron-store";

async function createDaily(event) {
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
    await db.execute("INSERT INTO daily (user_id) VALUES (?)", [userId]);
    return {
      success: true,
      message: "Daily created successfully",
    };
  } catch (error) {
    log.error("Daily creation error:", error.message);
    throw error;
  }
}

async function close(event) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const [data] = await db.execute(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );

    await db.execute("UPDATE daily SET closed_at = ?,  WHERE id = ?", [
      new Date(),
      data[0].id,
    ]);
    return {
      success: true,
      message: "Daily closed successfully",
    };
  } catch (error) {
    log.error("Daily creation error:", error.message);
    throw error;
  }
}
async function get(event) {
  try {
    const db = getDatabase();

    const [data] = await db.execute(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    return {
      success: true,
      data,
    };
  } catch (error) {
    log.error("categories error:", error.message);
    throw error;
  }
}

export {
  createCategory,
  getAll,
  findById,
  getByName,
  search,
  update,
  deleteCategory,
};
