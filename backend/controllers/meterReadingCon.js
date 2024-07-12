
const MeterReading = require('../models/meterReadingsModel');
const Tenant = require('../models/tenantModel');

const createMeterReading = async (req, res) => {
  const { previous, present, consumption, meter_num } = req.body;
  try {
    const meterReading = new MeterReading({ previous, present, consumption, meter_num });
    await meterReading.save();
    res.status(201).json(meterReading);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMeterReadingsByMeterNum = async (req, res) => {
  const { meter_num } = req.params;
  try {
    const meterReadings = await MeterReading.find({ meter_num });
    if (!meterReadings.length) {
      return res.status(404).json({ message: 'Meter readings not found' });
    }
    res.status(200).json(meterReadings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMeterReading = async (req, res) => {
  const { id } = req.params;
  const { previous, present, consumption, meter_num } = req.body;
  try {
    const meterReading = await MeterReading.findByIdAndUpdate(id, { previous, present, consumption, meter_num }, { new: true });
    if (!meterReading) {
      return res.status(404).json({ message: 'Meter reading not found' });
    }
    res.status(200).json(meterReading);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMeterReading = async (req, res) => {
  const { id } = req.params;
  try {
    const meterReading = await MeterReading.findByIdAndDelete(id);
    if (!meterReading) {
      return res.status(404).json({ message: 'Meter reading not found' });
    }
    res.status(200).json({ message: 'Meter reading deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMeterReadingsByTenantId = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    const meterReadings = await MeterReading.find({ meter_num: tenant.meter_num });
    res.status(200).json(meterReadings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMeterReading,
  getMeterReadingsByMeterNum,
  updateMeterReading,
  deleteMeterReading,
  getMeterReadingsByTenantId
};
