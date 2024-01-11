const modelIssue = require('../models/issue');
const modelSprint = require('../models/sprint');
const modelWorkProject = require('../models/project');
const modelNotification = require('../models/notification');
require('dotenv').config();

const listIssuesProject = async (req, res) => {
    try {
        //id user
        const { codeProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        const sprintID = req.query.sprintID;
        const parentIssueID = req.query.parentIssueID;
        const assignee = req.query.assignee;
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const checkProject = await modelWorkProject.findOne({ codeProject });
        const lengthIssue = await modelIssue.find({
            projectID: checkProject._id,
            ...(parentIssueID !== undefined && { parentIssue: parentIssueID === 'null' ? null : parentIssueID }),
        });
        const totalPage = Math.ceil(lengthIssue.length / 3);
        const checkCodeProject = await modelIssue
            .find({
                projectID: checkProject._id,
                ...(sprintID && {
                    sprint: sprintID,
                }),
                ...(parentIssueID !== undefined && { parentIssue: parentIssueID === 'null' ? null : parentIssueID }),
                ...(assignee && {
                    assignee: assignee,
                }),
                $or: [
                    { summary: { $regex: search } },
                    { priority: { $regex: search } },
                    { issueType: { $regex: search } },
                ],
            }).populate({path: 'projectID'})
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
const issueDetail = async (req, res) => {
    try {
        const { nameIssue,codeProject } = req.params;
        if (!nameIssue||!codeProject) {
            return res.status(404).json({
                message: 'is not id issue',
            });
        }
        const project =await modelWorkProject.findOne({codeProject})
        const issue = await modelIssue.findOne({ name: nameIssue,projectID:project._id}).populate({path: 'sprint'}).populate({path: 'projectID'}).populate({path: 'assignee',select: '-passWord'}).populate({path: 'reporter',select: '-passWord'});
        if(!issue){
            return res.status(404).json({
                message:"not found"
            })
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({
            message:error
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
        console.log();
        g;
        return res.status(404).json({
            message: 'can not get issue parent',
        });
    }
};
// add new work
const addNewIssues = async (req, res) => {
    try {
        const dataIssue = req.body;
        const { codeProject } = req.params;
        if (!dataIssue.summary) {
            return res.status(400).json({
                message: 'A summary is required',
            });
        }
        const project = await modelWorkProject.findOne({ codeProject });
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }
        const issue = await modelIssue.find({ projectID: project._id });
        const nameIssue = `${codeProject}-${issue.length + 1}`;
        const newIssues = new modelIssue(
            {...dataIssue,
            projectID:project._id,
            name:nameIssue }
        );
        await newIssues.save();
         if (dataIssue?.assignee) {
            const newNotification = new modelNotification({
                userID: dataIssue?.assignee,
                link: `${process.env.URL_ISSUE}/projects/${codeProject}/issues/${newIssues._id}`,
                title: `${req.user.name} assigned an issue to you`,
                content: `${dataIssue?.summary}`,
                createdAt: new Date(),
                read: false,
            });
            await newNotification.save();
        }
        res.json({
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
        const { idIssue, codeProject } = req.params;
        const updateData = req.body;
        if (!updateData) {
            return res.status(400).json({
                message: 'updateData is required',
            });
        }
        const checkIssue = await modelIssue.findById(idIssue);

        if (!checkIssue) {
            return res.status(404).json({
                message: 'idIssue not found',
            });
        }

        // Cập nhật dữ liệu dựa trên các trường trong updateData
        for (const field in updateData) {
            if (checkIssue[field] !== undefined) {
                checkIssue[field] = updateData[field];
            }
        }
        const issueEdit = await checkIssue.save();
        if (checkIssue.assignee === issueEdit.assignee) {
            const newNotification = new modelNotification({
                userID: checkIssue.assignee,
                link: `${process.env.URL_ISSUE}/projects/${codeProject}/issues/${checkIssue._id}`,
                title: `${req.user.name} changed a your issue`,
                content: `${checkIssue.summary}`,
                createdAt: new Date(),
                read: false,
            });
            await newNotification.save();
        }
        return res.status(200).json(issueEdit);
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
    if (issue) {
        const newNotification = new modelNotification({
            userID: issue.assignee,
            link: '',
            title: `${req.user.name} deleted a your issue`,
            content: `${issue.summary}`,
            createdAt: new Date(),
            read: false,
        });
        await newNotification.save();
    }

    res.json({
        message: 'Deleted issue successfully',
    });
};
//list issues in broad
const listIssuesBroad = async (req, res) => {
    try {
        const { codeProject } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const searchIssueUser = req.query.issueUser || '';
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id project',
            });
        }
        const checkProject = await modelWorkProject.findOne({ codeProject });
        const sprint = await modelSprint.find({ projectID: checkProject._id, status: 'RUNNING' });
        const sprintID = [];
        sprint.forEach((element) => {
            sprintID.push(element._id);
        });
        const countIssue = await modelIssue.find({
            projectID: checkProject._id,
            sprint: { $in: sprintID },
            parentIssue: { $ne: null },
        });
        const totalPage = Math.ceil(countIssue.length / limit);
        const checkIssues = await modelIssue
            .find({
                projectID: checkProject._id,
                sprint: { $in: sprintID },
                parentIssue: { $ne: null },
                $or: [
                    { assignee: { $regex: searchIssueUser } },
                    { issueType: { $regex: searchIssueUser } },
                    { sprint: { $regex: searchIssueUser } },
                ],
            })
            .populate({
                path: 'parentIssue',
            })
            .skip((skip - 1) * limit)
            .limit(limit);

        if (!checkIssues) {
            return res.status(400).json({
                message: 'is not issues of project',
            });
        }
        return res.status(200).json({
            issuesBroad: checkIssues,
            page: skip,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get issues broad',
        });
    }
};

module.exports = {
    listIssuesBroad,
    editInformationIssue,
    listIssuesProject,
    addNewIssues,
    issuesChildren,
    deleteIssue,
    issueDetail
};
