const {ClientChartSummaryService} = require('../DataServices/ChartsService');

const clientChartsSummaryCtrl = async (req,res,next)=>{
    let dashboardRes = await ClientChartSummaryService(req.body);
    res.json(dashboardRes);
}

module.exports = {
    ClientChartsSummaryCtrl:clientChartsSummaryCtrl
}