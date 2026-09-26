import {createServer} from "node:http";
import {routes} from "./routes.js";
const server=createServer((req,res)=>{
 res.setHeader("content-type","application/json");
 if(req.url==="/health"){res.writeHead(200);res.end(JSON.stringify({status:"ok",service:"ai-agency-api",version:"0.1.0"}));return}
 const route=Object.values(routes).find(r=>r.endsWith(" "+(req.url??"")));
 res.writeHead(route?200:404);res.end(JSON.stringify(route?{route}: {error:"Not found"}));
});
server.listen(Number(process.env.PORT??3000));