import {AbstractExpressServer} from "../AbstractExpressServer";
import bodyParser = require("body-parser");
/**
 * Created by edoua on 30/07/2017.
 */


export class Server extends AbstractExpressServer {

	protected doPrepareApp(): void {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	protected listenHandler () : void {
		console.log ("Express ready");
	}
}
