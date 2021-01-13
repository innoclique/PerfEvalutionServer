const ClientConfigSchema = require("../SchemaModels/ClientConfigSchema");
const Mongoose = require("mongoose");

const findConfigurationByOrgId =  async (options)=>{
    console.log(`organization : ${options}`)
    let orgConfig = await ClientConfigSchema.findOne(options);
    return orgConfig;
}
module.exports = {
    FindConfigurationByOrgId:findConfigurationByOrgId
}