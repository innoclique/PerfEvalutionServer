const Express = require('express');
const route = Express.Router();
const ApplicationController = require('../Controller/ApplicationController');
const AuthHelper = require('../Helpers/Auth_Helper');


route.post('/AddOrganization', ApplicationController.AddOrganization);
route.post('/GetOrganizationDataById',ApplicationController.GetOrganizationDataById);
route.post('/GetAllOrganizations',ApplicationController.GetAllOrganizations)
module.exports = route;

