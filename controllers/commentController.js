const modelComment = require('../models/comment');
const modelIssue = require('../models/issue');
const modelNotification = require('../models/notification');
// const { io } = require('../app');

const listComment = async (req, res) => {
    try {
        const { issueID } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const issue = await modelIssue.findOne({ name: issueID });
        if (!issue) {
            return res.status(400).json({
                message: 'not found issue',
            });
        }
        const comments = await modelComment
            .find({ issueID: issue._id })
            .populate({ path: 'authorID', select: '-passWord' })
            .skip((skip - 1) * limit)
            .limit(limit);

        if (!comments)
            return res.status(400).json({
                message: 'not found comments',
            });
        res.json(comments.reverse());
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { content, nameIssue, mentionUsers } = req.body;
        const { _id, name } = req.user;

        const issue = await modelIssue.findOne({ name: nameIssue }).populate({
            path: 'projectID',
            select: 'codeProject',
        });
        if (!issue)
            return res.status(400).json({
                message: 'issueID not found',
            });

        const newComment = new modelComment({
            issueID: issue._id,
            authorID: _id,
            mentionUsers,
            content,
            commentTime: new Date(),
        });
        if (mentionUsers?.length > 0) {
            mentionUsers.forEach(async (id) => {
                const newNotification = new modelNotification({
                    userID: id,
                    reporter: _id,
                    link: `${process.env.URL_FE}/projects/${issue.projectID.codeProject}/issues/${issue.name}`,
                    title: `${name} mentioned you in a comment`,
                    content,
                    notificationTime: new Date(),
                    read: false,
                });
                await newNotification.save();
            });
        }
        await newComment.save();
        res.json({
            message: 'Successfully created new comment',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

const editComment = async (req, res) => {
    try {
        const { commentID } = req.params;
        const { content } = req.body;
        const { _id } = req.user;

        const comment = await modelComment.findById({ _id: commentID });
        if (!comment)
            return res.status(400).json({
                message: 'commentID not found',
            });
        if (comment.authorID.toString() !== _id)
            return res.status(400).json({
                message: 'The user does not have editing rights',
            });

        comment.content = content;
        await comment.save();
        res.json({
            message: 'edit comment successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};

const deleteComment = async (req, res) => {
    const { commentID } = req.params;

    const deleteComment = await modelComment.findByIdAndDelete({ _id: commentID });
    if (!deleteComment)
        return res.status(400).json({
            message: 'Deleting comment failed',
        });

    res.json({
        message: 'Deleted comment successfully',
    });
};

module.exports = { addComment, editComment, deleteComment, listComment };
