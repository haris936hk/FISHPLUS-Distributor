const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

/**
 * Initialize the database
 * Database is stored in the user's app data directory
 */
function initialize() {
  if (db) {
    return db;
  }

  try {
    // Get user data path
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.sqlite');

    console.log('Initializing database at:', dbPath);

    // Create database connection
    db = new Database(dbPath, { verbose: console.log });

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Run initial schema if database is new
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
      console.log('Database schema initialized');
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Execute a SELECT query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Array} Query results
 */
function query(sql, params = []) {
  if (!db) initialize();
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Result with changes and lastInsertRowid
 */
function execute(sql, params = []) {
  if (!db) initialize();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/**
 * Execute multiple queries in a transaction
 * @param {Array} operations - Array of {sql, params} objects
 * @returns {Array} Results of all operations
 */
function transaction(operations) {
  if (!db) initialize();

  const txn = db.transaction(() => {
    const results = [];
    for (const op of operations) {
      const stmt = db.prepare(op.sql);
      results.push(stmt.run(...(op.params || [])));
    }
    return results;
  });

  return txn();
}

/**
 * Close the database connection
 */
function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initialize,
  query,
  execute,
  transaction,
  close,
};
