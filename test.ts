import * as express from "express";
import {Request, Response, NextFunction} from "express-serve-static-core"
import {ExpressAnnotation} from "./ExpressAnnotations";
import ExpressApp = ExpressAnnotation.Server.ExpressApp;
import Router = ExpressAnnotation.Routing.Router;
import IRoute = ExpressAnnotation.Routing.IRoute;
import GET = ExpressAnnotation.Routing.GET;
import param = ExpressAnnotation.Routing.param;
import query = ExpressAnnotation.Routing.query;

export class Server {
	@ExpressApp
	app = express();

	listen () {
		this.app.listen(3000, () => this.listenHandler ());
	}

	private listenHandler () {
		console.log ("Express ready");
	}
}

@Router({route: "/test"})
export class Test implements IRoute {

	router: express.Router;

	@GET({path: "/:id", json: true})
	private getAll(@param("id") id: string, @query("test") test: string): Promise<any> {
		return Promise.resolve({res: "Hello world", id: id, test: test});
	}

	@GET({path: "/plain", json: true})
	private simpleTest(): Promise<any> {
		return Promise.resolve("Hello world");
	}
}

let server = new Server();
let p = new Test();

server.listen();