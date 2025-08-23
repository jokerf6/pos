const bcrypt = require("bcryptjs");
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const Store = require("electron-store");

/**
 * Product handler
 */
async function createProduct(event, data) {
  const {
    name,
    description,
    price,
    buy_price,
    category_id,
    unit_id,
    barcode,
    generated_code,
  } = data;

  // Validate input
  if (
    !name ||
    !price ||
    !buy_price ||
    !category_id ||
    (!barcode && !generated_code)
  ) {
    throw new Error(
      "برجاء إدخال اسم المنتج والكمية والسعر وسعر الشراءوالفئة والباركود"
    );
  }

  const quantity = 0;
  // Use default unit if not provided
  const productUnitId = unit_id || 1;

  try {
    const db = getDatabase();
    
    // Validate unit exists
    if (unit_id) {
      const unitExists = await db.get("SELECT id FROM units WHERE id = ? AND deleted_at IS NULL", [unit_id]);
      if (!unitExists) {
        throw new Error("الوحدة المحددة غير موجودة");
      }
    }

    if (generated_code) {
      const rows = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      );
      if (rows.length > 0) {
        throw new Error("الباركود موجود بالفعل");
      }

      await db.run(
        "INSERT INTO items (name, barcode, description, quantity, price, buy_price, category_id, unit_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          generated_code,
          description,
          quantity,
          price,
          buy_price,
          category_id,
          productUnitId,
        ]
      );
      const find = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [generated_code]
      );
      await db.run("INSERT INTO transactions (item_id, transaction_type, quantity, unit_price, transaction_date) VALUES (?, ?, ?, ?, ?)", [find[0].id, "purchase", quantity, price, new Date()]);
    } else {
      const rows = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      if (rows.length === 0) {
        throw new Error("الباركود غير موجود");
      }

      await db.run(
        `UPDATE items 
         SET name = ?, description = ?, quantity = ?, price = ?, buy_price = ?, category_id = ?, unit_id = ?
         WHERE barcode = ?`,
        [name, description, quantity, price, buy_price, category_id, productUnitId, barcode]
      );
      const find = await db.all(
        "SELECT * FROM items WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      await db.run("INSERT INTO transactions (item_id, transaction_type, quantity, unit_price, transaction_date) VALUES (?, ?, ?, ?, ?)", [find[0].id, "purchase", quantity, price, new Date()]);
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
     const store = new Store();
     const branchId = store.get("branch.id");
    // Find user in database
    let products = branchId ?  await db.all(
      `SELECT 
  i.id,
  i.name,
  i.barcode,
  i.price,
  i.buy_price,
  i.category_id,
  i.unit_id,
  u.name as unit_name,
  u.abbreviation as unit_abbreviation,
  COALESCE(bs.quantity, 0) AS quantity,
  i.created_at,
  i.description
FROM items i
LEFT JOIN BranchStock bs 
  ON i.id = bs.productId AND bs.branchId = ?
LEFT JOIN units u
  ON i.unit_id = u.id
ORDER BY i.id DESC
LIMIT ? OFFSET ?;`,
      [branchId, limit, offset]
    ) : await db.all(
      `SELECT 
  i.id,
  i.name,
  i.barcode,
  i.price,
  i.buy_price,
  i.category_id,
  i.unit_id,
  u.name as unit_name,
  u.abbreviation as unit_abbreviation,
  COALESCE(SUM(bs.quantity), 0) AS quantity,
  i.created_at,
  i.description
FROM items i
LEFT JOIN BranchStock bs 
  ON i.id = bs.productId
LEFT JOIN units u
  ON i.unit_id = u.id
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
     const store = new Store();
     const branchId = store.get("branch.id");
let rows;

if (branchId) {
  // لو في فرع محدد
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.buy_price,
      i.category_id,
      COALESCE(bs.quantity, 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId AND bs.branchId = ?
    WHERE i.name LIKE ? OR i.barcode LIKE ?
    ORDER BY i.id DESC
    LIMIT ? OFFSET ?
    `,
    [branchId, `%${name}%`, `%${name}%`, limit, offset]
  );
} else {
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
      COALESCE(SUM(bs.quantity), 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId
    WHERE i.name LIKE ? OR i.barcode LIKE ?
    GROUP BY i.id
    ORDER BY i.id DESC
    LIMIT ? OFFSET ?
    `,
    [`%${name}%`, `%${name}%`, limit, offset]
  );
}

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
     const store = new Store();
     const branchId = store.get("branch.id");
   let rows;

if (branchId) {
  // لو في فرع محدد
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.buy_price,
      i.category_id,
      COALESCE(bs.quantity, 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId AND bs.branchId = ?
    WHERE i.barcode LIKE ?
    ORDER BY i.id DESC
    LIMIT 1
    `,
    [branchId, `%${name}%`]
  );
} else {
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
      COALESCE(SUM(bs.quantity), 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId
    WHERE i.barcode LIKE ?
    GROUP BY i.id
    ORDER BY i.id DESC
    LIMIT 1
    `,
    [`%${name}%`]
  );
}


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
const store = new Store();
const branchId = store.get("branch.id");

if (branchId) {
  // لو في فرع محدد
  rows = await db.all(
    `
    SELECT 
      i.id,
      i.name,
      i.barcode,
      i.price,
      i.buy_price,
      i.category_id,
      COALESCE(bs.quantity, 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId AND bs.branchId = ?
    WHERE i.id = ?
    LIMIT 1
    `,
    [branchId, id]
  );
} else {
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
      COALESCE(SUM(bs.quantity), 0) AS quantity,
      i.created_at,
      i.description
    FROM items i
    LEFT JOIN BranchStock bs 
      ON i.id = bs.productId
    WHERE i.id = ?
    GROUP BY i.id
    LIMIT 1
    `,
    [id]
  );
}    if (rows.length === 0) {
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
    const store = new Store();
    const branchId = store.get("branch.id");
    const db = getDatabase();
    const offset = (page - 1) * limit;

    const whereClauses = [];
    const params = [];

    // البحث بالاسم أو الباركود
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
    if (branchId) {
      // لو في فرع محدد
      baseSQL = `
        SELECT 
          i.id,
          i.name,
          i.barcode,
          i.price,
          i.buy_price,
          i.category_id,
          COALESCE(bs.quantity, 0) AS quantity,
          i.created_at,
          i.description
        FROM items i
        LEFT JOIN BranchStock bs 
          ON i.id = bs.productId AND bs.branchId = ?
      `;
      params.unshift(branchId); // أول param هو branchId
    } else {
      // لو مفيش فرع: اجمع الكميات من كل الفروع
      baseSQL = `
        SELECT 
          i.id,
          i.name,
          i.barcode,
          i.price,
          i.buy_price,
          i.category_id,
          COALESCE(SUM(bs.quantity), 0) AS quantity,
          i.created_at,
          i.description
        FROM items i
        LEFT JOIN BranchStock bs 
          ON i.id = bs.productId
      `;
    }

    // بناء WHERE
    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // GROUP BY لما مفيش فرع
    const groupBy = branchId ? "" : "GROUP BY i.id";

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

    await db.run(
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


async function AddQuantityToBranch(event, data) {
  const { id, quantity } = data;
  const store = new Store();
  const branchId = store.get("branch.id"); 
  // Validate input
  if (!branchId) {
    throw new Error("برجاء اختيار الفرع");
  }
  if(!quantity){
    throw new Error("برجاء إدخال الكمية");
  }
  try {
    const db = getDatabase();
    const product = await db.get("SELECT * FROM items WHERE barcode = ?", [id]);
    const isFound = await db.get("SELECT * FROM BranchStock WHERE branchId = ? AND productId = ?", [branchId, product.id]);
    if (!isFound) {
      await db.run("INSERT INTO BranchStock (branchId, productId, quantity) VALUES (?, ?, ?)", [branchId, product.id, quantity]);
    }
    await db.run(
      "UPDATE BranchStock SET quantity = ? WHERE branchId = ? AND productId = ?",
      [quantity, branchId, product.id]
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
    const rows = await db.all("SELECT * FROM items WHERE id LIKE ?", [
      `%${id}%`,
    ]);
    if (rows.length === 0) {
      throw new Error("منتج غير موجود");
    }
    await db.run("DELETE FROM items WHERE id LIKE ?", [`%${id}%`]);

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
  AddQuantityToBranch
};
