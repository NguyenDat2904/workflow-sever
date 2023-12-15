const express = require('express');
const router = express.Router();
const getdataproject=require("../controllers/workProjectController")
const authMidddlerware = require('../middlerwares/authMiddleware');
const refreshTokenMiddlerware = require('../middlerwares/refreshTokenMiddleware');

router.delete("/delete-project/:_id",refreshTokenMiddlerware,authMidddlerware,getdataproject.deleteProject)
router.post("/add-new-project/:_id",refreshTokenMiddlerware,authMidddlerware,getdataproject.addNewWork)
router.post("/workdetail",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkDetail)
router.post("/listwork",refreshTokenMiddlerware,authMidddlerware,getdataproject.getListWork)
router.get("/project/:_id",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkProject)

module.exports = router;