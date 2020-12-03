const Express = require("express");
const router = Express.Router();
const EmployeeManagerController = require('../Controller/EmployeeManagerController');

router.post("/dashboard", EmployeeManagerController.Dashboard);

module.exports = router;
