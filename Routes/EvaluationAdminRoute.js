const Express = require("express");
const router = Express.Router();
const EvaluationController = require('../Controller/EvaluationAdminController');




router.post("/CreateEvaluation", EvaluationController.CreateEvaluation);
router.post("/GetEvaluations", EvaluationController.GetEvaluations);
router.post("/GetAvailableOrgEvaluations", EvaluationController.GetAvailableOrgEvaluations);
router.post("/GetAppendix", EvaluationController.GetAppendix);
router.post("/dashboard", EvaluationController.GetEvaluationDashboard);
router.post("/DraftEvaluation", EvaluationController.DraftEvaluation);
router.post("/GetEvaluationFormById", EvaluationController.GetEvaluationFormById);
//router.post("/UpdateEvaluationForm", EvaluationController.UpdateEvaluationForm);
router.post("/UpdatePeers", EvaluationController.UpdatePeers);
router.post("/UpdateDirectReportees", EvaluationController.UpdateDirectReportees);
router.post("/GetCompetencyValues", EvaluationController.GetCompetencyValues);
router.post("/GetEmpCurrentEvaluation", EvaluationController.GetEmpCurrentEvaluation);
router.post("/GetEmployeePeersCompetencies", EvaluationController.GetEmployeePeersCompetencies);
router.post("/ReleaseKpiForm", EvaluationController.ReleaseKpiForm);

module.exports = router;
