const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const path = require("path");
const {app} = require("electron");
const fs = require("fs");
async function getByDomain(event, domain) {
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM settings WHERE `domain` = ?",
      [domain]
    );
    return {
      success: true,
      message: "Setting fetched successfully",
      data: data || null,
    };
  } catch (error) {
    log.error("Settings fetch error:", error.message);
    throw error;
  }
}

async function getByKey(event, key) {
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM settings WHERE `key` = ? LIMIT 1",
      [key]
    );
    return {
      success: true,
      message: "Setting fetched successfully",
      data: data[0] || null,
    };
  } catch (error) {
    log.error("Settings fetch error:", error.message);
    throw error;
  }
}

async function getAll(event) {
  try {
    const db = getDatabase();
    const data = await db.all("SELECT * FROM settings");
    return {
      success: true,
      message: "Setting fetched successfully",
      data: data || null,
    };
  } catch (error) {
    log.error("Settings fetch error:", error.message);
    throw error;
  }
}
async function updateSettings(event, data) {
  console.log("update->", data);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data: Must be a non-empty array");
  }

  try {
    const db = getDatabase();

    const promises = data.map(({ key, value }) => {
      console.log(key, value);
      if (!key || value === undefined) return null;

      return db.run("UPDATE settings SET value = ? WHERE `key` = ?", [
        value,
        key,
      ]);
    });

     await Promise.all(promises.filter(Boolean));


    return {
      success: true,
      message: `update setting(s) updated successfully`,
    };
  } catch (error) {
    log.error("Settings update error:", error.message);
    throw error;
  }
}


async function backupDatabase(event) {
  try {
    const db = getDatabase();
    const data = await db.all(
      "SELECT * FROM settings WHERE `key` = 'backupPath' LIMIT 1"
    );
    const now = new Date().toISOString().slice(0, 10);
    const targetPath = data[0]?.value + `/casher_${now}.db`;

    const DB_PATH = path.join(app.getPath('userData'), 'casher.db');
    const dir = path.dirname(`${targetPath}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.copyFileSync(DB_PATH, targetPath);

    return { success: true, path: targetPath };
  } catch (err) {
    console.error('Backup failed', err);
    return { success: false, error: err.message };
  }
}


module.exports = { getByDomain, getAll, updateSettings, getByKey, backupDatabase };
