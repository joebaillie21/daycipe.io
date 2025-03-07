// server/db/pool.js
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",         // Your PostgreSQL username
  host: "localhost",        // Your PostgreSQL host
  database: "daycipe",      // Your PostgreSQL database
  password: "password",     // Your PostgreSQL password
  port: 5432                // Default PostgreSQL port
});

//Initialize DB schema
const schemaPath = path.resolve('db/schema.sql');
const schemaQuery = fs.readFileSync(schemaPath, 'utf-8');

export const schemaInit = async () => {
    try {
        pool.query(schemaQuery);
    } catch (err) {
        console.log("Could not initialize database schema: ", err);
    }
}
