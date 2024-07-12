const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingCon');

router.post('/', billingController.createBilling);

router.get('/bill-no', billingController.getLatestBillNo);

router.get('/num/:billNo', billingController.getBillingByBillNo);

router.get('/:tenantId', billingController.getBillingsByTenantId);

router.get('/recent/:tenantId', billingController.getMostRecentBillingByTenantId);

router.patch('/num/:billNo', billingController.updateBillingByBillNo);

router.delete('/:id', billingController.deleteBilling);

router.get('/admin/view-billings', billingController.getAdminViewBills);

router.get('/admin/view-bills', billingController.renderAdminViewBills);




module.exports = router;
