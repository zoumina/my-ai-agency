import {AgencyRuntime} from "../orchestrator/agency.js";
import type {WorkflowContext} from "../orchestrator/types.js";
export function createAgencyWorkflow(runtime:AgencyRuntime){
 const ids=["market-intelligence","research","verification","opportunity-score","decision-maker","company-memory","outreach-draft","governance","conversation","pricing-proposal","negotiation","project-factory","website-factory","testing","deployment","monitoring","reporting","learning"];
 return ids.map(id=>({id,run:async(context:WorkflowContext)=>{
   if(runtime.control.emergencyStop)throw new Error("Emergency stop is active.");
   if(id==="governance"){const d=runtime.governance.decide("workflow."+context.workflowId,"medium","orchestrator");if(!d.allowed)throw new Error(d.reason);}
   await runtime.events.publish({id:crypto.randomUUID(),type:"workflow.step",occurredAt:new Date().toISOString(),actor:"orchestrator",payload:{workflowId:context.workflowId,step:id}});
 }}));
}