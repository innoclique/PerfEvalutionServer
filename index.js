
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
/////////////////////////////////////////////////////
var logger=require('./logger');
App.use(Cors());
App.use(Express.json());  
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({extended:true}));


/////////////////////API- ROUTE----------------
App.use("/Api/Identity", IdentityRoute );
App.use(Cookieparser());
////////////////////global error handler-------
App.use(AuthHelper.ErrorHandler);  

/////////////page Not Found ---------------
App.get('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.post('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.put('*', function(req, res){ res.status(404).json("404 Page Not found ")});
App.delete('*', function(req, res){ res.status(404).json("404 Page  Not found ")});



////////Start serve connection --------
App.listen( Port ,(err)=>{ 
    logger.debug('starting app');
    if(!err){
        console.log("server is running on Port "+ Port);
        logger.info('Server running on port %d', Port);
    }
    })
