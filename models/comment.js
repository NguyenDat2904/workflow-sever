const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentModal = new Schema(
    {
        issueID: { type: mongoose.Schema.Types.ObjectId, ref: 'issues' },
        authorID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        content: { type: String },
        commentTime: { type: Date },
    },

    { timestamps: true },
    { collection: 'comments' },
);

module.exports = mongoose.model('comments', CommentModal);
