// initdb.js
const { Pool } = require("pg");

const db = new Pool({
  connectionString: "postgresql://kwiksend_db_user:YADVilNVUNtI2KoGTbv48Rw9gsWWAAPV@dpg-d3frl2l6ubrc73cb91q0-a.frankfurt-postgres.render.com/kwiksend_db",

  ssl: {
    rejectUnauthorized: false, // important pour Render
  },
});

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        password_hash TEXT
      );
    `);

    console.log("✅ Table 'users' créée ou déjà existante.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur lors de la création :", err);
    process.exit(1);
  }
}

init();
