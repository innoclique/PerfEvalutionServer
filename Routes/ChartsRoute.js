const Express = require("express");
const router = Express.Router();
const {ClientChartsSummaryCtrl} = require('../Controller/ChartController');

router.post("/dashboard", ClientChartsSummaryCtrl);

module.exports = router;
