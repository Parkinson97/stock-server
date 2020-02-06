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
class BaseModel {
    toJSON() {
        let ignores = this.constructor[Symbol.for(this.constructor.name)];
        let finalObject = {};
        Object.keys(this).forEach(propName => {
            if (ignores && ignores.indexOf(propName) > -1)
                return;
            if (this[propName] && this[propName]['toJSON']) {
                finalObject[propName] = this[propName].toJSON();
            }
            else {
                finalObject[propName] = this[propName];
            }
        });
        return finalObject;
    }
    valueOf() {
        return this.toJSON();
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], BaseModel.prototype, "id", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({ name: "updatedAt" }),
    __metadata("design:type", Date)
], BaseModel.prototype, "updatedAt", void 0);
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map