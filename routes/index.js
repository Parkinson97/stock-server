"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Services_1 = require("../Services");
const Response_1 = require("../dataModels/Response");
let express = require('express');
let router = express.Router();
router.get('/getStock/:symbol', async function (req, res) {
    let symbol = req.params['symbol'];
    let stockObj = await Services_1.StockService.GetBySymbol(symbol);
    res.json(Response_1.JsonResponse(true, '', stockObj.toJSON()));
});
router.get('/_stock.db', async function (req, res) {
    let path = require('path');
    res.sendFile(path.resolve('./stock.db'));
});
module.exports = router;
//# sourceMappingURL=index.js.map