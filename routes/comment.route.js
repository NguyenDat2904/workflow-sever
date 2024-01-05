const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddlerware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add', authMiddlerware, commentController.addComment);

module.exports = router;
