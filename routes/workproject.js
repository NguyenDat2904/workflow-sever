const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');

router.delete(
    '/delete-existing-members/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.DeleteExistingMembers,
);
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
router.post('/add-new-project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.addNewWork);
router.post('/workdetail', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkDetail);
router.post('/listwork', refreshTokenMiddlerware, authMidddlerware, getdataproject.getListWork);
router.post('/project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkProject);
router.post(
    '/send-email-to-user',
     refreshTokenMiddlerware,
     authMidddlerware,
     checkUserPermissions,
    getdataproject.sendEmailToUser,
);

router.post(
    '/add-members-to-project',
    //  refreshTokenMiddlerware,
    //  authMidddlerware,
    getdataproject.addMembersToProject,
);

module.exports = router;
