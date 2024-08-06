const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// have to add building_num, floor_num, address, meter_num (still need feds to add those options for add user)
const tenantSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'tenant', 'floor leader', 'building leader', 'finance']
        // other roles are also tenants with an extra role
    },
    building_num: {
        type: Number,
        required: true
    },
    floor_num: {
        type: Number,
        required: true
    },
    unit: {
        type: Number,
        required: true
    },
    meter_num: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);