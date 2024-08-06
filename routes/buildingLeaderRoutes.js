const express = require('express');
const router = express.Router();
const { 
    getAssignedTenantsB
} = require('../controllers/tenantCon');

const { 
    getConsView
} = require('../controllers/billingCon');

// get all tenants under the current bldg leader's building num
router.get('/assigned-tenants/:building_num', getAssignedTenantsB);

// get cons view for billing
router.get('/billings-cons/:building_num', getConsView);
module.exports = router;