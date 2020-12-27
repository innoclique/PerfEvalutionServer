const Express = require("express");
const router = Express.Router();
const {AddPaymentConfigCtrl,
    FindScaleByClientTypeCtrl,
    SavePaymentReleaseCtrl,
    FindPaymentReleaseByOrgIdCtrl,
    FindAdhocListCtrl,
    FindAdhocLatestCtrl,
    FindEmpScaleByCtrl
} = require('../Controller/PaymentConfigController');

router.post("/add/config", AddPaymentConfigCtrl);
router.post("/Scale", FindScaleByClientTypeCtrl);
router.post("/employee/scale", FindEmpScaleByCtrl);
router.post("/release/save", SavePaymentReleaseCtrl);
router.post("/release/organization", FindPaymentReleaseByOrgIdCtrl);
router.post("/adhoc/request/list", FindAdhocListCtrl);
router.post("/adhoc/latest", FindAdhocLatestCtrl);

module.exports = router;
