const modelWorkProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');

//lấy project
const getWorkProject = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            res.status(404).json({
                message: 'not found id',
            });
        }
        const workProject = await modelWorkProject
            .find({ memberID: _id })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            });
        if (!workProject) {
            res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(workProject);
    } catch (error) {
        res.status(404).json({
            message: 'can not get data work Project',
        });
    }
};
// lấy list công việc của hàm getWorkProject đã lọc công việc theo id user trả về
const getListWork = async (req, res) => {
    try {
        const { nameProject } = req.body;

        if (!nameProject) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        //check project
        const checkProject = await modelWorkProject
            .findOne({ nameProject: nameProject })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            });
        if (!checkProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(checkProject);
    } catch (error) {
        res.status(404).json({
            message: 'can not get data list work  ',
        });
    }
};
//lấy công việc chi tiết của user qua lọc của hàm getListWork theo project
const getWorkDetail = async (req, res) => {
    try {
        const { workDetrailID } = req.body;
        if (!workDetrailID) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const WorkDetail = await modalWorkDetail.find({ _id: { $in: workDetrailID } });
        if (!WorkDetail) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(WorkDetail);
    } catch (error) {
        return res.status(404).json({
            message: 'can not get data work detail ',
        });
    }
};

const editProjectInformation = async (req, res) => {
    try {
        const { workProjectID } = req.params;
        const { codeProject, nameProject } = req.body;

        // check id project
        if (!workProjectID) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const project = await modelWorkProject.findById({ _id: workProjectID }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });

        // check project
        if (!project) {
            return res.status(400).json({
                message: 'Project not found',
            });
        }

        // check codeProject
        const checkCodeProject = await modelWorkProject.findOne({
            $and: [{ _id: workProjectID }, { codeProject: codeProject }],
        });

        if (checkCodeProject) {
            return res.status(400).json({
                message:'codeProject already exists'
            })
        }

        if (codeProject && nameProject) {
            project.codeProject = codeProject;
            project.nameProject = nameProject;
        } else if (codeProject) {
            project.codeProject = codeProject;
        } else if (nameProject) {
            project.nameProject = nameProject;
        }

        await project.save();
        return res.json({
            message: 'Edit project information successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(error.status).json({
            message: "Can't edit project information",
            error,
        });
    }
};

module.exports = { getWorkProject, getListWork, getWorkDetail, editProjectInformation };
