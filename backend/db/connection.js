const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Si se define DATABASE_URL, se conecta a base remota con esa URL
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false  // Necesario para Railway, Supabase, etc.
    }
  });
  console.log("✅ Conectado a base de datos remota");
} else {
  // Si no se define DATABASE_URL, se conecta a base local con tus variables
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  console.log("✅ Conectado a base de datos local");
}

module.exports = pool;
