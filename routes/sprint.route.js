const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const sprintController = require('../controllers/sprintController');

// get
router.get('/list/:codeProject', authMidddlerware, sprintController.listSprint);

// post
router.post('/:codeProject/add', authMidddlerware, permissions('create-sprint'), sprintController.addNewSprint);
//put
router.put('/:codeProject/update/:idSprint', authMidddlerware, permissions('update-sprint'),sprintController.editInformationSprint)
//patch
router.patch('/:codeProject/active/:idSprintComplete/:idSprintRunning',authMidddlerware, permissions('update-sprint'),sprintController.activeSprint)
//delete
router.delete('/:codeProject/:idSprint',authMidddlerware, permissions('delete-sprint'),sprintController.deleteSprint)
module.exports = router;
