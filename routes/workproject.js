const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');

router.patch(
    '/restore-project/:_id',
    refreshTokenMiddlerware,
    authMidddlerware,
    checkUserPermissions,
    getdataproject.restoreProject,
);
router.patch(
    '/editProject/:_id',
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
router.post('/add-new-project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.addNewWork);
router.post('/project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkProject);
router.get('/project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkProject);

module.exports = router;
