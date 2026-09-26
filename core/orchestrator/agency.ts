import {EventBus} from "../events/bus.js";
import {GovernanceEngine} from "../governance/engine.js";
import {WorkflowEngine} from "./engine.js";
import {ApprovalStore} from "../approvals/store.js";
import {defaultControlState, type ControlState} from "../control/state.js";

export class AgencyRuntime{
  readonly events=new EventBus();
  readonly workflows=new WorkflowEngine();
  readonly approvals=new ApprovalStore();
  readonly governance=new GovernanceEngine({maxAutonomousRisk:"medium",requireApprovalForOutboundEmail:true,emergencyStop:false});
  readonly control:ControlState={...defaultControlState};

  emergencyStop(reason="Manual emergency stop"):void{
    this.control.emergencyStop=true;
    this.control.autonomousExecutionEnabled=false;
    this.events.publish({type:"control.emergency_stop",payload:{reason,at:new Date().toISOString()}});
  }

  resumeAutonomy():void{
    this.control.emergencyStop=false;
    this.control.autonomousExecutionEnabled=true;
    this.events.publish({type:"control.resumed",payload:{at:new Date().toISOString()}});
  }
}