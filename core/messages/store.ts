import {Pool} from "pg";
export interface OutboundMessage{companyId:string;to:string;subject:string;body:string;providerId?:string}
export class PostgresMessageStore{
 constructor(private readonly pool=new Pool({connectionString:process.env.DATABASE_URL})){if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is required.");}
 async save(m:OutboundMessage){const id=crypto.randomUUID();await this.pool.query("INSERT INTO messages(id,company_id,direction,subject,body,provider_id,created_at) VALUES($1,$2,'outbound',$3,$4,$5,$6)",[id,m.companyId,m.subject,m.body,m.providerId??null,new Date().toISOString()]);return id;}
 async saveInbound(m:{companyId:string;subject?:string;body?:string;providerId:string}){const id=crypto.randomUUID();await this.pool.query("INSERT INTO messages(id,company_id,direction,subject,body,provider_id,created_at) VALUES($1,$2,'inbound',$3,$4,$5,$6)",[id,m.companyId,m.subject??null,m.body??null,m.providerId,new Date().toISOString()]);return id;}
 async close(){await this.pool.end();}
}