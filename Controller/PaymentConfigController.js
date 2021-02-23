const {AddPaymentConfiguration,
    findPaymentSettingByUserType,
    FindScaleByClientType,
    SavePaymentRelease,
    FindPaymentReleaseByOrgId,
    FindAdhocRequestList,
    FindAdhocLatestByOrganization,
    FindEmployeeScale,
    FindRangeList,
    FindPriceList,
    FindTaxRateByName,
    DeletePaymentRelease,
    SendPaymentInfoEmailService
} = require('../DataServices/PaymentConfigService');

const sendPaymentInfoEmailCtrl = async (req,res,next)=>{
    let EmailResponse = await SendPaymentInfoEmailService(req.body);
    res.json(EmailResponse);
}
const addPaymentConfiguartion = async (req,res,next)=>{
    let paymentConfigResponse = await AddPaymentConfiguration(req.body);
    res.json(paymentConfigResponse);
}

const findTaxRateByNameCtrl = async (req,res,next)=>{
    let request = req.body;
    let taxInfo = await FindTaxRateByName(request.State);
    let response={tax:taxInfo}
    res.json(response);
}

const findPaymentSettingCtrl = async (req,res,next)=>{
    let userType = req.params['usertype'];
    let paymentConfigResponse = await findPaymentSettingByUserType(userType);
    res.json(paymentConfigResponse);
}
const findScaleByClientTypeCtrl = async (req,res,next)=>{
    let productScaleResponse = await FindScaleByClientType(req.body);
    res.json(productScaleResponse);
}

const savePaymentReleaseCtrl = async (req,res,next)=>{
    await SavePaymentRelease(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Payment Release Not Saved"))
        .catch(err => next(err));
}

const findPaymentReleaseByOrgIdCtrl = async (req,res,next)=>{
    let paymentReleaseData = await FindPaymentReleaseByOrgId(req.body);
    res.json(paymentReleaseData);
}

const findAdhocListCtrl = async (req,res,next)=>{
    let adhocList = await FindAdhocRequestList();
    res.json(adhocList);
}

const findAdhocLatestCtrl = async (req,res,next)=>{
    let adhocLatest = await FindAdhocLatestByOrganization(req.body);
    res.json(adhocLatest);
}

const findEmpScaleByCtrl = async (req,res,next)=>{
    let productScaleResponse = await FindEmployeeScale(req.body);
    res.json(productScaleResponse);
}

const findRangeListCtrl = async (req,res,next)=>{
    let productScaleResponse = await FindRangeList(req.body);
    res.json(productScaleResponse);
}

const findPriceListCtrl = async (req,res,next)=>{
    let priceListResp = await FindPriceList(req.body);
    res.json(priceListResp);
}
const deletePaymentReleaseCtrl = async (req,res,next)=>{
    await DeletePaymentRelease(req.body).then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Payment Release Not deleted"))
    .catch(err => next(err));
}

module.exports = {
    AddPaymentConfigCtrl:addPaymentConfiguartion,
    findPaymentSettingCtrl:findPaymentSettingCtrl,
    FindScaleByClientTypeCtrl:findScaleByClientTypeCtrl,
    SavePaymentReleaseCtrl:savePaymentReleaseCtrl,
    FindPaymentReleaseByOrgIdCtrl:findPaymentReleaseByOrgIdCtrl,
    FindAdhocListCtrl:findAdhocListCtrl,
    FindAdhocLatestCtrl:findAdhocLatestCtrl,
    FindEmpScaleByCtrl:findEmpScaleByCtrl,
    FindRangeListCtrl:findRangeListCtrl,
    FindPriceListCtrl:findPriceListCtrl,
    FindTaxRateByNameCtrl:findTaxRateByNameCtrl,
    DeletePaymentReleaseCtrl:deletePaymentReleaseCtrl,
    SendPaymentInfoEmailCtrl:sendPaymentInfoEmailCtrl
    
}