const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");

const dashboardService =  async ()=>{
    let response = {};
    response['ClientStatus']={
        'active':0,
        'inactive':0
    };
    response['ResellerStatus']={
        'active':0,
        'inactive':0
    };
    let statusResultInfo = await organizationSchema.aggregate([getStatusAggregateQuery()])
    let {clientActive,clientInActive,resellerActive,resellerInActive} = statusResultInfo[0];
    
    if(clientActive && clientActive.length>0)
        response['ClientStatus']['active']=clientActive[0].count;
    if(clientInActive && clientInActive.length>0)
        response['ClientStatus']['inactive']=clientInActive[0].count;
    
    response['ClientStatus']['total']=response['ClientStatus']['active']+response['ClientStatus']['inactive'];
    
    if(resellerActive && resellerActive.length>0)
        response['ResellerStatus']['active']=resellerActive[0].count;
    if(resellerInActive && resellerInActive.length>0)
        response['ResellerStatus']['inactive']=resellerInActive[0].count;
    
    response['ResellerStatus']['total']=response['ResellerStatus']['active']+response['ResellerStatus']['inactive'];
    
    return response;
}
const getStatusAggregateQuery = ()=>{
    return {
        $facet: {
            "clientActive": [
                { "$match": { "ClientType" : "Client","IsActive": true } },
                {
                    $count: "count"
                }
            ],
             "clientInActive": [
                { "$match": { "ClientType" : "Client","IsActive": false } },
                {
                    $count: "count"
                }
            ],
            "resellerActive": [
                { "$match": { "ClientType" : "Reseller","IsActive": true } },
                {
                    $count: "count"
                }
            ],
            "resellerInActive": [
                { "$match": { "ClientType" : "Reseller","IsActive": false } },
                {
                    $count: "count"
                }
            ]
        }
    };
}
module.exports = {
    DashboardService:dashboardService
}