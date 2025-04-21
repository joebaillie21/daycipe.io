// server/db/pool.js
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
const { Pool } = pkg;

// Define database config based on environment
const getPoolConfig = () => {
    if (process.env.NODE_ENV === 'test') {
      return {
        user: "postgres",
        host: "localhost",
        database: "daycipe",
        password: "password",
        port: 5432
      };
    }
    
    // Default to development config
    return {
      user: process.env.PGUSER || "postgres",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "daycipe",
      password: process.env.PGPASSWORD || "postgres",
      port: parseInt(process.env.PGPORT || "5432")
    };
  };
  
export const pool = new Pool(getPoolConfig());
  
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
