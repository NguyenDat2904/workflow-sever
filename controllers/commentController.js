const modelComment = require('../models/comment');
const modelIssue = require('../models/issue');

const listComment = async (req, res) => {
    try {
        const { issueID } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const comments = await modelComment
            .find({ issueID })
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
        const { content, issueID } = req.body;
        const { _id } = req.user;

        const issue = await modelIssue.findById({ _id: issueID });
        if (!issue)
            return res.status(400).json({
                message: 'issueID not found',
            });

        const newComment = new modelComment({
            issueID,
            authorID: _id,
            content,
            commentTime: new Date(),
        });

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
