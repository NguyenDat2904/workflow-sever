const modelComment = require('../models/comment');
const modelIssue = require('../models/issue');

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
    const { commentID } = req.params;
    const { content } = req.body;
};

module.exports = { addComment, editComment };
