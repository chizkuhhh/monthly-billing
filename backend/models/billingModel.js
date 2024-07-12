const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const billingSchema = new Schema({
  ref_no: { type: Number, required: true },
  tenant_id: { type: String, required: true },
  meter_num: { type: String, required: true },
  bill_no: { type: String, required: true },
  billing_period_start: { type: Date, required: true },
  billing_period_end: { type: Date, required: true },
  prev_reading: { type: Number, required: true },
  pres_reading: { type: Number, required: true },
  consumption: { type: Number, required: true },
  water_basic_charge: { type: Number, required: true },
  water_sys_loss: { type: Number, required: true },
  water_maintenance: { type: Number, required: true },
  water_total: { type: Number, required: true },
  monthly_fee: { type: Number, required: true },
  stp: { type: Number, required: true },
  prev_water: { type: Number, required: true },
  prev_monthly_fee: { type: Number, required: true },
  prev_stp: { type: Number, required: true },
  total_due: { type: Number, required: true },
  other_charges: { type: Number, required: true },
  service_invoice: { type: String, required: true },
  payment_date: { type: Date, default: null },
  remarks: { type: String, required: true },
},
{
  timestamps: true
});

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
