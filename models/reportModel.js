const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    report_num: {
        type: Number,
        required: true,
        unique: true
    },
    tenant: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
