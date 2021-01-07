const got = require("got");
const { v4: uuidv4 } = require('uuid');
const requestObj = {
    "store_id": "moneris",
    "api_token": "hurgle",
    "checkout_id": "chkt5BF66neris",
    "txn_total": "452.00",
    "environment": "qa",
    "action": "preload",
    "order_no": "",
    "cust_id": "chkt - cust - 0303",
    "dynamic_descriptor": "dyndesc",
    "language": "en",

    /*"cart": {
        "items": [
            {
                "url": "https:\/\/example.com\/examples\/item1.jpg",
                "description": "One item",
                "product_code": "one_item",
                "unit_cost": "100.00",
                "quantity": "1"
            },
            {
                "url": "https:\/\/example.com\/examples\/item2.jpg",
                "description": "Two item",
                "product_code": "two_item",
                "unit_cost": "200.00",
                "quantity": "1"
            },
            {
                "url": "https:\/\/example.com\/examples\/item3.jpg",
                "description": "Three item",
                "product_code": "three_item",
                "unit_cost": "100.00",
                "quantity": "1"
            }
        ],
        "subtotal": "400.00",
        "tax": {
            "amount": "52.00",
            "description": "Taxes",
            "rate": "13.00"
        }
    },
    "contact_details": {
        "first_name": "bill",
        "last_name": "smith",
        "email": "test@moneris.com",
        "phone": "4165551234"
    },
    "shipping_details": {
        "address_1": "1 main st",
        "address_2": "Unit 2012",
        "city": "Toronto",
        "province": "ON",
        "country": "CA",
        "postal_code": "M1M1M1"
    },
    "billing_details": {
        "address_1": "1 main st",
        "address_2": "Unit 2000",
        "city": "Toronto",
        "province": "ON",
        "country": "CA",
        "postal_code": "M1M1M1"
    }*/
};

const requestOptions = {
    headers:{
      },
    json: requestObj
};
const postUrl = "https://gatewayt.moneris.com/chkt/request/request.php";

const getTicket = async (options) => {
    console.log(options);
    let {payableAmount,transactionId} = options;
    requestObj["txn_total"] = payableAmount;//Number(payableAmount);
    requestObj["order_no"] = uuidv4();
    try {
        console.log('inside getTicket');
        console.log("===MONARIES-REQUEST===");
        console.log(requestObj);
        const {body} = await got.post(postUrl, {
            json: requestObj,
            responseType: 'json'
        });
        console.log("===MONARIES RESPONSE===")
        console.log(body);
        console.log("====END====")
        return body;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

module.exports = {
    GetTicket: getTicket
}
