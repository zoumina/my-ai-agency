import {Pool} from "pg";
export type ProjectStatus="requirements"|"design"|"implementation"|"testing"|"ready_for_deployment"|"deployed"|"blocked";
export interface ProjectRecord{id:string;companyId:string;status:ProjectStatus;requirements:string[];createdAt:string;updatedAt:string}
export class PostgresProjectStore{
 constructor(private readonly pool=new Pool({connectionString:process.env.DATABASE_URL})){if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is required.");}
 async create(companyId:string,requirements:string[]){const id=crypto.randomUUID();const now=new Date().toISOString();await this.pool.query("INSERT INTO projects(id,company_id,status,requirements,created_at,updated_at) VALUES($1,$2,'requirements',$3,$4,$4)",[id,companyId,JSON.stringify(requirements),now]);return {id,companyId,status:"requirements" as const,requirements,createdAt:now,updatedAt:now};}
 async updateStatus(id:string,status:ProjectStatus){const now=new Date().toISOString();const r=await this.pool.query("UPDATE projects SET status=$2,updated_at=$3 WHERE id=$1 RETURNING id,company_id,status,requirements,created_at,updated_at",[id,status,now]);if(!r.rows[0])return undefined;const x=r.rows[0];return {id:x.id,companyId:x.company_id,status:x.status as ProjectStatus,requirements:x.requirements,createdAt:new Date(x.created_at).toISOString(),updatedAt:new Date(x.updated_at).toISOString()};}
 async list(){const r=await this.pool.query("SELECT id,company_id,status,requirements,created_at,updated_at FROM projects ORDER BY updated_at DESC");return r.rows;}
 async close(){await this.pool.end();}
}