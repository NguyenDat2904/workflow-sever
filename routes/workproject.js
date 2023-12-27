const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const checkUserPermissions = require('../middlewares/checkUserPermissions');

router.get('/project-detail/:_id',
authMidddlerware,getdataproject.ProjectDetail)
router.post("/list-member/:_id", authMidddlerware,getdataproject.ListMember)
router.delete(
    '/delete-existing-members/:_id',

    authMidddlerware,
    checkUserPermissions,
    getdataproject.DeleteExistingMembers,
);
router.patch(
    '/restore-project/:_id',

    authMidddlerware,
    checkUserPermissions,
    getdataproject.restoreProject,
);

router.patch(
    '/editProject/:_id',

    authMidddlerware,
    checkUserPermissions,
    getdataproject.editProjectInformation,
);
router.patch(
    '/delete-project/:_id',

    authMidddlerware,
    checkUserPermissions,
    getdataproject.deleteProject,
);
router.post('/add-new-project/:_id', authMidddlerware, getdataproject.addNewWork);
router.post('/workdetail', authMidddlerware, getdataproject.getWorkDetail);
router.post('/listwork', authMidddlerware, getdataproject.getListWork);
router.post('/project/:_id', authMidddlerware, getdataproject.getWorkProject);

module.exports = router;
