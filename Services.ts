import {getConnection} from "./index";
import {User} from "./entity/User";
import {makePassHash, randomString} from "./Tools";
import {Session} from "./entity/session";
import {Repository} from "typeorm";
import {Stock} from "./entity/Stock";
import {Cache} from "./entity/Cache";

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
    
    export async function BuyBySymbol(symbol: string, quantity: number, sessionKey:string){
        //call db
        let userFile = await UserService.GetUserBySessionKey(sessionKey);
        let stockbysym = await GetBySymbol(symbol);
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
            //take away number requested from stock total db

            //take away number requested from user currency db

            //return information
        }

        //workout sum total
        return stockbysym;
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
