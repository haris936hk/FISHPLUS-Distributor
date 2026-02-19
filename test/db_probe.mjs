// Test script to diagnose database issues
// Run with: node test/db_probe.mjs
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'fishplus-distributor', 'database.sqlite');
console.log('DB path:', dbPath);
console.log('DB exists:', fs.existsSync(dbPath));

try {
    const db = new Database(dbPath);

    // Check existing tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('\nExisting tables:', tables.map(t => t.name).join(', '));

    // Check schema_versions
    try {
        const versions = db.prepare("SELECT * FROM schema_versions").all();
        console.log('\nSchema versions:', versions);
    } catch (e) {
        console.log('No schema_versions table yet');
    }

    // Check columns in sale_items
    try {
        const cols = db.prepare("PRAGMA table_info(sale_items)").all();
        console.log('\nsale_items columns:', cols.map(c => c.name).join(', '));
    } catch (e) {
        console.log('sale_items not found');
    }

    db.close();
    console.log('\nDB probe complete.');
} catch (e) {
    console.error('\nDB Error:', e.message);
}
