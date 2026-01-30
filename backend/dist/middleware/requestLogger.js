"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
        console.log(`📤 ${statusColor} ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
