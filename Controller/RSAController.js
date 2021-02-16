const {DashboardService,FetchRSAAccountDetailsService} = require('../DataServices/RSAService');

const dashBoradCtrl = async (req,res,next)=>{
    let dashboardRes = await DashboardService();
    res.json(dashboardRes);
}

const findAccountDetailsCtrl = async (req,res,next)=>{
    let dashboardRes = await FetchRSAAccountDetailsService(req.body);
    res.json(dashboardRes);
}

module.exports = {
    DashBoradCtrl:dashBoradCtrl,
    FindAccountDetailsCtrl:findAccountDetailsCtrl
}