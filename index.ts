import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import {Session} from "./entity/session";
import {Stock} from "./entity/Stock";
import {User} from "./entity/User";
import {Share} from "./entity/Share";
import {Cache} from "./entity/Cache";

let conn = null;

export async function getConnection():Promise<Connection> {
    return new Promise((resolve, reject) => {
        if(conn != null){
            resolve(conn);
            return conn;
        }

        createConnection({
            type: "sqlite",
            entities: [
                Cache,
                Session,
                Share,
                Stock,
                User
            ], synchronize: true, database: "stock.db"
        }).then(async connection => {
            conn = connection;
            resolve(connection);
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    })
}