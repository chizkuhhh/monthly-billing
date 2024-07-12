
const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  previous: { type: Number, required: true },
  present: { type: Number, required: true },
  consumption: { type: Number, required: true },
  meter_num: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MeterReading', meterReadingSchema);
