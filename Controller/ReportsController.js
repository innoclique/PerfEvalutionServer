const {GetReport} = require('../DataServices/ReportsService');

const reportCtrl = async (req,res,next)=>{
    console.log('inside reportCtrl ',req.body);
    let reportsRes = await GetReport(req.body);
    res.json(reportsRes);
}

module.exports = {
    ReportCtrl:reportCtrl
}