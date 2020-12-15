const Express = require("express");
const router = Express.Router();
const {AddPaymentConfigCtrl,findPaymentSettingCtrl} = require('../Controller/PaymentConfigController');

router.post("/add/config", AddPaymentConfigCtrl);
router.post("/:usertype", findPaymentSettingCtrl);

module.exports = router;
