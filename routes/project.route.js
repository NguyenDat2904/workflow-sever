const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');

//
// patch
router.patch(
    '/:keyProject/restore-project',
    authMidddlerware,
    checkUserPermissions,
    projectController.restoreProject,
);
router.patch(
    '/:keyProject',
    authMidddlerware,
    checkUserPermissions('update-project'),
    projectController.editProjectInformation,
);
router.patch('/:keyProject/delete', authMidddlerware, checkUserPermissions('delete-project'), projectController.deleteProject);
router.patch(
    '/:keyProject/update-permissions',
    authMidddlerware,
    checkUserPermissions('update-project'),
    projectController.updatePermissions,
);
router.patch('/:keyProject/member/add', checkVerifyToken, projectController.addMembersToProject);

// post
router.post('/create', authMidddlerware, projectController.addNewWork);
router.post(
    '/:keyProject/send-email',
    authMidddlerware,
    checkUserPermissions('update-project'),
    projectController.sendEmailToUser,
);

// get
router.get('/list-member', authMidddlerware, projectController.listMember);
router.get('/project-detail/:codeProject', authMidddlerware, projectController.projectDetail); 
router.get('/list', authMidddlerware, projectController.getProject);

// delete
router.delete(
    '/:keyProject/members/:_idMemberDelete',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    projectController.deleteExistingMembers,
);
router.delete(
    '/:keyProject/delete-the-project-directly/:idProject',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    projectController.deleteTheProjectDirectly,
);
module.exports = router;
