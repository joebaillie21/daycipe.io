import request from 'supertest';
import express from 'express';
import cors from 'cors';
import factsRouter from '../../routes/factsRoutes.js';
import { setupTestDatabase, clearTestData, closeTestDatabase } from './setup/test-db.js';
import { pool } from '../../db/conn.js';
import { testFacts, today } from './fixtures/test-data.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/facts', factsRouter);

describe('Facts API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/facts', () => {
    it('should return all facts', async () => {
      // Insert test data
      await pool.query(`
        INSERT INTO facts (date, content, source, category) 
        VALUES ($1, $2, $3, $4)
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);

      const response = await request(app).get('/api/facts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].content).toBe(testFacts.math.content);
    });
  });

  describe('POST /api/facts/create', () => {
    it('should create a new fact', async () => {
      const response = await request(app)
        .post('/api/facts/create')
        .send({ fact: testFacts.physics });

      expect(response.status).toBe(200);
      expect(response.body.factId).toBeDefined();

      // Verify the fact was created in the database
      const result = await pool.query('SELECT * FROM facts WHERE id = $1', [response.body.factId]);
      expect(result.rows[0].content).toBe(testFacts.physics.content);
      expect(result.rows[0].source).toBe(testFacts.physics.source);
    });

    it('should validate required fields', async () => {
      const incompleteFact = { ...testFacts.math };
      delete incompleteFact.content;

      const response = await request(app)
        .post('/api/facts/create')
        .send({ fact: incompleteFact });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required key: content');
    });
  });

  describe('GET /api/facts/today', () => {
    it('should return today\'s fact for a specific category', async () => {
      // Insert test facts
      await pool.query(`
        INSERT INTO facts (date, content, source, category) 
        VALUES ($1, $2, $3, $4)
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);

      const response = await request(app).get('/api/facts/today?category=math');

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(testFacts.math.content);
      expect(response.body.category).toBe('math');
    });

    it('should return all category facts when category=all', async () => {
      // Insert facts from multiple categories
      await Promise.all([
        pool.query(`
          INSERT INTO facts (date, content, source, category) 
          VALUES ($1, $2, $3, $4)
        `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]),
        pool.query(`
          INSERT INTO facts (date, content, source, category) 
          VALUES ($1, $2, $3, $4)
        `, [testFacts.physics.date, testFacts.physics.content, testFacts.physics.source, testFacts.physics.category])
      ]);

      const response = await request(app).get('/api/facts/today?category=all');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 404 when no fact is available for today', async () => {
      const response = await request(app).get('/api/facts/today?category=math');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No fact of the day found.');
    });
  });

  describe('Voting functionality', () => {
    let factId;

    beforeEach(async () => {
      const result = await pool.query(`
        INSERT INTO facts (date, content, source, category, score) 
        VALUES ($1, $2, $3, $4, 0) RETURNING id
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);
      factId = result.rows[0].id;
    });

    it('should upvote a fact', async () => {
      const response = await request(app).post(`/api/facts/${factId}/upvote`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.newScore).toBe(1);

      // Verify in database
      const result = await pool.query('SELECT score FROM facts WHERE id = $1', [factId]);
      expect(result.rows[0].score).toBe(1);
    });

    it('should downvote a fact', async () => {
      const response = await request(app).post(`/api/facts/${factId}/downvote`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.newScore).toBe(-1);
    });

    it('should hide fact when score drops below threshold', async () => {
      // Set initial score to be just above threshold
      await pool.query('UPDATE facts SET score = -5 WHERE id = $1', [factId]);

      const response = await request(app).post(`/api/facts/${factId}/downvote`);

      expect(response.status).toBe(200);
      expect(response.body.isShown).toBe(false);
      expect(response.body.newScore).toBe(-6);

      // Verify in database
      const result = await pool.query('SELECT is_shown FROM facts WHERE id = $1', [factId]);
      expect(result.rows[0].is_shown).toBe(false);
    });
  });
});