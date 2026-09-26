import {EventBus} from "../events/bus.js";
import {GovernanceEngine} from "../governance/engine.js";
import {WorkflowEngine} from "./engine.js";
import {ApprovalStore} from "../approvals/store.js";
import {defaultControlState,type ControlState} from "../control/state.js";
export class AgencyRuntime{
 readonly events=new EventBus(); readonly workflows=new WorkflowEngine(); readonly approvals=new ApprovalStore();
 readonly governance=new GovernanceEngine({maxAutonomousRisk:"medium",requireApprovalForOutboundEmail:true,emergencyStop:false});
 readonly control:ControlState={...defaultControlState};
 emergencyStop(reason="Manual emergency stop"){this.control.emergencyStop=true;this.control.autonomousExecutionEnabled=false;this.events.publish({id:crypto.randomUUID(),type:"control.emergency_stop",occurredAt:new Date().toISOString(),actor:"command-center",payload:{reason}});}
 resumeAutonomy(){this.control.emergencyStop=false;this.control.autonomousExecutionEnabled=true;this.events.publish({id:crypto.randomUUID(),type:"control.resumed",occurredAt:new Date().toISOString(),actor:"command-center",payload:{}});}
}