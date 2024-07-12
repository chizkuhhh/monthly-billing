const express = require('express');
const router = express.Router();
const { 
    getAssignedTenantsB
} = require('../controllers/tenantCon');

// get all tenants under the current bldg leader's building num
router.get('/assigned-tenants/:building_num', getAssignedTenantsB);

module.exports = router;