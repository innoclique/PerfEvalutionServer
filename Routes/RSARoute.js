const Express = require("express");
const router = Express.Router();
const {DashBoradCtrl,FindAccountDetailsCtrl} = require('../Controller/RSAController');

router.post("/dashboard", DashBoradCtrl);
router.post("/account/details", FindAccountDetailsCtrl);

module.exports = router;
