// server/db/pool.js
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

// Define database config based on environment
const getPoolConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    if(isProduction) {
      return process.env.DATABASE_URL = {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
      }
    }
    
    if (process.env.NODE_ENV === 'test') {
      return {
        connectionString: "postgres://postgres:postgres@localhost:5432/daycipe_test"
      };
    }
    
    // Default to development config
    return {
      connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/daycipe"
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
