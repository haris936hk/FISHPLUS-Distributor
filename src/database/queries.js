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

// Supplier queries
const suppliers = {
  /**
   * Get all active suppliers with city/country names
   * @returns {Array} Suppliers with joined city/country data
   */
  getAll: () => {
    return db.query(
      `SELECT s.*, 
              c.name as city_name, c.name_urdu as city_name_urdu,
              co.name as country_name, co.name_urdu as country_name_urdu
       FROM suppliers s
       LEFT JOIN cities c ON s.city_id = c.id
       LEFT JOIN countries co ON s.country_id = co.id
       WHERE s.is_active = 1
       ORDER BY s.name ASC`
    );
  },

  /**
   * Get supplier by ID with joined data
   * @param {number} id - Supplier ID
   * @returns {Object|null} Supplier object or null
   */
  getById: (id) => {
    const result = db.query(
      `SELECT s.*, 
              c.name as city_name, c.name_urdu as city_name_urdu,
              co.name as country_name, co.name_urdu as country_name_urdu
       FROM suppliers s
       LEFT JOIN cities c ON s.city_id = c.id
       LEFT JOIN countries co ON s.country_id = co.id
       WHERE s.id = ?`,
      [id]
    );
    return result[0] || null;
  },

  /**
   * Search suppliers by name (partial match)
   * @param {string} name - Search term
   * @returns {Array} Matching suppliers
   */
  search: (name) => {
    const searchTerm = `%${name}%`;
    return db.query(
      `SELECT s.*, 
              c.name as city_name, c.name_urdu as city_name_urdu,
              co.name as country_name, co.name_urdu as country_name_urdu
       FROM suppliers s
       LEFT JOIN cities c ON s.city_id = c.id
       LEFT JOIN countries co ON s.country_id = co.id
       WHERE s.is_active = 1 AND (s.name LIKE ? OR s.name_english LIKE ?)
       ORDER BY s.name ASC`,
      [searchTerm, searchTerm]
    );
  },

  /**
   * Check if NIC already exists (for validation)
   * @param {string} nic - NIC number to check
   * @param {number|null} excludeId - Supplier ID to exclude (for updates)
   * @returns {boolean} True if NIC exists
   */
  checkNic: (nic, excludeId = null) => {
    if (!nic || nic.trim() === '') return false;

    const query = excludeId
      ? 'SELECT COUNT(*) as count FROM suppliers WHERE nic = ? AND id != ? AND is_active = 1'
      : 'SELECT COUNT(*) as count FROM suppliers WHERE nic = ? AND is_active = 1';

    const params = excludeId ? [nic, excludeId] : [nic];
    const result = db.query(query, params);
    return result[0]?.count > 0;
  },

  /**
   * Create a new supplier
   * @param {Object} data - Supplier data
   * @returns {Object} Insert result with lastInsertRowid
   */
  create: (data) => {
    const {
      name, name_english, nic, phone, mobile, email,
      address, city_id, country_id, opening_balance,
      default_commission_pct, notes, created_by
    } = data;

    return db.execute(
      `INSERT INTO suppliers (
        name, name_english, nic, phone, mobile, email,
        address, city_id, country_id, opening_balance,
        current_balance, default_commission_pct, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, name_english || null, nic || null, phone || null,
        mobile || null, email || null, address || null,
        city_id || null, country_id || null,
        opening_balance || 0, opening_balance || 0,
        default_commission_pct || 5.0, notes || null, created_by || null
      ]
    );
  },

  /**
   * Update an existing supplier
   * @param {number} id - Supplier ID
   * @param {Object} data - Updated supplier data
   * @returns {Object} Update result
   */
  update: (id, data) => {
    const {
      name, name_english, nic, phone, mobile, email,
      address, city_id, country_id, default_commission_pct, notes
    } = data;

    return db.execute(
      `UPDATE suppliers SET
        name = ?, name_english = ?, nic = ?, phone = ?,
        mobile = ?, email = ?, address = ?, city_id = ?,
        country_id = ?, default_commission_pct = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, name_english || null, nic || null, phone || null,
        mobile || null, email || null, address || null,
        city_id || null, country_id || null,
        default_commission_pct || 5.0, notes || null, id
      ]
    );
  },

  /**
   * Soft delete a supplier (set is_active = 0)
   * @param {number} id - Supplier ID
   * @returns {Object} Update result
   */
  delete: (id) => {
    return db.execute(
      `UPDATE suppliers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
  },

  /**
   * Check if supplier has any transactions (prevents deletion)
   * @param {number} id - Supplier ID
   * @returns {boolean} True if supplier has transactions
   */
  hasTransactions: (id) => {
    const purchaseResult = db.query(
      'SELECT COUNT(*) as count FROM purchases WHERE supplier_id = ?',
      [id]
    );
    const saleResult = db.query(
      'SELECT COUNT(*) as count FROM sales WHERE supplier_id = ?',
      [id]
    );
    return (purchaseResult[0]?.count || 0) > 0 || (saleResult[0]?.count || 0) > 0;
  },
};

// Reference data queries
const reference = {
  /**
   * Get all active cities with country info
   * @returns {Array} Cities with country names
   */
  getCities: () => {
    return db.query(
      `SELECT c.*, co.name as country_name, co.name_urdu as country_name_urdu
       FROM cities c
       LEFT JOIN countries co ON c.country_id = co.id
       WHERE c.is_active = 1
       ORDER BY c.name ASC`
    );
  },

  /**
   * Get all active countries
   * @returns {Array} Countries
   */
  getCountries: () => {
    return db.query(
      `SELECT * FROM countries WHERE is_active = 1 ORDER BY name ASC`
    );
  },
};

module.exports = {
  settings,
  users,
  dashboard,
  suppliers,
  reference,
};
