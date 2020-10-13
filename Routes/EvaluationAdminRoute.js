const Express = require("express");
const router = Express.Router();
const EvaluationController = require('../Controller/EvaluationAdminController');




router.post("/CreateEvaluation", EvaluationController.CreateEvaluation);
router.post("/GetEvaluations", EvaluationController.GetEvaluations);
router.post("/DraftEvaluation", EvaluationController.DraftEvaluation);
router.post("/GetEvaluationFormById", EvaluationController.GetEvaluationFormById);
router.post("/UpdateEvaluationForm", EvaluationController.UpdateEvaluationForm);

module.exports = router;
