// npm init -y
// npm install express dotenv mongoose express-handlebars body-parser path express-session bcryptjs jszip pdfmake(di ko pa naiinstall)

require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const path = require("path");
const session = require('express-session');

const tenantRoutes = require('./routes/tenantRoutes');
const mainRoutes = require('./routes/mainRoutes');
const billingRoutes = require('./routes/billingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const floorLeaderRoutes = require('./routes/floorLeaderRoutes');
const buildingLeaderRoutes = require('./routes/buildingLeaderRoutes');
const reportRoutes = require('./routes/reportRoutes');
// const meterReadingRoutes = require('./routes/meterReadingRoutes');

require('./handlebars-helpers');

//helpers

const Handlebars = require('handlebars');

Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

Handlebars.registerHelper('getFloorLeaderName', function (floorNum, floorLeaders) {
    let leader = floorLeaders.find(floorLeader => floorLeader.floor_num === floorNum);
    return leader ? `${leader.firstname} ${leader.lastname}` : '';
});

Handlebars.registerHelper('getTotalConsumptionForFloor', function (floorNum, consumptionPerFloor) {
    return consumptionPerFloor[floorNum] || 0;
});

Handlebars.registerHelper('uniqueFloors', function(billings) {
    const floors = [...new Set(billings.map(billing => billing.tenant_id.unit.split('-')[0]))];
    return floors;
});


// express app
const app = express();

// middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// handlebars setup
app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        defaultLayout: 'sidebar',
        layoutsDir: 'views/templates',
        helpers: require('./handlebars-helpers')
    })
);
app.set("view engine", ".hbs");


// express setup
app.use(express.static(path.join(__dirname, 'public')));

// session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using HTTPS
  }));

// routes
app.use('/', mainRoutes);
app.use('/api/tenants/', tenantRoutes);
app.use('/api/billings/', billingRoutes);
app.use('/api/announcements/', announcementRoutes);
app.use('/api/floor-leader/', floorLeaderRoutes);
app.use('/api/building-leader/', buildingLeaderRoutes);
app.use('/api/reports/', reportRoutes);
// app.use('/api/meter-readings/', meterReadingRoutes);

// connect to db (changed method - Cheska)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        // start listening for requests once connected to db
        app.listen(process.env.SERVER_PORT, () => {
            console.log('Connected to MongoDB Atlas & Listening on PORT', process.env.SERVER_PORT);
        });
    })
    .catch((error) => {
        console.log(error)
    });