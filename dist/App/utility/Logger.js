"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogMessage = exports.LogPrefix = exports.LogService = void 0;
var LogService;
(function (LogService) {
    LogService["DB"] = "DATABASE";
    LogService["API"] = "API";
})(LogService || (exports.LogService = LogService = {}));
var LogPrefix;
(function (LogPrefix) {
    LogPrefix["SHOP"] = "SHOP";
    LogPrefix["SHOPS"] = "SHOPS";
    LogPrefix["PRODUCTS"] = "PRODUCTS";
    LogPrefix["PRODUCT"] = "PRODUCT";
})(LogPrefix || (exports.LogPrefix = LogPrefix = {}));
var LogMessage;
(function (LogMessage) {
    LogMessage["NOT_FOUND"] = "NOT FOUND";
    LogMessage["RETRIEVED"] = "RETRIEVED";
    LogMessage["CREATED"] = "CREATED";
    LogMessage["NOT_CREATED"] = "NOT_CREATED";
    LogMessage["UPDATED"] = "UPDATED";
    LogMessage["NOT_UPDATED"] = "NOT_UPDATED";
    LogMessage["DELETED"] = "DELETED";
    LogMessage["NOTE_DELETED"] = "NOTE_DELETED";
})(LogMessage || (exports.LogMessage = LogMessage = {}));
const Logger = (service, prefix, msg) => {
    console.log(`[${service}]-[${prefix}]: [${msg}]`);
};
exports.Logger = Logger;
