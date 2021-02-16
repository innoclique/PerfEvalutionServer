const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");
const RsaAccountDetailsSchema = require("../SchemaModels/RsaAccountDetailsSchema");

const fetchRSAAccountDetailsService = async(options) => {
    let {orgId} = options;
    let organizationList = await RsaAccountDetailsSchema.find({Organization:orgId}).populate("RangeId");
    return organizationList;
}

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
    let statusResultInfo = await userSchema.aggregate([getStatusAggregateQuery()])
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
                { "$match": { "IsActive": true } },
                {
                    $lookup: {
                        from: "organizations",
                        localField: "Organization",
                        foreignField: "_id",
                        as: "client_active"
                    }
                },
                { "$unwind": "$client_active" },
                {
                    $match: {
                        "client_active.ClientType": "Client"
                    }
                },
                {
                    $count: "count"
                }
            ],
             "clientInActive": [
                { "$match": { "IsActive": false } },
                {
                    $lookup: {
                        from: "organizations",
                        localField: "Organization",
                        foreignField: "_id",
                        as: "client_inactive"
                    }
                },
                { "$unwind": "$client_inactive" },
                {
                    $match: {
                        "client_inactive.ClientType": "Client"
                    }
                },
                {
                    $count: "count"
                }
            ],
            "resellerActive": [
                { "$match": { "IsActive": true } },
                {
                    $lookup: {
                        from: "organizations",
                        localField: "Organization",
                        foreignField: "_id",
                        as: "reseller_active"
                    }
                },
                { "$unwind": "$reseller_active" },
                {
                    $match: {
                        "reseller_active.ClientType": "Reseller"
                    }
                },
                {
                    $count: "count"
                }
            ],
            "resellerInActive": [
                { "$match": { "IsActive": false } },
                {
                    $lookup: {
                        from: "organizations",
                        localField: "Organization",
                        foreignField: "_id",
                        as: "reseller_inactive"
                    }
                },
                { "$unwind": "$reseller_inactive" },
                {
                    $match: {
                        "reseller_inactive.ClientType": "Reseller"
                    }
                },
                {
                    $count: "count"
                }
            ]
        }
    };
}
module.exports = {
    DashboardService:dashboardService,
    FetchRSAAccountDetailsService:fetchRSAAccountDetailsService,
}