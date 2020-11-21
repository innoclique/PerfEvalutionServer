const Express = require("express");
const router = Express.Router();
const {CSADashBoradCtrl} = require('../Controller/CSAController');

router.post("/dashboard", CSADashBoradCtrl);

module.exports = router;
