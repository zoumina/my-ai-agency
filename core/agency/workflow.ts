import {AgencyRuntime} from "../orchestrator/agency.js";
export function createAgencyWorkflow(runtime:AgencyRuntime){
 return [
  {id:"market-intelligence",run:async()=>{}},
  {id:"research",run:async()=>{}},
  {id:"verification",run:async()=>{}},
  {id:"opportunity-score",run:async()=>{}},
  {id:"decision-maker",run:async()=>{}},
  {id:"company-memory",run:async()=>{}},
  {id:"outreach-draft",run:async()=>{}},
  {id:"governance",run:async()=>{}},
  {id:"conversation",run:async()=>{}},
  {id:"pricing-proposal",run:async()=>{}},
  {id:"negotiation",run:async()=>{}},
  {id:"project-factory",run:async()=>{}},
  {id:"website-factory",run:async()=>{}},
  {id:"testing",run:async()=>{}},
  {id:"deployment",run:async()=>{}},
  {id:"monitoring",run:async()=>{}},
  {id:"reporting",run:async()=>{}},
  {id:"learning",run:async()=>{}}
 ].map(s=>({id:s.id,run:async()=>{await s.run();}}));
}