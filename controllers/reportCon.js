// controllers/reportController.js
const Report = require('../models/reportModel');
const Tenant = require('../models/tenantModel');

const generateReportNumber = async () => {
    const lastReport = await Report.findOne().sort({ report_num: -1 });
    return lastReport ? lastReport.report_num + 1 : 1;
};

exports.createReport = async (req, res) => {
    try {
        const { tenantId, details, comments } = req.body;
        const report_num = await generateReportNumber();
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const report = new Report({
            report_num,
            tenant: tenant._id,
            firstname: tenant.firstname,
            lastname: tenant.lastname,
            details,
            comments
        });

        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({createdAt: -1});
        
        // Flatten the tenant data into the report object
        const flattenedReports = reports.map(report => ({
            ...report._doc,  // Include all properties of the report
        }));

        res.render('tenantReports', { reports: flattenedReports, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'reports' });
        /* res.json(reports); */
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get specific tenant reports

exports.getTenantReports = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const reports = await Report.find({ tenant: tenantId });

        if (reports.length === 0) {
            return res.status(404).json({ error: 'No reports found for this tenant' });
        }

        const flattenedReports = reports.map(report => ({
            ...report._doc
        }));

       /*  res.status(200).json(reports); */

        res.render('reportStatus', { reports: flattenedReports, userRole: req.session.userRole, userId: req.session.userId, 
            floorNum: req.session.floorNum, buildingNum: req.session.bldgNum, activePage: 'reports' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getReportCount = async (req, res) => {
    try {
        const count = await Report.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await Report.findByIdAndUpdate(reportId, { status: 'Resolved' }, { new: true });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json({ message: 'Report resolved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete report 

exports.deleteReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await Report.findByIdAndDelete(reportId);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}