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
const User_1 = require("./User");
const BaseModel_1 = require("./BaseModel");
const Stock_1 = require("./Stock");
let Share = class Share extends BaseModel_1.BaseModel {
};
__decorate([
    typeorm_1.Column("varchar", { length: 255, unique: true }),
    __metadata("design:type", String)
], Share.prototype, "key", void 0);
__decorate([
    typeorm_1.Column("datetime"),
    __metadata("design:type", Number)
], Share.prototype, "quantity", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], Share.prototype, "currency", void 0);
__decorate([
    typeorm_1.Column("decimal", { precision: 16, scale: 4 }),
    __metadata("design:type", Number)
], Share.prototype, "boughtPrice", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Stock_1.Stock, stock => stock.shares),
    typeorm_1.JoinTable(),
    __metadata("design:type", Stock_1.Stock)
], Share.prototype, "stock", void 0);
__decorate([
    typeorm_1.OneToOne(type => User_1.User, user => user.ownedShares),
    typeorm_1.JoinColumn(),
    __metadata("design:type", User_1.User)
], Share.prototype, "user", void 0);
Share = __decorate([
    typeorm_1.Entity()
], Share);
exports.Share = Share;
//# sourceMappingURL=Share.js.map