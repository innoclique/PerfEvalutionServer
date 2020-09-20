const Express = require('express');
const route = Express.Router();
const ApplicationController = require('../Controller/ApplicationController');
const EmployeeController = require('../Controller/EmployeeController');
const AuthHelper = require('../Helpers/Auth_Helper');


route.post('/AddOrganization', ApplicationController.AddOrganization);
route.post('/GetOrganizationDataById',ApplicationController.GetOrganizationDataById);
route.post('/GetAllOrganizations',ApplicationController.GetAllOrganizations);
route.post('/CreateEmployee', EmployeeController.CreateEmployee);
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
route.post('/UpdateKpiDataById',EmployeeController.UpdateKpiDataById);

route.post('/AddNote', ApplicationController.AddNote);
route.post('/GetNoteDataById',ApplicationController.GetNoteDataById);
route.post('/GetAllNotes',ApplicationController.GetAllNotes);
route.post('/UpdateNoteDataById',ApplicationController.UpdateNoteDataById);

module.exports = route;

