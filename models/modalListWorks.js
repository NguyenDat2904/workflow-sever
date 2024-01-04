const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueModel = new Schema(
    {
        projectID: { type: mongoose.Types.ObjectId, ref: 'workprojects' },
        issueType: { type: String, enum: ['EPIC', 'TASK', 'USER_STORY', 'BUG'], default: 'USER_STORY' },
        status: { type: String },
        summary: { type: String },
        description: { type: String },
        assignee: { type: mongoose.Types.ObjectId, ref: 'users' },
        reporter: { type: mongoose.Types.ObjectId, ref: 'users' },
        priority: { type: String, enum: ['Highest', 'High', 'Low', 'Lowest', 'Medium'], default: 'Medium' },
        sprint: { type: mongoose.Types.ObjectId, ref: 'sprints' },
        storyPointEstimate: { type: Number },
        startDate: { type: Date },
        dueDate: { type: Date },
        parentIssue: { type: mongoose.Types.ObjectId, ref: 'listworks' },
    },
    { timestamps: true },
    { collection: 'listworks' },
);
module.exports = mongoose.model('listworks', IssueModel);
