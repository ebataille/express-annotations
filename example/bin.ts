import {Server} from "./Server";
/**
 * Created by edoua on 30/07/2017.
 */


let server = new Server(3000);

server.prepareApp().loadController("./example/controllers/*.js").then (_ => {
	server.listen();
}).catch (error => {
	console.log(error);
});