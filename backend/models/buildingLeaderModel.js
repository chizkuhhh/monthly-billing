const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buildingLeaderSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    building_num: {
        type: Number,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Tenant'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BuildingLeader', buildingLeaderSchema);