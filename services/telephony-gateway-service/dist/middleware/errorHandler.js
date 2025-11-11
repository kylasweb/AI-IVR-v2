"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, request, reply) => {
    // Log error
    logger_1.logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    });
    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
        const message = 'Resource not found';
        reply.status(404).send({
            success: false,
            error: message,
        });
        return;
    }
    // Prisma errors
    if (error.code === 'P2002') {
        const message = 'Duplicate entry';
        reply.status(409).send({
            success: false,
            error: message,
        });
        return;
    }
    if (error.code === 'P2025') {
        const message = 'Record not found';
        reply.status(404).send({
            success: false,
            error: message,
        });
        return;
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        reply.status(401).send({
            success: false,
            error: message,
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        const message = 'Token expired';
        reply.status(401).send({
            success: false,
            error: message,
        });
        return;
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    reply.status(statusCode).send({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map