import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Get the directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure lowdb to write to db.json
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, fall back to empty db
await db.read();
console.log('DB init:', db.data);

db.data ||= {};
db.data.users ||= [];
db.data.books ||= [];
db.data.reviews ||= [];
// Ensure required collections exist
//db.data ||= { users: [], books: [], reviews: [] };

// Function to write to the database
const saveDb = async () => {
  await db.write();
};

export { db, saveDb }; 