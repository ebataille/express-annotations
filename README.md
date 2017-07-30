# express-annotations
Annotation for express with typescript

## installations

```
npm install --save express_annotations
```

## how to use it

### With the AbstractExpressServer

You only need to extend the `AbstractExpressServer`

```typescript

import {AbstractExpressServer}  from "express_annotations/dist/AbstractExpressServer";
import * as bodyParser from "body-parser";

export class Server extends AbstractExpressServer {
	
  // This method is called from the abstract class
  // to allow you to add custom use as bodyParser
  protected doPrepareApp(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  // when the express app is ready this handler is called
  protected listenHandler () : void {
    console.log ("Express ready");
  }	
}
```
Then in a bin.ts file

```typescript

import {Server} from "./Server";

let server = new Server(3000);

// the method loadController is to loadControllers
// it accepts regexp and return a native promise
server.prepareApp().loadController("./controllers/*.js").then (_ => {
  // all controller are loaded, we are ready to listen
  server.listen();
}).catch (error => {
  console.log(error);
});

```

Then you need to configure your controller.

### With annotation

If you don't want to use the Abstract Class what you need to do is to create a class then add the `@ExpressApp` annotation on your express app.

```typescript

import * as express from "express";

export class Server {
  @ExpressApp
  app = express ();
}
```

## Routing

For routing you only need to add an annotation on your routing class and implements IRoute :

```typescript
import * as express from "express";
import {IRoute, Router} from "express_annotations/dist/ExpressAnnotations";

@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;
}
```

By this way you have access to the controller so if you want to manipulate some rules using the express router, you still can.

## handling call

### GET / POST / PATCH / PUT / DELETE

All the method are accessible by annotation inside your Routing class.
All method work with promise so you need to return a promise with your result.
You can either return a couple of header / body, an object or a status


#### GET

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  // json:true means you want express return as json
  @GET({path:"/json", json:true})
  private handleGet () {
    return Promise.resolve({hello:"world !"});
  }

  // status:true means you want express return as response.sendStatus (status)
  @GET({path:"/status", status:true})
  private handleStatus () {
    return Promise.resolve(200);
  }

  // no status and no json mean you send your result as it is : response.send ("Hello world")
  @GET({path:"/plain"})
  private handleStatus () {
    return Promise.resolve("Hello world");
  }

  // By this way you can send custom header
  @GET({path:"/customHeader", json:true})
  private handleStatus () {
    return Promise.resolve({header:{"custom-header":"hello header !"}, body:{result:"Hello world with custom headers"});
  }
}
```

#### POST

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @POST ({path="/", json:true})
  private handlePost (@body body : any) {
    return Promise.resolve ({sendBody:body});
  }
}
```

#### PATCH

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @PATCH ({path="/", json:true})
  private handlePatch (@body body : any) {
    return Promise.resolve ({method:"patch", sendBody:body});
  }
}
```
#### PUT

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @PUT ({path="/", json:true})
  private handlePut (@body body : any) {
    return Promise.resolve ({method:"put", sendBody:body});
  }
}
```

#### DELETE

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @PUT ({path="/", json:true})
  private handleDelete () {
    return Promise.resolve ({method:"delete"});
  }
}
```

### Parameters

To get headers, path params or queries you only need to annotate your method arguments

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @GET ({path="/:id", json:true})
  private handleFindById (@param("id") id : string) {
    return Promise.resolve ({method:"findById", id:id});
  }

  @GET ({path="/", json:true})
  private handleFindByQueryId (@query("id") id : string) {
    return Promise.resolve ({method:"findByQueryId", id:id});
  }

  @GET ({path="/byHeader", json:true})
  private handleFindByHeaderId (@EHeader("id") id : string) {
    return Promise.resolve ({method:"findByHeaderId", id:id});
  }

  // if no name is given all headers will be returned
  @GET ({path="/byHeader2", json:true})
  private handleFindByCustomProp (@EHeader() headers : any) {
    return Promise.resolve ({method:"handleFindByCustomProp", id:headers["id"]});
  }

}
```

If you override the express request and need a property inside the request you can also need the `@custom` annotation 
```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  @GET ({path="/byHeader", json:true})
  private handleFindByCustomProp (@custom("myCustomProp") myCustomProp : any) {
    return Promise.resolve ({method:"handleFindByCustomProp", myProp:myCustomProp});
  }

}
```
Finaly if you want to have the orignal express Request and Response

```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  // the noResponse: true is to avoid to send response twice
  @GET ({path="/byOldSchool", noResponse:true})
  private handleOldSchool (@ERequest() request : Request, @EResponse() response : Response) {
    response.json ({oldSchool:true, response:"Hello world !"});
    return Promise.resolve ();
  }
}
```

### Automatic Path, Params and Query

If you don't specify name or path, annotations system will automatically handle them by the method or arguments name


```typescript
@Router({route: "/example"})
export class Test implements IRoute {
  // the router is automatically set by the annotation
  router : express.Router;

  ...

  // the generated path will be "<host>:<port>/example/automaticPath/:name"
  // For example http://localhost:3000/example/automaticPath/foo?start=25
  // will result to a call with name=foo and start = 25
  @GET ({json:true})
  private automaticPath (@param name:string, @query start : number) {
    return Promise.resolve ({method:"automaticPath", name:name, start: start});
  }
}
```

## TODO

* Add json:true to class to avoid to repeat them in all method and allow override in each method
* Add Error Handler for global and local to a route

