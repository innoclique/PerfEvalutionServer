const Express = require("express");
const router = Express.Router();
const ValidationHelper = require('../Helpers/Validation_Helper');
const SharedRoute = require('../Controller/SharedController');
const AuthHelper = require('../Helpers/Auth_Helper');


///////Confirm TnC-----------------------
router.post("/ConfirmTnC", AuthHelper.Authorization(), SharedRoute.ConfirmTnC);
router.post("/GetIndustries", SharedRoute.GetIndustries);
router.post("/GetEvaluationCategories", SharedRoute.GetEvaluationCategories);
router.post("/GetModelsByIndustry", SharedRoute.GetModelsByIndustry);
router.post("/GetModelsByIndustryByOrganization", SharedRoute.GetModelsByIndustryByOrganization);
router.post("/GetCompetencyList", SharedRoute.GetCompetencyList);
router.post("/SearchEmployee",SharedRoute.SearchEmployee);

module.exports = router;
