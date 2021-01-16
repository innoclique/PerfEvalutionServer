const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
var SchemaTypes = mongoose.Schema.Types;
const subscriptionSchema = new mongoose.Schema({
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    ActivatedOn: { type: Date },
    ValidTill: { type: Date },
    IsActive: { type: Boolean,  default:true},
    Type: { type: String },
});

subscriptionSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Subscription", subscriptionSchema);