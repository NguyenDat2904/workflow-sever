const express = require('express');
const multer = require('multer');
const router = express.Router();
const Login = require('../controllers/usersController');
const authMidddlerware = require('../middlerwares/authMiddleware');
const refreshTokenMiddlerware = require('../middlerwares/refreshTokenMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname;
        const extension = originalName.split('.').pop();
        const filename = `${uniqueSuffix}.${extension}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
});
/* GET users listing. */
router.put('/uploadimg/:_id', upload.fields([{name:"img"},{name:"imgCover"}]),Login.uploadImg);
router.post('/updateUser/:_id', Login.updateInfoUser);
router.post('/login', Login.Login);
router.post('/forgot', Login.Forgot);
router.patch('/forgot/changePassword/:_id', Login.NewPassword);
router.post('/loginGoogle', Login.LoginGoogle);
router.patch('/profile/changePassword/:_id', refreshTokenMiddlerware, authMidddlerware, Login.ProfileChangePassword);

module.exports = router;
