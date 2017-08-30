"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const METADATA_CLASS_KEY = "ea_metadata_class";
const METADATA_METHOD_KEY = "ea_metadata_";
class EA {
}
EA.routes = [];
function ExpressApp(target, key) {
    let _val = target[key];
    let getter = function () {
        return _val;
    };
    let setter = function (newVal) {
        _val = newVal;
        if (newVal) {
            setRoutes(newVal);
        }
    };
    function setRoutes(newApp) {
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
exports.ExpressApp = ExpressApp;
function Router(routeParam) {
    return (target) => {
        let original = target;
        function construct(constructor, args) {
            let c = function () {
                return new constructor(args);
            };
            c.prototype = constructor.prototype;
            return new c();
        }
        let f = function (...args) {
            initClassTarget(original.prototype);
            original.prototype[METADATA_CLASS_KEY].defaultJson = routeParam.json;
            let res = construct(original, args);
            res.router = express.Router();
            if (!EA.app) {
                EA.routes.push({ path: routeParam.route, router: res.router });
            }
            else {
                EA.app.use(routeParam.route, res.router);
            }
            for (let subRoute of original.prototype[METADATA_CLASS_KEY].methods) {
                res.router[subRoute.method](subRoute.path, subRoute.value);
            }
            if (original.prototype[METADATA_CLASS_KEY].errorHandler) {
                res.router.use((error, req, res, next) => {
                    original.prototype[METADATA_CLASS_KEY].errorHandler(error, req, res, next);
                });
            }
            return res;
        };
        f.prototype = original.prototype;
        return f;
    };
}
exports.Router = Router;
function handleMethod(method, routeValues, target, key, descriptor) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    let originalMethod = descriptor.value;
    let metadataKey = `${METADATA_METHOD_KEY}${key}`;
    if (!target[metadataKey]) {
        target[metadataKey] = [];
    }
    descriptor.value = (request, response, next) => {
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
                    params[p.index] = request[p.reqName];
                    break;
            }
        }
        return originalMethod.apply(target, params).then((result) => {
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
            }
            else if (routeValues.json || (target[METADATA_CLASS_KEY].defaultJson && !routeValues.noResponse)) {
                response.json(result ? (result.hasOwnProperty("body") ? result.body : result) : result);
            }
            else if (!routeValues.noResponse) {
                response.send(result ? (result.body ? result.body : result) : result);
            }
        }).catch((error) => {
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
function GET(routeValues = {}) {
    return (target, key, descriptor) => {
        return handleMethod.apply(this, ["get", routeValues, target, key, descriptor]);
    };
}
exports.GET = GET;
function POST(routeValues = {}) {
    return (target, key, descriptor) => {
        return handleMethod.apply(this, ["post", routeValues, target, key, descriptor]);
    };
}
exports.POST = POST;
function PUT(routeValues = {}) {
    return (target, key, descriptor) => {
        return handleMethod.apply(this, ["put", routeValues, target, key, descriptor]);
    };
}
exports.PUT = PUT;
function PATCH(routeValues = {}) {
    return (target, key, descriptor) => {
        return handleMethod.apply(this, ["patch", routeValues, target, key, descriptor]);
    };
}
exports.PATCH = PATCH;
function DELETE(routeValues = {}) {
    return (target, key, descriptor) => {
        return handleMethod.apply(this, ["delete", routeValues, target, key, descriptor]);
    };
}
exports.DELETE = DELETE;
function initClassTarget(target) {
    if (!target[METADATA_CLASS_KEY]) {
        target[METADATA_CLASS_KEY] = { methods: [], errorHandler: null, defaultJson: false, isServerClass: false };
    }
}
function ErrorHandler(target, key) {
    initClassTarget(target);
    target[METADATA_CLASS_KEY].errorHandler = target[key];
    if (target[METADATA_CLASS_KEY].isServerClass) {
        EA.app.use((error, req, res, next) => {
            target[METADATA_CLASS_KEY].errorHandler(error, req, res, next);
        });
    }
}
exports.ErrorHandler = ErrorHandler;
function ERequest() {
    return (target, key, index) => {
        addProperty(target, key, index, "request");
    };
}
exports.ERequest = ERequest;
function EResponse() {
    return (target, key, index) => {
        addProperty(target, key, index, "response");
    };
}
exports.EResponse = EResponse;
function EHeader(paramName) {
    return (target, key, index) => {
        addProperty(target, key, index, "header", paramName);
    };
}
exports.EHeader = EHeader;
function param(paramName) {
    return (target, key, index) => {
        let _paramName = paramName;
        if (!_paramName) {
            _paramName = getParamNames(target[key])[index];
        }
        addProperty(target, key, index, "params", _paramName);
    };
}
exports.param = param;
function body() {
    return (target, key, index) => {
        addProperty(target, key, index, "body");
    };
}
exports.body = body;
function query(paramName) {
    return (target, key, index) => {
        let _paramName = paramName;
        if (!_paramName) {
            _paramName = getParamNames(target[key])[index];
        }
        addProperty(target, key, index, "query", _paramName);
    };
}
exports.query = query;
function custom(paramName) {
    return (target, key, index) => {
        addProperty(target, key, index, "custom", paramName);
    };
}
exports.custom = custom;
function addProperty(target, key, index, type, reqName) {
    let metadataKey = `${METADATA_METHOD_KEY}${key}`;
    if (!target[metadataKey]) {
        target[metadataKey] = [];
    }
    target[metadataKey].push({ index: index, reqName: reqName, type: type });
}
// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically/9924463#9924463
function getParamNames(func) {
    let STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
    let ARGUMENT_NAMES = /([^\s,]+)/g;
    let fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
