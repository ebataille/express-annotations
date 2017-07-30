import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from  "express-serve-static-core";

import {body, ERequest, EResponse, ExpressApp, GET, IRoute, param, POST, query, Router} from "../../src/ExpressAnnotations";

@Router({route: "/test"})
export class Test implements IRoute {

	router: express.Router;

	@GET({path: "/plain", json: true})
	private simpleTest(): Promise<any> {
		return Promise.resolve("Hello world");
	}

	@GET ({path:"/oldWay"})
	private oldWay (@ERequest() request : Request, @EResponse() response : Response) : Promise<any> {
		response.json({type:"oldWay", query:request.query});
		return Promise.resolve();
	}

	@GET ({path:"/status", status:true})
	private sendStatus () : Promise<any> {
		return Promise.resolve(200);
	}

	@GET({path: "/:id", json: true})
	private getAll(@param("id") id: string, @query("test") test: string): Promise<any> {
		return Promise.resolve({res: "Hello world", id: id, test: test});
	}

	@POST({path:"/post", json: true})
	private handlePost (@body() body : any) : Promise<any> {
		return Promise.resolve({body:body, done:200});
	}
}

export function run () {
	new Test ();
}