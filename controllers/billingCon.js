const Billing = require('../models/billingModel');
const BuildingLeader = require('../models/buildingLeaderModel');
const FloorLeader = require('../models/floorLeaderModel');
const Tenant = require('../models/tenantModel');
const { query } = require('express');

const mongoose = require('mongoose');

// create billing
const createBilling = async (req, res) => {
    try {
      // check if the tenant has had a previous billing
      const previousBilling = await Billing.findOne({tenant_id: req.body.tenant_id}).sort({billing_period_end: -1}).lean();
      
      if (previousBilling) {
        // compute for the remaining balance
        let remainingPayment = previousBilling.payment_amount;

        // Subtract remaining payment from water_total
        if (remainingPayment > 0) {
          const waterTotal = Math.max(0, previousBilling.water_total - remainingPayment);
          remainingPayment = Math.max(0, remainingPayment - previousBilling.water_total);
          req.body.prev_water = waterTotal;
        }

        // Subtract remaining payment from monthly_fee
        if (remainingPayment > 0) {
          const monthlyFee = Math.max(0, previousBilling.monthly_fee - remainingPayment);
          remainingPayment = Math.max(0, remainingPayment - previousBilling.monthly_fee);
          req.body.prev_monthly_fee = monthlyFee;
        }

        // Subtract remaining payment from stp
        if (remainingPayment > 0) {
          const stp = Math.max(0, previousBilling.stp - remainingPayment);
          remainingPayment = Math.max(0, remainingPayment - previousBilling.stp);
          req.body.prev_stp = stp;
        }

        // if no payment was made yet
        if (remainingPayment == 0) {
          req.body.prev_water = previousBilling.water_total;
          req.body.prev_monthly_fee = previousBilling.monthly_fee;
          req.body.prev_stp - previousBilling.stp;
        }
      }

      req.body.total_due = req.body.prev_water + req.body.prev_monthly_fee + req.body.prev_stp + req.body.water_total + req.body.monthly_fee + req.body.stp;

      const newBilling = await Billing.create(req.body);
      const tenant = await Tenant.findById({_id: req.body.tenant_id}).lean();
      res.status(201).json({newBilling, tenant});
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

// get billing details for floor leader (TA)
const getTAView = async (req, res) => {
    const { building_num, floor_num } = req.params;
  
    try {
        // check if tenant is assigned to bldg and floor of current logged in leader
        // then add to billings if yes
        const tenants = await Tenant.find({ building_num: Number(building_num), floor_num: Number(floor_num) }).lean();
  
        // extract tenant ids
        const tenantIds = tenants.map(tenant => tenant._id);
  
        const billings = await Billing.find({ tenant_id: { $in: tenantIds } }).populate('tenant_id', 'firstname lastname unit')
        .sort({ billing_period_start: -1 }).lean();

        // Calculate totals
        const totals = {
            prev_reading: 0,
            pres_reading: 0,
            consumption: 0,
            water_basic_charge: 0,
            water_sys_loss: 0,
            water_maintenance: 0,
            water_total: 0,
            monthly_fee: 0,
            stp: 0,
            other_charges: 0,
            total_due: 0
        };
    
        billings.forEach(billing => {
            totals.prev_reading += billing.prev_reading;
            totals.pres_reading += billing.pres_reading;
            totals.consumption += billing.consumption;
            totals.water_basic_charge += billing.water_basic_charge;
            totals.water_sys_loss += billing.water_sys_loss;
            totals.water_maintenance += billing.water_maintenance;
            totals.water_total += billing.water_total;
            totals.monthly_fee += billing.monthly_fee;
            totals.stp += billing.stp;
            totals.other_charges += billing.other_charges;
            totals.total_due += billing.total_due;
        });
  
        res.render('floorLeaderTA', {billings, totals, userRole: req.session.userRole, userId: req.session.userId, 
          floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'billings'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  }

const getConsView = async (req, res) => {
  const { building_num } = req.params;

  try {
      const buildingLeader = await BuildingLeader.findOne({ building_num: Number(building_num) }).lean();
      const floorLeaders = await FloorLeader.find({ building_num: Number(building_num) }).lean();
      const tenants = await Tenant.find({ building_num: Number(building_num) }).lean();

      const tenantIds = tenants.map(tenant => tenant._id);

      const billings = await Billing.find({ tenant_id: { $in: tenantIds } })
          .populate('tenant_id', 'firstname lastname unit floor_num')
          .sort({billing_period_start: -1})
          .lean();
        
      // group billings by billing period
      const groupByBillingPeriod = (billings) => {
        return billings.reduce((acc, billing) => {
          const billingPeriod = `${billing.billing_period_start}-${billing.billing_period_end}`;

          if (!acc[billingPeriod]) {
            acc[billingPeriod] = [];
          }
          acc[billingPeriod].push(billing);
          return acc;
        }, {});
      };

      // calculate totals for each floor leader
      const calcTotalsForFloorLeaders = (floorLeaders, billingsGroupedByPeriod, tenants) => {
        return floorLeaders.map(floorLeader => {
          const leaderTenants = tenants.filter(tenant => tenant.floor_num === floorLeader.floor_num).map(tenant => tenant._id.toString());
      
          const totalsByPeriod = Object.entries(billingsGroupedByPeriod).map(([period, billings]) => {
            const periodBillings = billings.filter(billing => leaderTenants.includes(billing.tenant_id._id.toString()));
            const consumption = periodBillings.reduce((sum, billing) => sum + billing.consumption, 0);
            const basicCharge = periodBillings.reduce((sum, billing) => sum + billing.water_basic_charge, 0);
            const sysLossCharge = periodBillings.reduce((sum, billing) => sum + billing.water_sys_loss, 0);
            const waterMaintenance = periodBillings.reduce((sum, billing) => sum + billing.water_maintenance, 0);
            const currWater = periodBillings.reduce((sum, billing) => sum + billing.water_total, 0);
            const currMonthly = periodBillings.reduce((sum, billing) => sum + billing.monthly_fee, 0);
            const currSTP = periodBillings.reduce((sum, billing) => sum + billing.stp, 0);
            const prevWater = periodBillings.reduce((sum, billing) => sum + billing.prev_water, 0);
            const prevMonthly = periodBillings.reduce((sum, billing) => sum + billing.prev_monthly_fee, 0);
            const prevSTP = periodBillings.reduce((sum, billing) => sum + billing.prev_stp, 0);
            const otherCharges = periodBillings.reduce((sum, billing) => sum + billing.other_charges, 0);
            const paymentAmount = periodBillings.reduce((sum, billing) => sum + billing.payment_amount, 0);
            const totalAmountDue = periodBillings.reduce((sum, billing) => sum + billing.total_due, 0);
            return {
              period,
              consumption,
              basicCharge,
              sysLossCharge,
              waterMaintenance,
              currWater,
              currMonthly,
              currSTP,
              prevWater,
              prevMonthly,
              prevSTP,
              otherCharges,
              paymentAmount,
              totalAmountDue
            };
          });
      
          return {
            floorLeader,
            totalsByPeriod
          };
        });
      };

      const billingsGroupedbyPeriod = groupByBillingPeriod(billings);

      const totalsForFloorLeaders = calcTotalsForFloorLeaders(floorLeaders, billingsGroupedbyPeriod, tenants);
      // console.log(JSON.stringify(totalsForFloorLeaders, null, 2));

      res.render('buildingLeaderConsSOA', {
          building_num,
          billings,
          consumptionPerFloor: totalsForFloorLeaders,
          buildingLeader,
          floorLeaders,
          userRole: req.session.userRole,
          userId: req.session.userId,
          floorNum: req.session.floorNum,
          buildingNum: req.session.bldgNum,
          activePage: 'billings'
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// tenant bills
const getTenantBills = async (req, res) => {
  const {userId} = req.params; // Assuming userId is passed as a parameter

  try {
    // Find tenant details based on userId
    const tenant = await Tenant.findById(userId).lean();

    if (!tenant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch bills for the found tenant
    const billings = await Billing.find({ tenant_id: userId }).populate('tenant_id', 'firstname lastname unit')
                                  .sort({ billing_period_start: -1 }).lean();

    res.render('tenantBills', {billings, tenant, userRole: req.session.userRole, userId: req.session.userId, 
      floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'personal'});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get one bill for preview
const previewBill = async (req, res) => {
  const {billId} = req.params;

  try {
    const bill = await Billing.findById(billId).lean();
    const tenant = await Tenant.findById(req.session.userId).lean();

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.render('previewBill', {bill, tenant, userRole: req.session.userRole, userId: req.session.userId, 
      floorNum: req.session.floorNum, buildingNum: req.session.bldgNum});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const renderViewAdminBillings = async (req, res) => {
  res.render('viewAdminBillings', {userRole: req.session.userRole, userId: req.session.userId, 
    floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'billings'})
}

// get one bill for editing
const getBill = async (req, res) => {
  const { billId } = req.params;

  try {
    const bill = await Billing.findById(billId).lean();

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    return res.json(bill);
  } catch (error) {
    console.log('bleh');
    res.status(500).json({ message: error.message });
  }
}

const updateBill = async (req, res) => {
  const { billId } = req.params;
  const billData = req.body; // Assuming all fields are in req.body for update

  try {
      const updatedBill = await Billing.findByIdAndUpdate(billId, billData, { new: true });

      if (!updatedBill) {
          return res.status(404).json({ message: 'Bill not found' });
      }

      return res.json(updatedBill);
  } catch (error) {
      console.error('Error updating bill:', error.message);
      return res.status(500).json({ message: 'Failed to update bill' });
  }
}

// DELETE a bill
const deleteBill = async (req, res) => {
  const { billId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ message: 'Invalid bill ID' });
  }

  try {
      const bill = await Billing.findByIdAndDelete({_id: billId});

      if (!bill) {
          return res.status(404).json({ message: 'Bill not found' });
      }

      res.status(200).json({ message: 'Bill successfully deleted!'});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const checkPrevBill = async (req, res) => {
  const {tenant_id} = req.params;

  try {
    // check if the tenant has had a previous billing
    const previousBilling = await Billing.findOne({tenant_id: tenant_id}).sort({billing_period_end: -1}).lean();
    
    if (previousBilling) {
      res.status(201).json({previousBilling});
    } else {
      res.status(404).json({ message: "No previous billing data found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


  module.exports = {
    getTAView,
    getConsView,
    createBilling,
    getLatestBillNo,
    getTenantBills,
    previewBill,
    renderViewAdminBillings,
    getBill,
    updateBill,
    deleteBill,
    checkPrevBill
  }