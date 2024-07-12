const express = require('express');
const router = express.Router();
const { 
    getAssignedTenants
} = require('../controllers/tenantCon');

// get all tenants under the current floor leader's building and floor num
router.get('/assigned-tenants/:building_num/:floor_num', getAssignedTenants);

module.exports = router;