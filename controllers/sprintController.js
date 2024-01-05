const modelSprint = require('../models/sprint');

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

// list issue
const listSprint = async (req, res) => {
    try {
        const { _idProject } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        if (!_idProject) {
            return res.status(400).json({
                message: 'is not id project',
            });
        }
        const totalSprint = await modelSprint.find({ projectID: _idProject });
        const totalPage = Math.ceil(totalSprint.length / limit);
        const sprintProject = await modelSprint
            .find({ projectID: _idProject, $or: [{ name: { $regex: search } }, { sprintGoal: { $regex: search } }] })
            .sort({ createdAt: -1 })
            .skip((skip - 1) * limit)
            .limit(limit);
        if (!sprintProject.length === 0) {
            return res.status(400).json({
                message: 'Not available sprint',
            });
        }
        return res.status(200).json({
            sprint: sprintProject,
            page: skip,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'Can not issue ',
        });
    }
};

module.exports = { listSprint, addNewSprint };
