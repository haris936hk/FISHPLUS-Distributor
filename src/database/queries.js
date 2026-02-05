const db = require('./index');

/**
 * Common database queries with prepared statements
 * Prevents SQL injection and improves performance
 */

// Settings queries
const settings = {
  getAll: () => {
    return db.query('SELECT * FROM settings ORDER BY key');
  },

  get: (key) => {
    const result = db.query('SELECT value FROM settings WHERE key = ?', [key]);
    return result[0]?.value || null;
  },

  set: (key, value) => {
    return db.execute(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, value, value]
    );
  },

  delete: (key) => {
    return db.execute('DELETE FROM settings WHERE key = ?', [key]);
  },
};

// User queries
const users = {
  getAll: () => {
    return db.query('SELECT * FROM users ORDER BY created_at DESC');
  },

  getById: (id) => {
    const result = db.query('SELECT * FROM users WHERE id = ?', [id]);
    return result[0] || null;
  },

  getByUsername: (username) => {
    const result = db.query('SELECT * FROM users WHERE username = ?', [username]);
    return result[0] || null;
  },

  create: (username, email = null) => {
    return db.execute('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
  },

  update: (id, data) => {
    const { username, email } = data;
    return db.execute(
      `UPDATE users 
       SET username = COALESCE(?, username),
           email = COALESCE(?, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [username, email, id]
    );
  },

  delete: (id) => {
    return db.execute('DELETE FROM users WHERE id = ?', [id]);
  },
};

// Dashboard queries
const dashboard = {
  /**
   * Get suppliers with non-zero advance amounts
   * @returns {Array} Suppliers with id, name, and advance_amount
   */
  getSupplierAdvances: () => {
    return db.query(
      `SELECT id, name, name_english, advance_amount 
       FROM suppliers 
       WHERE advance_amount > 0 AND is_active = 1
       ORDER BY name ASC`
    );
  },

  /**
   * Get items with current stock levels
   * @returns {Array} Items with id, name, current_stock, and category
   */
  getItemsStock: () => {
    return db.query(
      `SELECT i.id, i.name, i.name_english, i.current_stock, i.unit_price,
              c.name as category_name, c.name_urdu as category_name_urdu
       FROM items i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.is_active = 1
       ORDER BY i.name ASC`
    );
  },

  /**
   * Get dashboard summary statistics
   * @returns {Object} Summary with counts and totals
   */
  getSummary: () => {
    const suppliersResult = db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(advance_amount), 0) as total_advances FROM suppliers WHERE is_active = 1'
    );
    const customersResult = db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(current_balance), 0) as total_balance FROM customers WHERE is_active = 1'
    );
    const itemsResult = db.query(
      'SELECT COUNT(*) as count FROM items WHERE is_active = 1'
    );
    const todaySalesResult = db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(net_amount), 0) as total 
       FROM sales 
       WHERE DATE(sale_date) = DATE('now', 'localtime')`
    );

    return {
      suppliers: suppliersResult[0] || { count: 0, total_advances: 0 },
      customers: customersResult[0] || { count: 0, total_balance: 0 },
      items: itemsResult[0] || { count: 0 },
      todaySales: todaySalesResult[0] || { count: 0, total: 0 },
    };
  },
};

module.exports = {
  settings,
  users,
  dashboard,
};
