const {DashboardService} = require('../DataServices/PSAService');
const dashBoradCtrl = async (req,res,next)=>{
    let dashboardRes = await DashboardService();
    res.json(dashboardRes);
}

module.exports = {
    DashBoradCtrl:dashBoradCtrl
}