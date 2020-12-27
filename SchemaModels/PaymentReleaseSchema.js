const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const PaymentReleasesSchema = new mongoose.Schema({

    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    ActivationDate: { type: Date },
    UserType: { type: String },
    isAnnualPayment: { type: Boolean},
    NoNeeded: { type: Number, required: true },
    NoOfEmployees: { type: Number, required: true, default:0 },
    NoOfMonths: { type: Number, required: true,default:0},
    NoOfMonthsLable: { type: String, required: true ,default:0},
    Status: { type: String ,default:0},/* Draft,Pending,Success,Complete,Canceled,Rejected */
    COST_PER_MONTH: { type: Number,default:0 },
    COST_PER_MONTH_ANNUAL_DISCOUNT : { type: Number },
    COST_PER_PA : { type: Number },
    DISCOUNT_PA_PAYMENT : { type: Number },
    TOTAL_AMOUNT : { type: Number },
    DUE_AMOUNT : { type: Number },
    TAX_AMOUNT : { type: Number },
    TOTAL_PAYABLE_AMOUNT : { type: Number },
    RangeId : { type: mongoose.Schema.Types.ObjectId, ref: 'Overridepricescales', default: null  },
    Range : { type: String},
    DurationMonths : { type: String},
    Purpose : { type: String},
    Type : { type: String},/* Initial,  */
    Paymentdate:{type:Date,default:new Date()}
});

PaymentReleasesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("PaymentReleases", PaymentReleasesSchema);