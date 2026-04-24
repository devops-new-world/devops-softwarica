const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString || typeof connectionString !== 'string') {
  console.error('ERROR: Missing or invalid DATABASE_URL environment variable.');
  console.error('Copy server/.env.example to server/.env and set DATABASE_URL with your PostgreSQL connection string.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
