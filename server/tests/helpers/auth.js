import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Generates a valid JWT for a given (or freshly generated) user id,
 * matching the payload shape your auth controller issues.
 * Use this to hit `protect`-guarded routes in Supertest without
 * going through the real login flow every time.
 */
export function makeAuthToken(
  userId = new mongoose.Types.ObjectId().toString(),
) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function authHeader(userId) {
  return { Authorization: `Bearer ${makeAuthToken(userId)}` };
}
