import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from  "express-serve-static-core";

import {body, ERequest, EResponse, ExpressApp, GET, IRoute, param, POST, query, Router} from "../../src/ExpressAnnotations";

/*
	This route will register at path : /test
 */
@Router({route: "/test"})
export class Test implements IRoute {

	router: express.Router;

	/*
		Simple get method.
		because the path is not set, the method name will be the path
		e.g. http://<host>:<port>/test/simpleTest
	 */
	@GET({json: false})
	private simpleTest(): Promise<any> {
		return Promise.resolve("Hello world");
	}

	/*
		 Simple get method on oldWay.
		 The ERequest and EResponse annotation give you the Request and Response from express.
		 That way you can do whatever you want.
		 If you respond with the Response Object don't forget to set the noResponse to true
	 */
	@GET ({path:"/oldWay", noResponse:true})
	private oldWay (@ERequest() request : Request, @EResponse() response : Response) : Promise<any> {
		response.json({type:"oldWay", query:request.query});
		return Promise.resolve();
	}

	/*
		just send a status, will do : response.sendStatus(200)
	 */
	@GET ({path:"/status", status:true})
	private sendStatus () : Promise<any> {
		return Promise.resolve(200);
	}

	/*
		We get here id from the path and a test property from query parameter.
	 */
	@GET({path:"/:id/detail/", json: true})
	private findById2(@param("id") id: string, @query("test") test: string): Promise<any> {
		return Promise.resolve({res: "Hello world", id: id, test: test});
	}

	/*
		We ommit the id name from @param because it is given by the param name itself (id : string)
	 */
	@GET({path:"/:id", json: true})
	private findById(@param() id: string, @query("test") test: string): Promise<any> {
		return Promise.resolve({res: "Hello world", id: id, test: test});
	}

	/*
		No path and no param / query name
		It will generate a path based on the method name and param arguments.
		In this example we will have
		/findById3/:id as path
		The same mechanism is working for query arguments meaning
	 	<host>:<port>/test/findById3/foo?test=bar
	 	will result as :
	 	id = foor
	 	test = bar
	 */
	@GET({json: true})
	private findById3(@param() id: string, @query() test: string): Promise<any> {
		return Promise.resolve({res: "Hello world", id: id, test: test});
	}

	/*
		Simple Post handler
		@body give you the request.body
	 */
	@POST({path:"/post", json: true})
	private handlePost (@body() body : any) : Promise<any> {
		return Promise.resolve({body:body, done:200});
	}
}

/*
	This method is mandatory if you use the AsbtractExpressServer.loadController
 */
export function run () {
	new Test ();
}
