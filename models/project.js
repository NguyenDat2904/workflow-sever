const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelProject = new Schema(
    {
        nameProject: { type: String },
        listMembers: [{ type: String, ref: 'users' }],
        codeProject: { type: String },
        listManagers: [{ type: String, ref: 'users' }],
        admin: { type: String, ref: 'users' },
        startDay: { type: Date },
        endDate: { type: Date },
        expected: { type: String },
        describeProject: { type: String },
        projectStatus: { type: String },
        deleteProject: { type: Boolean },
        imgProject: { type: String },
    },
    { timestamps: true },
    { collection: 'projects' },
);
module.exports = mongoose.model('projects', ModelProject);
