import {ResearchEngine,type ResearchSource} from "../research/engine.js";
import {selectDecisionMaker,type ContactCandidate} from "../decision-maker/discovery.js";
import {scoreOpportunity,type OpportunityInput} from "../opportunity/scoring.js";
import {qualifyLead,type LeadCandidate} from "./quality.js";
import {draftEmail} from "../outreach/drafter.js";
import {PostgresLeadEngine} from "./postgres.js";
import {AgencyRuntime} from "../../core/orchestrator/agency.js";
export interface CompanyCandidate{companyId:string;companyName:string;sources:ResearchSource[];contacts:ContactCandidate[];opportunity:OpportunityInput;suppressed?:boolean}
export class LeadPipeline{
 constructor(private readonly runtime:AgencyRuntime,private readonly leads=new PostgresLeadEngine()){}
 async process(c:CompanyCandidate){
  if(this.runtime.control.emergencyStop)throw new Error("Emergency stop is active.");
  if(c.suppressed)return {status:"suppressed" as const,companyId:c.companyId};
  const research=await new ResearchEngine().research(c.companyId,c.sources);
  const opportunity=scoreOpportunity(c.opportunity);
  const contact=selectDecisionMaker(c.contacts);
  const candidate:LeadCandidate={companyId:c.companyId,score:opportunity.score,confidence:Math.min(research.confidence,contact?.confidence??0),suppressed:false,hasReliableContact:Boolean(contact?.publicContact)};
  const stored=await this.leads.upsert(candidate);
  if(!qualifyLead(candidate))return {status:"rejected" as const,stored,research,opportunity};
  const email=contact?.publicContact?draftEmail({companyName:c.companyName,recipientName:contact.name,detectedProblem:opportunity.reasons.join(" ")||"an opportunity for improvement",proposedService:"a tailored website and digital improvement"}):undefined;
  const approval=email?await this.runtime.approvals.create("outbound-email:"+c.companyId,"medium",{companyId:c.companyId,to:contact?.publicContact??"",subject:email?.subject??"",body:email?.body??""}):undefined;
  return {status:"approval_required" as const,stored,research,opportunity,contact,email,approval};
 }
}