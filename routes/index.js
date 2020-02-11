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
router.get('/search/:query', async function (req, res) {
    let query = req.params['query'];
    let searchObj = await Services_1.StockService.searchExternal(query);
    res.json(Response_1.JsonResponse(true, '', searchObj));
});
router.get('/buy/:symbol/:quantity', async function (req, res) {
    let symbol = req.params['symbol'];
    let quant = req.params['quantity'];
    let stockObj = await Services_1.StockService.BuyBySymbol(symbol, quant);
    //res.json(JsonResponse(true, '', stockObj.toJSON()));
});
router.get('/sell/:symbol/:quantity', async function (req, res) {
    let symbol = req.params['symbol'];
    let quant = req.params['quantity'];
    let stockObj = await Services_1.StockService.SellBySymbol(symbol, quant);
    //res.json(JsonResponse(true, '', stockObj.toJSON()));
});
router.get('/_stock.db', async function (req, res) {
    let path = require('path');
    res.sendFile(path.resolve('./stock.db'));
});
router.get('/favicon.ico', async function (req, res) {
    let path = require('path');
    res.sendFile(path.resolve('favicon.ico'));
});
module.exports = router;
//# sourceMappingURL=index.js.map