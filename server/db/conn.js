// server/db/pool.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",         // Your PostgreSQL username
  host: "localhost",        // Your PostgreSQL host
  database: "daycipie",     // Your PostgreSQL database
  password: "",             // Your PostgreSQL password
  port: 5432                // Default PostgreSQL port
});
