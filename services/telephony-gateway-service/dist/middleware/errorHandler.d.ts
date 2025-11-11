import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
export interface ApiError extends FastifyError {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (error: ApiError, request: FastifyRequest, reply: FastifyReply) => void;
//# sourceMappingURL=errorHandler.d.ts.map