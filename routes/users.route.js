const express = require('express');
const multer = require('multer');
const router = express.Router();
const login = require('../controllers/usersController');
const verifyEmail = require('../middlewares/checkVerifyToken');
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const newAccess = require('../controllers/newToken');
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
router.get('/new-access', refreshTokenMiddlerware, newAccess);
router.patch('/uploadimg', authMidddlerware, upload.fields([{ name: 'img' }, { name: 'imgCover' }]), login.uploadImg);
router.patch('/updateUser/background', authMidddlerware, login.updateBackgroundAndContent);
router.patch('/updateUser', authMidddlerware, login.updateInfoUser);
router.post('/login', login.login);
router.post('/forgot', login.forgot);
router.patch('/forgot/changePassword', verifyEmail, login.newPassword);
router.post('/loginGoogle', login.loginGoogle);
router.patch('/profile/changePassword', authMidddlerware, login.ProfileChangePassword);
router.get('/', authMidddlerware, login.getUser);

module.exports = router;
