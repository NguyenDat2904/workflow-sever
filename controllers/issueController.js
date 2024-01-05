const modelIssue = require('../models/issue');

const ListIssuesProject = async (req, res) => {
    try {
        //id user
        const { _idProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        if (!_idProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const lengthIssue = await modelIssue.find({ projectID: _idProject, parentIssue: null });
        const totalPage = Math.ceil(lengthIssue.length / 3);
        const checkCodeProject = await modelIssue
            .find({
                projectID: _idProject,
                parentIssue: null,
                $or: [
                    { summary: { $regex: search } },
                    { priority: { $regex: search } },
                    { issueType: { $regex: search } },
                ],
            })
            .populate({
                path: 'sprint',
            })
            .populate({
                path: 'assignee',
                select: '-passWord',
            })
            .populate({
                path: 'reporter',
                select: '-passWord',
            })
            .sort({ createdAt: -1 })
            .skip((skipPage - 1) * limitPage)
            .limit(limitPage);
        if (!checkCodeProject) {
            return req.status(400).json({
                message: 'codeProject does not exist',
            });
        }
        return res.status(200).json({
            dataListIssues: checkCodeProject,
            page: skipPage,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get list work',
        });
    }
};
//issuesChildren
const issuesChildren = async (req, res) => {
    try {
        const { _idIssueParent } = req.params;
        if (!_idIssueParent) {
            return res.status(400).json({
                message: 'is not id issue',
            });
        }
        const checkIssueParent = await modelIssue.find({ parentIssue: _idIssueParent });
        if (checkIssueParent.length === 0) {
            return res.status(400).json({
                message: 'is not issue children',
            });
        }
        return res.status(200).json(checkIssueParent);
    } catch (error) {
        return res.status(404).json({
            message: 'can not get issue parent',
        });
    }
};
// add new work
const addNewIssues = async (req, res) => {
    try {
        const {
            projectID,
            issueType,
            summary,
            description,
            assigneeID,
            reporterID,
            priority,
            sprintID,
            storyPointEstimate,
            startDate,
            dueDate,
        } = req.body;
        if (!summary) {
            return res.status(400).json({
                message: 'A summary is required',
            });
        }
        const newStartDate = new Date(startDate);
        const newDueDate = new Date(dueDate);
        const newIssues = new modelIssue({
            projectID,
            issueType,
            status: 'TODO',
            summary,
            description,
            assignee: assigneeID,
            reporter: reporterID,
            priority,
            sprint: sprintID,
            storyPointEstimate,
            startDate: newStartDate || new Date(),
            dueDate: newDueDate,
            parentIssue: null,
        });
        await newIssues.save();
        return res.status(200).json({
            message: 'add new issue successfully',
            data: newIssues,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not add work',
        });
    }
};

//edit information
const editInformationIssue = async (req, res) => {
    try {
        const { idIssue } = req.params;
        const { fillName, content } = req.body;
        if (!fillName || !content) {
            return res.status(400).json({
                message: 'is not fillName or content',
            });
        }
        const newDueDate = new Date(content);
        const checkIssue = await modelIssue.findById({ _id: idIssue });

        if (!checkIssue) {
            return res.status(404).json({
                message: 'idIssue not found',
            });
        }

        switch (fillName) {
            case 'summary':
                checkIssue.summary = content;
                break;

            case 'status':
                checkIssue.status = content;

                break;
            case 'priority':
                checkIssue.priority = content;

                break;
            case 'assignee':
                checkIssue.assignee = content;

                break;
            case 'reporter':
                checkIssue.reporter = content;

                break;
            case 'startDate':
                checkIssue.startDate = newDueDate;

                break;
            case 'dueDate':
                checkIssue.dueDate = newDueDate;
                break;
            default:
                return res.status(400).json({
                    message: 'FillName does not exist',
                });
        }
        await checkIssue.save();
        return res.status(200).json(checkIssue);
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            error: error.message,
        });
    }
};
//delete issue
const deleteIssue = async (req, res) => {
    const { issueID } = req.params;

    if (!issueID) {
        return res.status(400).json({
            message: 'issueID not found',
        });
    }

    const issue = await modelIssue.findByIdAndDelete({ _id: issueID });
    if (!issue) {
        return res.status(400).json({
            message: 'Deleting issue failed',
        });
    }

    res.json({
        message: 'Deleted issue successfully',
    });
};

module.exports = {
    editInformationIssue,
    ListIssuesProject,
    addNewIssues,
    issuesChildren,
    deleteIssue,
};
