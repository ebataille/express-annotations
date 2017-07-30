"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
var ExpressAnnotations_1 = require("../../src/ExpressAnnotations");
/*
    This route will register at path : /test
 */
var Test = (function () {
    function Test() {
    }
    /*
        Simple get method.
        because the path is not set, the method name will be the path
        e.g. http://<host>:<port>/test/simpleTest
     */
    Test.prototype.simpleTest = function () {
        return Promise.resolve("Hello world");
    };
    /*
         Simple get method on oldWay.
         The ERequest and EResponse annotation give you the Request and Response from express.
         That way you can do whatever you want.
         If you respond with the Response Object don't forget to set the noResponse to true
     */
    Test.prototype.oldWay = function (request, response) {
        response.json({ type: "oldWay", query: request.query });
        return Promise.resolve();
    };
    /*
        just send a status, will do : response.sendStatus(200)
     */
    Test.prototype.sendStatus = function () {
        return Promise.resolve(200);
    };
    /*
        We get here id from the path and a test property from query parameter.
     */
    Test.prototype.findById2 = function (id, test) {
        return Promise.resolve({ res: "Hello world", id: id, test: test });
    };
    /*
        We ommit the id name from @param because it is given by the param name itself (id : string)
     */
    Test.prototype.findById = function (id, test) {
        return Promise.resolve({ res: "Hello world", id: id, test: test });
    };
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
    Test.prototype.findById3 = function (id, test) {
        return Promise.resolve({ res: "Hello world", id: id, test: test });
    };
    /*
        Simple Post handler
        @body give you the request.body
     */
    Test.prototype.handlePost = function (body) {
        return Promise.resolve({ body: body, done: 200 });
    };
    return Test;
}());
__decorate([
    ExpressAnnotations_1.GET({ json: false })
], Test.prototype, "simpleTest");
__decorate([
    ExpressAnnotations_1.GET({ path: "/oldWay", noResponse: true }),
    __param(0, ExpressAnnotations_1.ERequest()), __param(1, ExpressAnnotations_1.EResponse())
], Test.prototype, "oldWay");
__decorate([
    ExpressAnnotations_1.GET({ path: "/status", status: true })
], Test.prototype, "sendStatus");
__decorate([
    ExpressAnnotations_1.GET({ path: "/:id/detail/", json: true }),
    __param(0, ExpressAnnotations_1.param("id")), __param(1, ExpressAnnotations_1.query("test"))
], Test.prototype, "findById2");
__decorate([
    ExpressAnnotations_1.GET({ path: "/:id", json: true }),
    __param(0, ExpressAnnotations_1.param()), __param(1, ExpressAnnotations_1.query("test"))
], Test.prototype, "findById");
__decorate([
    ExpressAnnotations_1.GET({ json: true }),
    __param(0, ExpressAnnotations_1.param()), __param(1, ExpressAnnotations_1.query())
], Test.prototype, "findById3");
__decorate([
    ExpressAnnotations_1.POST({ path: "/post", json: true }),
    __param(0, ExpressAnnotations_1.body())
], Test.prototype, "handlePost");
Test = __decorate([
    ExpressAnnotations_1.Router({ route: "/test" })
], Test);
exports.Test = Test;
/*
    This method is mandatory if you use the AsbtractExpressServer.loadController
 */
function run() {
    new Test();
}
exports.run = run;
