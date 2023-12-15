const express = require('express');
const router = express.Router();
const getdataproject = require('../controllers/workProjectController');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');

router.patch("/delete-project/:_id",getdataproject.deleteProject)
router.post("/add-new-project/:_id",getdataproject.addNewWork)
router.post("/workdetail",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkDetail)
router.post("/listwork",refreshTokenMiddlerware,authMidddlerware,getdataproject.getListWork)
router.patch(
    '/editProject/:workProjectID',
    refreshTokenMiddlerware,
    authMidddlerware,
    getdataproject.editProjectInformation,
);
router.get("/project/:_id",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkProject)

module.exports = router;
