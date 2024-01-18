const modelIssue = require('../models/issue');
const modelSprint = require('../models/sprint');
const modelWorkProject = require('../models/project');
const modelNotification = require('../models/notification');
const { isObjectIdOrHexString } = require('mongoose');
const { parse } = require('dotenv');
const url=require('url')
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
        const urlString=req.url;
        const parseUrl=url.parse(urlString,true)
        const assignee = parseUrl.query;
        const typeBug=req.query.typeBug
        const typeUserStory=req.query.typeUserStory
        const typeTask=req.query.typeTask
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const arrayAssignee=assignee.assignee?.split("-")
        console.log(arrayAssignee)
        const checkProject = await modelWorkProject.findOne({ codeProject });
        const lengthIssue = await modelIssue.find({
            projectID: checkProject._id,
            ...(parentIssueID !== undefined && { parentIssue: parentIssueID }),
            ...(arrayAssignee!== undefined && {
                assignee:{$in:arrayAssignee} ,
            }),
        });
        const type=[]
        if(typeBug!==undefined){
            type.push(typeBug)
        }
        if(typeUserStory!==undefined){
            type.push(typeUserStory)
        }
        if(typeTask!==undefined){
            type.push(typeTask)
        }
        const totalPage = Math.ceil(lengthIssue.length / limitPage);
        const checkCodeProject = await modelIssue.aggregate([
            {
                $match: {
                    projectID: checkProject._id,
                    ...(sprintID && {
                        sprint: sprintID,
                    }),
                    ...(parentIssueID !== undefined && {
                        parentIssue: parentIssueID,
                    }),
                    ...(arrayAssignee!== undefined && {
                        assignee:{$in:arrayAssignee},
                    }),
                    ...(type.length>0&& {
                        issueType:{$in:type}
                    }),
                    $or: [
                        { summary: { $regex: search } },
                        { name: { $regex: search } },
                        { issueType: { $regex: search } },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectID',
                    foreignField: '_id',
                    as: 'infoProjects',
                },
            },
            {
                $lookup: {
                    let: { userObjId: {$convert: {input: '$sprint', to : 'objectId', onError: '',onNull: ''}} },
                    from: 'sprints',
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userObjId'] },sprint: { $exists: false } } }],
                    as: 'infoSprints',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userObjId: {$convert: {input: '$assignee', to : 'objectId', onError: '',onNull: ''}}  },
                    pipeline: [{ 
                        $match: { 
                            $expr: { $eq: ['$_id', '$$userObjId'] },
                            assignee: { $exists: false }
                } }],
                    as: 'infoAssignee',
                },
            },
            { $unwind: { path: '$infoProjects', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$infoSprints', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$infoAssignee', preserveNullAndEmptyArrays: true } },
            { $project: { infoSprints: { passWord: 0 } } },
            { $project: { infoAssignee: { passWord: 0 } } },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: (skipPage - 1) * limitPage },
            { $limit: limitPage },
        ]);

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
        const { codeProject } = req.params;

        const { search, idParen } = req.query;
        if (!codeProject) {
            return res.status(404).json({
                message: 'is not id issue',
            });
        }
        const project = await modelWorkProject.findOne({ codeProject });
        const issue = await modelIssue
            .findOne({
                $or: [{ name: search }, { _id: isObjectIdOrHexString(idParen) ? idParen : null }],
                projectID: project._id,
            })
            .populate({ path: 'sprint' })
            .populate({ path: 'projectID' })
            .populate({ path: 'assignee', select: '-passWord' })
            .populate({ path: 'reporter', select: '-passWord' });
        if (!issue) {
            return res.status(404).json({
                message: 'not found',
            });
        }
        res.status(200).json(issue);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error,
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
        const newIssues = new modelIssue({ ...dataIssue, projectID: project._id, name: nameIssue });
        await newIssues.save();
        if (dataIssue?.assignee) {
            const newNotification = new modelNotification({
                userID: dataIssue?.assignee,
                reporter: dataIssue?.reporter,
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
            } else {
                // Nếu trường không tồn tại trong checkIssue, thêm trường mới vào
                checkIssue[field] = updateData[field];
            }
        }
        const issueEdit = await checkIssue.save();
        if (checkIssue.assignee === issueEdit.assignee) {
            const newNotification = new modelNotification({
                userID: checkIssue?.assignee,
                reporter: issueEdit?.reporter,
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
    const updateParentIssue=await modelIssue.find({parentIssue:issueID})
    updateParentIssue.forEach(async(element)=>{
        element.parentIssue=null
         await element.save()
    })
    if (issue) {
        const newNotification = new modelNotification({
            userID: issue?.assignee,
            reporter: issue?.reporter,
            link: '',
            title: `${req.user.name} has deleted one of your issue`,
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

        console.log(sprint);
        const sprintID = [];
        sprint.forEach((element) => {
            sprintID.push(element._id.toString());
        });
        const countIssue = await modelIssue.find({
            projectID: checkProject._id,
            sprint: { $in: sprintID },
        });
        const totalPage = Math.ceil(countIssue.length / limit);
        const checkIssues = await modelIssue.aggregate([
            {$match:{
                projectID: checkProject._id,
                sprint: { $in: sprintID },
                $or: [
                    { assignee: { $regex: searchIssueUser } },
                    { issueType: { $regex: searchIssueUser } },
                    { sprint: { $regex: searchIssueUser } },
                ],
            }},
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectID',
                    foreignField: '_id',
                    as: 'infoProjects',
                },
            },
            {
                $lookup: {
                    from: 'sprints',
                    let: { userObjId: { $toObjectId: '$sprint' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userObjId'] } } }],
                    as: 'infoSprints',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userObjId: { $toObjectId: '$assignee' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userObjId'] } } }],
                    as: 'infoAssignee',
                },
            },
            { $skip: (skip - 1) * limit },
            { $limit: limit }
        ])
            
            

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
const searchIssues = async (req, res) => {
    try {
        const { email } = req.user;
        const search = req.query.search || '';
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const checkProject = await modelWorkProject.find({
            $or: [{ listMembers: email }, { listManagers: email }, { admin: email }],
        });
        const idProject = [];
        checkProject.forEach((element) => {
            idProject.push(element._id);
        });
        const issuesLength = await modelIssue.find({
            projectID: { $in: idProject },
            $or: [{ summary: { $regex: search } }, { name: { $regex: search } }],
        });
        const totalPage = Math.ceil(issuesLength.length / limit);
        const issues = await modelIssue
            .find({
                projectID: { $in: idProject },
                $or: [{ summary: { $regex: search } }, { name: { $regex: search } }],
            }).populate({ path: 'projectID' })
            .skip((skip - 1) * limit)
            .limit(limit);
        res.status(200).json({ data: issues, page: skip, totalPage });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'can not search',
        });
    }
};
const issueYourWork = async (req, res) => {
    try {
        const { email } = req.user;
        if (!email) {
            return res.status(404).json({
                message: 'is not email',
            });
        }
        const listProject = await modelWorkProject.find({
            $or: [{ listMembers: email }, { listManagers: email }, { admin: email }],
        });
        const idProject = [];
        listProject.forEach((element) => {
            idProject.push(element._id);
        });
        const issue = await modelIssue
            .find({
                projectID: { $in: idProject },
                $and: [{ assignee: { $ne: '' } }, { assignee: { $ne: null } }],
            })
            .populate({
                path: 'projectID',
            });

        return res.json(issue);
    } catch (error) {
        return res.status(500).json({
            message: 'can not get',
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
    issueDetail,
    issueYourWork,
    searchIssues,
};
