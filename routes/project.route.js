const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');

//
// patch
router.patch(
    '/:codeProject/restore-project',
    authMidddlerware,
    checkUserPermissions,
    projectController.restoreProject,
);
router.patch(
    '/:codeProject',
    authMidddlerware,
    checkUserPermissions('update-project'),
    projectController.editProjectInformation,
);
router.patch('/:codeProject/delete', authMidddlerware, checkUserPermissions('delete-project'), projectController.deleteProject);
router.patch(
    '/:codeProject/update-permissions',
    authMidddlerware,
    checkUserPermissions('update-project'),
    projectController.updatePermissions,
);
router.patch('/:codeProject/member/add', checkVerifyToken, projectController.addMembersToProject);

// post
router.post('/create', authMidddlerware, projectController.addNewWork);
router.post(
    '/:codeProject/send-email',
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
    '/:codeProject/members/:_idMemberDelete',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    projectController.deleteExistingMembers,
);
router.delete(
    '/:codeProject/delete-the-project-directly/:idProject',
    authMidddlerware,
    checkUserPermissions('delete-project'),
    projectController.deleteTheProjectDirectly,
);
module.exports = router;
