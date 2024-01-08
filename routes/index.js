var express = require('express');
var router = express.Router();
const users = require('./users.route');
const authRoute = require('./auth.route');

// auth route
router.get('/', () => {
    console.log('some');
});
router.use('/auth', authRoute);

module.exports = router;
