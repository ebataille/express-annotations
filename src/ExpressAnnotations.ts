import * as express from "express";
import {Express, NextFunction, Router, Request, Response} from "express-serve-static-core";

const METADATA_CLASS_KEY: string = "ea_metadata_class";
const METADATA_METHOD_KEY: string = "ea_metadata_";

interface Route {
	path: string;
	router: Router;
}

class EA {
	static app: Express;
	static routes: Route[] = [];
}

export function ExpressApp(target: any, key: string) {
	let _val = target[key];

	let getter = function () {
		return _val;
	};
	let setter = function (newVal: Express) {
		_val = newVal;
		if (newVal) {
			setRoutes(newVal);
		}
	};

	function setRoutes(newApp: Express) {
		EA.app = newApp;
		if (EA.routes) {
			for (let route of EA.routes) {
				EA.app.use(route.path, route.router);
			}
		}
		initClassTarget(target);
		target[METADATA_CLASS_KEY].isServerClass = true;
	}

	if (delete target[key]) {
		Object.defineProperty(target, key, {
			get: getter,
			set: setter,
			enumerable: true,
			configurable: true
		});
	}
	if (_val) {
		setRoutes(_val);
	}
}

export interface IRoute {
	router: Router;
}

export interface RouterParams {
	route: string;
	json?: boolean;
}

export interface RouteValues {
	path?: string;
	json?: boolean;
	status?: boolean;
	noResponse?: boolean;
}

export interface Result {
	body: any;
	headers?: any[];
}

export function Router<T extends any, IRoute>(routeParam: RouterParams) {
	return (target: T) => {
		let original = target;

		function construct(constructor: T, args: any[]) {
			let c: any = function () {
				return new constructor(args);
			};
			c.prototype = constructor.prototype;
			return new c();
		}

		let f: any = function (...args: any[]) {
			initClassTarget(original.prototype);
			original.prototype[METADATA_CLASS_KEY].defaultJson = routeParam.json;
			let res = construct(original, args);
			res.router = express.Router();
			if (!EA.app) {
				EA.routes.push({path: routeParam.route, router: res.router});
			}
			else {
				EA.app.use(routeParam.route, res.router);
			}
			for (let subRoute of original.prototype[METADATA_CLASS_KEY].methods) {
				res.router[subRoute.method](subRoute.path, (req : Request, response : Response, next : NextFunction) => subRoute.value(req, response, next, res));
			}
			if (original.prototype[METADATA_CLASS_KEY].errorHandler) {
				res.router.use((error: any, req: Request, res: Response, next: NextFunction) => {
					original.prototype[METADATA_CLASS_KEY].errorHandler(error, req, res, next);
				});
			}
			return res;
		};

		f.prototype = original.prototype;
		return f;
	}
}

function handleMethod<T extends any, IRouter>(method: string, routeValues: RouteValues, target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<Result | any>>) {
	if (descriptor === undefined) {
		descriptor = Object.getOwnPropertyDescriptor(target, key);
	}
	let originalMethod = descriptor.value;
	let metadataKey = `${METADATA_METHOD_KEY}${key}`;
	if (!target[metadataKey]) {
		target[metadataKey] = [];
	}
	descriptor.value = (request: Request, response: Response, next: NextFunction, objectTarget : any): Promise<Result | any> => {
		let params = [];
		for (let p of target[metadataKey]) {
			switch (p.type) {
				case "params":
					params[p.index] = request.params[p.reqName];
					break;
				case "query":
					params[p.index] = request.query[p.reqName];
					break;
				case "request":
					params[p.index] = request;
					break;
				case "response":
					params[p.index] = response;
					break;
				case "body":
					params[p.index] = request.body;
					break;
				case "header":
					if (p.reqName) {
						params[p.index] = request.headers[p.reqName];
					}
					else {
						params[p.index] = request.headers;
					}
					break;
				case "custom":
					params[p.index] = (<any>request)[p.reqName];
					break;
			}
		}

		return (<any>originalMethod).apply(objectTarget, params).then((result: Result | any) => {
			if (result.hasOwnProperty("headers")) {
				let headers = result["headers"];
				for (let prop in headers) {
					if (headers.hasOwnProperty(prop)) {
						response.setHeader(prop, headers[prop]);
					}
				}
			}
			if (routeValues.status) {
				response.sendStatus(result ? (result.hasOwnProperty("body") ? result.body : result) : result);
			} else if (routeValues.json || (target[METADATA_CLASS_KEY].defaultJson && !routeValues.noResponse)) {
				response.json(result ? (result.hasOwnProperty("body") ? result.body : result) : result);
			}
			else if (!routeValues.noResponse) {
				response.send(result ? (result.body ? result.body : result) : result);
			}
		}).catch((error: any) => {
			next(error);
		});
	};
	initClassTarget(target);
	if (!routeValues.path) {
		routeValues.path = `/${key}`;
		for (let p of target[metadataKey]) {
			if (p.type == "params") {
				routeValues.path += `/:${p.reqName}`;
			}
		}
	}
	target[METADATA_CLASS_KEY].methods.push({
		method: method,
		path: routeValues.path,
		value: descriptor.value
	});
	return descriptor;
}

export function GET<T extends any, IRoute>(routeValues: RouteValues = {}) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["get", routeValues, target, key, descriptor]);
	}
}

export function POST<T extends any, IRoute>(routeValues: RouteValues = {}) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["post", routeValues, target, key, descriptor]);
	}
}

export function PUT<T extends any, IRoute>(routeValues: RouteValues = {}) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["put", routeValues, target, key, descriptor]);
	}
}

export function PATCH<T extends any, IRoute>(routeValues: RouteValues = {}) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["patch", routeValues, target, key, descriptor]);
	}
}

export function DELETE<T extends any, IRoute>(routeValues: RouteValues = {}) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["delete", routeValues, target, key, descriptor]);
	}
}

function initClassTarget(target: any) {
	if (!target[METADATA_CLASS_KEY]) {
		target[METADATA_CLASS_KEY] = {methods: [], errorHandler: null, defaultJson: false, isServerClass:false};
	}
}

export function ErrorHandler(target : any, key : string) {
	initClassTarget(target);
	target[METADATA_CLASS_KEY].errorHandler = target[key];
	if (target[METADATA_CLASS_KEY].isServerClass) {
		EA.app.use((error : any, req : Request, res : Response, next : NextFunction) => {
			target[METADATA_CLASS_KEY].errorHandler(error, req, res, next);
		});
	}
}

export function ERequest() {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "request");
	}
}

export function EResponse() {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "response");
	}
}

export function EHeader(paramName: string) {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "header", paramName);
	}
}

export function param(paramName?: string) {
	return (target: any, key: string, index: number) => {
		let _paramName = paramName;
		if (!_paramName) {
			_paramName = getParamNames(target[key])[index];
		}
		addProperty(target, key, index, "params", _paramName);
	}
}

export function body() {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "body");
	}
}

export function query(paramName?: string) {
	return (target: any, key: string, index: number) => {
		let _paramName = paramName;
		if (!_paramName) {
			_paramName = getParamNames(target[key])[index];
		}
		addProperty(target, key, index, "query", _paramName);
	}
}

export function custom(paramName: string) {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "custom", paramName);
	}
}

function addProperty(target: any, key: string, index: number, type: string, reqName?: string) {
	let metadataKey = `${METADATA_METHOD_KEY}${key}`;
	if (!target[metadataKey]) {
		target[metadataKey] = [];
	}
	target[metadataKey].push({index: index, reqName: reqName, type: type});
}

// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically/9924463#9924463
function getParamNames(func: Function) {
	let STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
	let ARGUMENT_NAMES = /([^\s,]+)/g;
	let fnStr = func.toString().replace(STRIP_COMMENTS, '');
	let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
	if (result === null)
		result = [];
	return result;
}