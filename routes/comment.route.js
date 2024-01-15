const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddlerware = require('../middlewares/authMiddleware');
const router = express.Router();


// get
router.get('/list/:issueID', authMiddlerware, commentController.listComment);

// post
router.post('/add', authMiddlerware, commentController.addComment);

// patch
router.patch('/edit/:commentID', authMiddlerware, commentController.editComment);

// delete
router.delete('/delete/:commentID', authMiddlerware, commentController.deleteComment);

module.exports = router;
