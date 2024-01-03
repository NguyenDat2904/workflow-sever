const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SprintModal = new Schema(
    {
        projectID: { type: mongoose.Schema.Types.ObjectId, ref: 'workprojects' },
        name: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        sprintGoal: { type: String },
        status: { type: String },
    },

    { timestamps: true },
    { collection: 'sprints' },
);

module.exports = mongoose.model('sprints', SprintModal);
