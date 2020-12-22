const Express = require("express");
const router = Express.Router();
const {MonerisCtrl} = require('../Controller/MonerisController');

router.post("", MonerisCtrl);

module.exports = router;
