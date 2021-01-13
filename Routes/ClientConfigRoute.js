const Express = require("express");
const router = Express.Router();
const {FindConfigByOrgCtrl} = require('../Controller/ClientConfigController');

router.post("/organization", FindConfigByOrgCtrl);

module.exports = router;
