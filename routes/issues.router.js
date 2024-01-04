const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const ListProjectController = require('../controllers/listWorkController');
const checkUserPermissions = require('../middlewares/checkUserPermissions');

//get
router.get('/:_idProject', authMidddlerware, ListProjectController.ListIssuesProject);

//post
router.post('/add-new-issue', authMidddlerware, ListProjectController.addNewIssues);
router.post('/add-new-sprint', authMidddlerware, ListProjectController.addNewSprint);

// delete
router.delete('/:keyProject/:issueID', authMidddlerware, checkUserPermissions('delete-issue'), ListProjectController.deleteIssue)

module.exports = router;
