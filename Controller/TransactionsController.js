const {AddTransactions,
        } = require('../DataServices/TransactionsService');

const addTransactionCtrl = async (req,res,next)=>{
    let transactionResponse = await AddTransactions(req.body);
    res.json(transactionResponse);
}

module.exports = {
    AddTransactionCtrl:addTransactionCtrl
}