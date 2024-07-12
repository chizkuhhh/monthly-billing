const express = require('express');

const {
    getAllAnnouncements,
    createAnnouncement,
    getAnnouncement,
    deleteAnnouncement,
    updateAnnouncement
} = require('../controllers/announcementCon');

const router = express.Router();

// GET all announcements
router.get('/all/:id', getAllAnnouncements);

// GET one announcement
router.get('/:id', getAnnouncement)

// POST a new announcement
router.post('/', createAnnouncement);

// DELETE an announcement
router.delete('/:id', deleteAnnouncement);

router.patch('/:id', updateAnnouncement);

module.exports = router;