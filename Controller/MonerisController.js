const {GetTicket} = require('../DataServices/MonerisService');

const monerisCtrl = async (req,res,next)=>{
    console.log('inside monerisCtrl ',req.body);
    let response = await GetTicket(req.body);
    console.log('response from service : ',response);
    res.json(response);
}

module.exports = {
    MonerisCtrl:monerisCtrl
}