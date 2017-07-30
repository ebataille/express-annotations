import { Express } from "express-serve-static-core";
export declare abstract class AbstractExpressServer {
    port: number;
    app: Express;
    constructor(port: number);
    prepareApp(): this;
    protected abstract doPrepareApp(): void;
    listen(): this;
    protected abstract listenHandler(): void;
    loadController(controllers: string): Promise<{}>;
}
