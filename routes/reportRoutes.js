// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportCon');

router.post('/admin', reportController.createReport);
router.get('/admin', reportController.getReports);
router.put('/admin/:reportId', reportController.resolveReport);
router.get('/admin/:tenantId', reportController.getTenantReports);
router.delete('/admin/:reportId', reportController.deleteReport);
router.get('/admin/count', reportController.getReportCount);

module.exports = router;
