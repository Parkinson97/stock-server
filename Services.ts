import {getConnection} from "./index";
import {User} from "./entity/User";
import {makePassHash, randomString} from "./Tools";
import {Session} from "./entity/session";
import { Repository } from "typeorm";
import {Stock} from "./entity/Stock";

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
        return new Promise((resolve, reject) => {
            // bylDVhjt292qu2Fvc09DeEaHFuu0M5bg8kb2YYhvzLfPkyvFQFcDbItTsXt3
            let url = 'https://api.worldtradingdata.com/api/v1/stock';

            const superagent = require('superagent');

            superagent.get(url)
                .send({
                    symbol: symbol,
                    api_token: apiKey
                })
                .set('accept', 'json')
                .end((err, res) => {
                if(err) reject(err);
                resolve(JSON.parse(res.text))
                });


        })

    }
}