const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const StatusesSchema = new mongoose.Schema({
    Status:{
        type: String,
        default: 'Initiated'
    },  
    Key:{type:String,default:'Init'},
    CreatedOn:  { type: Date },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedOn:  { type: Date },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

StatusesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("statuses", StatusesSchema);