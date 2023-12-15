const modelWorkProject = require('../models/modelWorkProject');
const ModelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');

//lấy project
const getWorkProject = async (req, res) => {
    try {
        const { _id } = req.params;
        const {deleteProject}=req.body
        if (!_id||!deleteProject) {
            res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const workProject = await modelWorkProject.find({ memberID: _id, deleteProject: deleteProject }).populate({
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
            res.status(404).json({
                message: 'not found id',
            });
        }
        //check project
        const checkProject = await modelWorkProject.findOne({ nameProject: nameProject }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });

        if (!checkProject) {
            res.status(404).json({
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
            res.status(404).json({
                message: 'not found id',
            });
        }
        const WorkDetail = await modalWorkDetail.find({ _id: { $in: workDetrailID } });
        if (!WorkDetail) {
            res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(WorkDetail);
    } catch (error) {
        res.status(404).json({
            message: 'can not get data work detail ',
        });
    }
};
// add new work
const addNewWork = async (req, res) => {
    try {
        const { _id } = req.params;
        
        const { nameProject, codeProject } = req.body;
        console.log( nameProject, codeProject );
        if (!_id || !nameProject || !codeProject) {
            return res.status(400).json({
                message: 'is not nameProject or codeProject or id',
            });
        }
        const checkCodeProject = await modelWorkProject.findOne({codeProject:codeProject});
        if (checkCodeProject) {
            return res.status(401).json({
                message: 'already exists codeProject',
            });
        }
        const newProject = new modelWorkProject({
            nameProject: nameProject,
            listWorkID: [],
            memberID: [_id],
            codeProject: codeProject,
            startDay: new Date(),
            endDate: null,
            expected: '',
            describeProject: '',
            projectStatus: 'Chuẩn  bị',
            deleteProject: false,
        });
        await newProject.save();
        const data = await modelWorkProject.find({});
        return res.status(200).json({
            message: 'Add new successfully',
            data: data,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: 'Not found',
        });
    }
};
//delete project
const deleteProject = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                message: 'is not id',
            });
        }
        const findProjectID = await modelWorkProject.findById(_id);
        if (!findProjectID) {
            return res.status(400).json({
                message: 'user not found',
            });
        }
        if (findProjectID.deleteProject === false) {
            findProjectID.deleteProject = true;
            await findProjectID.save();
        }
        setTimeout(async () => {
            if (findProjectID.deleteProject === true) {
                 await modelWorkProject.findByIdAndDelete(_id);
            }
        }, 10000);
        return res.status(200).json({
            message: 'Moved to trash',
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'Can not delete',
        });
    }
};
//restore project
const restoreProject=async(req,res)=>{
    const { _id,deleteProject }=req.body
    if( !_id||!deleteProject ){

    }
}

module.exports = { getWorkProject, getListWork, getWorkDetail, addNewWork, deleteProject };
