const {FindConfigurationByOrgId} = require('../DataServices/ClientConfigService');
const findConfigByOrgCtrl = async (req,res,next)=>{
    let payload = req.body;
    let configResponse = await FindConfigurationByOrgId(payload);
    res.json(configResponse);
}

module.exports = {
    FindConfigByOrgCtrl:findConfigByOrgCtrl
}