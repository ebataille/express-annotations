import {Server} from "./Server";
/**
 * Created by edoua on 30/07/2017.
 */


let server = new Server(3000);

server.loadController("./example/controllers/*.js").listen();