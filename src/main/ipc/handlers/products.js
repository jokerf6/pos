const bcrypt = require("bcryptjs");
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

const fs = require("fs");

const { BrowserWindow } = require("electron");
/**
 * Product handler
 */
async function createProduct(event, data) {
  const {
    name,
    description,
    price,
    buy_price,
    quantity,
    category_id,
    barcode,
    unitId,
    generated_code,
  } = data;
   console.log("Create product data:", data);

  // Validate input
  if (
    !name ||
    !price ||
    !buy_price ||
    !category_id ||
    !unitId ||
    !quantity ||
    (!barcode && !generated_code)
  ) {
    throw new Error(
      "برجاء إدخال اسم المنتج والكمية والسعر و الوحدات وسعر الشراءوالفئة والباركود"
    );
  }
  try {
    const db = getDatabase();
    if (generated_code) {
      const rows = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      );
      if (rows.length > 0) {
        throw new Error("الباركود موجود بالفعل");
      }

      await db.run(
        "INSERT INTO items (name, barcode, description, quantity, price,buy_price,category_id, unitId) VALUES (?, ?, ?,?,?,?,?,?)",
        [
          name,
          generated_code,
          description,
          quantity,
          price,
          buy_price,
          category_id,
          unitId,
        ]
      );
      const find = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      );
      await db.run("INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?,?)", [find[0].id, "purchase", quantity, price,  new Date()]);
    } 
    else {
      const rows = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      if (rows.length === 0) {
        throw new Error("الباركود غير موجود");
      }

      await db.run(
        `UPDATE items 
         SET name = ?, description = ?, quantity = ?, price = ?, buy_price = ?, category_id = ?, unitId = ?
         WHERE barcode = ?`,
        [name, description, quantity, price, buy_price, category_id, unitId, barcode]
      );
      const find = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      await db.run("INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?, ?)", [find[0].id, "purchase", quantity, price,  new Date()]);
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
    let products =  await db.all(
      `SELECT 
  i.id,
  i.name,
  i.barcode,
  i.price,
  i.unitId,
  i.buy_price,
  i.category_id,
  i.quantity,
  i.created_at,
  u.name AS unitName,
  i.description
FROM items i
LEFT JOIN units u 
  ON i.unitId = u.id
WHERE i.deleted_at IS NULL
GROUP BY i.id
ORDER BY i.id DESC
LIMIT ? OFFSET ?;`,
      [ limit, offset]
    );
    const rows = await db.all("SELECT COUNT(*) as total FROM items");
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
let rows;

  // لو مفيش فرع -> نجمع من كل الفروع
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.buy_price,
      i.category_id,
      u.name AS unitName,
      i.unitId,
      i.quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN units u
      ON i.unitId = u.id
    WHERE (i.name LIKE ? OR i.barcode LIKE ?) AND i.deleted_at IS NULL
    GROUP BY i.id
    ORDER BY i.id DESC
    LIMIT ? OFFSET ?
    `,
    [`%${name}%`, `%${name}%`, limit, offset]
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

  const lastProduct = await db.all(
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
   let rows;

  // لو مفيش فرع -> نجمع من كل الفروع
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.unitId,
      i.buy_price,
      i.category_id,
      i.quantity,
      i.created_at,
      i.description,
      u.name AS unitName
    FROM items i
    LEFT JOIN units u
      ON i.unitId = u.id
    WHERE i.barcode LIKE ? AND i.deleted_at IS NULL
    GROUP BY i.id
    ORDER BY i.id DESC
    LIMIT 1
    `,
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
let rows;

  // لو مفيش فرع -> نجمع من كل الفروع
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.unitId,
      i.buy_price,
      i.category_id,
      i.quantity,
      i.created_at,
      i.description,
      u.name AS unitName
    FROM items i
    LEFT JOIN units u
      ON i.unitId = u.id
    WHERE i.id = ? AND i.deleted_at IS NULL
    GROUP BY i.id
    LIMIT 1
    `,
    [id]
  );
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

    const whereClauses = [];
    const params = [];

    // البحث بالاسم أو الباركود
    whereClauses.push("i.deleted_at IS NULL");
    if (name) {
      whereClauses.push("(i.name LIKE ? OR i.barcode LIKE ?)");
      params.push(`%${name}%`, `%${name}%`);
    }

    // فلترة بالسعر
    if (filters.priceFrom) {
      whereClauses.push("i.price >= ?");
      params.push(Number(filters.priceFrom));
    }
    if (filters.priceTo) {
      whereClauses.push("i.price <= ?");
      params.push(Number(filters.priceTo));
    }

    // فلترة بالتصنيف
    if (filters.category) {
      whereClauses.push("i.category_id = ?");
      params.push(filters.category);
    }

    // SQL الأساسي
    let baseSQL;
 
      // لو مفيش فرع: اجمع الكميات من كل الفروع
      baseSQL = `
        SELECT 
          i.id,
          i.name,
          i.barcode,
          i.price,
          i.unitId,
          i.buy_price,
          i.category_id,
          i.quantity,
          i.created_at,
          i.description,
          u.name AS unitName
        FROM items i
        LEFT JOIN units u
          ON i.unitId = u.id
      `;
    

    // بناء WHERE
    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // GROUP BY لما مفيش فرع
    const groupBy = "GROUP BY i.id";

    // فلترة بالكمية (بعد ما حسبناها)
    if (filters.quantityFrom) {
      whereClauses.push("quantity >= ?");
      params.push(Number(filters.quantityFrom));
    }
    if (filters.quantityTo) {
      whereClauses.push("quantity <= ?");
      params.push(Number(filters.quantityTo));
    }

    const sql = `
      ${baseSQL}
      ${whereSQL}
      ${groupBy}
      ORDER BY i.id DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(sql, [...params, limit, offset]);
    // حساب الإجمالي (count)
    const countSQL = `
      SELECT COUNT(*) as total FROM (
        ${baseSQL}
        ${whereSQL}
        ${groupBy}
      ) as subquery
    `;
    const search = await db.all(countSQL, params);

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
  if (!name  || !price || !buy_price) {
    throw new Error("برجاء إدخال اسم المنتج والكمية والسعر وسعر الشراء");
  }
  console.log("Update product data:", quantity,id);
  try {
    const db = getDatabase();
     const find = await db.all("SELECT * FROM items WHERE barcode = ?", [id]);
    await db.run(
      "UPDATE items SET name = ?, quantity = ?, price = ?, buy_price=? WHERE barcode = ?",
      [name, quantity, price, buy_price, id]
    );
  if(quantity){
       await db.run("INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?, ?)", [find[0].id, "purchase", quantity, price,  new Date()]);
  }
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
    const rows = await db.all("SELECT * FROM items WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("منتج غير موجود");
    }


    await db.run(
      "UPDATE items SET name = ?, deleted_at = ? WHERE id = ?",
      [`${rows[0].name}_deleted_${rows[0].id}`, new Date(), id]
    );
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    log.error("Product deleted error:", error.message);
    throw error;
  }
}


async function printBarcode(event, data) {
  const {name,price,generated_code,barcode,copies} = data;
 const win = new BrowserWindow({
    width: 300,
    height: 200,
    autoHideMenuBar: true,
    show:false
  });
    const db = getDatabase();
const printer = await db.all(
      "SELECT * FROM settings WHERE `key` = ? LIMIT 1",
      ["productPrinter"]
    );
  const company = await db.all(
      "SELECT * FROM settings WHERE `key` = ? LIMIT 1",
      ["companyName"]
    );

  const product = {
    name2: company[0]?.value || "",
    name,
    price:`${parseInt(price).toFixed(2)} L.E`,
    barcode: generated_code || barcode
  };
   
  win.loadFile("label.html", { query: product });

  win.webContents.on("did-finish-load", () => {
    const printerName = printer[0]?.value || ""; 
    
    win.webContents.print(
      {
        silent: true,             
        printBackground: true,
        deviceName: printerName, 
       copies: copies            
      },
      (success, failureReason) => {
        if (!success) {
          console.error("فشل الطباعة:", failureReason);
        } 
      }
    );
  });
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
  printBarcode
};
