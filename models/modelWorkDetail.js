const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelWorkDetail = new Schema(
    {
        nameDetail: { type: String },
        implementerID: { type: mongoose.Types.ObjectId, ref: 'users' },
        descWork: { type: String },
        status: { type: String },
    },
    { timestamps: true },
    { collection: 'workdetails' },
);
module.exports = mongoose.model('workdetails', ModelWorkDetail);
