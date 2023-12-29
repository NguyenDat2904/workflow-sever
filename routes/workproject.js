const express = require('express');
const router = express.Router();
const WorkProjectController = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');
const ListProjectController=require('../controllers/listWorkController')

// list work
router.post('/list-work',ListProjectController.ListWorkProject) 
//
// patch
router.patch('/restore-project/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.restoreProject);

router.patch('/editProject/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.editProjectInformation);
router.patch('/delete-project/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.deleteProject);
router.patch('/update-permissions/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.updatePermissions);
router.patch('/add-members-to-project/:_id', checkVerifyToken, WorkProjectController.addMembersToProject);
router.patch('/update-permissions/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.updatePermissions);

// post
router.post('/add-new-project/:_id', authMidddlerware, WorkProjectController.addNewWork);
router.post('/workdetail', authMidddlerware, WorkProjectController.getWorkDetail);
router.post('/listwork', authMidddlerware, WorkProjectController.getListWork);
router.post('/project/:_id', authMidddlerware, WorkProjectController.getWorkProject);
router.post('/send-email-to-user/:_id', authMidddlerware, checkUserPermissions, WorkProjectController.sendEmailToUser);
router.post('/list-member/:_id', authMidddlerware, WorkProjectController.ListMember);

// get
router.get('/project-detail/:codeProject', authMidddlerware, WorkProjectController.ProjectDetail);

// delete
router.delete(
    '/delete-existing-members/:_id',
    authMidddlerware,
    checkUserPermissions,
    WorkProjectController.DeleteExistingMembers,
);
module.exports = router;
