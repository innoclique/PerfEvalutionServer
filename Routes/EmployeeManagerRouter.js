const Express = require("express");
const router = Express.Router();
const EmployeeManagerController = require('../Controller/EmployeeManagerController');

router.post("/dashboard", EmployeeManagerController.Dashboard);
router.post("/direct/reports", EmployeeManagerController.DirectReposrtsCtrl);
router.post("/request/peer-direct/reports/save", EmployeeManagerController.SavePeerDirectReportRequestCtrl);
router.post("/request/peer-direct/reports/list", EmployeeManagerController.FindPeerDirectReportRequestCtrl);
router.post("/find/employee/peer-direct/reports", EmployeeManagerController.FindPeerDirectReportRequestByEmployeeCtrl);
router.post("/find/request/peer-direct", EmployeeManagerController.findRequestPeerInfoByEmpIdCtrl);

module.exports = router;
