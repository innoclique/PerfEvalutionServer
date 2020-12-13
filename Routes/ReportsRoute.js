const Express = require("express");
const router = Express.Router();
const {ReportCtrl} = require('../Controller/ReportsController');

router.post("", ReportCtrl);

module.exports = router;
