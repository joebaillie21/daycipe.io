import request from 'supertest';
import express from 'express';
import cors from 'cors';
import reportsRouter from '../../routes/reportsRoutes.js';
import { setupTestDatabase, clearTestData, closeTestDatabase } from './setup/test-db.js';
import { pool } from '../../db/conn.js';
import { testFacts } from './fixtures/test-data.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/reports', reportsRouter);

describe('Reports API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('POST /api/reports/create', () => {
    let factId;

    beforeEach(async () => {
      // Insert a fact to report
      const result = await pool.query(`
        INSERT INTO facts (date, content, source, category) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);
      factId = result.rows[0].id;
    });

    it('should create a new report', async () => {
      const reportData = {
        content_type: 'fact',
        content_id: factId,
        substance_of_report: 'This fact is inaccurate'
      };

      const response = await request(app)
        .post('/api/reports/create')
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.reportId).toBeDefined();

      // Verify in database
      const result = await pool.query('SELECT * FROM reports WHERE id = $1', [response.body.reportId]);
      expect(result.rows[0].type_of_reported_content).toBe('fact');
      expect(result.rows[0].reported_content_id).toBe(factId);
      expect(result.rows[0].substance_of_report).toBe('This fact is inaccurate');
    });

    it('should validate required fields', async () => {
      const incompleteReport = {
        content_type: 'fact',
        content_id: factId
        // Missing substance_of_report
      };

      const response = await request(app)
        .post('/api/reports/create')
        .send(incompleteReport);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Request does not contain all required fields.');
    });
  });

  describe('GET /api/reports/content/:type/:id', () => {
    let factId;
    let reportId;

    beforeEach(async () => {
      // Insert a fact and a report for it
      const factResult = await pool.query(`
        INSERT INTO facts (date, content, source, category) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);
      factId = factResult.rows[0].id;

      const reportResult = await pool.query(`
        INSERT INTO reports (type_of_reported_content, reported_content_id, substance_of_report)
        VALUES ($1, $2, $3) RETURNING id
      `, ['fact', factId, 'Test report']);
      reportId = reportResult.rows[0].id;
    });

    it('should get reports for specific content', async () => {
      const response = await request(app).get(`/api/reports/content/fact/${factId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].substance_of_report).toBe('Test report');
    });
  });

  describe('GET /api/reports', () => {
    it('should get all reports', async () => {
      // Insert a fact and multiple reports
      const factResult = await pool.query(`
        INSERT INTO facts (date, content, source, category) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [testFacts.math.date, testFacts.math.content, testFacts.math.source, testFacts.math.category]);
      const factId = factResult.rows[0].id;

      await Promise.all([
        pool.query(`
          INSERT INTO reports (type_of_reported_content, reported_content_id, substance_of_report)
          VALUES ($1, $2, $3)
        `, ['fact', factId, 'Report 1']),
        pool.query(`
          INSERT INTO reports (type_of_reported_content, reported_content_id, substance_of_report)
          VALUES ($1, $2, $3)
        `, ['fact', factId, 'Report 2'])
      ]);

      const response = await request(app).get('/api/reports');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });
});