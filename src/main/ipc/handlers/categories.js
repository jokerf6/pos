import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import * as path from "path";
import * as fs from "fs";
async function createCategory(event, data) {
  const { name, image } = data;
  let savedImagePath = null;

  if (image) {
    const dirname = path.dirname(import.meta.url);
    console.log("dirname", dirname);
    const uploadsPath = path
      .join(dirname, "../../", "public", "uploads", name)
      .split("file:")[1]; // or a custom static folder
    console.log("uploadsPath------>", uploadsPath);
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const filePath = path.join(uploadsPath, image.name);
    fs.writeFileSync(filePath, Buffer.from(image.buffer));

    savedImagePath = `${filePath}`; // You can use this path in frontend
  }
  // Validate input
  if (!name) {
    throw new Error("برجاء إدخال اسم القسم");
  }

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM categories WHERE name LIKE ?",
      [`%${name}%`]
    );
    if (rows.length > 0) {
      throw new Error("اسم القسم موجود بالفعل");
    }
    console.log("name", name);
    console.log("image", image);
    await db.execute("INSERT INTO categories (name, image) VALUES (?, ?)", [
      name,
      savedImagePath || null,
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
    const [data] = await db.execute("SELECT * FROM categories");
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

    const [rows] = await db.execute(
      "SELECT * FROM categories WHERE username LIKE ?",
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
    const [rows] = await db.execute("SELECT * FROM categories WHERE id = ?", [
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
    const [rows] = await db.execute(
      "SELECT * FROM categories WHERE name LIKE ?",
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
  const { id, name, image } = user;

  if (!name) {
    throw new Error("برجاء إدخال اسم  القسم");
  }

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM categories WHERE username LIKE ?",
      [`%${name}%`]
    );
    if (rows.length > 0 && rows[0].id !== id) {
      throw new Error("اسم القسم موجود بالفعل");
    }

    await db.execute("UPDATE categories SET name = ?,  WHERE id = ?", [
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
    const [rows] = await db.execute(
      "SELECT * FROM categories WHERE id LIKE ?",
      [`%${id}%`]
    );
    if (rows.length === 0) {
      throw new Error("قسم غير موجود");
    }
    await db.execute("DELETE FROM categories WHERE id LIKE ?", [`%${id}%`]);

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    log.error("Category deleted error:", error.message);
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
