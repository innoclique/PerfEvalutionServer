const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const OverridepricescaleSchema = new mongoose.Schema({

    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    EvaluationYear: { type: String, required: true },
    ClientType: { type: String, required: true },
    Range: { type: String, required: true },
    RangeFrom: { type: Number, required: true, default:0 },
    RangeTo: { type: Number, required: true,default:0},
    Cost: { type: Number, required: true ,default:0},
    Discount: { type: Number ,default:0},
    Tax: { type: Number,default:0 },
    Type : { type: String },
    UsageType : { type: String }
});

OverridepricescaleSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Overridepricescales", OverridepricescaleSchema);