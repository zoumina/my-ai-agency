import type {GovernanceDecision,RiskLevel} from "./types.js";
const riskRank:Record<RiskLevel,number>={low:0,medium:1,high:2,critical:3};
export interface GovernancePolicy{maxAutonomousRisk:RiskLevel;requireApprovalForOutboundEmail:boolean;emergencyStop:boolean}
export class GovernanceEngine{
 constructor(private readonly policy:GovernancePolicy){}
 setEmergencyStop(stopped:boolean){this.policy.emergencyStop=stopped;}
 decide(action:string,risk:RiskLevel,actor:string):GovernanceDecision{
  const stopped=this.policy.emergencyStop;
  const outboundEmail=action.startsWith("outbound-email:")||action.startsWith("email.");
  const emailApproval=outboundEmail&&this.policy.requireApprovalForOutboundEmail;
  const requiresHumanApproval=stopped||emailApproval||riskRank[risk]>riskRank[this.policy.maxAutonomousRisk];
  return {action,risk,allowed:!stopped,requiresHumanApproval,reason:stopped?"Emergency stop is active.":requiresHumanApproval?"Governance approval required.":"Within autonomous policy.",actor,createdAt:new Date().toISOString()};
 }
}