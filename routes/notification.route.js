const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// get
router.get('/', authMiddleware, notificationController.getNotifications);

// post
router.post('/add', authMiddleware, notificationController.addNotification);

// patch
router.patch('/edit/:notificationID', authMiddleware, notificationController.editNotification,);

// delete
router.delete('/:notificationID', authMiddleware, notificationController.deleteNotification);

module.exports = router;
