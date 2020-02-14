import {getConnection} from "./index";
import {User} from "./entity/User";
import {makePassHash, randomString} from "./Tools";
import {Session} from "./entity/session";
import {Repository} from "typeorm";
import {Stock} from "./entity/Stock";
import {Cache} from "./entity/Cache";
import {Share} from "./entity/Share";

export namespace RepoService{
    export async function UserRepo():Promise<Repository<User>>{
        let connection = await getConnection();
        return connection.manager.getRepository(User);
    }
    export async function SessionRepo():Promise<Repository<Session>>{
        let connection = await getConnection();
        return connection.manager.getRepository(Session);
    }
    export async function StockRepo():Promise<Repository<Stock>>{
        let connection = await getConnection();
        return connection.manager.getRepository(Stock);
    }
    export async function CacheRepo():Promise<Repository<Cache>>{
        let connection = await getConnection();
        return connection.manager.getRepository(Cache);
    }
    export async function ShareRepo():Promise<Repository<Share>>{
        let connection = await getConnection();
        return connection.manager.getRepository(Share);
    }
}

export namespace LoginService{
    export async function VerifyUser(username: string, password: string) {
        let userrepo = await RepoService.UserRepo();
        let user = await userrepo.findOne({
            where: {name: username}
        });
        if(user == null){
            return false;
        }
        let passHash = await makePassHash(password, user.salt);
        return (passHash === user.passwordHash);
    }

}

export namespace SessionService{
    export async function CreateSession(user: User) {
        let userrepo = await RepoService.UserRepo();
        let sessrepo = await RepoService.SessionRepo();
        let sess = new Session();
        sess.key = randomString(64);
        await sessrepo.save(sess);

        user.session = sess;
        await userrepo.save(user);
        return sess;
    }

    export async function GetSessionBySessionKey(key: string) {
        let sess = await RepoService.SessionRepo();
        return await sess.findOne({
            where: {key: key},
            relations: ['user']
        });
    }

    export async function checkSessionValid(key:string){
        let sess = await GetSessionBySessionKey(key);
        return sess.CheckValid(60);
    }

    export async function InvalidateSession(sessionKey: string) {
        let sess = await RepoService.SessionRepo();
        await sess.delete({ key: sessionKey })
    }
}

export namespace UserService{
    export async function GetByUsername(username: string) {
        let userrepo = await RepoService.UserRepo();
        return await userrepo.findOne({
            where: {name:username},
            relations: ['ownedShares']
        });
    }
    export async function GetUserBySessionKey(sessionKey:string){
        let userrepo = await RepoService.UserRepo();
        return await userrepo.findOne({
            where: {sessionId: sessionKey},
            relations: ['ownedShares']
        })
    }
}

export namespace StockService{
    let apiKey = 'bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3';
    export async function GetBySymbol(symbol: string) {
        let stockrepo = await RepoService.StockRepo();

        let stock = await stockrepo.findOne({
            where: {symbol:symbol},
            relations: ['shares']
        });
        if(!stock?.CheckValid()){
            let result = await GetBySymbolFromExternal(symbol);
            let prop = result['data'][0];
            if(!stock){
                stock = new Stock();
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

    export async function GetBySymbolFromExternal(symbol: string){
        return new Promise(async (resolve, reject) => {
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = 'https://api.worldtradingdata.com/api/v1/stock';
            let key = `${url}?symbol=${symbol}&api_token=${apiKey}`;

            let c = await CacheService.Fetch(key);

            if(c?.CheckValid()){
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
                    if(err) reject(err);
                    else{
                        await CacheService.Store(key, res.text);
                        resolve(JSON.parse(res.text))
                    }
                });


        })

    }

    export async function searchExternal(searchQuery: string):Promise<any> {
        return new Promise(async (resolve, reject) => {
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = 'https://api.worldtradingdata.com/api/v1/stock_search';
            let key = `${url}?search_term=${searchQuery}&api_token=${apiKey}`;

            let c = await CacheService.Fetch(key);

            if(c?.CheckValid()){
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
                    if(err) reject(err);
                    else{
                        await CacheService.Store(key, res.text);
                        resolve(JSON.parse(res.text))
                    }
                });


        })
    }
    
    export async function saveStockBySymbol(symb:string, newShare:Share, ) {
        let stockrepo = await RepoService.StockRepo();
        let stock = await stockrepo.findOne({
            where: {symbol:symb},
            relations: ['shares']
        });
        stock.sharesTotal = stock.sharesTotal - newShare.quantity;
        stock.shares.push(newShare);
        //console.log("NEWSTOCK: " + stock);
        await stockrepo.save(stock);
    }

    export async function saveUserBySessionKey(sessionKey:string, newShare:Share, totalStockPriceRequest:number) {
        let userrepo = await RepoService.UserRepo();
        let user = await userrepo.findOne({
            where: {symbol:sessionKey},
            relations: ['ownedShares']
        });
        user.credit = user.credit - totalStockPriceRequest;
        user.ownedShares.push(newShare);
        // user.sharesTotal = user.sharesTotal - newShare.quantity;
        // user.shares.push(newShare);
        //console.log("NEWuserfle: " + user);
        await userrepo.save(user);
    }

    export async function BuyBySymbol(symbol: string, quantity: number, sessionKey:string){
        //call db
        let userFile = await UserService.GetUserBySessionKey(sessionKey);
        let stockbysym = await GetBySymbol(symbol);
        let stockRepo = await GetBySymbol(symbol);
        let coinVal = 0.00;
        if(!(stockbysym.currency == userFile['creditCurrency'])){
            console.log('from: ' + stockbysym.currency + ' - to: ' + userFile['creditCurrency']);
            let currconvert = await ConvertExternal(stockbysym.currency, userFile['creditCurrency']);
            // 1 of stockbysum.currency == currconvert['data'][0] e.g currconvert['data'][0] == {"CAD":"1.306"}
            let currValue = currconvert['data'][userFile['creditCurrency']];
            coinVal = parseFloat(currValue);
            console.log("coinVal: "+coinVal);
        }
        let oneStockPriceInHomeCurrency = coinVal*stockbysym.price;
        let totalStockPriceRequest = oneStockPriceInHomeCurrency*quantity;
        if(totalStockPriceRequest>userFile.credit){
            //reject request - insufficient funds
            return "fail - insufficient funds"
        }else{
            let newShare = new Share();
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
            //await saveStockBySymbol(stockbysym.symbol, newShare);
            //take away number requested from user currency db
            userFile.credit = userFile.credit - totalStockPriceRequest;
            userFile.ownedShares.push(newShare);
            await saveUserBySessionKey(sessionKey, newShare, totalStockPriceRequest);
            //return information
            let jsonObj = "{'newShare':"+newShare+", 'newUserCredits:'"+userFile.credit+"}";
            console.log(jsonObj);
            return jsonObj;
        }

        //workout sum total
        return "ERROR";
    }

    export async function SellBySymbol(symbol: string, quant: number){
        //
        return '';
    }

    export async function ConvertExternal(from: string, to:string){
        return new Promise(async (resolve, reject) => {
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = "https://api.worldtradingdata.com/api/v1/forex";
            let key = `${url}?base=${from}?convert_to=${to}&api_token=${apiKey}`;

            let c = await CacheService.Fetch(key);

            if(c?.CheckValid()){
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
                    if(err) reject(err);
                    else{
                        await CacheService.Store(key, res.text);
                        resolve(JSON.parse(res.text))
                    }
                });


        })

    }



}

export namespace CacheService{
    export async function Store(key: string, value: string) {
        let repo = await RepoService.CacheRepo();
        let c = await repo.findOne({
            where: {
                key:key
            }
        });
        if(!c) c = new Cache();
        c.key = key;
        c.result = value;
        return await repo.save(c);
    }
    export async function Fetch(key: string) {
        let repo = await RepoService.CacheRepo();
        return await repo.findOne({
            where: {
                key: key
            }
        });
    }
}
