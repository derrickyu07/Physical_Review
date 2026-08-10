const express = require('express');
const router = express.Router();

const validation = require('../middleware/validationMiddleware');
const protect = require('../middleware/authMiddleware');
const {
  registerUserValidation,
  loginUserValidation,
  updateUserValidation,
} = require('../validators/userValidator');

const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser,
  getOrCreateDemoUser,
} = require('../controllers/userController');

router.post('/register', registerUserValidation, validation, registerUser);

router.post('/login', loginUserValidation, validation, loginUser);

router.get('/profile', getUserProfile);

router.get('/getAllUsers', protect, getAllUsers);

router.put(
  '/updateUser',
  updateUserValidation,
  validation,
  protect,
  updateUser,
);

router.post('/getOrCreateDemoUser', getOrCreateDemoUser);

module.exports = router;
