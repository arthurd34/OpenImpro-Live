const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../openimpro.db');
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS state_persistence (
    id INTEGER PRIMARY KEY,
    data TEXT
  )
`);

module.exports = {
    saveState: (state) => {
        const json = JSON.stringify(state);
        const stmt = db.prepare('INSERT OR REPLACE INTO state_persistence (id, data) VALUES (1, ?)');
        stmt.run(json);
    },
    loadState: () => {
        const stmt = db.prepare('SELECT data FROM state_persistence WHERE id = 1');
        const row = stmt.get();
        return row ? JSON.parse(row.data) : null;
    }
};