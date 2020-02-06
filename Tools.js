"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsonIgnore() {
    return function (target, propertyKey, descriptor) {
        let symbol = Symbol.for(target.constructor.name);
        if (!target.constructor[symbol])
            target.constructor[symbol] = [];
        target.constructor[symbol].push(propertyKey);
    };
}
exports.jsonIgnore = jsonIgnore;
function randomString(len = 8) {
    let buff = require("crypto").randomBytes(len);
    return buff.toString("hex");
}
exports.randomString = randomString;
async function makePassHash(password, salt) {
    let crypto = require("crypto");
    return new Promise(resolve => {
        crypto.scrypt(password, salt, 64, (err, key) => {
            resolve(crypto.createHash("sha256").update(key.toString("hex")).digest("hex"));
        });
    });
}
exports.makePassHash = makePassHash;
function isVoid(item) {
    if (typeof item === "string" || item instanceof String) {
        item = item.trim();
        if (item === '')
            return true;
    }
    if (item === void 0)
        return true;
    return item === null;
}
exports.isVoid = isVoid;
//# sourceMappingURL=Tools.js.map