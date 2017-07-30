"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by edoua on 30/07/2017.
 */
const ExpressAnnotations_1 = require("./ExpressAnnotations");
const express = require("express");
const glob = require("glob");
class AbstractExpressServer {
    constructor(port) {
        this.port = port;
        this.app = express();
    }
    prepareApp() {
        this.doPrepareApp();
        return this;
    }
    listen() {
        this.app.listen(this.port, () => this.listenHandler());
        return this;
    }
    loadController(controllers) {
        return new Promise((resolve, reject) => {
            glob(controllers, (error, files) => {
                if (error) {
                    reject(error);
                    return;
                }
                for (let file of files) {
                    console.log(file);
                    require(file).run();
                }
                resolve();
            });
        });
    }
}
__decorate([
    ExpressAnnotations_1.ExpressApp
], AbstractExpressServer.prototype, "app", void 0);
exports.AbstractExpressServer = AbstractExpressServer;
