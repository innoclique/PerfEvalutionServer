const {AddPaymentConfiguration,findPaymentSettingByUserType,FindScaleByClientType} = require('../DataServices/PaymentConfigService');

const addPaymentConfiguartion = async (req,res,next)=>{
    let paymentConfigResponse = await AddPaymentConfiguration(req.body);
    res.json(paymentConfigResponse);
}

const findPaymentSettingCtrl = async (req,res,next)=>{
    let userType = req.params['usertype'];
    let paymentConfigResponse = await findPaymentSettingByUserType(userType);
    res.json(paymentConfigResponse);
}
const findScaleByClientTypeCtrl = async (req,res,next)=>{
    let userType = req.body;
    let productScaleResponse = await FindScaleByClientType(userType);
    res.json(productScaleResponse);
}


module.exports = {
    AddPaymentConfigCtrl:addPaymentConfiguartion,
    findPaymentSettingCtrl:findPaymentSettingCtrl,
    FindScaleByClientTypeCtrl:findScaleByClientTypeCtrl
}