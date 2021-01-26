const organizationSchema = require("../SchemaModels/OrganizationSchema");
const EvaluationRepo = require('../SchemaModels/Evalution');
const Mongoose = require("mongoose");

const getReport = async (options) => {
    console.log('inside getReport');
    let { reportType, orgId } = options
    let response = {};
    switch (reportType) {
        case 'RESELLER_INFO':
            response = await getResellerInfo(orgId);
            break;
        case 'RESELLER_CLIENTS_INFO':
            response = await getClientInfo(orgId);
            break;
        case 'CLIENTS_INFO':
            response = await getClientInfo(orgId);
            break;
        case 'CLIENT_PURCHASE_HISTORY':
            response = await getClientPurchaseHistory(orgId);
            break;
        case 'EVALUATIONS_SUMMARY':
            response = await getEvaluationsSummary(orgId);
            break;
        case 'CLIENTS_REVENUE':
            response = await getClientInfo(orgId);
            break;
        case 'RESELLER_REVENUE':
            response = await getResellerInfo(orgId);
            break;
        case 'CLIENT_REVENUE_DETAILS':
            response = await getClientPurchaseHistory(orgId);
            break;
        case 'RESELLER_REVENUE_DETAILS':
            response = await getResellerPurchaseHistory(orgId);
            break;
        case 'EA_EVALUATIONS':
            response = await getEAEvaluations(orgId);
            break;

        default:
            break;
    }
    return response;
}

const getEAEvaluations = async (companyId, years) => {
    var year = new Date().getFullYear();
    let whereObj = {};
    whereObj['EvaluationYear'] = `${year}`;
    whereObj['Company'] = Mongoose.Types.ObjectId(companyId);
    console.log(whereObj)
    let evaluationSummaryArray = await EvaluationRepo.find(whereObj, { EvaluationPeriod: 1, EvaluationDuration: 1 });
    return evaluationSummaryArray;
}

const getResellerInfo = async (ParentOrganization) => {
    console.log('inside getResellerInfo ', ParentOrganization);
    let whereObj = { 'ClientType': 'Reseller' };
    whereObj['ParentOrganization'] = Mongoose.Types.ObjectId(ParentOrganization);
    // let clientSummaryArray = await organizationSchema.find(whereObj).sort({ Name: 1 });
    let clientSummaryArray = await getClientPurchaseInfo(whereObj);
    return clientSummaryArray;
}

const getClientPurchaseInfo = async (whereObj) => {
    console.log('inside getClientPurchaseInfo ', whereObj);

    return await organizationSchema.aggregate([
        {
            $match:whereObj
        },
        {
            $lookup: {
                from: "paymentreleases",
                localField: "_id",
                foreignField: "Organization",
                as: "paymentReleases"
            }
        },
        {
            $project: {
                _id: 0, 
                Organization: "$$ROOT", 
                paymentReleases: {
                    $filter: {
                        input: "$paymentReleases",
                        as: "payment",
                        cond: { $eq: ["$$payment.Status", "Complete"] }
                    }
                },
    
            }
        },
        {
            $project: { "Organization.paymentReleases": 0 }
        },
        { $sort: { 'Organization.Name': 1 } }
    ]);
}

const getClientInfo = async (ParentOrganization) => {
    console.log('inside getClientInfo ', ParentOrganization);
    let whereObj = { 'ClientType': 'Client' };
    whereObj['ParentOrganization'] = Mongoose.Types.ObjectId(ParentOrganization);
    let clients = await getClientPurchaseInfo(whereObj);
    let reseller = await organizationSchema.find({ '_id': ParentOrganization });
    let result = {};
    result.resellerInfo = reseller[0];
    result.clientsInfo = clients;
    return result;
}

const getClientPurchaseHistory = async (client) => {
    console.log('inside getClientPurchaseHistory ', client);
    // let clientInfo = await organizationSchema.find({ '_id': client });
    let whereObj = { '_id': Mongoose.Types.ObjectId(client) };
    let clientInfo = await getClientPurchaseInfo(whereObj);
    let resellerInfo = await organizationSchema.find({ '_id': clientInfo[0].Organization.ParentOrganization });
    let result = {};
    result.resellerInfo = resellerInfo[0];
    result.clientInfo = clientInfo[0];
    console.log('clientInfo : ', clientInfo[0]);
    return result;
}

const getResellerPurchaseHistory = async (client) => {
    console.log('inside getResellerPurchaseHistory ', client);
    // let resellerInfo = await organizationSchema.find({ '_id': client });
    let whereObj = { '_id': Mongoose.Types.ObjectId(client) };
    let resellerInfo = await getClientPurchaseInfo(whereObj);
    console.log(resellerInfo);
    let result = {};
    result.resellerInfo = resellerInfo[0];
    return result;
}

const getEvaluationsSummary = async (client) => {
    console.log('inside getEvaluationsSummary ', client);
    let whereObj = {};
    let clientInfo = await organizationSchema.find({ '_id': client });
    // let year = new Date().getFullYear();
    let year = getYearStart(clientInfo.StartMonth);
    whereObj['EvaluationYear'] = `${year}`;
    whereObj['Company'] = Mongoose.Types.ObjectId(client);
    console.log(whereObj)
    let evaluationSummaryArray = await EvaluationRepo.find(whereObj, { EvaluationPeriod: 1, EvaluationDuration: 1 });
    let yearEndCount = evaluationSummaryArray.length;
    clientSummaryResponse = { data: yearEndCount, label: 'Year-end' };
    return clientSummaryResponse;
}

 const getYearStart  = async (month) => {
    if (this.months.indexOf(month) > new Date().getMonth()) {
        var currentYear = (new Date().getFullYear() - 1).toString();
        currentYear = currentYear.substring(2);
        return currentYear;
    } else {
        var currentYear = new Date().getFullYear().toString();
        currentYear = currentYear.substring(2);
        return currentYear;
    }
}

module.exports = {
    GetReport: getReport
}
