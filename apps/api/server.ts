import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {routes} from "./routes.js";
import {AgencyRuntime} from "../../core/orchestrator/agency.js";

const runtime=new AgencyRuntime();
const routeMap:Record<string,string>=Object.fromEntries(Object.values(routes).flatMap(value=>{
  const [methods,path]=value.split(" ");
  return (methods??"").split("/").map(method=>[method+" "+path,value]);
}));

const json=(res:import("node:http").ServerResponse,status:number,data:unknown)=>{
  res.setHeader("content-type","application/json; charset=utf-8");
  res.writeHead(status);res.end(JSON.stringify(data));
};

const server=createServer(async(req,res)=>{
  const method=req.method??"GET";
  const path=(req.url??"/").split("?")[0];

  if(method==="GET" && path==="/"){
    const html=await readFile(join(process.cwd(),"apps/dashboard/index.html"),"utf8");
    res.setHeader("content-type","text/html; charset=utf-8");res.writeHead(200);res.end(html);return;
  }
  if(method==="GET" && path==="/dashboard.js"){
    const js=await readFile(join(process.cwd(),"apps/dashboard/dashboard.js"),"utf8");
    res.setHeader("content-type","text/javascript; charset=utf-8");res.writeHead(200);res.end(js);return;
  }
  if(method==="GET" && path==="/health"){
    json(res,200,{status:runtime.control.emergencyStop?"stopped":"ok",service:"ai-agency-api",version:"0.1.0",autonomousExecutionEnabled:runtime.control.autonomousExecutionEnabled});
    return;
  }
  if(method==="POST" && path==="/control/emergency-stop"){
    runtime.emergencyStop("Command Center emergency stop");
    json(res,200,{ok:true,state:runtime.control});return;
  }
  if(method==="POST" && path==="/control/resume"){
    runtime.resumeAutonomy();
    json(res,200,{ok:true,state:runtime.control});return;
  }
  if(method==="GET" && path==="/control/state"){json(res,200,runtime.control);return;}

  const route=routeMap[method+" "+path];
  json(res,route?200:404,route?{route}:{error:"Not found"});
});
server.listen(Number(process.env.PORT??3000),()=>console.log("AI Agency Command Center on port "+(process.env.PORT??3000)));