const modelProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modelSprint = require('../models/modelSprint');

const ListIssuesProject = async (req, res) => {
    try {
        //id user
        const { _idProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        if (!_idProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const lengthListWork = await modelListWork.find({ projectID: _idProject, parentIssue: null });
        const totalPage = Math.ceil(lengthListWork.length / 3);
        const checkCodeProject = await modelListWork
            .find({ projectID: _idProject, parentIssue: null })
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
        const newIssues = new modelListWork({
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
// add sprint
const addNewSprint = async (req, res) => {
    try {
        const { projectID, name, startDate, endDate, sprintGoal, status } = req.body;
        if (!projectID || !name || !startDate || !endDate || !sprintGoal || !status) {
            return res.status(400).json({
                message: 'not enough information',
            });
        }
        const checkName = await modelSprint.findOne({ name });
        if (checkName) {
            return res.status(400).json({
                message: 'name already exists',
            });
        }
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        const newIssue = new modelSprint({
            projectID,
            name,
            startDate: newStartDate || new Date(),
            endDate: newEndDate,
            sprintGoal,
            status,
        });
        await newIssue.save();
        return res.status(200).json({
            message: 'add new successfully',
            data: newIssue,
        });
    } catch (error) {
        return res.status(404).json({
            message: 'can not add new',
        });
    }
};

const deleteIssue = async (req, res) => {
    const { issueID, keyProject } = req.params;

    if (!issueID) {
        return res.status(400).json({
            message: 'issueID not found',
        });
    }
    const project = await modelProject.findOne({ codeProject: keyProject });
    if (!project) {
        return res.status(400).json({
            message: 'keyProject not found',
        });
    }

    const issue = await modelListWork.findByIdAndDelete({ _id: issueID });
    if (!issue) {
        return res.status(400).json({
            message: 'Deleting issue failed',
        });
    }

    const index = project.listWorkID.toString().indexOf(issueID);
    project.listWorkID.splice(index, 1);

    await project.save();
    res.json({
        message: 'Deleted issue successfully',
    });
};
module.exports = { ListIssuesProject, addNewIssues, addNewSprint, deleteIssue };
