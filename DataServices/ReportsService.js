const organizationSchema = require("../SchemaModels/OrganizationSchema");
const PaymentReleaseSchema = require("../SchemaModels/PaymentReleaseSchema");
const EvaluationRepo = require('../SchemaModels/Evalution');
const Mongoose = require("mongoose");

const getReport = async (options) => {
    console.log('inside getReport');
    let { reportType, orgId, year } = options
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
        case 'PURCHASE_SUMMARY':
            response = await getClientPurchaseSummary(orgId, year);
            break;
        case 'RESELLER_PURCHASE_SUMMARY':
            response = await getResellerClientPurchaseSummary(orgId, year);
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
            $match: whereObj
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

const getClientPurchaseSummary = async (ParentOrganization, year) => {
    console.log('inside getClientPurchaseSummary ', ParentOrganization, year);

    var paymentSummary = await PaymentReleaseSchema.aggregate(
        [
            { $match: { "Paymentdate": { $exists: true }, "TOTAL_PAYABLE_AMOUNT": { $exists: true }, "Status": "Complete" } },
            {
                $lookup:
                {
                    from: "organizations",
                    localField: "Organization",
                    foreignField: "_id",
                    as: "org"
                }
            },
            {
                $project: {
                    month: { $month: "$Paymentdate" },
                    year: { $year: "$Paymentdate" },
                    TOTAL_PAYABLE_AMOUNT: 1,
                    UsageType: 1,
                    Organization: 1,
                    org: { $arrayElemAt: ["$org", 0] },
                }
            },
            { $match: { "year": year, "org.ParentOrganization": Mongoose.Types.ObjectId(ParentOrganization), "org.ClientType": "Client" } },

            {
                $group: {
                    _id: { month: "$month", UsageType: "$UsageType" },
                    total: { $sum: "$TOTAL_PAYABLE_AMOUNT" }
                }
            },
            { $sort: { month: 1 } },

        ]
    );
    console.log('paymentSummary ::: ', JSON.stringify(paymentSummary));
    let result = {};

    let licenseData = [];
    let employeesData = [];

    for (var i = 1; i <= 12; i++) {
        const employeesItem = paymentSummary.find(item => item._id.month == i && item._id.UsageType == 'Employees');
        const licenseItem = paymentSummary.find(item => item._id.month == i && item._id.UsageType == 'License');

        if (employeesItem) {
            employeesData.push(parseFloat(employeesItem.total));
        } else {
            employeesData.push(0);
        }
        if (licenseItem) {
            licenseData.push(parseFloat(licenseItem.total));
        } else {
            licenseData.push(0);
        }
        result.license = licenseData;
        result.employees = employeesData;
    }

    console.log(result);
    return result;
}

const getResellerClientPurchaseSummary = async (ParentOrganization, year) => {
    console.log('inside getResellerClientPurchaseSummary ', ParentOrganization, year);

    var paymentSummary = await PaymentReleaseSchema.aggregate(
        [
            { $match: { "Paymentdate": { $exists: true }, "TOTAL_PAYABLE_AMOUNT": { $exists: true }, "Status": "Complete" } },
            {
                $lookup:
                {
                    from: "organizations",
                    localField: "Organization",
                    foreignField: "_id",
                    as: "org"
                }
            },
            {
                $project: {
                    month: { $month: "$Paymentdate" },
                    year: { $year: "$Paymentdate" },
                    TOTAL_PAYABLE_AMOUNT: 1,
                    UsageType: 1,
                    Organization: 1,
                    org: { $arrayElemAt: ["$org", 0] },
                }
            },
            { $match: { "year": year, "org.ParentOrganization": Mongoose.Types.ObjectId(ParentOrganization), "org.ClientType": "Reseller" } },

            {
                $group: {
                    _id: { month: "$month" },
                    total: { $sum: "$TOTAL_PAYABLE_AMOUNT" }
                }
            },
            { $sort: { month: 1 } },

        ]
    );
    console.log('paymentSummary ::: ', JSON.stringify(paymentSummary));
    let result = {};

    let data = [];

    for (var i = 1; i <= 12; i++) {
        const item = paymentSummary.find(item => item._id.month == i);
        // const licenseItem = paymentSummary.find(item => item._id.month == i && item._id.UsageType == 'License');

        if (item) {
            data.push(parseFloat(item.total));
        } else {
            data.push(0);
        }
        // if (licenseItem) {
        //     licenseData.push(parseFloat(licenseItem.total));
        // } else {
        //     licenseData.push(0);
        // }
        // result.license = licenseData;
        result.data = data;
    }

    console.log(result);
    return result;
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
    let clientInfo = await organizationSchema.findOne({ '_id': client });
    // let year = new Date().getFullYear();
    console.log('clientInfo.StartMonth : ', JSON.stringify(clientInfo));
    var year = await getYearStart(clientInfo.StartMonth);
    console.log(' year : ', year);
    whereObj['EvaluationYear'] = `${year}`;
    whereObj['Company'] = Mongoose.Types.ObjectId(client);
    console.log(whereObj)
    let evaluationSummaryArray = await EvaluationRepo.find(whereObj, { EvaluationPeriod: 1, EvaluationDuration: 1 });
    let yearEndCount = evaluationSummaryArray.length;
    clientSummaryResponse = { data: yearEndCount, label: 'Year-end' };
    return clientSummaryResponse;
}
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July",
    "Aug", "Sep", "Oct", "Nov", "Dec"];

const getYearStart = async (month) => {
    console.log('month : ', month);
    if (month > new Date().getMonth()) {
        var currentYear = (new Date().getFullYear() - 1).toString();
        return currentYear;
    } else {
        var currentYear = new Date().getFullYear().toString();
        return currentYear;
    }
}

module.exports = {
    GetReport: getReport
}
