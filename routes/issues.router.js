const express = require('express');
const  router = express.Router();
const authMidddlerware=require('../middlewares/authMiddleware')
const ListProjectController= require('../controllers/listWorkController')

//get
router.get('/:_idProject',authMidddlerware,ListProjectController.ListIssuesProject) 
//post
router.post('/add-new-issue',authMidddlerware,ListProjectController.addNewIssues)
router.post('/add-new-sprint',authMidddlerware,ListProjectController.addNewSprint)


module.exports=router