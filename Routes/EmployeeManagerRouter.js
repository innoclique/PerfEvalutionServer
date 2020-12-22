const Express = require("express");
const router = Express.Router();
const EmployeeManagerController = require('../Controller/EmployeeManagerController');

router.post("/dashboard", EmployeeManagerController.Dashboard);
router.post("/direct/reports", EmployeeManagerController.DirectReposrtsCtrl);

module.exports = router;
