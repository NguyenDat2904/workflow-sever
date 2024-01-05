const token = require('../helpers/tokenHelpers');
const users = require('../models/user');
const newToken = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.status(400).json({
                message: 'is not _id',
            });
        }
        const user = await users.findById(_id);
        if (!user) {
            return res.status(400).json({
                message: 'not found user',
            });
        }
        const new_token = token(user, '24h');
        return res.status(200).json({
            accessToken: new_token,
        });
    } catch (error) {
        res.status.json({
            message: 'error new token',
        });
    }
};

module.exports = newToken;
