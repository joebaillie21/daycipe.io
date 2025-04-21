import fs from 'fs';
import path from 'path';
import { pool } from '../../../db/conn.js';

export async function setupTestDatabase() {
  // Execute schema.sql to create tables
  const schemaPath = path.resolve('db/schema.sql');
  const schemaQuery = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    await pool.query(schemaQuery);
    console.log('Test database schema initialized');
  } catch (error) {
    console.error('Error initializing test database schema:', error);
    throw error;
  }
}

export async function clearTestData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear tables in the correct order to respect foreign key constraints
    await client.query('DELETE FROM reports');
    await client.query('DELETE FROM facts');
    await client.query('DELETE FROM jokes');
    await client.query('DELETE FROM recipes');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE facts_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE jokes_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE recipes_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE reports_id_seq RESTART WITH 1');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closeTestDatabase() {
  await pool.end();
}