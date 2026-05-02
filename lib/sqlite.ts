import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'database.db');

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;

/**
 * Initialize the database with the core schema
 */
export function initDb() {
  const schemaPath = path.resolve(process.cwd(), 'db/core_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database initialized with core schema.');
}
