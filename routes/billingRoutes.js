const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingCon');

router.post('/', billingController.createBilling);

router.get('/bill-no', billingController.getLatestBillNo);

// router.get('/num/:billNo', billingController.getBillingByBillNo);

router.get('/:userId', billingController.getTenantBills);

router.get('/report/:billId', billingController.previewBill);


// router.get('/recent/:tenantId', billingController.getMostRecentBillingByTenantId);

// router.patch('/num/:billNo', billingController.updateBillingByBillNo);

// router.delete('/:id', billingController.deleteBilling);

router.get('/admin/view-billings', billingController.renderViewAdminBillings);

router.get('/get-bill/:billId', billingController.getBill);

router.patch('/edit-bill/:billId', billingController.updateBill);

router.delete('/:billId', billingController.deleteBill);

router.get('/prev-bill/:tenant_id', billingController.checkPrevBill);

// router.get('/admin/view-bills', billingController.renderAdminViewBills);




module.exports = router;
