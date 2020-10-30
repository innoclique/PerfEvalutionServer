const Express = require("express");
const router = Express.Router();
const EvaluationController = require('../Controller/EvaluationAdminController');




router.post("/CreateEvaluation", EvaluationController.CreateEvaluation);
router.post("/GetEvaluations", EvaluationController.GetEvaluations);
router.post("/DraftEvaluation", EvaluationController.DraftEvaluation);
router.post("/GetEvaluationFormById", EvaluationController.GetEvaluationFormById);
//router.post("/UpdateEvaluationForm", EvaluationController.UpdateEvaluationForm);
router.post("/UpdatePeers", EvaluationController.UpdatePeers);
router.post("/UpdateDirectReportees", EvaluationController.UpdateDirectReportees);
router.post("/GetCompetencyValues", EvaluationController.GetCompetencyValues);
router.post("/GetEmpCurrentEvaluation", EvaluationController.GetEmpCurrentEvaluation);
router.post("/GetEmployeePeersCompetencies", EvaluationController.GetEmployeePeersCompetencies);

module.exports = router;
