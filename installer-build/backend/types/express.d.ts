import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
    };
}
export interface ApiError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface EnergyQuery {
    timeframe?: string;
    device?: string;
    userId?: string;
    period?: string;
}
export interface UserQuery extends PaginationQuery {
    role?: string;
    verified?: string;
}
export interface NotificationQuery {
    userId?: string;
    type?: string;
    read?: string;
    priority?: string;
}
//# sourceMappingURL=express.d.ts.map