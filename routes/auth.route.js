const express = require('express');
const router = express.Router();
const getUsers = require('../controllers/usersController');
const AuthController = require('../controllers/authController');

// post /auth/verify
router.post('/verify', AuthController.verify);

// post /auth/register
router.post('/register', AuthController.register);

module.exports = router;