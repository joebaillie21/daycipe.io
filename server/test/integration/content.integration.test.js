import request from 'supertest';
import express from 'express';
import cors from 'cors';
import contentRouter from '../../routes/contentRoutes.js';
import { setupTestDatabase, clearTestData, closeTestDatabase } from './setup/test-db.js';
import { pool } from '../../db/conn.js';
import { generateContentInDateRange } from './fixtures/test-data.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/content', contentRouter);

describe('Content Range API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/content/range', () => {
    it('should return content for a single date', async () => {
      const testDate = '2024-01-01';
      const content = generateContentInDateRange(testDate, testDate);

      // Insert test data
      await Promise.all([
        ...content.facts.map(fact => 
          pool.query(`
            INSERT INTO facts (date, content, source, category, is_shown) 
            VALUES ($1, $2, $3, $4, true)
          `, [fact.date, fact.content, fact.source, fact.category])
        ),
        ...content.jokes.map(joke => 
          pool.query(`
            INSERT INTO jokes (date, content, is_shown) 
            VALUES ($1, $2, true)
          `, [joke.date, joke.content])
        ),
        ...content.recipes.map(recipe => 
          pool.query(`
            INSERT INTO recipes (date, content, category, is_shown) 
            VALUES ($1, $2, $3, true)
          `, [recipe.date, recipe.content, recipe.category])
        )
      ]);

      const response = await request(app).get(`/api/content/range?startDate=${testDate}`);

      expect(response.status).toBe(200);
      expect(response.body.dateRange.startDate).toBe(testDate);
      expect(response.body.dateRange.endDate).toBe(testDate);
      expect(response.body.counts.facts).toBeGreaterThan(0);
      expect(response.body.counts.jokes).toBeGreaterThan(0);
      expect(response.body.counts.recipes).toBeGreaterThan(0);
    });

    it('should return content for a date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-03';
      const content = generateContentInDateRange(startDate, endDate);

      // Insert test data
      await Promise.all([
        ...content.facts.map(fact => 
          pool.query(`
            INSERT INTO facts (date, content, source, category, is_shown) 
            VALUES ($1, $2, $3, $4, true)
          `, [fact.date, fact.content, fact.source, fact.category])
        ),
        ...content.jokes.map(joke => 
          pool.query(`
            INSERT INTO jokes (date, content, is_shown) 
            VALUES ($1, $2, true)
          `, [joke.date, joke.content])
        ),
        ...content.recipes.map(recipe => 
          pool.query(`
            INSERT INTO recipes (date, content, category, is_shown) 
            VALUES ($1, $2, $3, true)
          `, [recipe.date, recipe.content, recipe.category])
        )
      ]);

      const response = await request(app).get(`/api/content/range?startDate=${startDate}&endDate=${endDate}`);

      expect(response.status).toBe(200);
      expect(response.body.dateRange.startDate).toBe(startDate);
      expect(response.body.dateRange.endDate).toBe(endDate);
      expect(response.body.counts.total).toBeGreaterThan(0);
    });

    it('should not return hidden content', async () => {
      const testDate = '2024-01-01';
      
      // Insert visible and hidden facts
      await pool.query(`
        INSERT INTO facts (date, content, source, category, is_shown) 
        VALUES ($1, $2, $3, $4, true)
      `, [testDate, 'Visible fact', 'Source', 'math']);
      
      await pool.query(`
        INSERT INTO facts (date, content, source, category, is_shown, score) 
        VALUES ($1, $2, $3, $4, false, -10)
      `, [testDate, 'Hidden fact', 'Source', 'math']);

      const response = await request(app).get(`/api/content/range?startDate=${testDate}`);

      expect(response.status).toBe(200);
      expect(response.body.counts.facts).toBe(1);
      expect(response.body.content.facts[0].content).toBe('Visible fact');
    });

    it('should validate date format', async () => {
      const response = await request(app).get('/api/content/range?startDate=invalid-date');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid startDate parameter is required (YYYY-MM-DD)');
    });

    it('should validate date logic', async () => {
      const response = await request(app).get('/api/content/range?startDate=2024-01-05&endDate=2024-01-01');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('endDate cannot be earlier than startDate');
    });
  });
});