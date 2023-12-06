const express = require('express');
const router = express.Router();
const Login = require('../controllers/usersController');
const authMidddlerware = require('../middlerwares/authMiddleware');
const refreshTokenMiddlerware = require('../middlerwares/refreshTokenMiddleware');

/* GET users listing. */
router.post('/login', Login.Login);
router.post('/forgot', Login.Forgot);
router.patch('/forgot/changePassword/:_id', Login.NewPassword);
router.post('/loginGoogle', Login.LoginGoogle);
router.patch('/profile/changePassword/:_id', refreshTokenMiddlerware, authMidddlerware, Login.ProfileChangePassword);

module.exports = router;
