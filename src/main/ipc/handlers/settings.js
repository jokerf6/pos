const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");

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
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data: Must be a non-empty array");
  }

  try {
    const db = getDatabase();

    const promises = data.map(({ key, value }) => {
      if (!key || value === undefined) return null;

      return db.run("UPDATE settings SET value = ? WHERE `key` = ?", [
        value,
        key,
      ]);
    });

    const results = await Promise.all(promises.filter(Boolean));

    const updatedCount = results.reduce((acc, [result]) => {
      return acc + (result.affectedRows > 0 ? 1 : 0);
    }, 0);

    return {
      success: true,
      message: `${updatedCount} setting(s) updated successfully`,
    };
  } catch (error) {
    log.error("Settings update error:", error.message);
    throw error;
  }
}

module.exports = { getByDomain, getAll, updateSettings, getByKey };
