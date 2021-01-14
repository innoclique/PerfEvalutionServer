const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");


const ClientConfigSchema = new mongoose.Schema({

    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    ConfigKey:{ type: String, default: null },
    ActivateWithin: { type: Number, default: 0 },
    onBeforeAfter: { type: String },
    RefferenceTo: { type: String },
    TimeUnit: { type: String },
    Description: { type: String}
});

ClientConfigSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Clientconfigurations", ClientConfigSchema);