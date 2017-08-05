import { Request, Response, Express, NextFunction } from "express-serve-static-core";
export declare abstract class AbstractExpressServer {
    port: number;
    app: Express;
    private controllerLoaded;
    constructor(port: number);
    protected abstract doPrepareApp(): void;
    protected abstract initError(error: any): void;
    listen(): this;
    protected abstract listenHandler(): void;
    loadController(controllers: string): this;
    protected errorHandler(error: any, req: Request, res: Response, next: NextFunction): void;
}
