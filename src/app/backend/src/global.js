"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.cyan = exports.magenta = exports.blue = exports.yellow = exports.green = exports.red = void 0;
exports.guid = guid;
exports.red = "\x1b[31m%s\x1b[0m";
exports.green = "\x1b[32m%s\x1b[0m";
exports.yellow = "\x1b[33m%s\x1b[0m";
exports.blue = "\x1b[34m%s\x1b[0m";
exports.magenta = "\x1b[35m%s\x1b[0m";
exports.cyan = "\x1b[36m%s\x1b[0m";
function guid() {
    return crypto.randomUUID();
}
// you can add as many config here
exports.config = {
    WEBSITE_URL: process.env.WEBSITE_URL,
    PORT: process.env.PORT,
    HOST: process.env.HOST
};
