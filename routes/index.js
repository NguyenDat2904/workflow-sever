const express = require('express');
const router = express.Router();
const postuser=require("../controllers/postUser")

/* GET home page. */
router.post('/', postuser);

module.exports = router;
