const {GetNotifications} = require('../DataServices/NotificationsService');

const notificationsCtrl = async (req,res,next)=>{
    console.log('inside notificationsCtrl ',req.body);
    let notificationsRes = await GetNotifications(req.body);
    res.json(notificationsRes);
}

module.exports = {
    NotificationsCtrl:notificationsCtrl
}