const express = require('express');
const  router = express.Router();
const authMidddlerware=require('../middlewares/authMiddleware')
const permissions=require('../middlewares/checkUserPermissions')
const ListProjectController= require('../controllers/listWorkController')

//get
router.get('/broad/:idProject',ListProjectController.listIssuesBroad)
router.get('/of-sprint/:_idProject',authMidddlerware,ListProjectController.ListSprint)
router.get('/children/:_idIssueParent',authMidddlerware,ListProjectController.issuesChildren)
router.get('/:_idProject',authMidddlerware,ListProjectController.ListIssuesProject) 
//post
router.post('/add-new-issue/:keyProject',authMidddlerware,permissions('create-issue'),ListProjectController.addNewIssues)
router.post('/add-new-sprint/:keyProject',authMidddlerware,permissions('create-sprint'),ListProjectController.addNewSprint)
//patch
router.patch('/edit-information/:idIssue',authMidddlerware,ListProjectController.editInformationIssue)

// delete
router.delete('/:keyProject/:issueID', authMidddlerware, permissions('delete-issue'), ListProjectController.deleteIssue)

module.exports = router;
