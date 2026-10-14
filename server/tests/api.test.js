import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('StudyTrack API Integration Tests', () => {
  let userAToken = '';
  let userBToken = '';
  let userATaskId = null;
  let userAReminderId = null;

  const testUserA = {
    name: 'Student Alice',
    email: `alice_${Date.now()}@example.com`,
    password: 'password123'
  };

  const testUserB = {
    name: 'Student Bob',
    email: `bob_${Date.now()}@example.com`,
    password: 'password123'
  };

  it('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('StudyTrack API');
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/signup creates a new student account', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUserA);

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUserA.email);
      expect(res.body.token).toBeDefined();
      userAToken = res.body.token;
    });

    it('POST /api/auth/signup prevents duplicate emails', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUserA);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('POST /api/auth/login rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserA.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid email or password');
    });

    it('POST /api/auth/login succeeds with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserA.email,
          password: testUserA.password
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe(testUserA.name);
    });

    it('GET /api/auth/me returns authenticated student profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUserA.email);
      expect(res.body.settings).toBeDefined();
    });

    it('GET /api/auth/me rejects unauthorized request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    // Create User B for isolation testing
    it('Registers User B for isolation tests', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUserB);

      expect(res.status).toBe(201);
      userBToken = res.body.token;
    });
  });

  describe('Task Management Endpoints', () => {
    it('POST /api/tasks validates required fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });

    it('POST /api/tasks creates a task for User A', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Algorithms Homework 3',
          description: 'Divide and conquer algorithms and recurrence relations.',
          subject: 'Computer Science',
          priority: 'High',
          status: 'Pending',
          due_date: '2026-10-25 18:00',
          estimated_duration: 90,
          notes: 'Submit PDF to portal'
        });

      expect(res.status).toBe(201);
      expect(res.body.task).toBeDefined();
      expect(res.body.task.title).toBe('Algorithms Homework 3');
      userATaskId = res.body.task.id;
    });

    it('GET /api/tasks returns User A tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.some(t => t.id === userATaskId)).toBe(true);
    });

    it('User B cannot see or access User A task (Data Isolation)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('User B cannot update User A task (Data Isolation)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(404);
    });

    it('User B cannot delete User A task (Data Isolation)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('User A can update own task status to Completed', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'Completed' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('Completed');
      expect(res.body.task.completed_at).toBeDefined();
    });
  });

  describe('Reminders & Study Sessions', () => {
    it('GET /api/reminders retrieves user reminders and counts unread', async () => {
      const res = await request(app)
        .get('/api/reminders')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.reminders)).toBe(true);
      if (res.body.reminders.length > 0) {
        userAReminderId = res.body.reminders[0].id;
      }
    });

    it('POST /api/study-sessions logs a focus study session', async () => {
      const res = await request(app)
        .post('/api/study-sessions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          duration_minutes: 45,
          session_type: 'focus',
          task_id: userATaskId
        });

      expect(res.status).toBe(201);
      expect(res.body.session.duration_minutes).toBe(45);
    });

    it('GET /api/study-sessions returns recorded stats', async () => {
      const res = await request(app)
        .get('/api/study-sessions')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.totalMinutes).toBeGreaterThanOrEqual(45);
    });
  });

  describe('Analytics & Goals', () => {
    it('GET /api/analytics/summary returns calculated metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalTasks).toBeGreaterThanOrEqual(1);
      expect(res.body.completedTasks).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.overallCompletionRate).toBe('number');
    });

    it('GET /api/goals and PUT /api/goals manage daily targets', async () => {
      const putRes = await request(app)
        .put('/api/goals')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ targetTasks: 6, targetMinutes: 150 });

      expect(putRes.status).toBe(200);

      const getRes = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.today.targetTasks).toBe(6);
      expect(getRes.body.today.targetMinutes).toBe(150);
    });
  });
});
