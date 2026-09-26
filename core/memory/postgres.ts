import {Pool} from "pg";
import type {CompanyProfile} from "./types.js";
export class PostgresCompanyMemoryStore{
 private readonly pool:Pool;
 constructor(connectionString=process.env.DATABASE_URL){if(!connectionString)throw new Error("DATABASE_URL is required.");this.pool=new Pool({connectionString});}
 async upsert(p:CompanyProfile):Promise<void>{const now=new Date().toISOString();await this.pool.query(`INSERT INTO companies(id,legal_name,domain,country,industry,opportunity_score,suppressed,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8) ON CONFLICT(id) DO UPDATE SET legal_name=$2,domain=$3,country=$4,industry=$5,opportunity_score=$6,suppressed=$7,updated_at=$8`,[p.companyId,p.name,p.domain??null,p.country??null,p.industry??null,p.opportunityScore??null,p.suppressed??false,now]);}
 async get(id:string):Promise<CompanyProfile|undefined>{const r=await this.pool.query("SELECT * FROM companies WHERE id=$1",[id]);const x=r.rows[0];if(!x)return undefined;return {companyId:x.id,name:x.legal_name,domain:x.domain,country:x.country,industry:x.industry,opportunityScore:x.opportunity_score,suppressed:x.suppressed};}
 async suppress(id:string):Promise<void>{await this.pool.query("UPDATE companies SET suppressed=true,updated_at=NOW() WHERE id=$1",[id]);}
 async close():Promise<void>{await this.pool.end();}
}