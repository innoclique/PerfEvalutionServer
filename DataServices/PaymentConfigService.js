const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const PaymentConfigSchema = require('../SchemaModels/PaymentConfigurationSchema');
const PaymentPriceScaleRepo = require('../SchemaModels/PaymentPriceScaleSchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');

const addPaymentConfiguration = async (paymentConfig) => {
    const _paymentConfig = await PaymentConfigSchema(paymentConfig);
    var savedpaymentConfig = await _paymentConfig.save();
    return savedpaymentConfig;
};

const findPaymentSettingByUserType = async (type) => {
    const paymentSettingObj = await PaymentConfigSchema.findOne({PaymentSettingType:type})
    return paymentSettingObj;
};

const findScaleByClientType = async (options) => {
    return await PaymentPriceScaleRepo.findOne({
        ClientType:options.ClientType,
        RangeFrom:{$gte:options.RangeFrom},
        RangeTo:{$lt:options.RangeTo}
    })
}

module.exports = {
    AddPaymentConfiguration:addPaymentConfiguration,
    findPaymentSettingByUserType:findPaymentSettingByUserType,
    FindScaleByClientType:findScaleByClientType
}

