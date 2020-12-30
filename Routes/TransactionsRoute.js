const Express = require("express");
const router = Express.Router();
const {AddTransactionCtrl,FindAllTransactionsByOrgIdCtrl
} = require('../Controller/TransactionsController');
const {AddTransactionHistoryCtrl
} = require('../Controller/TransactionsHistoryController');

router.post("/add", AddTransactionCtrl);
router.post("/list", FindAllTransactionsByOrgIdCtrl);
router.post("/history/add", AddTransactionHistoryCtrl);

module.exports = router;
