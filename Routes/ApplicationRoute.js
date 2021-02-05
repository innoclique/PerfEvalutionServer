const Express = require('express');
const route = Express.Router();
const ApplicationController = require('../Controller/ApplicationController');
const EmployeeController = require('../Controller/EmployeeController');
const DevGoalsController = require('../Controller/DevGoalsController');
const AuthHelper = require('../Helpers/Auth_Helper');


route.post('/UpdateOrganization', ApplicationController.UpdateOrganization);
route.post('/AddOrganization', ApplicationController.AddOrganization);
route.post('/GetOrganizationDataById',ApplicationController.GetOrganizationDataById);
route.post('/GetAllOrganizations',ApplicationController.GetAllOrganizations);
route.post('/SuspendOrg',ApplicationController.SuspendOrg);
route.post('/ActivateOrg',ApplicationController.ActivateOrg);
route.post('/CreateEmployee', EmployeeController.CreateEmployee);
route.post('/UpdateEmployee', EmployeeController.UpdateEmployee);
route.post('/GetEmployeeDataById',EmployeeController.GetEmployeeDataById);
route.post('/GetAllEmployees',EmployeeController.GetAllEmployees);
route.post('/GetEmployeeProfile',EmployeeController.GetEmployeeProfile);
route.post('/UpdateEmployeeProfile',EmployeeController.UpdateEmployeeProfile);


route.post('/AddStrength',EmployeeController.AddStrength);
route.post('/GetAllStrengths',EmployeeController.GetAllStrengths);
route.post('/GetEmployeeEvaluationYears',EmployeeController.GetEmpEvaluationYears);

route.post('/AddAccomplishment', EmployeeController.AddAccomplishment);
route.post('/GetAccomplishmentDataById',EmployeeController.GetAccomplishmentDataById);
route.post('/GetAllAccomplishments',EmployeeController.GetAllAccomplishments);
route.post('/UpdateAccomplishmentDataById',EmployeeController.UpdateAccomplishmentDataById);
route.post('/GetReporteeAccomplishments',EmployeeController.GetReporteeAccomplishments);
route.post('/GetTSReleasedAccomplishments',EmployeeController.GetTSReleasedAccomplishments);

route.post('/AddKpi', EmployeeController.AddKpi);
route.post('/GetKpiDataById',EmployeeController.GetKpiDataById);
route.post('/GetAllKpis',EmployeeController.GetAllKpis);
route.post('/GetEmployeeCurrentEvaluation',EmployeeController.GetEmpCurrentEvaluation);
route.post('/GetKpisByManager',EmployeeController.GetKpisByManager);
route.post('/GetKpisByManagerId',EmployeeController.GetKpisByManagerId);
route.post('/SubmitKpisForEvaluation',EmployeeController.SubmitKpisForEvaluation);
route.post('/SubmitAllSignOffKpis',EmployeeController.SubmitAllSignOffKpis);
route.post('/DenyAllEmployeeSignOffKpis',EmployeeController.DenyAllEmployeeSignOffKpis);
route.post('/SubmitKpisByEmployee',EmployeeController.SubmitKpisByEmployee);
route.post('/SubmitAllKpisByManager',EmployeeController.SubmitAllKpisByManager);
route.post('/SubmitKpisByManager',EmployeeController.SubmitKpisByManager);
route.post('/SubmitSignoffKpisByManager',EmployeeController.SubmitSignoffKpisByManager);
route.post('/UpdateKpiDataById',EmployeeController.UpdateKpiDataById);
route.post('/DenyAllSignoffKpis',EmployeeController.DenyAllSignoffKpis);
route.post('/dashboard',EmployeeController.Dashboard);
route.post('/PG/Signoff', EmployeeController.PGSignoffCtrl);
route.post('/Find/PG/Signoff', EmployeeController.GetPGSignoffByOwnerCtrl);
route.post('/getCopiesTo',EmployeeController.GetCopiesTo);

route.post('/AddNote', ApplicationController.AddNote);
route.post('/GetNoteDataById',ApplicationController.GetNoteDataById);
route.post('/GetAllNotes',ApplicationController.GetAllNotes);
route.post('/UpdateNoteDataById',ApplicationController.UpdateNoteDataById);
route.post('/GetAllDepartments',EmployeeController.GetAllDepartments);
route.post('/GetEmpSetupBasicData',EmployeeController.GetEmpSetupBasicData);
route.post('/GetKpiSetupBasicData',EmployeeController.GetKpiSetupBasicData);
route.post('/GetSetupBasicData',EmployeeController.GetSetupBasicData);
route.post('/GetAllMeasurementCriterias',EmployeeController.GetAllMeasurementCriterias);
route.post('/CreateMeasurementCriteria',EmployeeController.CreateMeasurementCriteria);

route.post('/AddReseller', ApplicationController.AddReseller);
route.post('/UpdateReseller', ApplicationController.UpdateReseller);
route.post('/GetUnlistedEmployees', EmployeeController.GetUnlistedEmployees);
route.post('/GetManagers', EmployeeController.GetManagers);
route.post('/GetImmediateApprCircle', EmployeeController.GetImmediateApprCircle);
route.post('/GetThirdSignatorys', EmployeeController.GetThirdSignatorys);
route.post('/GetDirectReporteesOfManager', EmployeeController.GetDirectReporteesOfManager);
route.post('/GetPeers', EmployeeController.GetPeers);
route.post('/GetKpisForTS', EmployeeController.GetKpisForTS);


route.post('/GetKpisForDevGoals',AuthHelper.Authorization(), DevGoalsController.GetKpisForDevGoals);
route.post('/AddDevGoal', AuthHelper.Authorization(), DevGoalsController.AddDevGoal);
route.post('/UpdateDevGoalById', AuthHelper.Authorization(), DevGoalsController.UpdateDevGoalById);
route.post('/UpdateStrengthById', AuthHelper.Authorization(), DevGoalsController.UpdateStrengthById);
route.post('/GetAllDevGoals', AuthHelper.Authorization(), DevGoalsController.GetAllDevGoals);
route.post('/GetAllDevGoalsByManger', AuthHelper.Authorization(), DevGoalsController.GetAllDevGoalsByManger);
route.post('/GetAllStrengthsByManger', AuthHelper.Authorization(), DevGoalsController.GetAllStrengthsByManger);
route.post('/SubmitActionPlanByEmp',DevGoalsController.SubmitActionPlanByEmp);
route.post('/GetReporteeReleasedKpiForm',DevGoalsController.GetReporteeReleasedKpiForm);
route.post('/GetTSReleasedKpiForm',DevGoalsController.GetTSReleasedKpiForm);

route.post('/SaveCompetencyQnA', AuthHelper.Authorization(), EmployeeController.SaveCompetencyQnA);
route.post('/GetPendingPeerReviewsList', EmployeeController.GetPendingPeerReviewsList);
route.post('/GetPendingPeerReviewsToSubmit', EmployeeController.GetPendingPeerReviewsToSubmit);
route.post('/SavePeerReview', EmployeeController.SavePeerReview);
route.post('/SaveEmployeeFinalRating', EmployeeController.SaveEmployeeFinalRating);
route.post('/SaveManagerFinalRating', EmployeeController.SaveManagerFinalRating);
route.post('/SaveTSFinalRating', EmployeeController.SaveTSFinalRating);
route.post('/GetPeerAvgRating', EmployeeController.GetPeerAvgRating);
route.post('/GetAllOrganizationsForReseller', ApplicationController.GetAllOrganizationsForReseller);
route.post('/GetReporteeEvaluations', EmployeeController.GetReporteeEvaluations);
route.post('/GetTSReporteeEvaluations', EmployeeController.GetTSReporteeEvaluations);
route.post('/GetDRReviewsList', EmployeeController.GetDRReviewsList);
route.post('/GetPendingDRReviewsToSubmit', EmployeeController.GetPendingDRReviewsToSubmit);
route.post('/SaveDRReview', EmployeeController.SaveDRReview);
route.post('/SaveCompetencyQnAByManager', EmployeeController.SaveCompetencyQnAByManager);
route.post('/GetOverallRatingByCompetency', EmployeeController.GetOverallRatingByCompetency);

module.exports = route;

