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
let Session = class Session extends BaseModel_1.BaseModel {
    setExpiry() {
        //session okay for an hour
        this.expiry = new Date(Date.now() + (60 * 60000));
    }
    CheckValid(minutes = 60) {
        return !(Date.now() >= this.expiry.getTime() + (minutes * 60000));
    }
};
__decorate([
    typeorm_1.Column("varchar", { length: 255, unique: true }),
    __metadata("design:type", String)
], Session.prototype, "key", void 0);
__decorate([
    typeorm_1.Column("datetime"),
    __metadata("design:type", Date)
], Session.prototype, "expiry", void 0);
__decorate([
    typeorm_1.OneToOne(type => User_1.User, user => user.session),
    __metadata("design:type", User_1.User)
], Session.prototype, "user", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Session.prototype, "setExpiry", null);
Session = __decorate([
    typeorm_1.Entity()
], Session);
exports.Session = Session;
//# sourceMappingURL=session.js.map