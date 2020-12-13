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
    let clientSummaryArray = await organizationSchema.find(whereObj);
    return clientSummaryArray;
}

const getClientInfo = async (ParentOrganization) => {
    console.log('inside getClientInfo ', ParentOrganization);
    let whereObj = { 'ClientType': 'Client' };
    whereObj['ParentOrganization'] = Mongoose.Types.ObjectId(ParentOrganization);
    let clients = await organizationSchema.find(whereObj);
    let reseller = await organizationSchema.find({ '_id': ParentOrganization });
    let result = {};
    result.resellerInfo = reseller[0];
    result.clientsInfo = clients;
    return result;
}

const getClientPurchaseHistory = async (client) => {
    console.log('inside getClientPurchaseHistory ', client);
    let clientInfo = await organizationSchema.find({ '_id': client });
    let resellerInfo = await organizationSchema.find({ '_id': clientInfo[0].ParentOrganization });
    let result = {};
    result.resellerInfo = resellerInfo[0];
    result.clientInfo = clientInfo[0];
    return result;
}

const getResellerPurchaseHistory = async (client) => {
    console.log('inside getResellerPurchaseHistory ', client);
    let resellerInfo = await organizationSchema.find({ '_id': client });
    console.log(resellerInfo);
    let result = {};
    result.resellerInfo = resellerInfo[0];
    return result;
}

const getEvaluationsSummary = async (client) => {
    console.log('inside getEvaluationsSummary ', client);
    let whereObj = {};
    let year = new Date().getFullYear();
    whereObj['EvaluationYear'] = `${year}`;
    whereObj['Company'] = Mongoose.Types.ObjectId(client);
    console.log(whereObj)
    let evaluationSummaryArray = await EvaluationRepo.find(whereObj, { EvaluationPeriod: 1, EvaluationDuration: 1 });
    let yearEndCount = evaluationSummaryArray.length;
    clientSummaryResponse = { data: yearEndCount, label: 'Year-end' };
    return clientSummaryResponse;
}

module.exports = {
    GetReport: getReport
}