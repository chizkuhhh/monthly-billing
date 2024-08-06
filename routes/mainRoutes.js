const express = require('express');
const router = express.Router();
const {
    getHomePage,
    getDashboard,
    getChangePWPage
} = require('../controllers/mainCon');

const {
    getLogin,
    validateUser,
    logoutUser
} = require('../controllers/loginCon');

router.get('/', getHomePage);

router.get('/login', getLogin);

router.post('/login', validateUser);

router.post('/logout', logoutUser);

router.get('/dashboard', getDashboard);

module.exports = router;