const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SprintModal = new Schema(
    {
        projectID: { type: mongoose.Schema.Types.ObjectId, ref: 'projects' },
        name: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        sprintGoal: { type: String },
        status: { type: String,enum:['PENDING','RUNNING','DONE'],default:'PENDING' },
        duration:{type:Number}
    },

    { timestamps: true },
    { collection: 'sprints' },
);

module.exports = mongoose.model('sprints', SprintModal);
