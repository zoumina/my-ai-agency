import {Pool} from "pg";
import {qualifyLead,type LeadCandidate} from "./quality.js";
export interface StoredLead extends LeadCandidate{id:string;status:"qualified"|"rejected";}
export class PostgresLeadEngine{
 constructor(private readonly pool=new Pool({connectionString:process.env.DATABASE_URL})){if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is required.");}
 async upsert(candidate:LeadCandidate):Promise<StoredLead>{
  const qualified=qualifyLead(candidate);const id=crypto.randomUUID();const status=qualified?"qualified":"rejected";
  await this.pool.query("INSERT INTO leads(id,company_id,score,status,contact,created_at) VALUES($1,$2,$3,$4,$5,$6)",[id,candidate.companyId,candidate.score,status,JSON.stringify({reliable:candidate.hasReliableContact,confidence:candidate.confidence}),new Date().toISOString()]);
  return {...candidate,id,status};
 }
 async top(limit=50){const r=await this.pool.query("SELECT id,company_id,score,status,contact,created_at FROM leads WHERE status='qualified' ORDER BY score DESC,created_at DESC LIMIT $1",[limit]);return r.rows;}
}