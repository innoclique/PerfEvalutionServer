const Express = require("express");
const router = Express.Router();
const {NotificationsCtrl} = require('../Controller/NotificationsController');

router.post("", NotificationsCtrl);

module.exports = router;
