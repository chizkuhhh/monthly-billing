const express = require('express');
const router = express.Router();
const { 
    getAssignedTenants
} = require('../controllers/tenantCon');

const { 
    getTAView
} = require('../controllers/billingCon');



// get all tenants under the current floor leader's building and floor num
router.get('/assigned-tenants/:building_num/:floor_num', getAssignedTenants);

// get TA view for billings
router.get('/billings-ta/:building_num/:floor_num', getTAView);

module.exports = router;