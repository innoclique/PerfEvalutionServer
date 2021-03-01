const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean, any } = require("joi");
//const { boolean } = require("joi");

const KpiHistorySchema = new mongoose.Schema({

    CreatedOn:{type:Date},
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    KpiData:{type:Object},
    Action: {type:String}

}
,{usePushEach: true}
);

KpiHistorySchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("KPIHistory", KpiHistorySchema);