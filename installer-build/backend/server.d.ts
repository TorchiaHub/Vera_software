import express, { Express } from 'express';
declare class Server {
    app: Express;
    private port;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    listen(): void;
}
declare const serverInstance: Server;
export declare const app: express.Express;
export default serverInstance;
//# sourceMappingURL=server.d.ts.map