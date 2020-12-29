const {AddTransactionsHistory,
        } = require('../DataServices/TransactionsHistoryService');

const addTransactionHistoryCtrl = async (req,res,next)=>{
    await AddTransactionsHistory(req.body)
        .then(Response => Response ? res.status(200).json({message: "Added Record successfully."}) : res.status(404).json("Transactions Not Found"))
        .catch(err => next(err));
}

module.exports = {
    AddTransactionHistoryCtrl:addTransactionHistoryCtrl
}