const Express = require('express');
const route = Express.Router();
const ApplicationController = require('../Controller/ApplicationController');
const AuthHelper = require('../Helpers/Auth_Helper');


route.post('/AddOrganization', ApplicationController.AddOrganization);
module.exports = route;

