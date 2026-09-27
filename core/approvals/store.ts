import {Pool} from "pg";

export interface ApprovalPayload{companyId:string;to:string;subject:string;body:string}
export interface ApprovalRequest{id:string;action:string;risk:"low"|"medium"|"high"|"critical";status:"pending"|"approved"|"rejected";createdAt:string;decidedAt?:string;consumedAt?:string;payload?:ApprovalPayload}

export class ApprovalStore{
 private readonly items:ApprovalRequest[]=[];
 private readonly pool?:Pool;
 constructor(pool?:Pool){
  this.pool=pool;
 }
 private localCreate(action:string,risk:ApprovalRequest["risk"],payload?:ApprovalPayload){
  const x:ApprovalRequest={id:crypto.randomUUID(),action,risk,status:"pending",createdAt:new Date().toISOString(),payload};
  this.items.push(x);return {...x,payload:x.payload?{...x.payload}:undefined};
 }
 async create(action:string,risk:ApprovalRequest["risk"],payload?:ApprovalPayload){
  if(!this.pool)return this.localCreate(action,risk,payload);
  const id=crypto.randomUUID(),createdAt=new Date().toISOString();
  await this.pool.query("INSERT INTO approvals(id,action,risk,status,created_at,payload) VALUES($1,$2,$3,'pending',$4,$5)",[id,action,risk,createdAt,payload?JSON.stringify(payload):null]);
  return {id,action,risk,status:"pending" as const,createdAt,payload};
 }
 async list(){
  if(!this.pool)return this.items.map(x=>({...x,payload:x.payload?{...x.payload}:undefined}));
  const r=await this.pool.query("SELECT id,action,risk,status,created_at,decided_at,consumed_at,payload FROM approvals ORDER BY created_at DESC");
  return r.rows.map(x=>this.row(x));
 }
 async get(id:string){
  if(!this.pool){const x=this.items.find(v=>v.id===id);return x?{...x,payload:x.payload?{...x.payload}:undefined}:undefined;}
  const r=await this.pool.query("SELECT id,action,risk,status,created_at,decided_at,consumed_at,payload FROM approvals WHERE id=$1",[id]);
  return r.rows[0]?this.row(r.rows[0]):undefined;
 }
 async approve(id:string){
  if(!this.pool){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="approved";x.decidedAt=new Date().toISOString();return {...x};}
  const r=await this.pool.query("UPDATE approvals SET status='approved',decided_at=NOW() WHERE id=$1 AND status='pending' RETURNING id,action,risk,status,created_at,decided_at,consumed_at,payload",[id]);
  return r.rows[0]?this.row(r.rows[0]):undefined;
 }
 async reject(id:string){
  if(!this.pool){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="rejected";x.decidedAt=new Date().toISOString();return {...x};}
  const r=await this.pool.query("UPDATE approvals SET status='rejected',decided_at=NOW() WHERE id=$1 AND status='pending' RETURNING id,action,risk,status,created_at,decided_at,consumed_at,payload",[id]);
  return r.rows[0]?this.row(r.rows[0]):undefined;
 }
 async markConsumed(id:string){
  if(!this.pool){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="approved"||x.consumedAt)return undefined;x.consumedAt=new Date().toISOString();return {...x};}
  const r=await this.pool.query("UPDATE approvals SET consumed_at=NOW() WHERE id=$1 AND status='approved' AND consumed_at IS NULL RETURNING id,action,risk,status,created_at,decided_at,consumed_at,payload",[id]);
  return r.rows[0]?this.row(r.rows[0]):undefined;
 }
 private row(x:any):ApprovalRequest{return {id:x.id,action:x.action,risk:x.risk,status:x.status,createdAt:new Date(x.created_at).toISOString(),decidedAt:x.decided_at?new Date(x.decided_at).toISOString():undefined,consumedAt:x.consumed_at?new Date(x.consumed_at).toISOString():undefined,payload:x.payload??undefined};}
}