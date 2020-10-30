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

route.post('/AddStrength',EmployeeController.AddStrength);
route.post('/GetAllStrengths',EmployeeController.GetAllStrengths);

route.post('/AddAccomplishment', EmployeeController.AddAccomplishment);
route.post('/GetAccomplishmentDataById',EmployeeController.GetAccomplishmentDataById);
route.post('/GetAllAccomplishments',EmployeeController.GetAllAccomplishments);
route.post('/UpdateAccomplishmentDataById',EmployeeController.UpdateAccomplishmentDataById);

route.post('/AddKpi', EmployeeController.AddKpi);
route.post('/GetKpiDataById',EmployeeController.GetKpiDataById);
route.post('/GetAllKpis',EmployeeController.GetAllKpis);
route.post('/GetKpisByManager',EmployeeController.GetKpisByManager);
route.post('/SubmitKpisForEvaluation',EmployeeController.SubmitKpisForEvaluation);
route.post('/UpdateKpiDataById',EmployeeController.UpdateKpiDataById);

route.post('/AddNote', ApplicationController.AddNote);
route.post('/GetNoteDataById',ApplicationController.GetNoteDataById);
route.post('/GetAllNotes',ApplicationController.GetAllNotes);
route.post('/UpdateNoteDataById',ApplicationController.UpdateNoteDataById);
route.post('/GetAllDepartments',EmployeeController.GetAllDepartments);
route.post('/GetEmpSetupBasicData',EmployeeController.GetEmpSetupBasicData);
route.post('/GetKpiSetupBasicData',EmployeeController.GetKpiSetupBasicData);
route.post('/GetAllMeasurementCriterias',EmployeeController.GetAllMeasurementCriterias);
route.post('/CreateMeasurementCriteria',EmployeeController.CreateMeasurementCriteria);

route.post('/AddReseller', ApplicationController.AddReseller);
route.post('/UpdateReseller', ApplicationController.UpdateReseller);
route.post('/GetUnlistedEmployees', EmployeeController.GetUnlistedEmployees);
route.post('/GetManagers', EmployeeController.GetManagers);
route.post('/GetThirdSignatorys', EmployeeController.GetThirdSignatorys);
route.post('/GetDirectReporteesOfManager', EmployeeController.GetDirectReporteesOfManager);
route.post('/GetPeers', EmployeeController.GetPeers);
route.post('/GetKpisForTS', EmployeeController.GetKpisForTS);


route.post('/GetKpisForDevGoals',AuthHelper.Authorization(), DevGoalsController.GetKpisForDevGoals);
route.post('/AddDevGoal', AuthHelper.Authorization(), DevGoalsController.AddDevGoal);
route.post('/GetAllDevGoals', AuthHelper.Authorization(), DevGoalsController.GetAllDevGoals);

route.post('/SaveCompetencyQnA', AuthHelper.Authorization(), EmployeeController.SaveCompetencyQnA);

module.exports = route;

