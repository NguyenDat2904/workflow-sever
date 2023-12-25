const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');
const checkVerifyToken = require('../middlewares/checkVerifyToken');


router.post('/list-member/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.ListMember);
router.patch(
    '/restore-project/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.restoreProject,
);

router.patch(
    '/edit-project/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.editProjectInformation,
);
router.patch(
    '/delete-project/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.deleteProject,
);
router.patch(
    '/update-permissions/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.updatePermissions,
);
router.patch('/add-members-to-project/:_id', checkVerifyToken, getdataproject.addMembersToProject);

router.post('/add-new-project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.addNewWork);
router.post('/workdetail', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkDetail);
router.post('/listwork', refreshTokenMiddlerware, authMidddlerware, getdataproject.getListWork);
router.post('/project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkProject);
router.post(
    '/send-email-to-user/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.sendEmailToUser,
);
router.get('/project-detail/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.ProjectDetail);

router.delete(
    '/delete-existing-members/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.DeleteExistingMembers,
);
module.exports = router;
