"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = apiRoutes;
var chat_ts_1 = require("./chat.ts");
var user_ts_1 = require("./user.ts");
function apiRoutes() {
    (0, chat_ts_1.default)();
    (0, user_ts_1.default)();
}
