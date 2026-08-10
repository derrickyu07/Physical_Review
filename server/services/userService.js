const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const DEMO_USER_EMAIL = 'demo@physicalreview.app';

async function getUserByEmailService(email) {
  const user = await User.findOne({ email });
  return user;
}

async function createUserService({ password, name, email }) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: passwordHash });
  return user;
}

async function getUserProfileByIdService(userId) {
  const user = await User.findById(userId).select('-password');

  return user;
}

async function updateUserService({ userId, name, email }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name, email } },
    { returnDocument: 'after', runValidators: true },
  ).select('-password');
  return user;
}

async function getAllUsersService() {
  const users = await User.find().select('-password');
  return users;
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function getOrCreateDemoUserService() {
  let user = await getUserByEmailService(DEMO_USER_EMAIL);
  if (!user) {
    user = await createUserService({
      name: 'demoUser',
      email: DEMO_USER_EMAIL,
      password: crypto.randomBytes(16).toString('hex'),
    });
  }
  return user;
}

module.exports = {
  getUserByEmailService,
  createUserService,
  getUserProfileByIdService,
  updateUserService,
  getAllUsersService,
  generateToken,
  verifyPassword,
  getOrCreateDemoUserService,
};
