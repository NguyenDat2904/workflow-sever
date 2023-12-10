const express = require('express');
const router = express.Router();
const getdataproject=require("../controllers/workProjectController")
const authMidddlerware = require('../middlerwares/authMiddleware');
const refreshTokenMiddlerware = require('../middlerwares/refreshTokenMiddleware');

router.get("/workdetail",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkDetail)
router.post("/listwork",refreshTokenMiddlerware,authMidddlerware,getdataproject.getListWork)
router.post("/project/:_id",refreshTokenMiddlerware,authMidddlerware,getdataproject.getWorkProject)

module.exports = router;