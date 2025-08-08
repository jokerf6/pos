import bcrypt from "bcryptjs";
import log from "electron-log";
import { getDatabase } from "../../database/connection.js";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Product handler
 */
async function createInvoice(event, data) {
  const {
    customerName,
    customerPhone,
    paymentType,
    invoiceDiscount,
    total,
    netTotal,
    products,
  } = data;
  //   const newProduct = {
  //         id: product.id,
  //         name: product.name,
  //         quantity: 1,
  //         price: product.price,
  //         discount: 0,
  //       };

  // Validate input
  console.log("createInvoice data", data);
  if (!paymentType || products.length === 0) {
    throw new Error("الرجاء ملء جميع الحقول المطلوبة");
  }

  try {
    const db = getDatabase();

    const [rows] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );
    console.log(rows);
    if (rows.length === 0) {
      throw new Error("برجاء فتح يومية جديدة");
    }

    const [invoice] = await db.execute(
      "INSERT INTO invoices (customerName, customerPhone, paymentType,discount,total,totalAfterDiscount,dailyId) VALUES (?,?, ?, ?,?,?,?)",
      [
        customerName,
        customerPhone,
        paymentType,
        invoiceDiscount,
        total,
        netTotal,
        rows[0].id,
      ]
    );
    for (let i = 0; i < products.length; i += 1) {
      if (paymentType !== "مرتجع")
        await db.execute(
          "UPDATE items set quantity = quantity - ? WHERE id = ?",
          [products[i].quantity, products[i].id]
        );
      else {
        await db.execute(
          "UPDATE items set quantity = quantity + ? WHERE id = ?",
          [products[i].quantity, products[i].id]
        );
      }
      await db.execute(
        "INSERT INTO invoiceItems (invoiceId,itemId,pricePerUnit,quantity,discount,price, totalPriceAfterDiscount) VALUES (?, ?, ?,?,?,?,?)",
        [
          invoice.insertId,
          products[i].id,
          products[i].price,
          products[i].quantity,
          products[i].discount,
          products[i].price * products[i].quantity,
          Math.max(
            products[i].price * products[i].quantity - products[i].discount,
            0
          ),
        ]
      );
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

async function beforeInvoice(event, data) {
  console.log("beforeInvoice filter", data);

  const { id, filter = {} } = data || {};
  try {
    const db = getDatabase();
    let all = false;
    if(data && data.all) {
     all = data.all;
    }
    const [daily] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );

    if (daily.length === 0) {
      throw new Error("برجاء فتح يومية جديدة");
    }

    let { from, to, invoiceType } = filter;

    // Convert from/to to full-day timestamps
    if (from) {
      from = startOfDay(new Date(from)).toISOString();
    }
    if (to) {
      to = endOfDay(new Date(to)).toISOString();
    }
    // Build WHERE conditions dynamically
    const whereClauses = !all? ["dailyId = ?"]:[];
    const values = !all? [daily[0].id]:[];

    if (id && id !== null) {
      whereClauses.push("id < ?");
      values.push(id);
    }

    if (from) {
      whereClauses.push("createdAt >= ?");
      values.push(from);
    }

    if (to) {
      whereClauses.push("createdAt <= ?");
      values.push(to);
    }

    if (invoiceType) {
      whereClauses.push("paymentType = ?");
      values.push(invoiceType);
    }

    const whereString = whereClauses.join(" AND ");
    console.log("whereString", whereString, values);

    const [rows] = await db.execute(
      `SELECT * FROM invoices ${whereString.length > 0 ? "WHERE" : ""} ${whereString} ORDER BY id DESC LIMIT 1`,
      values
    );

    const [firstRows] = await db.execute(
      `SELECT * FROM invoices ${whereString.length > 0 ? "WHERE" : ""} ${whereString} ORDER BY id ASC LIMIT 1`,
      values
    );

    if (rows.length === 0) {
      return {
        success: true,
        data: null,
        message: "لا توجد فواتير سابقة",
      };
    }

    const [items] = await db.execute(
      `SELECT 
        invoiceItems.*, 
        items.name AS name 
      FROM invoiceItems 
      JOIN items ON items.id = invoiceItems.itemId 
      WHERE invoiceItems.invoiceId = ?`,
      [rows[0].id]
    );

    const beforeInvoice = { ...rows[0], items, first:firstRows[0].id };

    return {
      success: true,
      data: beforeInvoice,
      message: "تم الاسترجاع بنجاح",
    };
  } catch (error) {
    log.error("beforeInvoice error:", error.message);
    throw error;
  }
}
async function afterInvoice(event, data) {
  const { id, filter = {} } = data;
  try {
    const db = getDatabase();

    const [daily] = await db.execute(
      "SELECT * FROM daily WHERE closed_at IS NULL LIMIT 1"
    );

    if (daily.length === 0) {
      throw new Error("برجاء فتح يومية جديدة");
    }

    let { from, to, invoiceType } = filter;

    // Convert from/to to full-day timestamps
    if (from) {
      from = startOfDay(new Date(from)).toISOString();
    }
    if (to) {
      to = endOfDay(new Date(to)).toISOString();
    }
    // Build WHERE clause
    const whereClauses = ["dailyId = ?"];
    const values = [daily[0].id];

    if (id) {
      whereClauses.push("id > ?");
      values.push(id);
    }

    if (from) {
      whereClauses.push("createdAt >= ?");
      values.push(from);
    }

    if (to) {
      whereClauses.push("createdAt <= ?");
      values.push(to);
    }

    if (invoiceType) {
      whereClauses.push("paymentType = ?");
      values.push(invoiceType);
    }

    const whereString = whereClauses.join(" AND ");

    const [rows] = await db.execute(
      `SELECT * FROM invoices WHERE ${whereString} ORDER BY id ASC LIMIT 1`,
      values
    );
        const [lastRows] = await db.execute(
      `SELECT * FROM invoices WHERE ${whereString} ORDER BY id DESC LIMIT 1`,
      values
    );


    if (rows.length === 0) {
      return {
        success: true,
        data: null,
        message: "لا توجد فواتير لاحقة",
      };
    }

    const [items] = await db.execute(
      `SELECT 
        invoiceItems.*, 
        items.name AS name 
      FROM invoiceItems 
      JOIN items ON items.id = invoiceItems.itemId 
      WHERE invoiceItems.invoiceId = ?`,
      [rows[0].id]
    );

    const afterInvoice = { ...rows[0], items, last:lastRows[0].id };

    return {
      success: true,
      data: afterInvoice,
      message: "تم الاسترجاع بنجاح",
    };
  } catch (error) {
    log.error("afterInvoice error:", error.message);
    throw error;
  }
}

async function getAllInvoices(event, data) {
  try {
    const { limit = 10, page = 0 } = data || {};
    const db = getDatabase();

    const whereClauses = [];
    const params = [];

    if (data.from && data.to) {
      whereClauses.push("DATE(i.created_at) BETWEEN ? AND ?");
      params.push(data.from, data.to);
    }

    if (data.type) {
      whereClauses.push("i.paymentType = ?");
      params.push(data.type);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [rows] = await db.execute(
      `
      SELECT 
        i.id AS invoice_id,
        i.customerName,
        i.paymentType,
        i.createdAt,
        COUNT(ii.id) AS total_items
      FROM invoices i
      LEFT JOIN invoiceItems ii ON i.id = ii.invoiceId
      ${whereSQL}
      GROUP BY i.id, i.customerName, i.paymentType, i.createdAt
      ORDER BY i.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, page]
    );

    const [totalResult] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM invoices i
      ${whereSQL}
      `,
      params
    );

    return {
      success: true,
      data: rows,
      total: totalResult[0].total,
      message: "Invoices retrieved successfully",
    };
  } catch (error) {
    log.error("getAllInvoices error:", error.message);
    throw error;
  }
}

async function updateInvoice(event, data) {
  const { invoiceId, paymentType } = data;
  console.log("updateInvoice data", data,invoiceId, paymentType);

  try {
    const db = getDatabase();

    // Update invoice header
    await db.execute(
      `UPDATE invoices SET 
    paymentType = ?
   WHERE id = ?`,
      [paymentType, invoiceId]
    );

    return {
      success: true,
      message: "Invoice updated successfully",
    };
  } catch (error) {
    log.error("Invoice update error:", error.message);
    throw error;
  }
}
export {
  createInvoice,
  afterInvoice,
  beforeInvoice,
  getAllInvoices,
  updateInvoice,
};
