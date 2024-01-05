const express = require('express');
const router = express.Router();
const WorkProjectController = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');

//
// patch
router.patch(
    '/:keyProject/restore-project',
    authMidddlerware,
    checkUserPermissions,
    WorkProjectController.restoreProject,
);
router.patch(
    '/:keyProject',
    authMidddlerware,
    checkUserPermissions('update-project'),
    WorkProjectController.editProjectInformation,
);
router.patch('/:keyProject/delete', authMidddlerware, checkUserPermissions('delete-project'), WorkProjectController.deleteProject);
router.patch(
    '/:keyProject/update-permissions',
    authMidddlerware,
    checkUserPermissions('update-project'),
    WorkProjectController.updatePermissions,
);
router.patch('/:keyProject/member/add', checkVerifyToken, WorkProjectController.addMembersToProject);

// post
router.post('/create', authMidddlerware, WorkProjectController.addNewWork);
router.post(
    '/:keyProject/send-email',
    authMidddlerware,
    checkUserPermissions('update-project'),
    WorkProjectController.sendEmailToUser,
);

// get
router.get('/list-member', authMidddlerware, WorkProjectController.ListMember);
router.get('/project-detail/:codeProject', authMidddlerware, WorkProjectController.ProjectDetail); 
router.get('/list', authMidddlerware, WorkProjectController.getWorkProject);

// delete
router.delete(
    '/:keyProject/members/:_idMemberDelete',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    WorkProjectController.DeleteExistingMembers,
);
router.delete(
    '/:keyProject/delete-the-project-directly/:idProject',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    WorkProjectController.DeleteTheProjectDirectly,
);
module.exports = router;
