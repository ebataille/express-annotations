/**
 * Created by edoua on 30/07/2017.
 */
import {ExpressApp} from "./ExpressAnnotations";
import * as express from "express";
import * as glob from "glob";
import {Express} from "express-serve-static-core";

export abstract class AbstractExpressServer {

	@ExpressApp
	app : Express = express();

	constructor (public port : number) {

	}

	prepareApp () {
		this.doPrepareApp();
		return this;
	}

	protected abstract doPrepareApp () : void;

	listen () {
		this.app.listen(this.port, () => this.listenHandler ());
		return this;
	}

	protected abstract listenHandler () : void;

	loadController (controllers : string) {
		return new Promise((resolve, reject) => {
			glob (controllers, (error : any, files : string[]) => {
				if (error) {
					reject(error);
					return;
				}
				for (let file of files) {
					console.log(file);
					require(file).run ();
				}
				resolve ();
			});
		});
	}
}