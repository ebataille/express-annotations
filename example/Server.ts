import {AbstractExpressServer} from "../src/AbstractExpressServer";
import bodyParser = require("body-parser");
import {Request, Response, NextFunction} from "express-serve-static-core";
/**
 * Created by edoua on 30/07/2017.
 */


export class Server extends AbstractExpressServer {
	protected initError(error: any): void {
		console.log("Error happen !", error);
	}

	protected doPrepareApp(): void {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	protected listenHandler () : void {
		console.log ("Express ready");
	}


	protected errorHandler(error: any, req: Request, res: Response, next: NextFunction): any {
		console.log("GLOBAL");
		return super.errorHandler(error, req, res, next);
	}
}
