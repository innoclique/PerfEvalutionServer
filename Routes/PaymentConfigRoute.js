const Express = require("express");
const router = Express.Router();
const {AddPaymentConfigCtrl,findPaymentSettingCtrl,FindScaleByClientTypeCtrl} = require('../Controller/PaymentConfigController');

router.post("/add/config", AddPaymentConfigCtrl);
//router.post("/:usertype", findPaymentSettingCtrl);
router.post("/Scale", FindScaleByClientTypeCtrl);

module.exports = router;
