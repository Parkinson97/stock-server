

export function jsonIgnore():any {
    return function (target, propertyKey:string, descriptor: PropertyDescriptor):void{
        let symbol = Symbol.for( target.constructor.name );
        if (!target.constructor[ symbol ]) target.constructor[symbol] = [];
        target.constructor[symbol].push(propertyKey);
    }
}

export function randomString(len:number=8){
    let buff:Buffer = require("crypto").randomBytes(len);
    return buff.toString("hex");
}

export async function makePassHash(password:string, salt:string){
    let crypto = require("crypto");
    return new Promise<string>(resolve => {
        crypto.scrypt(password, salt, 64, (err, key) => {
            resolve(crypto.createHash("sha256").update(key.toString("hex")).digest("hex"));
        });
    })
}

export function isVoid(item:any) {
    if(typeof item === "string" || item instanceof String){
        item = item.trim();
        if(item === '') return true;
    }
    if(item === void 0)return true
    return item === null;
}