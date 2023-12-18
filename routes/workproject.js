const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const CheckAdmin=require("../middlewares/checkAdmin")

router.post("/list-member/:_id", refreshTokenMiddlerware, authMidddlerware,getdataproject.ListMember)
router.delete('/delete-existing-members/:_id', refreshTokenMiddlerware, authMidddlerware,CheckAdmin, getdataproject.DeleteExistingMembers)
router.patch('/restore-project/:_id', refreshTokenMiddlerware, authMidddlerware,CheckAdmin, getdataproject.restoreProject);
router.patch(
    '/editProject/:workProjectID',
    refreshTokenMiddlerware,
    authMidddlerware,
    getdataproject.editProjectInformation,
);
router.patch('/delete-project/:_id', refreshTokenMiddlerware, authMidddlerware,CheckAdmin, getdataproject.deleteProject);
router.post('/add-new-project/:_id',refreshTokenMiddlerware, authMidddlerware, getdataproject.addNewWork);
router.post('/workdetail', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkDetail);
router.post('/listwork', refreshTokenMiddlerware, authMidddlerware, getdataproject.getListWork);
router.post('/project/:_id', refreshTokenMiddlerware, authMidddlerware, getdataproject.getWorkProject);


module.exports = router;
