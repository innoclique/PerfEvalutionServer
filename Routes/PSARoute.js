const Express = require("express");
const router = Express.Router();
const {DashBoradCtrl} = require('../Controller/PSAController');

router.post("/dashboard", DashBoradCtrl);

module.exports = router;