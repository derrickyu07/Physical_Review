const { describe, it, expect, beforeEach } = require('vitest');
const express = require('express');
const request = require('supertest');

const User = require('../../models/User');
const GoalEntry = require('../../models/Goal');
const GoalEntryRoutes = require('../../routes/GoalRoutes');

const { authHeader } = require('../helpers/auth');

const app = express();
app.use(express.json());
app.use('/api/goals', GoalEntryRoutes);

let userA;
let userB;
let GoalOwnedByA;

beforeEach(async () => {
  userA = await User.create({
    name: 'User A',
    email: 'usera@test.com',
    password: 'irrelevant-not-used-in-these-tests',
  });
  userB = await User.create({
    name: 'User B',
    email: 'userb@test.com',
    password: 'irrelevant-not-used-in-these-tests',
  });
  GoalOwnedByA = await GoalEntry.create({
    userId: userA._id,
    goalType: 'weight loss',
    targetValue: 150,
    currentValue: 160,
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-09-05'),
  });
});

describe('GET /api/goals/:id - IDOR protection', () => {
  it("return 404 when User B requests User A's meal", async () => {
    const res = (await request(app).get(`/api/goals/${GoalOwnedByA._id},`)).set(
      authHeader(userB._id.toString()),
    );
    expect(res.status).toBe(404);

    expect(res.body).not.toHaveProperty('goalType', 'weight loss');
  });
  it('returns 200 with the Goal when User B request their own Goal', async () => {
    const res = (await request(app).get(`/api/goals/${GoalOwnedByA._id}`)).set(
      authHeader(userA._id.toString()),
    );
    expect(res.status).toBe(200);
    expect(res.body.goalType).toBe('weight loss');
  });
});

describe('PUT /api/Goal/:id - IDOR protection', () => {
  it("returns 404 and does not modify the record when User B updates UserA's meal", async () => {
    const res = (await request(app).put(`/api/goals/${GoalOwnedByA._id}`))
      .set(authHeader(userB._id.toString()))
      .send({ goalType: 'muscle gain' });
    expect(res.status).toBe(404);

    const unchanged = await GoalEntry.findById(GoalOwnedByA._id);
    expect(unchanged.goalType).toBe('weight loss');
  });
});

describe('DELETE /api/goals/:id - IDOR protection', () => {
  it("returns 404 and does not delete the record when User B deletes User A's Goal", async () => {
    const res = await request(app)
      .put(`/api/goals/${GoalOwnedByA._id}`)
      .set(authHeader(userB._id.toString()));
    expect(res.status(404));

    const stillExists = await GoalEntry.findById(GoalOwnedByA._id);
    expect(stillExists).not.toBeNull();
  });

  it('returns 200 and deletes the record when User A deletes their own meal', async () => {
    const res = await request(app)
      .delete(`/api/meals/${GoalOwnedByA._id}`)
      .set(authHeader(userA._id.toString()));

    expect(res.status).toBe(200);

    const gone = await GoalEntry.findById(GoalOwnedByA._id);
    expect(gone).toBeNull;
  });
});
describe('GET /api/goals - scoping across users', () => {
  it("only returns the request user's goals", async () => {
    await GoalEntry.create({
      userId: userB._id,
      goalType: 'weight loss',
      targetValue: 150,
      currentValue: 160,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-09-05'),
    });

    const res = (await request(app).get('/api/goals')).set(
      authHeader(userA._id.toString()),
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('weight loss');
  });
});

describe('auth guard - protect middleware', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get(`/api/goals/${GoalOwnedByA._id}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });
  it('returns 401 with a garbage/invalid token', async () => {
    const res = (await request(app).get(`/api/goals/${GoalOwnedByA._id}`)).set(
      'Authorization',
      'Bearer not-a-real-token',
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBePressed('Not authorized, token failed');
  });
});
