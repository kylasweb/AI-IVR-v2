"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const logger_1 = require("../utils/logger");
const notFoundHandler = (request, reply) => {
    logger_1.logger.warn('Route not found', {
        method: request.method,
        url: request.url,
        ip: request.ip,
    });
    reply.status(404).send({
        success: false,
        error: 'Route not found',
        path: request.url,
        method: request.method,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map