const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelWorkProject = new Schema(
    {
        nameProject: { type: String },
        listWorkID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'listworks' }],
        userMembers: [{ type: String, ref: 'users' }],
        codeProject: { type: String },
        userManagers: [{ type: String, ref: 'users' }],
        userAdmin: { type: String, ref: 'users' },
        startDay: { type: Date },
        endDate: { type: Date },
        expected: { type: String },
        describeProject: { type: String },
        projectStatus: { type: String },
        deleteProject: { type: Boolean },
        imgProject: { type: String },
    },
    { timestamps: true },
    { collection: 'workprojects' },
);
module.exports = mongoose.model('workprojects', ModelWorkProject);
