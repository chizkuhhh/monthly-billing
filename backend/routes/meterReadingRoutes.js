const express = require('express');
const {
  createMeterReading,
  getMeterReadingsByMeterNum,
  updateMeterReading,
  deleteMeterReading,
  getMeterReadingsByTenantId
} = require('../controllers/meterReadingCon');

const router = express.Router();

//router.post('/', createMeterReading);
router.get('/:meter_num', getMeterReadingsByMeterNum);
router.put('/:id', updateMeterReading);
router.delete('/:id', deleteMeterReading);
router.get('/tenant/:tenantId', getMeterReadingsByTenantId);

module.exports = router;
