const Express = require("express");
const router = Express.Router();
const EvaluationController = require('../Controller/EvaluationAdminController');




router.post("/CreateEvaluation", EvaluationController.CreateEvaluation);
router.post("/GetEvaluations", EvaluationController.GetEvaluations);

module.exports = router;
