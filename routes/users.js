const express = require('express');
const router = express.Router();
const Login=require("../controller/usersController");

/* GET users listing. */
router.post("/",Login)

module.exports = router;
