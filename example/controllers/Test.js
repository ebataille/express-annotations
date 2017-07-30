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
Object.defineProperty(exports, "__esModule", { value: true });
const ExpressAnnotations_1 = require("../../src/ExpressAnnotations");
let Test = class Test {
    simpleTest() {
        return Promise.resolve("Hello world");
    }
    oldWay(request, response) {
        response.json({ type: "oldWay", query: request.query });
        return Promise.resolve();
    }
    sendStatus() {
        return Promise.resolve(200);
    }
    getAll(id, test) {
        return Promise.resolve({ res: "Hello world", id: id, test: test });
    }
    handlePost(body) {
        return Promise.resolve({ body: body, done: 200 });
    }
};
__decorate([
    ExpressAnnotations_1.GET({ path: "/plain", json: true })
], Test.prototype, "simpleTest", null);
__decorate([
    ExpressAnnotations_1.GET({ path: "/oldWay" }),
    __param(0, ExpressAnnotations_1.ERequest()), __param(1, ExpressAnnotations_1.EResponse())
], Test.prototype, "oldWay", null);
__decorate([
    ExpressAnnotations_1.GET({ path: "/status", status: true })
], Test.prototype, "sendStatus", null);
__decorate([
    ExpressAnnotations_1.GET({ path: "/:id", json: true }),
    __param(0, ExpressAnnotations_1.param("id")), __param(1, ExpressAnnotations_1.query("test"))
], Test.prototype, "getAll", null);
__decorate([
    ExpressAnnotations_1.POST({ path: "/post", json: true }),
    __param(0, ExpressAnnotations_1.body())
], Test.prototype, "handlePost", null);
Test = __decorate([
    ExpressAnnotations_1.Router({ route: "/test" })
], Test);
exports.Test = Test;
function run() {
    new Test();
}
exports.run = run;
