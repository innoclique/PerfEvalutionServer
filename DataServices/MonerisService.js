const got = require("got");
const { v4: uuidv4 } = require('uuid');
const {MonerisConfig} = require("../utils/MonerisUtils")
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);

const getTicket = async (options) => {
    let {monerisSettings} = config;
    
    console.log(options);
    let requestObj = MonerisConfig();
    let {payableAmount,transactionId} = options;
    requestObj["txn_total"] = payableAmount;//Number(payableAmount);
    requestObj["order_no"] = uuidv4();
    try {
        console.log('inside getTicket');
        console.log("===MONARIES-REQUEST===");
        console.log(requestObj);
        const {body} = await got.post(monerisSettings.GATEWAY_URL, {
            json: requestObj,
            responseType: 'json'
        });
        console.log("===MONARIES RESPONSE===")
        console.log(body);
        console.log("====END====")
        return body;
    } catch (error) {
        console.log("Error!")
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

module.exports = {
    GetTicket: getTicket
}
