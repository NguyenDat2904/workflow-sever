const express = require('express');
const router = express.Router();
const authMidddlerware = require('../middlewares/authMiddleware');
const permissions = require('../middlewares/checkUserPermissions');
const issueController = require('../controllers/issueController');

//get
router.get('/search',authMidddlerware,issueController.searchIssues)
router.get('/yourWork',authMidddlerware,issueController.issueYourWork)
router.get('/:codeProject/detail',authMidddlerware,issueController.issueDetail)
router.get('/broad/:codeProject',authMidddlerware,issueController.listIssuesBroad)
router.get('/children/:_idIssueParent', authMidddlerware, issueController.issuesChildren);
router.get('/:codeProject', authMidddlerware, issueController.listIssuesProject);

//post
router.post('/:codeProject/add', authMidddlerware, permissions('create-issue'), issueController.addNewIssues);

//patch
router.patch(
    '/:codeProject/edit-information/:idIssue',
    authMidddlerware,
    permissions('update-issue'),
    issueController.editInformationIssue,
);
router.patch(
    '/:codeProject/change-parent/:idIssue',
    authMidddlerware,
    permissions('update-issue'),
    issueController.changeParent,
);

// delete
router.delete(
    '/:codeProject/:issueID',
    authMidddlerware,
    permissions('delete-issue'),
    issueController.deleteIssue,
);

module.exports = router;
