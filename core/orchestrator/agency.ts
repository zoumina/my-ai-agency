import {EventBus} from "../events/bus.js";
import {GovernanceEngine} from "../governance/engine.js";
import {WorkflowEngine} from "./engine.js";
import {ApprovalStore} from "../approvals/store.js";
import {defaultControlState,type ControlState} from "../control/state.js";
import {Pool} from "pg";
export class AgencyRuntime{
 readonly events=new EventBus(); readonly workflows=new WorkflowEngine();
 readonly approvals:ApprovalStore;
 readonly governance=new GovernanceEngine({maxAutonomousRisk:"medium",requireApprovalForOutboundEmail:true,emergencyStop:false});
 readonly control:ControlState={...defaultControlState};
 constructor(){
  const databaseUrl=process.env.DATABASE_URL;
  this.approvals=new ApprovalStore(databaseUrl?new Pool({connectionString:databaseUrl}):undefined);
 }
 emergencyStop(reason="Manual emergency stop"){this.control.emergencyStop=true;this.control.autonomousExecutionEnabled=false;this.governance.setEmergencyStop(true);this.events.publish({id:crypto.randomUUID(),type:"control.emergency_stop",occurredAt:new Date().toISOString(),actor:"command-center",payload:{reason}});}
 resumeAutonomy(){this.control.emergencyStop=false;this.control.autonomousExecutionEnabled=true;this.governance.setEmergencyStop(false);this.events.publish({id:crypto.randomUUID(),type:"control.resumed",occurredAt:new Date().toISOString(),actor:"command-center",payload:{}});}
}