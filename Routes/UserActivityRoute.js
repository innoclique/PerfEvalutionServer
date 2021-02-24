const Express = require("express");
const router = Express.Router();
const {UserActivityCtrl} = require('../Controller/UserActivityController');

router.post("", UserActivityCtrl);

module.exports = router;
