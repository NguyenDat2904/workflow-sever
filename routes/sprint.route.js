const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const sprintController = require('../controllers/sprintController');

// get
router.get('/list/:_idProject', authMidddlerware, sprintController.listSprint);

// post
router.post('/:keyProject/add', authMidddlerware, permissions('create-sprint'), sprintController.addNewSprint);

module.exports = router;
