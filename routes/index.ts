import {StockService} from "../Services";
import {JsonResponse} from "../dataModels/Response";

let express = require('express');
let router = express.Router();

router.get('/getStock/:symbol', async function(req, res) {
  let symbol = req.params['symbol'];
  let stockObj = await StockService.GetBySymbol(symbol);
  res.json(JsonResponse(true, '', stockObj.toJSON()));
});

router.get('/_stock.db', async function(req, res) {
  let path = require('path');
  res.sendFile(path.resolve('./stock.db'));
});

module.exports = router;
