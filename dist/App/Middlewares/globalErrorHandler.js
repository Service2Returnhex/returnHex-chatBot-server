"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHanlder = void 0;
const globalErrorHanlder = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};
exports.globalErrorHanlder = globalErrorHanlder;
