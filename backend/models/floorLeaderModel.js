const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// have to add building_num, floor_num, address, meter_num (still need feds to add those options for add user)
const floorLeaderSchema = new Schema({
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
    floor_num: {
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

module.exports = mongoose.model('FloorLeader', floorLeaderSchema);