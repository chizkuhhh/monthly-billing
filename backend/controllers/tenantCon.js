const Admin = require('../models/adminModel');
const Tenant = require('../models/tenantModel');
const Finance = require('../models/financeModel');
const FloorLeader = require('../models/floorLeaderModel');
const BuildingLeader = require('../models/buildingLeaderModel');

const mongoose = require('mongoose');

// get all assigned tenants for floor leader view
const getAssignedTenants = async (req, res) => {
    const { building_num, floor_num } = req.params;

    try {
        const tenants = await Tenant.find({ building_num: Number(building_num), floor_num: Number(floor_num) }).sort({ createdAt: -1 }).lean(); // sort from newest user created
        console.log({tenants})
        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all assigned tenants for bldg leader view
const getAssignedTenantsB = async (req, res) => {
    const { building_num } = req.params;

    try {
        const tenants = await Tenant.find({ building_num: Number(building_num) }).sort({ createdAt: -1 }).lean(); // sort from newest user created
        console.log({tenants})
        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all tenants except for self (admin)
const getAllTenants = async (req, res) => {
    const { id } = req.params;

    try {
        const tenants = await Tenant.find({ _id: { $ne: id } }).sort({ createdAt: -1 }).lean(); // exclude the document with the specified _id
        console.log({tenants})
        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await Tenant.findById(id).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.query.format === 'json') {
            return res.json(user);
        }

        // Otherwise, render the page
        res.render('accountDetails', { user, userRole: req.session.userRole, userId: req.session.userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// POST a new user (create new user)
const createUser = async (req, res) => {
    const {firstname, lastname, username, password, role, building_num, floor_num, address, meter_num} = req.body;

    // add the user document to db
    try {
        const user = await Tenant.create({firstname, lastname, username, password, role, building_num, floor_num, address, meter_num});
        // add user to corresponding collection based on given role
        if (role === 'admin') {
            await Admin.create({firstname, lastname, user_id: user._id});
        } else if (role === 'finance') {
            await Finance.create({firstname, lastname, user_id: user._id});
            console.log(finance);
        } else if (role === 'floor leader') {
            await FloorLeader.create({firstname, lastname, building_num, floor_num, user_id: user._id});
        } else if (role === 'building leader') {
            await BuildingLeader.create({firstname, lastname, building_num, user_id: user._id});
        }

        res.status(200).json(user); // return the user information if successfully created

    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// DELETE a user
const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await Tenant.findByIdAndDelete({_id: id});

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Tenant.findOneAndDelete({ user_id: id });

        // Remove from the corresponding role collection
        switch (user.role) {
            case 'admin':
                await Admin.findOneAndDelete({ user_id: id });
                break;
            case 'finance':
                await Finance.findOneAndDelete({ user_id: id });
                break;
            case 'floor leader':
                await FloorLeader.findOneAndDelete({ user_id: id });
                break;
            case 'building leader':
                await BuildingLeader.findOneAndDelete({ user_id: id });
                break;
            default:
                throw new Error('Invalid role specified');
        }

        res.status(200).json({ message: 'User successfully deleted!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a user (edit their details)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, username, password, role, building_num, floor_num, address, meter_num } = req.body;

    try {
        const user = await Tenant.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // get old role and update document
        const oldRole = user.role;
        user.firstname = firstname;
        user.lastname = lastname;
        user.username = username;
        user.password = password;
        user.building_num = building_num;
        user.floor_num = floor_num;
        user.address = address;
        user.meter_num = meter_num;
        user.role = role;

        await user.save();

        if (oldRole !== role) {

            switch (oldRole) {
                case 'admin':
                    await Admin.findOneAndDelete({ user_id: id });
                    break;
                case 'finance':
                    await Finance.findOneAndDelete({ user_id: id });
                    break;
                case 'floor leader':
                    await FloorLeader.findOneAndDelete({ user_id: id });
                    break;
                case 'building leader':
                    await BuildingLeader.findOneAndDelete({ user_id: id });
                    break;
                default:
                    throw new Error('Invalid old role specified');
            }

            switch (role) {
                case 'admin':
                    await Admin.create({ firstname, lastname, user_id: id });
                    break;
                case 'finance':
                    await Finance.create({ firstname, lastname, user_id: id });
                    break;
                case 'floor leader':
                    await FloorLeader.create({ firstname, lastname, user_id: id, building_num, floor_num });
                    break;
                case 'building leader':
                    await BuildingLeader.create({ firstname, lastname, user_id: id, building_num });
                    break;
                default:
                    throw new Error('Invalid new role specified');
            }
        }

        res.status(200).json(user); // Return the updated user information

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAssignedTenants,
    getAssignedTenantsB,
    getAllTenants,
    getUser,
    createUser,
    updateUser,
    deleteUser
}