const modelWorkProject = require('../models/modelWorkProject');

const checkUserPermissions = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const { _idUser } = req.body;
        if (!_id || !_idUser) {
            return res.status(404).json({
                message: 'is not _id',
            });
        }

        // get project
        const listProject = await modelWorkProject.findById({ _id: _id });
        if (!listProject) {
            return res.status(404).json({
                message: 'not found user',
            });
        }

        // check user permissions
        if (listProject.adminID.toString() === _idUser) {
            req.user = {};
            req.user.role = 'admin';
            return next();
        }

        const checkManager = listProject.managerID.find((idUser) => {
            return idUser.toString() === _idUser;
        });

        if (checkManager) {
            req.user = {};
            req.user.role = 'manager';
            next();
        }

        if (listProject.adminID.toString() !== _idUser && !checkManager) {
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
