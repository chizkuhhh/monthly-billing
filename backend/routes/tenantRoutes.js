const express = require('express');

const {
    getAllTenants,
    getUser,
    createUser,
    deleteUser,
    updateUser
} = require('../controllers/tenantCon');

const router = express.Router();

// GET all users (for admin & finance)
router.get('/all/:id', getAllTenants);

// GET a single user
router.get('/:id', getUser);

// POST a new user (create new user)
router.post('/', createUser);

// DELETE a user
router.delete('/:id', deleteUser);

// UPDATE a user (edit their details)
router.patch('/:id', updateUser);

module.exports = router;