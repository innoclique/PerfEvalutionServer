const mongoose = require("mongoose");
const PeerDirectReportsRequestsSchema = new mongoose.Schema({
    EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },    
    IsDraft:{type:Boolean, default:false},
    Peer:[
        {
            EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },  
            displayTemplate:{type:String},
            Competencies:[{_id:{type:String},Name:{type:String}}],
            message:{type:String}
        }
    ],
    DirectReportees:[
        {
            EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },  
            displayTemplate:{type:String},
            Competencies:[{_id:{type:String},Name:{type:String}}],
            message:{type:String}
        }
    ],
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    CreatedOn:{type:Date,default: Date() },
    Type:{type:String},
    EvaluationYear:{type:String},
});
PeerDirectReportsRequestsSchema.set('toJSON', { versionKey: false });
module.exports = mongoose.model("PeerDirectReportsRequests", PeerDirectReportsRequestsSchema);