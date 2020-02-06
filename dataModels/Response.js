"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function JsonResponse(isSuccess = true, message, data) {
    return (new Response(isSuccess, message, data)).toJSON();
}
exports.JsonResponse = JsonResponse;
class Response {
    constructor(isSuccess = true, message, data) {
        this.isSuccess = isSuccess;
        this.body = {};
        this.body = {
            isSuccessful: isSuccess,
            message: (message !== null && message !== void 0 ? message : ""),
            payload: (data !== null && data !== void 0 ? data : {})
        };
    }
    toJSON() {
        return this.body;
    }
}
exports.Response = Response;
//# sourceMappingURL=Response.js.map