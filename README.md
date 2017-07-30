# express-annotaions
Annotation for express with typescript

## installations

```
npm install --save express_annotations
```

## how to use it

### With the AbstractExpressServer

You only need to extends the `AbstractExpressServer`

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

All the method are accessible by annotation inside your Routing class

```typescript

```
