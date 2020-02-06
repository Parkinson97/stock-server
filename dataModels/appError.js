"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, name = "AppError") {
        super();
        this.message = message;
        this.name = name;
    }
    static from(e) {
        let appError = new AppError(e.message);
        Object.keys(e).forEach(prop => {
            if (prop != "name")
                appError[prop] = e[prop];
        });
        return appError;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=appError.js.map