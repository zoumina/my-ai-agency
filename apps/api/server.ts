import {createServer} from "node:http";
import {routes} from "./routes.js";

const routeMap: Record<string,string> = Object.fromEntries(
  Object.values(routes).flatMap(value => {
    const [methods, path] = value.split(" ");
    return (methods ?? "").split("/").map(method => [method + " " + path, value]);
  })
);

const server=createServer((req,res)=>{
  res.setHeader("content-type","application/json; charset=utf-8");
  const key=(req.method ?? "GET")+" "+(req.url ?? "").split("?")[0];
  if(key==="GET /health"){
    res.writeHead(200);
    res.end(JSON.stringify({status:"ok",service:"ai-agency-api",version:"0.1.0"}));
    return;
  }
  const route=routeMap[key];
  res.writeHead(route?200:404);
  res.end(JSON.stringify(route?{route}: {error:"Not found"}));
});

server.listen(Number(process.env.PORT??3000),()=>console.log("AI Agency API listening on "+(process.env.PORT??3000)));