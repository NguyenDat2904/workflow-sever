const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const SprintController = require('../controllers/sprintController');

// get
router.get('/list/:_idProject', authMidddlerware, SprintController.ListSprint);

// post
router.post('/:codeProject/add', authMidddlerware, permissions('create-sprint'), SprintController.addNewSprint);

module.exports = router;
