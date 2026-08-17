const { describe, it, expect, beforeEach } = require('vitest');
const express = require('express');
const request = require('supertest');

const User = require('../../models/User');
const MealEntry = require('../../models/MealEntry');
const mealEntryRoutes = require('../../routes/mealEntryRoutes'); // adjust path if named differently
const { authHeader } = require('../helpers/auth');

const app = express();
app.use(express.json());
app.use('/api/meals', mealEntryRoutes);

let userA;
let userB;
let mealOwnedByA;

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

  mealOwnedByA = await MealEntry.create({
    userId: userA._id,
    name: 'Chicken and Rice',
    calories: 500,
    fat: 10,
    carbohydrates: 60,
    protein: 40,
    mealDate: new Date('2026-03-10'),
    mealType: 'lunch',
    quantity: 1,
  });
});

describe('GET /api/meals/:id — IDOR protection', () => {
  it("returns 404 when User B requests User A's meal", async () => {
    const res = await request(app)
      .get(`/api/meals/${mealOwnedByA._id}`)
      .set(authHeader(userB._id.toString()));

    expect(res.status).toBe(404);
    // The failure mode we're guarding against is data leakage, not just a
    // wrong status code — confirm the body never contains A's meal data.
    expect(res.body).not.toHaveProperty('name', 'Chicken and Rice');
  });

  it('returns 200 with the meal when User A requests their own meal', async () => {
    const res = await request(app)
      .get(`/api/meals/${mealOwnedByA._id}`)
      .set(authHeader(userA._id.toString()));

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Chicken and Rice');
  });
});

describe('PUT /api/meals/:id — IDOR protection', () => {
  it("returns 404 and does not modify the record when User B updates User A's meal", async () => {
    const res = await request(app)
      .put(`/api/meals/${mealOwnedByA._id}`)
      .set(authHeader(userB._id.toString()))
      .send({ name: 'Hacked Name' });

    expect(res.status).toBe(404);

    // The strongest form of this assertion: go straight to the DB and
    // confirm the record genuinely wasn't touched, not just that the
    // response looked right.
    const unchanged = await MealEntry.findById(mealOwnedByA._id);
    expect(unchanged.name).toBe('Chicken and Rice');
  });
});

describe('DELETE /api/meals/:id — IDOR protection', () => {
  it("returns 404 and does not delete the record when User B deletes User A's meal", async () => {
    const res = await request(app)
      .delete(`/api/meals/${mealOwnedByA._id}`)
      .set(authHeader(userB._id.toString()));

    expect(res.status).toBe(404);

    const stillExists = await MealEntry.findById(mealOwnedByA._id);
    expect(stillExists).not.toBeNull();
  });

  it('returns 200 and deletes the record when User A deletes their own meal', async () => {
    const res = await request(app)
      .delete(`/api/meals/${mealOwnedByA._id}`)
      .set(authHeader(userA._id.toString()));

    expect(res.status).toBe(200);

    const gone = await MealEntry.findById(mealOwnedByA._id);
    expect(gone).toBeNull();
  });
});

describe('GET /api/meals — scoping across users', () => {
  it("only returns the requesting user's meals, never another user's", async () => {
    await MealEntry.create({
      userId: userB._id,
      name: "User B's Meal",
      calories: 300,
      fat: 5,
      carbohydrates: 30,
      protein: 20,
      mealDate: new Date('2026-03-10'),
      mealType: 'breakfast',
      quantity: 1,
    });

    const res = await request(app)
      .get('/api/meals')
      .set(authHeader(userA._id.toString()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Chicken and Rice');
  });
});

describe('auth guard — protect middleware', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get(`/api/meals/${mealOwnedByA._id}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });

  it('returns 401 with a garbage/invalid token', async () => {
    const res = await request(app)
      .get(`/api/meals/${mealOwnedByA._id}`)
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, token failed');
  });
});
