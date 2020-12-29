const Express = require("express");
const router = Express.Router();
const {AddTransactionCtrl
} = require('../Controller/TransactionsController');

router.post("/add", AddTransactionCtrl);

module.exports = router;
