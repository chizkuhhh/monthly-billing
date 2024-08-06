const Announcement = require('../models/announcementModel');

const mongoose = require('mongoose');

// get all announcements
const getAllAnnouncements = async (req, res) => {
    const { id } = req.params;

    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 }).lean(); // sort from newest announcement created
        console.log({announcements})
        res.render('announcements', { announcements , userId: id, userRole: req.session.userRole, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'announcements'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get one announcement
const getAnnouncement = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid announcement ID' });
    }

    try {
        const announcement = await Announcement.findById(id).lean();

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// post an announcement
const createAnnouncement = async (req, res) => {
    const { title, message, id } = req.body;
    console.log(req.body);

    try {
        const announcement = await Announcement.create({title, message, user_id: id});

        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// delete an announcement
const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid announcement ID' });
    }

    try {
        const announcement = await Announcement.findByIdAndDelete(id).lean();

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// update or edit an announcement
const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, message, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid announcement ID' });
    }

    try {
        const announcement = await Announcement.findByIdAndUpdate({_id: id}, {
            ...req.body
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAllAnnouncements,
    getAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement
}