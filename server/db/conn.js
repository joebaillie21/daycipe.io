// server/db/pool.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",         // Your PostgreSQL username
  host: "localhost",        // Your PostgreSQL host
  database: "daycipie",     // Your PostgreSQL database
  password: "",             // Your PostgreSQL password
  port: 5432                // Default PostgreSQL port
});

module.exports = pool;
