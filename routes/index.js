var express = require('express');
var router = express.Router();
const users = require('./users');
const authRoute = require('./auth.route');

// auth route
router.use('/auth', authRoute);

module.exports = router;
