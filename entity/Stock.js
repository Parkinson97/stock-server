"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const BaseModel_1 = require("./BaseModel");
const Share_1 = require("./Share");
const Tools_1 = require("../Tools");
let Stock = class Stock extends BaseModel_1.BaseModel {
    CheckValid() {
        return !(Date.now() >= this.lastSync.getTime() + (60 * 60000));
    }
};
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], Stock.prototype, "symbol", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], Stock.prototype, "name", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], Stock.prototype, "currency", void 0);
__decorate([
    typeorm_1.Column("decimal", { precision: 16, scale: 4 }),
    __metadata("design:type", Number)
], Stock.prototype, "price", void 0);
__decorate([
    typeorm_1.Column("integer"),
    __metadata("design:type", Number)
], Stock.prototype, "sharesTotal", void 0);
__decorate([
    typeorm_1.OneToMany(type => Share_1.Share, share => share.stock),
    Tools_1.jsonIgnore(),
    __metadata("design:type", Array)
], Stock.prototype, "shares", void 0);
__decorate([
    typeorm_1.Column("datetime"),
    __metadata("design:type", Date)
], Stock.prototype, "lastSync", void 0);
Stock = __decorate([
    typeorm_1.Entity()
], Stock);
exports.Stock = Stock;
//# sourceMappingURL=Stock.js.map