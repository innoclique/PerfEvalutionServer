const Express = require("express");
const router = Express.Router();
const ValidationHelper = require('../Helpers/Validation_Helper');
const SharedRoute = require('../Controller/SharedController');
const AuthHelper = require('../Helpers/Auth_Helper');


///////Confirm TnC-----------------------
router.post("/ConfirmTnC", AuthHelper.Authorization(), SharedRoute.ConfirmTnC);
router.post("/GetIndustries", AuthHelper.Authorization(), SharedRoute.GetIndustries);
module.exports = router;
