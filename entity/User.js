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
const session_1 = require("./session");
const BaseModel_1 = require("./BaseModel");
const Share_1 = require("./Share");
const Tools_1 = require("../Tools");
let User = class User extends BaseModel_1.BaseModel {
};
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    Tools_1.jsonIgnore(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    Tools_1.jsonIgnore(),
    __metadata("design:type", String)
], User.prototype, "salt", void 0);
__decorate([
    typeorm_1.Column("varchar", { length: 255 }),
    __metadata("design:type", String)
], User.prototype, "creditCurrency", void 0);
__decorate([
    typeorm_1.Column("decimal", { precision: 16, scale: 4 }),
    __metadata("design:type", Number)
], User.prototype, "credit", void 0);
__decorate([
    typeorm_1.OneToMany(type => Share_1.Share, share => share.user, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], User.prototype, "ownedShares", void 0);
__decorate([
    typeorm_1.OneToOne(type => session_1.Session, session => session.user, {
        nullable: true,
        cascade: ['insert', 'update', 'remove'],
        eager: true
    }),
    typeorm_1.JoinColumn(),
    Tools_1.jsonIgnore(),
    __metadata("design:type", session_1.Session)
], User.prototype, "session", void 0);
User = __decorate([
    typeorm_1.Entity()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map