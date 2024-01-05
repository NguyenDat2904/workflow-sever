const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const ListProjectController = require('../controllers/listWorkController');

//get
router.get('/children/:_idIssueParent', authMidddlerware, ListProjectController.issuesChildren);
router.get('/:_idProject', authMidddlerware, ListProjectController.ListIssuesProject);

//post
router.post('/:keyProject/add', authMidddlerware, permissions('create-issue'), ListProjectController.addNewIssues);

//patch
router.patch(
    '/:keyProject/edit-information/:idIssue',
    authMidddlerware,
    permissions('update-issue'),
    ListProjectController.editInformationIssue,
);

// delete
router.delete(
    '/:keyProject/:issueID',
    authMidddlerware,
    permissions('delete-issue'),
    ListProjectController.deleteIssue,
);

module.exports = router;
