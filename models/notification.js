const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationModal = new Schema(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        link: { type: String },
        title: { type: String },
        content: { type: String },
        notificationTime: { type: Date },
        read: { type: Boolean },
    },

    { timestamps: true },
    { collection: 'notifications' },
);

module.exports = mongoose.model('notifications', NotificationModal);
