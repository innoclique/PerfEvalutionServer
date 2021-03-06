
//////////////////////////////////////////////////////////////
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
require('dotenv').config();
const App = Express();
const Cookieparser = require('cookie-parser');
const Port = process.env.PORT||3000;
//////////////////////////////////////////////

//////////////////////////////////////////////////////////
const IdentityRoute = require("./Routes/IdentityRoute");
const AuthHelper = require("./Helpers/Auth_Helper");
const SharedRoute=require('./Routes/SharedRoute');
const ApplicationRoute=require('./Routes/ApplicationRoute');
const EvaluationRoute=require('./Routes/EvaluationAdminRoute');
const psaRoute=require('./Routes/PSARoute');
const rsaARoute=require('./Routes/RSARoute');
const chartsRoute=require('./Routes/ChartsRoute');
const csaARoute=require('./Routes/CSARoute');
const EmployeeManagerRouter=require('./Routes/EmployeeManagerRouter');
const reportsRoute=require('./Routes/ReportsRoute');
const paymentConfigRoute=require('./Routes/PaymentConfigRoute');
const MonerisRoute=require('./Routes/MonerisRoute');
const TransactionsRoute=require('./Routes/TransactionsRoute');
const ClientConfigRoute=require('./Routes/ClientConfigRoute');
const notificationsRoute=require('./Routes/NotificationsRoute');
const userActivityRoute=require('./Routes/UserActivityRoute');
/////////////////////////////////////////////////////
var logger=require('./logger');
App.use(Cors());
App.use(Express.json({limit:'50mb'}));  
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({extended:true}));


/////////////////////API- ROUTE----------------
App.use("/api/identity", IdentityRoute );
App.use("/api/shared", SharedRoute );
App.use("/api/app", ApplicationRoute );
App.use("/api/evaluation", EvaluationRoute );
App.use("/api/psa", psaRoute );
App.use("/api/chart",  chartsRoute);
App.use("/api/rsa", rsaARoute );
App.use("/api/csa", csaARoute );
App.use("/api/em", EmployeeManagerRouter );
App.use("/api/reports",  reportsRoute);
App.use("/api/payments", paymentConfigRoute );
App.use("/api/moneris/ticket",MonerisRoute);
App.use("/api/transactions",TransactionsRoute);
App.use("/api/clientconfig",ClientConfigRoute);
App.use("/api/notifications",  notificationsRoute);
App.use("/api/log/useractivity",  userActivityRoute);
App.use(Cookieparser());
////////////////////global error handler-------
App.use(AuthHelper.ErrorHandler);  

/////////////page Not Found ---------------
App.get('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.post('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.put('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.delete('*', function(req, res){ res.status(404).json("404 Page  Not found ")});


process.on('unhandledRejection',function (error,p) {        
    logger.error('error '+error);
    logger.error('stack ::'+ error.stack)
    //process.exit(1);
})
////////Start serve connection --------
App.listen( Port ,(err)=>{ 
    logger.debug('starting app');
    if(!err){
        console.log("server is running on Port "+ Port);
        logger.info('Server running on port %d', Port);
    }
    })
