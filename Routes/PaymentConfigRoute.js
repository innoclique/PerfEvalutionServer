const Express = require("express");
const router = Express.Router();
const {AddPaymentConfigCtrl,
    FindScaleByClientTypeCtrl,
    SavePaymentReleaseCtrl,
    FindPaymentReleaseByOrgIdCtrl,
    FindAdhocListCtrl,
    FindAdhocLatestCtrl,
    FindEmpScaleByCtrl,
    FindRangeListCtrl,
    FindPriceListCtrl,
    FindTaxRateByNameCtrl
} = require('../Controller/PaymentConfigController');

router.post("/add/config", AddPaymentConfigCtrl);
router.post("/range/list", FindRangeListCtrl);
router.post("/Scale", FindScaleByClientTypeCtrl);
router.post("/employee/scale", FindEmpScaleByCtrl);
router.post("/release/save", SavePaymentReleaseCtrl);
router.post("/release/organization", FindPaymentReleaseByOrgIdCtrl);
router.post("/adhoc/request/list", FindAdhocListCtrl);
router.post("/adhoc/latest", FindAdhocLatestCtrl);
router.post("/price/list", FindPriceListCtrl);
router.post("/tax", FindTaxRateByNameCtrl);

module.exports = router;
