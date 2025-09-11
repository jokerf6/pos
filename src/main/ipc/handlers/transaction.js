// src/electron-api/productTransactions.js

const { getDatabase } = require("../../database/connection.js");

async function getProductTransactions(event, data) {
  const { productId, page = 1, limit = 10 } = data;
  try {
    const db = getDatabase();
    
    // Get product details
    const productRows = await db.all(
      "SELECT * FROM items WHERE id = ?",
      [productId]
    );
    
    if (productRows.length === 0) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    // Get total count of transactions
    const countRows = await db.all(
      "SELECT COUNT(*) as total FROM transactions WHERE item_id = ?",
      [productId]
    );
    const total = countRows[0].total;

    // Get paginated transactions
    const offset = (page - 1) * limit;
    const transactionRows = await db.all(
      `SELECT 
        t.id,
        t.transaction_type,
        t.quantity,
        t.unit_price,
        t.total_value,
    strftime('%d/%m/%Y', t.transaction_date / 1000, 'unixepoch') AS date_ar,
          t.transaction_date AS date,
        CASE 
          WHEN t.transaction_type = 'purchase' THEN 'مشتريات'
          WHEN t.transaction_type = 'sale' THEN 'مبيعات'
          WHEN t.transaction_type = 'return' THEN 'مرتجع'
        END AS movement_type_ar,
        CASE 
          WHEN t.transaction_type = 'purchase' THEN 'up'
          WHEN t.transaction_type = 'sale' THEN 'down'
          WHEN t.transaction_type = 'return' THEN 'up'
        END AS movement_icon
      FROM transactions t
      WHERE t.item_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    // Calculate statistics (for all transactions, not just current page)
    const allTransactions = await db.all(
      `SELECT transaction_type, quantity, total_value 
       FROM transactions WHERE item_id = ?`,
      [productId]
    );

    const statistics = {
      totalMovements: total,
      totalSales: allTransactions
        .filter(t => t.transaction_type === 'sale')
        .reduce((sum, t) => sum + +t.quantity, 0),
      totalPurchases: allTransactions
        .filter(t => t.transaction_type === 'purchase')
        .reduce((sum, t) => sum + +t.quantity, 0),
      totalValue: allTransactions
        .reduce((sum, t) => sum + +t.total_value, 0)
    };
   console.log("transaction");
   console.log(page);
    return {
      success: true,
      product: {
        id: productRows[0].id,
        name: productRows[0].name,
        code: productRows[0].barcode
      },
      transactions: transactionRows,
      statistics,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };

  } catch (error) {
    console.error('Error fetching product transactions:', error);
    return {
      success: false,
      message: "Database error"
    };
  }
}
module.exports = { getProductTransactions };
