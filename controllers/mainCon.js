const path = require("path");
const FloorLeader = require('../models/floorLeaderModel');
const BuildingLeader = require('../models/buildingLeaderModel');
const Admin = require('../models/adminModel');
const Tenant = require('../models/tenantModel');
const Finance = require('../models/financeModel');
const Announcement = require('../models/announcementModel');

const getHomePage = (req, res) => {
  res.render('index');
};

const getDashboard = async (req, res) => {
  const user = await Tenant.findById(req.session.userId).lean();
  const announcement = await Announcement.findOne().sort({createdAt: -1}).lean();

  try {
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
}

module.exports = {
    getHomePage,
    getDashboard
}