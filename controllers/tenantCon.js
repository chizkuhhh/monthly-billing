const Admin = require('../models/adminModel');
const Tenant = require('../models/tenantModel');
const Finance = require('../models/financeModel');
const FloorLeader = require('../models/floorLeaderModel');
const BuildingLeader = require('../models/buildingLeaderModel');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// get all assigned tenants for floor leader view
const getAssignedTenants = async (req, res) => {
    const { building_num, floor_num } = req.params;

    try {
        const tenants = await Tenant.find({ building_num: Number(building_num), floor_num: Number(floor_num), _id: { $ne: req.session.userId } }).sort({ building_num: 1, unit: 1 }).lean(); // sort from newest user created
        console.log({tenants})
        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'accounts' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all assigned tenants for bldg leader view
const getAssignedTenantsB = async (req, res) => {
    const { building_num } = req.params;

    try {
        const tenants = await Tenant.find({ building_num: Number(building_num), _id: { $ne: req.session.userId } }).sort({ building_num: 1, unit: 1 }).lean(); // sort from newest user created
        console.log({tenants})
        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'accounts' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all tenants except for self (admin)
const getAllTenants = async (req, res) => {
    const { id } = req.params;

    try {
        const tenants = await Tenant.find({ _id: { $ne: id } }).sort({ building_num: 1, unit: 1 }).lean(); // exclude the document with the specified _id
        console.log({tenants})

        res.render('manageUsers', { tenants, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'accounts' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUser = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
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
        // res.render('accountDetails', { user, userRole: req.session.userRole, userId: req.session.userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// POST a new user (create new user)
const createUser = async (req, res) => {
    const {firstname, lastname, username, password, role, building_num, floor_num, unit, meter_num} = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // add the user document to db
    try {
        const user = await Tenant.create({firstname, lastname, username, password: hashedPassword, role, building_num, floor_num, unit, meter_num});
        // add user to corresponding collection based on given role
        if (role === 'admin') {
            await Admin.create({firstname, lastname, user_id: user._id});
        } else if (role === 'finance') {
            await Finance.create({firstname, lastname, user_id: user._id});
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
        return res.status(400).json({ message: 'Invalid user ID' });
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

        res.status(200).json({ message: 'User successfully deleted!', username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE a user (edit their details)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, username, role, building_num, floor_num, unit, meter_num } = req.body;

    console.log(req.body);

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
        user.building_num = building_num;
        user.floor_num = floor_num;
        user.unit = unit;
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
                case 'tenant':
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
                case 'tenant':
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

// POST bulk new users (create multiple users)
const createBulkUsers = async (req, res) => {
    const users = req.body; // Assuming req.body is an array of user objects

    try {
        const createdUsers = [];
        for (const userData of users) {
            const { firstname, lastname, username, password, role, building_num, floor_num, unit, meter_num } = userData;

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

            // Create the user document
            const newUser = await Tenant.create({
                firstname,
                lastname,
                username,
                password: hashedPassword,
                role,
                building_num,
                floor_num,
                unit,
                meter_num
            });

            // Depending on the role, add user to corresponding collection
            if (role === 'admin') {
                await Admin.create({ firstname, lastname, user_id: newUser._id });
            } else if (role === 'finance') {
                await Finance.create({ firstname, lastname, user_id: newUser._id });
            } else if (role === 'floor leader') {
                await FloorLeader.create({ firstname, lastname, building_num, floor_num, user_id: newUser._id });
            } else if (role === 'building leader') {
                await BuildingLeader.create({ firstname, lastname, building_num, user_id: newUser._id });
            }

            createdUsers.push(newUser); // Collect created user data
        }

        res.status(200).json(createdUsers); // return the created users array if successfully created

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const changePassword = async (req, res) => {
    const { id, oldPW, newPW } = req.body;

    try {
        // 1. Validate input
        if (!oldPW || !newPW) {
            return res.status(400).json({ error: 'Both Old Password and New Password are required' });
        }
        
        // 2. Fetch user from database
        const user = await Tenant.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // 3. Compare old password
        const isMatch = await bcrypt.compare(oldPW, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid old password' });
        }
        
        // 4. Update password
        // hash password
        const hashedPassword = await bcrypt.hash(newPW, 10); // 10 is the saltRounds
        user.password = hashedPassword; // This assumes you have a method to hash passwords in your model

        await user.save(); // Save the updated user

        // Optionally, you may want to send a success message
        return res.status(200).json({ message: 'Password updated successfully' });
        
    } catch (error) {
        console.error('Error in changing password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const changePassAdmin = async (req, res) => {
    const { id } = req.params; // Get user ID from parameters
    const { newPW } = req.body; // Get new password from request body

    try {
        // 1. Validate input
        if (!newPW) {
            return res.status(400).json({ error: 'New Password is required' });
        }
        
        // 2. Fetch user from database
        const user = await Tenant.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // 3. Update password
        // hash password
        const hashedPassword = await bcrypt.hash(newPW, 10); // 10 is the saltRounds
        user.password = hashedPassword; // This assumes you have a method to hash passwords in your model

        await user.save(); // Save the updated user

        // Optionally, you may want to send a success message
        return res.status(200).json({ message: 'Password updated successfully' });
        
    } catch (error) {
        console.error('Error in changing password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getChangePWPage = (req, res) => {
    res.render('changePass', {
        userRole: req.session.userRole,
        userId: req.session.userId,
        floorNum: req.session.floorNum,
        buildingNum: req.session.bldgNum,
        activePage: 'changepass'
    });
}

module.exports = {
    getAssignedTenants,
    getAssignedTenantsB,
    getAllTenants,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    createBulkUsers,
    getChangePWPage,
    changePassword,
    changePassAdmin
}