const path = require("path");
const bcrypt = require('bcryptjs');
const FloorLeader = require('../models/floorLeaderModel');
const BuildingLeader = require('../models/buildingLeaderModel');
const Admin = require('../models/adminModel');
const Tenant = require('../models/tenantModel');
const Finance = require('../models/financeModel');
const Announcement = require('../models/announcementModel');

const getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
}

const validateUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Tenant.findOne({ username }).lean();

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare hashed password from request with hashed password from database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const announcement = await Announcement.findOne().sort({createdAt: -1}).lean();

        // store user role in session
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.floorNum = user.floor_num;
        req.session.bldgNum = user.building_num;

        console.log(user);
        // if user is a floor leader or building leader, take note of their building_num and floor_num (if applicable)
        if (user.role === 'floor leader') {
            const floor_leader = await FloorLeader.findOne({user_id: user._id}).lean();
            return res.render('dashboard', {user, floor_leader, userRole: req.session.userRole, userId: req.session.userId, 
                floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'dashboard', announcement});
        
        } else if (user.role === 'building leader') {
            const building_leader = await BuildingLeader.findOne({user_id: user._id}).lean();
            return res.render('dashboard', {user, building_leader, userRole: req.session.userRole, userId: req.session.userId, 
                floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'dashboard', announcement});
    
        } else if (user.role === 'admin') {
            const admin = await Admin.findOne({user_id: user._id}).lean();
            return res.render('dashboard', {user, admin, userRole: req.session.userRole, userId: req.session.userId, 
                floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'dashboard', announcement});
    
        } else if (user.role === 'tenant') {
            return res.render('dashboard', {user, userRole: req.session.userRole, userId: req.session.userId, 
                floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'dashboard', announcement});
    
        } else if (user.role === 'finance') {
            const finance = await Finance.findOne({user_id: user._id}).lean();
            return res.render('dashboard', {user, finance, userRole: req.session.userRole, userId: req.session.userId, 
                floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'dashboard', announcement});
    
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to end session' });
        }
        res.status(200).json({ message: 'Session ended successfully' });
    });
};

module.exports = {
    getLogin,
    validateUser,
    logoutUser
}