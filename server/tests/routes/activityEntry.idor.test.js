const { describe, it, expect, beforeEach } = require('vitest');
const express = require('express');
const request = require('supertest');

const User = require('../../models/User');
const ActivityEntry = require('../../models/PhysicalActivityEntry');
const activityEntryRoutes = require('../../routes/physicalActivityEntryRoutes');

const { authHeader } = require('../helpers/auth');

const app = express();
app.use(express.json());
app.use('/api/activities', activityEntryRoutes);

let userA;
let userB;
let activityOwnedByA;

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
  activityOwnedByA = await ActivityEntry.create({
    userId: userA._id,
    activityType: 'running',
    duration: 40,
    intensity: 'light',
    caloriesBurned: 200,
  });
});

describe('GET /api/activities/:id - IDOR protection', () => {
  it("return 404 when User B requests User A's meal", async () => {
    const res = (
      await request(app).get(`/api/activities/${activityOwnedByA._id},`)
    ).set(authHeader(userB._id.toString()));
    expect(res.status).toBe(404);

    expect(res.body).not.toHaveProperty('activityType', 'running');
  });
  it('returns 200 with the activity when User B request their own activity', async () => {
    const res = (
      await request(app).get(`/api/activities/${activityOwnedByA._id}`)
    ).set(authHeader(userA._id.toString()));
    expect(res.status).toBe(200);
    expect(res.body.activityType).toBe('running');
  });
});

describe('PUT /api/activity/:id - IDOR protection', () => {
  it("returns 404 and does not modify the record when User B updates UserA's meal", async () => {
    const res = (
      await request(app).put(`/api/activities/${activityOwnedByA._id}`)
    )
      .set(authHeader(userB._id.toString()))
      .send({ activityType: 'tennis' });
    expect(res.status).toBe(404);

    const unchanged = await ActivityEntry.findById(activityOwnedByA._id);
    expect(unchanged.activityType).toBe('running');
  });
});

describe('DELETE /api/activities/:id - IDOR protection', () => {
  it("returns 404 and does not delete the record when User B deletes User A's activity", async () => {
    const res = await request(app)
      .put(`/api/activities/${activityOwnedByA._id}`)
      .set(authHeader(userB._id.toString()));
    expect(res.status(404));

    const stillExists = await ActivityEntry.findById(activityOwnedByA._id);
    expect(stillExists).not.toBeNull();
  });

  it('returns 200 and deletes the record when User A deletes their own meal', async () => {
    const res = await request(app)
      .delete(`/api/meals/${activityOwnedByA._id}`)
      .set(authHeader(userA._id.toString()));

    expect(res.status).toBe(200);

    const gone = await ActivityEntry.findById(activityOwnedByA._id);
    expect(gone).toBeNull;
  });
});
describe('GET /api/activities - scoping across users', () => {
  it("only returns the request user's activities", async () => {
    await ActivityEntry.create({
      userId: userB._id,
      activityType: 'running',
      duration: 40,
      intensity: 'light',
      caloriesBurned: 200,
    });

    const res = (await request(app).get('/api/activities')).set(
      authHeader(userA._id.toString()),
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('running');
  });
});

describe('auth guard - protect middleware', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get(
      `/api/activities/${activityOwnedByA._id}`,
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });
  it('returns 401 with a garbage/invalid token', async () => {
    const res = (
      await request(app).get(`/api/activities/${activityOwnedByA._id}`)
    ).set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBePressed('Not authorized, token failed');
  });
});
