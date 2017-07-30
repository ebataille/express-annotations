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
}

export interface RouteValues {
	path: string;
	json?: boolean;
	status?: boolean;
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
			let res = construct(original, args);
			res.router = express.Router();
			if (!EA.app) {
				EA.routes.push({path: routeParam.route, router: res.router});
			}
			else {
				EA.app.use(routeParam.route, res.router);
			}
			for (let subRoute of original.prototype[METADATA_CLASS_KEY]) {
				res.router[subRoute.method](subRoute.path, subRoute.value);
			}
			return res;
		};

		f.prototype = original.prototype;
		return f;
	}
}

function handleMethod<T extends any, IRouter> (method: string, routeValues : RouteValues, target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) {
	if (descriptor === undefined) {
		descriptor = Object.getOwnPropertyDescriptor(target, key);
	}
	let originalMethod = descriptor.value;
	descriptor.value = (request: Request, response: Response, next: NextFunction): Promise<any> => {
		let metadataKey = `${METADATA_METHOD_KEY}${key}`;
		let params = [];
		if (!target[metadataKey]) {
			target[metadataKey] = [];
		}
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
					console.log ("body", request.body);
					params[p.index] = request.body;
					break;
			}
		}

		return (<any>originalMethod).apply(this, params).then((result: any) => {
			if (routeValues.json) {
				response.json(result);
			}
			else if (routeValues.status) {
				response.sendStatus(result);
			} else {
				response.send(result);
			}
		}).catch((error: any) => {
			next(error);
		});
	};
	if (!target[METADATA_CLASS_KEY]) {
		target[METADATA_CLASS_KEY] = [];
	}
	target[METADATA_CLASS_KEY].push({
		method:method,
		path: routeValues.path,
		value: descriptor.value
	});
	return descriptor;
}

export function GET<T extends any, IRoute>(routeValues: RouteValues) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["get", routeValues, target, key, descriptor]);
	}
}

export function POST<T extends any, IRoute>(routeValues: RouteValues) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["post", routeValues, target, key, descriptor]);
	}
}

export function PUT<T extends any, IRoute>(routeValues: RouteValues) {
	return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
		return handleMethod.apply(this, ["put", routeValues, target, key, descriptor]);
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

export function param(paramName: string) {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "params", paramName);
	}
}

export function body() {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "body");
	}
}

export function query(paramName: string) {
	return (target: any, key: string, index: number) => {
		addProperty(target, key, index, "query", paramName);
	}
}

function addProperty(target: any, key: string, index: number, type: string, reqName?: string) {
	let metadataKey = `${METADATA_METHOD_KEY}${key}`;
	if (!target[metadataKey]) {
		target[metadataKey] = [];
	}
	target[metadataKey].push({index: index, reqName: reqName, type: type});
}