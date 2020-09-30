const Express = require("express");
const router = Express.Router();
const ValidationHelper = require('../Helpers/Validation_Helper');
const EvaluationController = require('../Controller/EvaluationAdminController');
const AuthHelper = require('../Helpers/Auth_Helper');



router.post("/CreateEvaluation", EvaluationController.CreateEvaluation);


module.exports = router;
