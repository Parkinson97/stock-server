import {StockService} from "../Services";
import {JsonResponse} from "../dataModels/Response";
import {User} from "../entity/User";

let express = require('express');
let router = express.Router();

router.get('/getStock/:symbol', async function(req, res) {
  let symbol = req.params['symbol'];
  let stockObj = await StockService.GetBySymbol(symbol);
  res.json(JsonResponse(true, '', stockObj.toJSON()));
});

router.get('/search/:query', async function(req, res) {
  let query = req.params['query'];
  let searchObj = await StockService.searchExternal(query);
  res.json(JsonResponse(true, '', searchObj));
});

router.get('/buy/:symbol/:quantity/:sessionId', async function(req, res) {
  let symbol = req.params['symbol'];
  let quant = req.params['quantity'];
  let sessId = req.params['sessionId'];
  let stockObj = await StockService.BuyBySymbol(symbol, quant, sessId);
  //console.log(stockObj);
  res.json(JsonResponse(true, '', stockObj.toJSON()));
});

router.get('/sell/:symbol/:quantity', async function(req, res) {
  let symbol = req.params['symbol'];
  let quant = req.params['quantity'];
  let stockObj = await StockService.SellBySymbol(symbol, quant);
  //res.json(JsonResponse(true, '', stockObj.toJSON()));
});

router.get('/_stock.db', async function(req, res) {
  let path = require('path');
  res.sendFile(path.resolve('./stock.db'));
});

router.get('/favicon.ico', async function(req, res) {
  let path = require('path');
  res.sendFile(path.resolve('favicon.ico'));
});

module.exports = router;
