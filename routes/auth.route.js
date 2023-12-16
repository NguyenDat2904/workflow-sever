const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');
const AuthController = require('../controllers/authController');
const checkVerifyToken = require('../middlewares/checkVerifyToken');

// post /auth/verify
router.post('/verify', AuthController.verify);

// post /auth/register
router.post('/register', checkVerifyToken, AuthController.register);

module.exports = router;
