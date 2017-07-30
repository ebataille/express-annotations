import { Router } from "express-serve-static-core";
export declare function ExpressApp(target: any, key: string): void;
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
export declare function Router<T extends any, IRoute>(routeParam: RouterParams): (target: T) => any;
export declare function GET<T extends any, IRoute>(routeValues: RouteValues): (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => any;
export declare function POST<T extends any, IRoute>(routeValues: RouteValues): (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => any;
export declare function PUT<T extends any, IRoute>(routeValues: RouteValues): (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => any;
export declare function PATCH<T extends any, IRoute>(routeValues: RouteValues): (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => any;
export declare function DELETE<T extends any, IRoute>(routeValues: RouteValues): (target: T, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => any;
export declare function ERequest(): (target: any, key: string, index: number) => void;
export declare function EResponse(): (target: any, key: string, index: number) => void;
export declare function param(paramName: string): (target: any, key: string, index: number) => void;
export declare function body(): (target: any, key: string, index: number) => void;
export declare function query(paramName: string): (target: any, key: string, index: number) => void;
export declare function custom(paramName: string): (target: any, key: string, index: number) => void;
