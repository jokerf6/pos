require('dotenv').config(); // لازم يكون في أول سطر قبل أي استخدام لـ process.env
const log = require("electron-log");
const { getDatabase } = require("../../database/connection.js");
const { startOfDay, endOfDay } = require("date-fns");
const pkg = require("electron-pos-printer");
const escpos = require("escpos");
const escposUsb = require("escpos-usb");
const { PosPrinter } = pkg;
escpos.USB = escposUsb;

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
      if (paymentType !== "مرتجع") {
        await db.execute(
          "UPDATE items set quantity = quantity - ? WHERE id = ?",
          [products[i].quantity, products[i].id]
        );
        const [find] = await db.execute(
          "SELECT * FROM items WHERE id = ? LIMIT 1",
          [products[i].id]
        );
        await db.execute(
          "INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?,?)",
          [find[0].id, "sale", find[0].quantity, find[0].price, new Date()]
        );
      } else {
        await db.execute(
          "UPDATE items set quantity = quantity + ? WHERE id = ?",
          [products[i].quantity, products[i].id]
        );
        const [find] = await db.execute(
          "SELECT * FROM items WHERE id = ? LIMIT 1",
          [products[i].id]
        );
        await db.execute(
          "INSERT INTO transactions (item_id,transaction_type, quantity,unit_price, transaction_date) VALUES (?, ?, ?, ?,?)",
          [find[0].id, "return", find[0].quantity, find[0].price, new Date()]
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
    if (data && data.all) {
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
    const whereClauses = !all ? ["dailyId = ?"] : [];
    const values = !all ? [daily[0].id] : [];

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

    const beforeInvoice = { ...rows[0], items, first: firstRows[0].id };

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

    const afterInvoice = { ...rows[0], items, last: lastRows[0].id };

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
  console.log("updateInvoice data", data, invoiceId, paymentType);

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

async function PrintInvoice(event, data) {
  try {
    const options = {
      preview: false,
      margin: "0 0 0 0",
      copies: 1,
      printerName: "POSPrinter POS80",
      timeOutPerLine: 400,
      pageSize: "80mm", // page size,
      defaultStyle: {
        fontFamily: "Arial", // أو 'Tahoma', 'Cairo' لو الخط العربي مهم
      },
    };
    const {
      customerName,
      customerPhone,
      paymentType,
      invoiceDiscount,
      total,
      netTotal,
      products,
    } = data;
    const db = getDatabase();

    const data2 = [
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: process.env.COMPANY_NAME,
        style: { fontWeight: "700", textAlign: "center", fontSize: "24px" },
      },
      {
        type: "text",
        value: process.env.COMPANY_PHONE,
        style: {
          fontWeight: "700",
          textAlign: "center",
          fontSize: "24px",
          backgroundColor: "black", // الخلفية سوداء
          color: "white", // النص أبيض
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: "بيان أسعار",
        style: { fontSize: "18px", textAlign: "center" },
      },
    ];

    const [rows] = await db.execute(
      `SELECT d.*, u.username
   FROM daily d
   JOIN users u ON u.id = d.userId
   WHERE d.closed_at IS NULL
   LIMIT 1`
    );
    const username = rows[0].username;
    const [rows2] = await db.execute(
      `SELECT id 
   FROM invoices 
   ORDER BY id DESC 
   LIMIT 1`
    );
    const now = new Date();
    const date = formatDate(now);
    data2.push({
      type: "table",
      // style the table
      style: {},
      // list of the columns to be rendered in the table header
      tableHeader: [],
      // multi dimensional array depicting the rows and columns of the table body
      tableBody: [
        [
          {
            type: "text",
            value: `${date}`,
            style: { fontSize: "10px", textAlign: "left", fontWeight: "bold" },
          },
          {
            type: "text",
            value: "تاريخ",
            style: { fontSize: "10px", textAlign: "right", fontWeight: "bold" },
          },
        ],
        [
          {
            type: "text",
            value: `${rows2[0].id}`,
            style: { fontSize: "10px", textAlign: "left", fontWeight: "bold" },
          },
          {
            type: "text",
            value: "رقم",
            style: { fontSize: "10px", textAlign: "right", fontWeight: "bold" },
          },
        ],
        [
          {
            type: "text",
            value: `${username}`,
            style: { fontSize: "10px", textAlign: "left", fontWeight: "bold" },
          },
          {
            type: "text",
            value: "الكاشير",
            style: { fontSize: "10px", textAlign: "right", fontWeight: "bold" },
          },
        ],
      ],
      // list of columns to be rendered in the table footer
      tableFooter: [],
      // custom style for the table header
      tableHeaderStyle: {},
      // custom style for the table body
      tableBodyStyle: {},
      // custom style for the table footer
      tableFooterStyle: {},
    });
    const tableBody = await Promise.all(
      products.map(async (p) => {
        const [find] = await db.execute(
          "SELECT * FROM items WHERE id = ? LIMIT 1",
          [p.id]
        );

        const item = find[0]; // أول صف من جدول items

        return [
          {
            type: "text",
            value: String(p.quantity * item.price),
            style: {
              fontWeight: "bold",
              border: "1px solid black",
              textAlign: "center",
            },
          },
          {
            type: "text",
            value: String(item.price),
            style: {
              fontWeight: "bold",
              border: "1px solid black",
              textAlign: "center",
            },
          },
          {
            type: "text",
            value: String(p.quantity),
            style: {
              fontWeight: "bold",
              border: "1px solid black",
              textAlign: "center",
            },
          },
          {
            type: "text",
            value: item.name,
            style: {
              fontWeight: "bold",
              border: "1px solid black",
              textAlign: "center",
            },
          },
        ];
      })
    );
    data2.push({
      type: "table",
      // style the table
      style: { border: "1px solid black" },
      // list of the columns to be rendered in the table header
      tableHeader: [
        {
          type: "text",
          value: "الإجمالي",
          style: {
            fontWeight: "bold",
            border: "1px solid black",
            textAlign: "center",
          },
        },
        {
          type: "text",
          value: "السعر",
          style: {
            fontWeight: "bold",
            border: "1px solid black",
            textAlign: "center",
          },
        },
        {
          type: "text",
          value: "الكمية",
          style: {
            fontWeight: "bold",
            border: "1px solid black",
            textAlign: "center",
          },
        },
        {
          type: "text",
          value: "اسم المنتج",
          style: {
            fontWeight: "bold",
            border: "1px solid black",
            textAlign: "center",
          },
        },
      ],

      // multi dimensional array depicting the rows and columns of the table body
      tableBody,
      // list of columns to be rendered in the table footer
      tableFooter: [],
      // custom style for the table header
      tableHeaderStyle: {
        fontWeight: "bold",
        border: "1px solid black",
        textAlign: "center",
      },
      // custom style for the table body
      tableBodyStyle: {
        fontWeight: "bold", // يخلي الصفوف Bold
        border: "1px solid black", // يعمل خطوط بين الأعمدة والصفوف
        textAlign: "center",
      },
      // custom style for the table footer
      tableFooterStyle: {},
    });
    data2.push({
      type: "table",
      // style the table
      style: {},
      // list of the columns to be rendered in the table header
      tableHeader: [],

      // multi dimensional array depicting the rows and columns of the table body
      tableBody: [
        [
          {
            type: "text",
            value: "",
            style: { textAlign: "right", fontSize: "12px" },
          },
          {
            type: "text",
            value: String(products.length),
            style: {
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
            },
          },

          {
            type: "text",
            value: "عدد القطع",
            style: { textAlign: "right", fontSize: "12px", fontWeight: "bold" },
          },
        ],
        [
          {
            type: "text",
            value: "",
            style: { textAlign: "right", fontSize: "12px" },
          },
          {
            type: "text",
            value: "كاش",
            style: {
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
            },
          },
          {
            type: "text",
            value: "طريقة الدفع",
            style: { textAlign: "right", fontSize: "12px", fontWeight: "bold" },
          },
        ],
        [
          {
            type: "text",
            value: " جنيه مصري",
            style: { textAlign: "left", fontSize: "12px", fontWeight: "bold" },
          },
          {
            type: "text",
            value: String(total),
            style: {
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
            },
          },

          {
            type: "text",
            value: "الإجمالي",
            style: { textAlign: "right", fontSize: "12px", fontWeight: "bold" },
          },
        ],
        [
          {
            type: "text",
            value: " جنيه مصري",
            style: {
              textAlign: "left",
              border: "1px dashed black",
              fontSize: "12px",
              fontWeight: "bold",
            },
          },

          {
            type: "text",
            value: String(netTotal),
            style: {
              textAlign: "left",
              fontSize: "12px",
              border: "1px dashed black",
              fontWeight: "bold",
            },
          },

          {
            type: "text",
            value: "المطلوب",
            style: {
              textAlign: "right",
              fontSize: "12px",
              border: "1px dashed black",
              fontWeight: "bold",
            },
          },
        ],
      ],
      // list of columns to be rendered in the table footer
      tableFooter: [],
      // custom style for the table header
      tableHeaderStyle: {},
      // custom style for the table body
      tableBodyStyle: {},
      // custom style for the table footer
      tableFooterStyle: {},
    });

    data2.push(
      ...[
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "ملحوظه : الاستبدال بالفاتورة",
          style: {
            fontWeight: "700",
            textAlign: "center",
            fontSize: "14px",
            marginTop: "5px",
          },
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "يمكنكم زيارتنا بالعنوان التالي",
          style: { fontWeight: "700", textAlign: "center", fontSize: "14px" },
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: process.env.COMPANY_ADDRESS,
          style: { fontWeight: "700", textAlign: "center", fontSize: "14px" },
        },
        {
          type: "text",
          value: "__________________________________________",
          style: { textAlign: "center" },
        },
        {
          type: "text",
          value: "© All Copyrights Reserved To Sailentra 2025  01034097707",
          style: { textAlign: "center", fontWeight: "bold" },
        },
      ]
    );
    try {
      await PosPrinter.print(data2, options);
      console.log("Printed successfully");
    } catch (err) {
      console.error("Print error", err);
    }
  } catch (err) {
    console.error("خطأ في الطباعة:", err);
  }
}
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12
  hours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year}  ${hours}:${minutes}${ampm}`;
}
module.exports = {
  PrintInvoice,
  createInvoice,
  afterInvoice,
  beforeInvoice,
  getAllInvoices,
  updateInvoice,
};
