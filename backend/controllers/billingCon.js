const Billing = require('../models/billingModel');
const User = require('../models/tenantModel');
const MeterReading = require('../models/meterReadingsModel');
const BuildingLeader = require('../models/buildingLeaderModel');

const createBilling = async (req, res) => {
  try {
    const newBilling = await Billing.create(req.body);
    res.status(201).json(newBilling);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get latest created bill and return the bill number
const getLatestBillNo = async (req, res) => {
  try {
    const latestBill = await Billing.find({}).sort({ createdAt: -1 }).limit(1).lean();

    if (latestBill.length > 0) {
      const latestBillNo = latestBill[0].bill_no;
      const [numberPart, yearPart] = latestBillNo.split('-');
      const nextNumberPart = parseInt(numberPart, 10) + 1;
      const currentYear = new Date().getFullYear().toString().slice(-2);
      
      const nextBillNo = `${nextNumberPart}-${currentYear}`;
      res.status(200).json({ nextBillNo });
    } else {
      // Handle the case where there are no existing bills
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextBillNo = `00001-${currentYear}`;
      res.status(200).json({ nextBillNo });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const getBillingByBillNo = async (req, res) => {
  const { billNo } = req.params;

  try {
    const billing = await Billing.findOne({ bill_no: billNo }).lean();

    if (!billing) {
      return res.status(404).json({ error: 'Billing record not found' });
    }

    const tenant = await User.findById(billing.tenant_id).lean();
    const meterReading = await MeterReading.findOne({ meter_num: tenant.meter_num }).lean();
    const buildingLeader = await BuildingLeader.findOne({ building_num: tenant.building_num }).lean();

    if (!tenant || !meterReading || !buildingLeader) {
      return res.status(404).json({ error: 'Related data not found' });
    }

    const billingWithTenantInfo = {
      ...billing,
      tenant_name: `${tenant.firstname} ${tenant.lastname}`,
      tenant_info: tenant,
      meter_reading: meterReading,
      building_leader: buildingLeader
    };

    res.json({ billing: billingWithTenantInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBillingsByTenantId = async (req, res) => {
    const { tenantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    try {
      const [billings, totalBillings] = await Promise.all([
        Billing.find({ tenant_id: tenantId })
          .sort({ bill_date: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Billing.countDocuments({ tenant_id: tenantId })
      ]);
  
      if (!billings.length) {
        return res.status(404).json({ error: 'Billing records not found' });
      }
  
      const user = await User.findOne({ _id: tenantId }).lean();
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const hasNextPage = (page * limit) < totalBillings;
      const hasPreviousPage = page > 1;
  
      res.render('history', { billings, user, currentPage: page, hasNextPage, hasPreviousPage, userRole: req.session.userRole, userId: req.session.userId });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };
  

const getMostRecentBillingByTenantId = async (req, res) => {
    const { tenantId } = req.params;
    try {
        const mostRecentBilling = await Billing.findOne({ tenant_id: tenantId })
            .sort({ bill_date: -1 })
            .lean(); 

        if (!mostRecentBilling) {
            return res.status(404).json({ error: 'Billing record not found' });
        }

        const user = await User.findOne({ _id: tenantId }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.render('billing', { billing: mostRecentBilling, user, userRole: req.session.userRole, userId: req.session.userId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* const updateBilling = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBilling = await Billing.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedBilling);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; */

const updateBillingByBillNo = async (req, res) => {
  const { billNo } = req.params;

  try {

    const updatedBilling = await Billing.findOneAndUpdate(
      { bill_no: billNo },
      {
        consumption: req.body.consumption,
        water_basic_charge: req.body.water_basic_charge,
        water_sys_loss: req.body.water_sys_loss,
        water_maintenance: req.body.water_maintenance,
        monthly_fee: req.body.monthly_fee,
        stp: req.body.stp,
        prev_water: req.body.prev_water,
        prev_monthly_fee: req.body.prev_monthly_fee,
        prev_stp: req.body.prev_stp,
        other_charges: req.body.other_charges,
        total_due: req.body.total_due,
        service_invoice: req.body.service_invoice,
        remarks: req.body.remarks,
      },
      { new: true }
    );

    if (!updatedBilling) {
      return res.status(404).json({ error: 'Billing record not found' });
    }

    const tenant = await User.findById(updatedBilling.tenant_id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const meterReading = await MeterReading.findOne({ meter_num: tenant.meter_num });
    if (!meterReading) {
      return res.status(404).json({ error: 'Meter reading not found' });
    }

    meterReading.consumption = req.body.meter_reading.consumption;
    await meterReading.save();

    res.json({ billing: updatedBilling });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBilling = async (req, res) => {
  const { id } = req.params;
  try {
    await Billing.findByIdAndDelete(id);
    res.json({ message: 'Billing record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAdminViewBills = async (req, res) => {
  const index = parseInt(req.query.index) || 0;

  try {
    const billings = await Billing.find().sort({ bill_date: -1 }).lean();

    if (!billings.length) {
      return res.status(404).json({ error: 'No billing records found' });
    }

    if (index < 0 || index >= billings.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const billing = billings[index];
    const tenant = await User.findById(billing.tenant_id).lean();
    const meterReading = await MeterReading.findOne({ meter_num: tenant.meter_num }).lean();
    const buildingLeader = await BuildingLeader.findOne({ building_num: tenant.building_num }).lean();

    const billingWithTenantInfo = {
      ...billing,
      tenant_name: tenant ? `${tenant.firstname} ${tenant.lastname}` : 'Unknown Tenant',
      tenant_info: tenant,
      meter_reading: meterReading || null,
      building_leader: buildingLeader || null
    };

    const hasNext = index < billings.length - 1;
    const hasPrevious = index > 0;

    res.json({
      billing: billingWithTenantInfo,
      hasNext,
      hasPrevious,
      currentIndex: index
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// render admin view bills

const renderAdminViewBills = async (req, res) => {
  try {
    const billings = await Billing.find().sort({ bill_date: -1 }).lean();

    if (!billings.length) {
      return res.status(404).json({ error: 'No billing records found' });
    }

    const tenantIds = [...new Set(billings.map(b => b.tenant_id))];
    const tenants = await User.find({ _id: { $in: tenantIds } }).lean();

    const meterNums = tenants.map(t => t.meter_num);
    const meterReadings = await MeterReading.find({ meter_num: { $in: meterNums } }).lean();

    const billingsWithTenantInfo = billings.map(billing => {
      const tenant = tenants.find(t => t._id.toString() === billing.tenant_id.toString());
      const meterReading = meterReadings.find(mr => mr.meter_num === tenant.meter_num);
      return {
        ...billing,
        tenant_name: tenant ? `${tenant.firstname} ${tenant.lastname}` : 'Unknown Tenant',
        tenant_info: tenant,
        meter_reading: meterReading || null
      };
    });

    const buildings = {};
    for (const billing of billingsWithTenantInfo) {
      const buildingNum = billing.tenant_info.building_num;
      if (!buildings[buildingNum]) {
        const buildingLeader = await BuildingLeader.findOne({ building_num: buildingNum }).lean();
        buildings[buildingNum] = {
          number: buildingNum,
          tenants: [],
          building_leader: buildingLeader || null
        };
      }
      buildings[buildingNum].tenants.push(billing);
    }

    const buildingArray = Object.values(buildings);

    res.render('adminViewBills', {
      buildings: buildingArray,
      userRole: req.session.userRole,
      userId: req.session.userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createBilling,
  getBillingByBillNo,
  getBillingsByTenantId,
  getMostRecentBillingByTenantId,
  updateBillingByBillNo,
  deleteBilling,
  getAdminViewBills,
  renderAdminViewBills,
  getLatestBillNo
};