const Mongoose = require("mongoose");
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);

Mongoose.connect(config.database, { useNewUrlParser:true, useCreateIndex:true ,useUnifiedTopology:true})
.then( con=>{console.error(" Connection Successful  "+config.database);})
.catch( err=>{console.error(" Failed To Connect to Db " + err);}); 
//Mongoose.set("debug",true);
Mongoose.Promise = global.Promise;  

exports.UserRepository = require('../SchemaModels/UserSchema');

// exports.JobRepository = require('../SchemaModels/JobSchema');

// exports.ApplicationRepository = require('../SchemaModels/ApplicationsSchema');

// exports.AcademicRepository = require('../SchemaModels/InstitutionSchema');

// exports.WorkExRepository = require('../SchemaModels/WorkExperienceSchema');

