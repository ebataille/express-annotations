import * as express from "express";
import {Express, NextFunction, Router, Request, Response} from "express-serve-static-core";

export namespace ExpressAnnotation {

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

	export namespace Server {

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
	}

	export namespace Routing {

		export interface IRoute {
			router: Router;
		}

		export interface RouterParams {
			route: string;
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

		export function GET<T extends any, IRouter>(routeValues: any) {

			return (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args:any[]) => Promise<any>>) => {
				if (descriptor === undefined) {
					descriptor = Object.getOwnPropertyDescriptor(target, key);
				}
				let originalMethod = descriptor.value;
				descriptor.value = (req: Request, responsse: Response, next: NextFunction): Promise<any> => {
					let metadataKey = `${METADATA_METHOD_KEY}${key}`;
					let params = [];
					if (!target[metadataKey]) {
						target[metadataKey] = [];
					}
					for (let p of target[metadataKey]) {
						if (p.type == "params") {
							params[p.index] = req.params[p.reqName];
						}
						else if (p.type == "query") {
							params[p.index] = req.query[p.reqName];
						}
					}
					return originalMethod.apply(this, params).then((result: any) => {
						if (routeValues.json) {
							responsse.json(result);
						}
						else {
							responsse.send(result);
						}
					});
				};
				if (!target[METADATA_CLASS_KEY]) {
					target[METADATA_CLASS_KEY] = [];
				}
				target[METADATA_CLASS_KEY].push({
					method: "get",
					path: routeValues.path,
					value: descriptor.value
				});
				return descriptor;
			}
		}

		export function param(paramName: string) {
			return (target: any, key: string, index: number) => {
				let metadataKey = `${METADATA_METHOD_KEY}${key}`;
				if (!target[metadataKey]) {
					target[metadataKey] = [];
				}
				target[metadataKey].push({index: index, reqName: paramName, type: "params"});
			}
		}

		export function query(paramName: string) {
			return (target: any, key: string, index: number) => {
				let metadataKey = `${METADATA_METHOD_KEY}${key}`;
				if (!target[metadataKey]) {
					target[metadataKey] = [];
				}
				target[metadataKey].push({index: index, reqName: paramName, type: "query"});
			}
		}
	}
}