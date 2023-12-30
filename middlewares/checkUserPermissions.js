const modelWorkProject = require('../models/modelWorkProject');

const checkUserPermissions = async (req, res, next) => {
    try {
        const { keyProject } = req.params;
        const { _id } = req.user;
        console.log(_id)
        if (!keyProject || !_id) {
            return res.status(404).json({
                message: 'is not _id',
            });
        }
        console.log(_id)
        // get project
        const listProject = await modelWorkProject.findOne({ codeProject: keyProject });
        if (!listProject) {
            return res.status(404).json({
                message: 'not found user',
            });
        }

        // check user permissions
        if (listProject.adminID.toString() === _id) {
            req.user = {};
            req.user.role = 'admin';
            return next();
        }
        const checkManager = listProject.managerID.find((idUser) => {
            return idUser.toString() === _id;
        });

        if (checkManager) {
            req.user = {};
            req.user.role = 'manager';
            next();
        }

        if (listProject.adminID.toString() !== _id && !checkManager) {
            return res.status(400).json({
                message: 'this user does not have permissions',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'error check admin',
        });
    }
};
module.exports = checkUserPermissions;
