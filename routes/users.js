const express = require('express');
const router = express.Router();
const Login=require("../controllers/usersController");
const authMidddlerware=require("../middlewares/authMiddlerware")

/* GET users listing. */
router.post("/login",Login.Login)
router.post("/forgot",Login.Forgot)
router.patch("/forgot/changePassword/:_id",Login.NewPassword)


module.exports = router;
