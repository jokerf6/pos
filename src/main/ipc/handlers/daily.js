import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import Store from "electron-store";

async function openDaily(event) {
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

async function closeDaily(event) {
  const store = new Store();
  const userId = store.get("user.id");
  try {
    const db = getDatabase();
    const [data] = await db.execute(
      "SELECT * FROM daily where closed_at IS NULL Limit 1"
    );
    if (data.length === 0) {
      return {
        success: false,
        message: "لا يوجد يوم مفتوح لإغلاقه",
      };
    }
    const closedAt = formatDateForMySQL(); // e.g. "2025-07-17 10:15:05"

    await db.execute("UPDATE daily SET closed_at = ? WHERE id = ?", [
      closedAt,
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
async function getDaily(event) {
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
    log.error("daily error:", error.message);
    throw error;
  }
}

function formatDateForMySQL(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
export { openDaily, closeDaily, getDaily };
