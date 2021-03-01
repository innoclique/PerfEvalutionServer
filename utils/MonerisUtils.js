var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const getDefaultConfig = ()=>{
    let {monerisSettings} = config;
    const options = {
        "store_id": monerisSettings.STORE_ID,
        "api_token": monerisSettings.API_TOKEN,
        "checkout_id": monerisSettings.CHECKOUT_ID,
        "environment": monerisSettings.ENVIRONMENT,
        "action": monerisSettings.ACTION,
        "dynamic_descriptor": monerisSettings.DYNAMIC_DESCRIPTOR,
        "language": monerisSettings.LANGUAGE,
    };
    return options;
}
module.exports = {
    MonerisConfig:getDefaultConfig
}