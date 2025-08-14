const bcrypt = require("bcryptjs");
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");

/**
 * Product handler
 */
async function createProduct(event, data) {
  const {
    name,
    description,
    quantity,
    price,
    buy_price,
    category_id,
    barcode,
    generated_code,
  } = data;


  // Validate input
  if (
    !name ||
    !quantity ||
    !price ||
    !buy_price ||
    !category_id ||
    (!barcode && !generated_code)
  ) {
    throw new Error(
      "برجاء إدخال اسم المنتج والكمية والسعر وسعر الشراءوالفئة والباركود"
    );
  }

  try {
    const db = getDatabase();
    if (generated_code) {
      const [rows] = await db.execute(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      );
      if (rows.length > 0) {
        throw new Error("الباركود موجود بالفعل");
      }

      await db.execute(
        "INSERT INTO items (name, barcode, description,quantity, price,buy_price,category_id) VALUES (?, ?, ?,?,?,?,?)",
        [
          name,
          generated_code,
          description,
          quantity,
          price,
          buy_price,
          category_id,
        ]
      );
      const [find] = await db.execute(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      ); 
      await db.execute("INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?,?)", [find[0].id, "purchase", quantity, price,  new Date()]);
    } else {
      const [rows] = await db.execute(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      if (rows.length === 0) {
        throw new Error("الباركود غير موجود");
      }

      await db.execute(
        `UPDATE items 
         SET name = ?, description = ?, quantity = ?, price = ?, buy_price = ?, category_id = ?
         WHERE barcode = ?`,
        [name, description, quantity, price, buy_price, category_id, barcode]
      );
      const [find] = await db.execute(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      ); 
      await db.execute("INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?,?)", [find[0].id, "purchase", quantity, price,  new Date()]);
    }
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    log.error("Product creation error:", error.message);
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
    const [products] = await db.execute(
      "SELECT * FROM items ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM items");
    return {
      success: true,
      products,
      total: rows[0].total,
    };
  } catch (error) {
    log.error("products error:", error.message);
    throw error;
  }
}

async function getByName(name) {
  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM items WHERE name LIKE ? OR barcode LIKE ?",
      [`%${name}%`, `%${name}%`]
    );

    return {
      success: true,
      users: rows,
    };
  } catch (error) {
    throw error;
  }
}

async function generateBarCode(event) {
  const db = getDatabase();

  const [lastProduct] = await db.execute(
    "SELECT * FROM items ORDER BY id DESC LIMIT 1"
  );
  if (lastProduct.length === 0) {
    return {
      success: true,
      barcode: "100",
    };
  } else {
    const lastBarcode = lastProduct[0].barcode;
    const newBarcode = parseInt(lastBarcode) + 1;
    return {
      success: true,
      barcode: newBarcode.toString(),
    };
  }
}
async function getBybarcode(event, data) {
  const  name  = data;

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM items WHERE barcode LIKE ? LIMIT 1",
      [`%${name}%`]
    );


    return {
      success: true,
      product: rows.length > 0 ? rows[0] : null,
    };
  } catch (error) {
    throw error;
  }
}

async function findById(event, { id }) {
  try {
    const db = getDatabase();
    // Find user in database
    const [rows] = await db.execute("SELECT * FROM items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return {
        success: false,
        message: "Product not found",
      };
    }
    return {
      success: true,
      user: rows[0],
    };
  } catch (error) {
    throw error;
  }
}

async function search(
  event,
  {
    name = "",
    page = 1,
    limit = 10,
    filters = {
      quantityFrom: "",
      quantityTo: "",
      priceFrom: "",
      priceTo: "",
      category: "",
    },
  } = {}
) {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    // بناء شروط البحث الديناميكية
    const whereClauses = [];
    const params = [];

    // البحث بالاسم أو الباركود
    if (name) {
      whereClauses.push("(name LIKE ? OR barcode LIKE ?)");
      params.push(`%${name}%`, `%${name}%`);
    }

    // فلترة بالكمية
    if (filters.quantityFrom) {
      whereClauses.push("quantity >= ?");
      params.push(Number(filters.quantityFrom));
    }
    if (filters.quantityTo) {
      whereClauses.push("quantity <= ?");
      params.push(Number(filters.quantityTo));
    }

    // فلترة بالسعر
    if (filters.priceFrom) {
      whereClauses.push("price >= ?");
      params.push(Number(filters.priceFrom));
    }
    if (filters.priceTo) {
      whereClauses.push("price <= ?");
      params.push(Number(filters.priceTo));
    }

    // فلترة بالتصنيف
    if (filters.category) {
      whereClauses.push("category_id = ?");
      params.push(filters.category);
    }

    console.log(whereClauses, params);

    // لو مفيش شروط، نحط 1=1
    const whereSQL = whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

    // جلب البيانات
    const [rows] = await db.execute(
      `SELECT * FROM items WHERE ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    console.log("search products:", rows, limit, offset);

    // حساب الإجمالي
    const [search] = await db.execute(
      `SELECT COUNT(*) as total FROM items WHERE ${whereSQL}`,
      params
    );

    return {
      success: true,
      products: rows,
      total: search[0].total,
    };
  } catch (error) {
    log.error("products error:", error.message);
    throw error;
  }
}

async function update(event, data) {
  const { name, description, quantity, price, buy_price,id } = data;

  // Validate input
  if (!name || !quantity || !price || !buy_price) {
    throw new Error("برجاء إدخال اسم المنتج والكمية والسعر وسعر الشراء");
  }
  console.log("Update product data:", quantity,id);
  try {
    const db = getDatabase();

    await db.execute(
      "UPDATE items SET name = ?, quantity = ?, price = ?, buy_price=? WHERE barcode = ?",
      [name, quantity, price, buy_price, id]
    );

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    log.error("User updated error:", error.message);
    throw error;
  }
}

async function deleteProduct(event, id) {
  // Validate input
  if (!id) {
    throw new Error("lمنتج غير موجود");
  }

  try {
    const db = getDatabase();
    const [rows] = await db.execute("SELECT * FROM items WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("منتج غير موجود");
    }
    await db.execute("DELETE FROM items WHERE id LIKE ?", [`%${id}%`]);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    log.error("Product deleted error:", error.message);
    throw error;
  }
}
module.exports = {
  createProduct,
  getAll,
  findById,
  getByName,
  search,
  update,
  deleteProduct,
  generateBarCode,
  getBybarcode,
};
