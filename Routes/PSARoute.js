const Express = require("express");
const router = Express.Router();
const {ClientChartsSummaryCtrl} = require('../Controller/PSAController');

router.post("/dashboard/client/summary", ClientChartsSummaryCtrl);

module.exports = router;
