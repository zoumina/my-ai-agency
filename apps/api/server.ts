import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {routes} from "./routes.js";
import {AgencyRuntime} from "../../core/orchestrator/agency.js";
import {createGmailAdapter} from "../../integrations/gmail/adapter.js";
import {SchedulerRunner} from "../../core/scheduler/runner.js";
import {PostgresProjectStore} from "../../core/projects/store.js";
import {ProjectLifecycle} from "../../agents/project/lifecycle.js";
import {PostgresMessageStore} from "../../core/messages/store.js";

const runtime=new AgencyRuntime();
const gmail=()=>createGmailAdapter();
const projects=()=>new PostgresProjectStore();
const lifecycle=new ProjectLifecycle(runtime);
const scheduler=new SchedulerRunner({
  "reply-sync":async()=>{if(!process.env.GMAIL_CLIENT_ID||!process.env.GMAIL_CLIENT_SECRET||!process.env.GMAIL_REFRESH_TOKEN||!process.env.GMAIL_USER)return;for(const reply of await gmail().listReplies())await runtime.events.publish({id:crypto.randomUUID(),type:"reply.received",occurredAt:new Date().toISOString(),actor:"gmail-sync",payload:reply});},
  "health-monitor":async()=>{if(runtime.control.emergencyStop)console.warn("[health] agency is stopped");}
});
scheduler.start();
process.on("SIGTERM",()=>{scheduler.stop();process.exit(0);});
process.on("SIGINT",()=>{scheduler.stop();process.exit(0);});
const routeMap:Record<string,string>=Object.fromEntries(Object.values(routes).flatMap(value=>{
  const [methods,path]=value.split(" ");
  return (methods??"").split("/").map(method=>[method+" "+path,value]);
}));

const readJson=async(req:import("node:http").IncomingMessage)=>{let body="";for await(const chunk of req)body+=chunk;return body?JSON.parse(body):{};};
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
  if(method==="GET" && path==="/projects"){
    try{const store=projects();json(res,200,await store.list());await store.close();}catch(error){json(res,503,{error:error instanceof Error?error.message:"Database unavailable"});}return;
  }
  if(method==="POST" && path==="/projects"){
    try{
      const input=await readJson(req) as {companyId:string;requirements:string[]};
      if(!input.companyId||!Array.isArray(input.requirements)||input.requirements.length===0){json(res,400,{error:"companyId and non-empty requirements are required"});return;}
      const prepared=await lifecycle.prepare(input.companyId,input.requirements);
      const store=projects();const saved=await store.create(input.companyId,input.requirements);await store.close();
      json(res,201,{project:saved,plan:prepared});return;
    }catch(error){json(res,500,{error:error instanceof Error?error.message:"Project creation failed"});return;}
  }
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
    if(runtime.control.emergencyStop){json(res,403,{error:"Emergency stop is active."});return;}
    let input:{companyId:string;to:string;subject:string;body:string};
    try{input=await readJson(req) as {companyId:string;to:string;subject:string;body:string};}catch{json(res,400,{error:"Invalid JSON body"});return;}
    if(!input.companyId||!input.to||!input.subject||!input.body){json(res,400,{error:"companyId, to, subject and body are required"});return;}
    if(approval.action!=="outbound-email:"+input.companyId){json(res,403,{error:"Approval does not match company."});return;}
    if(!approval.payload||approval.payload.to!==input.to||approval.payload.subject!==input.subject||approval.payload.body!==input.body){json(res,403,{error:"Email payload does not match the approved message."});return;}
    const decision=runtime.governance.decide("outbound-email:"+input.companyId,"medium","approval");
    if(!decision.allowed){json(res,403,{error:decision.reason});return;}
    try{
      const sent=await createGmailAdapter().send({to:input.to,subject:input.subject,body:input.body});
      runtime.approvals.markConsumed(approvalId);
      if(process.env.DATABASE_URL){try{const store=new PostgresMessageStore();await store.save({companyId:input.companyId,to:input.to,subject:input.subject,body:input.body,providerId:sent.providerId});await store.close();}catch(error){console.error("[messages] outbound persistence failed",error);}}
      await runtime.events.publish({id:crypto.randomUUID(),type:"email.sent",occurredAt:new Date().toISOString(),actor:"approval",companyId:input.companyId,payload:{providerId:sent.providerId}});
      json(res,200,{ok:true,providerId:sent.providerId,approvalId});return;
    }catch(error){json(res,502,{error:error instanceof Error?error.message:"Gmail send failed"});return;}
  }

  const route=routeMap[method+" "+path];
  json(res,route?200:404,route?{route}:{error:"Not found"});
});
server.listen(Number(process.env.PORT??3000),()=>console.log("AI Agency Command Center on port "+(process.env.PORT??3000)));