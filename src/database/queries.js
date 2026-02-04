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

module.exports = {
  settings,
  users,
};
