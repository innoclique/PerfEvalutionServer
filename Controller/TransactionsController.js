const {AddTransactions,
    FindAllTransactionsByOrgId
        } = require('../DataServices/TransactionsService');

const addTransactionCtrl = async (req,res,next)=>{
    let transactionResponse = await AddTransactions(req.body);
    res.json(transactionResponse);
}

const findAllTransactionsByOrgIdCtrl = async (req,res,next)=>{
    let transactionResponse = await FindAllTransactionsByOrgId(req.body);
    res.json(transactionResponse);
}

module.exports = {
    AddTransactionCtrl:addTransactionCtrl,
    FindAllTransactionsByOrgIdCtrl:findAllTransactionsByOrgIdCtrl
}