const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const issueController = require('../controllers/issueController');

//get
router.get('/children/:_idIssueParent', authMidddlerware, issueController.issuesChildren);
router.get('/:_idProject', authMidddlerware, issueController.ListIssuesProject);

//post
router.post('/:keyProject/add', authMidddlerware, permissions('create-issue'), issueController.addNewIssues);

//patch
router.patch(
    '/:keyProject/edit-information/:idIssue',
    authMidddlerware,
    permissions('update-issue'),
    issueController.editInformationIssue,
);

// delete
router.delete(
    '/:keyProject/:issueID',
    authMidddlerware,
    permissions('delete-issue'),
    issueController.deleteIssue,
);

module.exports = router;
