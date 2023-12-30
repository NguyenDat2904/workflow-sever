const express = require('express');
const router = express.Router();
const WorkProjectController = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');
const ListProjectController = require('../controllers/listWorkController');

// list work
router.get('/issues/:codeProject',authMidddlerware,ListProjectController.ListWorkProject) 
//
// patch
router.patch('/:keyProject/restore-project', authMidddlerware, checkUserPermissions, WorkProjectController.restoreProject);
router.patch(
    '/:keyProject',
    authMidddlerware,
    checkUserPermissions,
    WorkProjectController.editProjectInformation,
);
router.patch('/:keyProject/delete', authMidddlerware, checkUserPermissions, WorkProjectController.deleteProject);
router.patch(
    '/:keyProject/update-permissions',
    authMidddlerware,
    checkUserPermissions,
    WorkProjectController.updatePermissions,
);
router.patch('/:keyProject/add-members-to-project', checkVerifyToken, WorkProjectController.addMembersToProject);
// post
router.post('/create', authMidddlerware, WorkProjectController.addNewWork);
router.get('/work-detail/:parentIssue', authMidddlerware, WorkProjectController.getWorkDetail);
router.get('/list-work', authMidddlerware, WorkProjectController.getListWork);
router.get('/list', authMidddlerware, WorkProjectController.getWorkProject);
router.post('/send-email-to-user', authMidddlerware, checkUserPermissions, WorkProjectController.sendEmailToUser);
router.get('/list-member',authMidddlerware, WorkProjectController.ListMember);

// get
router.get('/project-detail/:codeProject', authMidddlerware, WorkProjectController.ProjectDetail);

// delete
router.delete(
    '/:keyProject/members/:_idMemberDelete',
    authMidddlerware,
    checkUserPermissions,
    WorkProjectController.DeleteExistingMembers,
);
module.exports = router;
