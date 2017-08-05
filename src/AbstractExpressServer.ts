/**
 * Created by edoua on 30/07/2017.
 */
import {ExpressApp} from "./ExpressAnnotations";
import * as express from "express";
import * as glob from "glob";
import {Request, Response, Express, NextFunction} from "express-serve-static-core";

export abstract class AbstractExpressServer {

	@ExpressApp
	app : Express = express();

	private controllerLoaded : Promise<any> = Promise.resolve();

	constructor (public port : number) {
		this.doPrepareApp();
	}

	protected abstract doPrepareApp () : void;
	protected abstract initError (error : any) : void;

	listen () {
		this.controllerLoaded.then(_ => {
			this.app.use((error : any, request : Request, result : Response, next : NextFunction) => {
				this.errorHandler(error , request, result, next)
			});
			this.app.listen(this.port, () => this.listenHandler ());
		});
		return this;
	}

	protected abstract listenHandler () : void;

	loadController (controllers : string) {
		this.controllerLoaded = new Promise((resolve, reject) => {
			glob (controllers, (error : any, files : string[]) => {
				if (error) {
					reject(error);
					return;
				}
				for (let file of files) {
					let module = require(`${process.cwd()}/${file}`);
					for (let prop in module) {
						if (module.hasOwnProperty(prop) && typeof module[prop] == "function") {
							new module[prop] ();
						}
					}
				}
				resolve ();
			});
		}).catch(error => {
			this.initError(error);
		});
		return this;
	}

	protected errorHandler (error : any, req : Request, res : Response, next : NextFunction) {
		let status = error.status || 500;
		let err = error.error || error;
		res.status(status);
		if (typeof err == "object")
			res.json(err);
		else {
			res.send(err);
		}
	}
}