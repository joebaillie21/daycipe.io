// server/db/pool.js
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
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
