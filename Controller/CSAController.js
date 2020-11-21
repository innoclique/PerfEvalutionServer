const {CSADashboardService} = require('../DataServices/CSAService');
const dashBoradCtrl = async (req,res,next)=>{
    let payload = req.body;
    let dashboardRes = await CSADashboardService(payload.userId);
    res.json(dashboardRes);
}

module.exports = {
    CSADashBoradCtrl:dashBoradCtrl
}