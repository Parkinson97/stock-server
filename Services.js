"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const User_1 = require("./entity/User");
const Tools_1 = require("./Tools");
const session_1 = require("./entity/session");
const Stock_1 = require("./entity/Stock");
const Cache_1 = require("./entity/Cache");
const Share_1 = require("./entity/Share");
var RepoService;
(function (RepoService) {
    async function UserRepo() {
        let connection = await index_1.getConnection();
        return connection.manager.getRepository(User_1.User);
    }
    RepoService.UserRepo = UserRepo;
    async function SessionRepo() {
        let connection = await index_1.getConnection();
        return connection.manager.getRepository(session_1.Session);
    }
    RepoService.SessionRepo = SessionRepo;
    async function StockRepo() {
        let connection = await index_1.getConnection();
        return connection.manager.getRepository(Stock_1.Stock);
    }
    RepoService.StockRepo = StockRepo;
    async function CacheRepo() {
        let connection = await index_1.getConnection();
        return connection.manager.getRepository(Cache_1.Cache);
    }
    RepoService.CacheRepo = CacheRepo;
    async function ShareRepo() {
        let connection = await index_1.getConnection();
        return connection.manager.getRepository(Share_1.Share);
    }
    RepoService.ShareRepo = ShareRepo;
})(RepoService = exports.RepoService || (exports.RepoService = {}));
var LoginService;
(function (LoginService) {
    async function VerifyUser(username, password) {
        let userrepo = await RepoService.UserRepo();
        let user = await userrepo.findOne({
            where: { name: username }
        });
        if (user == null) {
            return false;
        }
        let passHash = await Tools_1.makePassHash(password, user.salt);
        return (passHash === user.passwordHash);
    }
    LoginService.VerifyUser = VerifyUser;
})(LoginService = exports.LoginService || (exports.LoginService = {}));
var SessionService;
(function (SessionService) {
    async function CreateSession(user) {
        let userrepo = await RepoService.UserRepo();
        let sessrepo = await RepoService.SessionRepo();
        let sess = new session_1.Session();
        sess.key = Tools_1.randomString(64);
        await sessrepo.save(sess);
        user.session = sess;
        await userrepo.save(user);
        return sess;
    }
    SessionService.CreateSession = CreateSession;
    async function GetSessionBySessionKey(key) {
        let sess = await RepoService.SessionRepo();
        return await sess.findOne({
            where: { key: key },
            relations: ['user']
        });
    }
    SessionService.GetSessionBySessionKey = GetSessionBySessionKey;
    async function checkSessionValid(key) {
        let sess = await GetSessionBySessionKey(key);
        return sess.CheckValid(60);
    }
    SessionService.checkSessionValid = checkSessionValid;
    async function InvalidateSession(sessionKey) {
        let sess = await RepoService.SessionRepo();
        await sess.delete({ key: sessionKey });
    }
    SessionService.InvalidateSession = InvalidateSession;
})(SessionService = exports.SessionService || (exports.SessionService = {}));
var UserService;
(function (UserService) {
    async function GetByUsername(username) {
        let userrepo = await RepoService.UserRepo();
        return await userrepo.findOne({
            where: { name: username },
            relations: ['ownedShares']
        });
    }
    UserService.GetByUsername = GetByUsername;
    async function GetUserBySessionKey(sessionKey) {
        let userrepo = await RepoService.UserRepo();
        return await userrepo.findOne({
            where: { sessionId: sessionKey },
            relations: ['ownedShares']
        });
    }
    UserService.GetUserBySessionKey = GetUserBySessionKey;
})(UserService = exports.UserService || (exports.UserService = {}));
var StockService;
(function (StockService) {
    let apiKey = 'bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3';
    async function GetBySymbol(symbol) {
        var _a;
        let stockrepo = await RepoService.StockRepo();
        let stock = await stockrepo.findOne({
            where: { symbol: symbol },
            relations: ['shares']
        });
        if (!((_a = stock) === null || _a === void 0 ? void 0 : _a.CheckValid())) {
            let result = await GetBySymbolFromExternal(symbol);
            let prop = result['data'][0];
            if (!stock) {
                stock = new Stock_1.Stock();
                stock.name = prop['name'];
                stock.symbol = prop['symbol'];
                stock.currency = prop['currency'];
            }
            stock.price = parseFloat(prop['price']);
            stock.sharesTotal = prop['volume'];
            stock.lastSync = new Date();
            await stockrepo.save(stock);
        }
        return stock;
    }
    StockService.GetBySymbol = GetBySymbol;
    async function GetBySymbolFromExternal(symbol) {
        return new Promise(async (resolve, reject) => {
            var _a;
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = 'https://api.worldtradingdata.com/api/v1/stock';
            let key = `${url}?symbol=${symbol}&api_token=${apiKey}`;
            let c = await CacheService.Fetch(key);
            if ((_a = c) === null || _a === void 0 ? void 0 : _a.CheckValid()) {
                resolve(JSON.parse(c.result));
                return;
            }
            const superagent = require('superagent');
            superagent.get(url)
                .send({
                symbol: symbol,
                api_token: apiKey
            })
                .set('accept', 'json')
                .end(async (err, res) => {
                if (err)
                    reject(err);
                else {
                    await CacheService.Store(key, res.text);
                    resolve(JSON.parse(res.text));
                }
            });
        });
    }
    StockService.GetBySymbolFromExternal = GetBySymbolFromExternal;
    async function searchExternal(searchQuery) {
        return new Promise(async (resolve, reject) => {
            var _a;
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = 'https://api.worldtradingdata.com/api/v1/stock_search';
            let key = `${url}?search_term=${searchQuery}&api_token=${apiKey}`;
            let c = await CacheService.Fetch(key);
            if ((_a = c) === null || _a === void 0 ? void 0 : _a.CheckValid()) {
                resolve(JSON.parse(c.result));
                return;
            }
            const superagent = require('superagent');
            superagent.get(url)
                .send({
                search_term: searchQuery,
                api_token: apiKey
            })
                .set('accept', 'json')
                .end(async (err, res) => {
                if (err)
                    reject(err);
                else {
                    await CacheService.Store(key, res.text);
                    resolve(JSON.parse(res.text));
                }
            });
        });
    }
    StockService.searchExternal = searchExternal;
    async function saveStockBySymbol(symb, newShare) {
        let stockrepo = await RepoService.StockRepo();
        let stock = await stockrepo.findOne({
            where: { symbol: symb },
            relations: ['shares']
        });
        stock.sharesTotal = stock.sharesTotal - newShare.quantity;
        stock.shares.push(newShare);
        console.log("NEWSTOCK: " + stock);
        await stockrepo.save(stock);
    }
    StockService.saveStockBySymbol = saveStockBySymbol;
    async function saveUserBySessionKey(sessionKey, newShare, totalStockPriceRequest) {
        let userrepo = await RepoService.UserRepo();
        let user = await userrepo.findOne({
            where: { symbol: sessionKey },
            relations: ['ownedShares']
        });
        user.credit = user.credit - totalStockPriceRequest;
        user.ownedShares.push(newShare);
        // user.sharesTotal = user.sharesTotal - newShare.quantity;
        // user.shares.push(newShare);
        //console.log("NEWuserfle: " + user);
        await userrepo.save(user);
    }
    StockService.saveUserBySessionKey = saveUserBySessionKey;
    async function BuyBySymbol(symbol, quantity, sessionKey) {
        //call db
        let userFile = await UserService.GetUserBySessionKey(sessionKey);
        let stockbysym = await GetBySymbol(symbol);
        let stockRepo = await GetBySymbol(symbol);
        let coinVal = 0.00;
        if (!(stockbysym.currency == userFile['creditCurrency'])) {
            console.log('from: ' + stockbysym.currency + ' - to: ' + userFile['creditCurrency']);
            let currconvert = await ConvertExternal(stockbysym.currency, userFile['creditCurrency']);
            // 1 of stockbysum.currency == currconvert['data'][0] e.g currconvert['data'][0] == {"CAD":"1.306"}
            let currValue = currconvert['data'][userFile['creditCurrency']];
            coinVal = parseFloat(currValue);
            console.log("coinVal: " + coinVal);
        }
        let oneStockPriceInHomeCurrency = coinVal * stockbysym.price;
        let totalStockPriceRequest = oneStockPriceInHomeCurrency * quantity;
        if (totalStockPriceRequest > userFile.credit) {
            //reject request - insufficient funds
            return "fail - insufficient funds";
        }
        else {
            let newShare = new Share_1.Share();
            newShare.stock = stockbysym;
            newShare.boughtPrice = totalStockPriceRequest;
            newShare.user = userFile;
            newShare.currency = stockbysym.currency;
            newShare.quantity = quantity;
            newShare.updatedAt = new Date();
            //take away number requested from stock total db
            // stockRepo.sharesTotal = stockbysym.sharesTotal - newShare.quantity;
            // stockRepo.shares.push(newShare);
            // await stockRepo.save();
            await saveStockBySymbol(stockbysym.symbol, newShare);
            //take away number requested from user currency db
            userFile.credit = userFile.credit - totalStockPriceRequest;
            userFile.ownedShares.push(newShare);
            await saveUserBySessionKey(sessionKey, newShare, totalStockPriceRequest);
            //return information
            let jsonObj = "{'newShare':" + newShare + ", 'newUserCredits:'" + userFile.credit + "}";
            console.log(jsonObj);
            return jsonObj;
        }
        //workout sum total
        return "ERROR";
    }
    StockService.BuyBySymbol = BuyBySymbol;
    async function SellBySymbol(symbol, quant) {
        //
        return '';
    }
    StockService.SellBySymbol = SellBySymbol;
    async function ConvertExternal(from, to) {
        return new Promise(async (resolve, reject) => {
            var _a;
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = "https://api.worldtradingdata.com/api/v1/forex";
            let key = `${url}?base=${from}?convert_to=${to}&api_token=${apiKey}`;
            let c = await CacheService.Fetch(key);
            if ((_a = c) === null || _a === void 0 ? void 0 : _a.CheckValid()) {
                resolve(JSON.parse(c.result));
                return;
            }
            const superagent = require('superagent');
            superagent.get(url)
                .send({
                base: from,
                convert_to: to,
                api_token: apiKey
            })
                .set('accept', 'json')
                .end(async (err, res) => {
                if (err)
                    reject(err);
                else {
                    await CacheService.Store(key, res.text);
                    resolve(JSON.parse(res.text));
                }
            });
        });
    }
    StockService.ConvertExternal = ConvertExternal;
})(StockService = exports.StockService || (exports.StockService = {}));
var CacheService;
(function (CacheService) {
    async function Store(key, value) {
        let repo = await RepoService.CacheRepo();
        let c = await repo.findOne({
            where: {
                key: key
            }
        });
        if (!c)
            c = new Cache_1.Cache();
        c.key = key;
        c.result = value;
        return await repo.save(c);
    }
    CacheService.Store = Store;
    async function Fetch(key) {
        let repo = await RepoService.CacheRepo();
        return await repo.findOne({
            where: {
                key: key
            }
        });
    }
    CacheService.Fetch = Fetch;
})(CacheService = exports.CacheService || (exports.CacheService = {}));
//# sourceMappingURL=Services.js.map