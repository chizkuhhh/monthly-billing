const express = require('express');

const {
    getAllTenants,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    createBulkUsers,
    getChangePWPage,
    changePassword,
    changePassAdmin
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

// POST bulk users (for postman use only) - cheska
router.post('/bulk-add', createBulkUsers);

// go to change password page
router.get('/change-password/form', getChangePWPage);

router.patch('/change-password/for-user/:id', changePassword);

router.patch('/change-password/by-admin/:id', changePassAdmin);

module.exports = router;