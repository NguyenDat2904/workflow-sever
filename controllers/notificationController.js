const modelNotification = require('../models/notification');

const getNotifications = async (req, res) => {
    const { _id } = req.user;
    const skip = parseInt(req.query.skip) || 1;
    const limit = parseInt(req.query.limit) || 25;

    const notification = await modelNotification
        .find({ userID: _id })
        .skip((skip - 1) * limit)
        .limit(limit);
    if (!notification)
        return res.status(400).json({
            message: 'not found notification',
        });

    res.json(notification);
};

const addNotification = async (req, res) => {
    try {
        const { link, title, content } = req.body;
        const { _id } = req.user;

        if (!link || !title || !content)
            return res.status(400).json({
                message: 'not found link or title or content',
            });

        const newNotification = new modelNotification({
            userID: _id,
            link,
            title,
            content,
            notificationTime: new Date(),
            read: false,
        });

        await newNotification.save();
        res.json({
            message: 'added success notification',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

const editNotification = async (req, res) => {
    try {
        const { _id } = req.user;
        const { notificationID } = req.params;

        if (!notificationID)
            return res.status(400).json({
                message: 'not found notificationID',
            });

        const notification = await modelNotification.findOne({ $and: [{ _id: notificationID }, { userID: _id }] });
        if (!notification)
            return res.status(400).json({
                message: 'not found notification',
            });

        notification.read = true;
        await notification.save();
        res.json({
            message: 'Edited successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { _id } = req.user;
        const { notificationID } = req.params;

        if (!notificationID)
            return res.status(400).json({
                message: 'not found notificationID',
            });
        const deleteNotification = await modelNotification.findOneAndDelete({
            $and: [{ _id: notificationID }, { userID: _id }],
        });
        if (!deleteNotification)
            return res.status(400).json({
                message: 'Delete notification failed',
            });

        res.json({
            message: 'notification removed successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

module.exports = { getNotifications, addNotification, editNotification, deleteNotification };
