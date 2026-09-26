import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {routes} from "./routes.js";
import {AgencyRuntime} from "../../core/orchestrator/agency.js";
import {createGmailAdapter} from "../../integrations/gmail/adapter.js";
import {SchedulerRunner} from "../../core/scheduler/runner.js";

const runtime=new AgencyRuntime();
const gmail=()=>createGmailAdapter();
const scheduler=new SchedulerRunner({
  "reply-sync":async()=>{for(const reply of await gmail().listReplies())await runtime.events.publish({id:crypto.randomUUID(),type:"reply.received",occurredAt:new Date().toISOString(),actor:"gmail-sync",payload:reply});},
  "health-monitor":async()=>{if(runtime.control.emergencyStop)console.warn("[health] agency is stopped");}
});
scheduler.start();
process.on("SIGTERM",()=>{scheduler.stop();process.exit(0);});
process.on("SIGINT",()=>{scheduler.stop();process.exit(0);});
const routeMap:Record<string,string>=Object.fromEntries(Object.values(routes).flatMap(value=>{
  const [methods,path]=value.split(" ");
  return (methods??"").split("/").map(method=>[method+" "+path,value]);
}));

const readJson=async(req:import("node:http").IncomingMessage)=>{let body="";for await(const chunk of req)body+=chunk;return body?JSON.parse(body):{}};
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
  if(method==="GET" && path==="/approvals"){json(res,200,runtime.approvals.list());return;}
  if((method==="POST") && /^\/approvals\/[^/]+\/(approve|reject)$/.test(path)){
    const [,id,action]=path.split("/");
    const result=action==="approve"?runtime.approvals.approve(id):runtime.approvals.reject(id);
    if(!result){json(res,404,{error:"Approval not found or already decided"});return;}
    json(res,200,result);return;
  }

  if(method==="POST" && /^\/approvals\/[^/]+\/send$/.test(path)){
    const [,approvalId]=path.split("/");
    const approval=runtime.approvals.get(approvalId);
    if(!approval||approval.status!=="approved"||approval.consumedAt){json(res,409,{error:"Approval is not available for sending"});return;}
    const input=await readJson(req) as {companyId:string;to:string;subject:string;body:string};
    if(!input.companyId||!input.to||!input.subject||!input.body){json(res,400,{error:"companyId, to, subject and body are required"});return;}
    const decision=runtime.governance.decide("outbound-email:"+input.companyId,"medium","approval");
    if(!decision.allowed){json(res,403,{error:decision.reason});return;}
    try{
      const sent=await createGmailAdapter().send({to:input.to,subject:input.subject,body:input.body});
      runtime.approvals.markConsumed(approvalId);
      json(res,200,{ok:true,providerId:sent.providerId,approvalId});return;
    }catch(error){json(res,502,{error:error instanceof Error?error.message:"Gmail send failed"});return;}
  }

  const route=routeMap[method+" "+path];
  json(res,route?200:404,route?{route}:{error:"Not found"});
});
server.listen(Number(process.env.PORT??3000),()=>console.log("AI Agency Command Center on port "+(process.env.PORT??3000)));