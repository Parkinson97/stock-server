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
let Cache = class Cache extends BaseModel_1.BaseModel {
    CheckValid() {
        return !(Date.now() >= this.updatedAt.getTime() + (10 * 60000));
    }
};
__decorate([
    typeorm_1.Column("varchar", { length: 255, unique: true }),
    __metadata("design:type", String)
], Cache.prototype, "key", void 0);
__decorate([
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], Cache.prototype, "result", void 0);
Cache = __decorate([
    typeorm_1.Entity()
], Cache);
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map