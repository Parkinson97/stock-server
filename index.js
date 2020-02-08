"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const session_1 = require("./entity/session");
const Stock_1 = require("./entity/Stock");
const User_1 = require("./entity/User");
const Share_1 = require("./entity/Share");
const Cache_1 = require("./entity/Cache");
let conn = null;
async function getConnection() {
    return new Promise((resolve, reject) => {
        if (conn != null) {
            resolve(conn);
            return conn;
        }
        typeorm_1.createConnection({
            type: "sqlite",
            entities: [
                Cache_1.Cache,
                session_1.Session,
                Share_1.Share,
                Stock_1.Stock,
                User_1.User
            ], synchronize: true, database: "stock.db"
        }).then(async (connection) => {
            conn = connection;
            resolve(connection);
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
}
exports.getConnection = getConnection;
//# sourceMappingURL=index.js.map