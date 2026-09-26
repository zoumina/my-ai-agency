export interface ApprovalPayload{companyId:string;to:string;subject:string;body:string}
export interface ApprovalRequest{id:string;action:string;risk:"low"|"medium"|"high"|"critical";status:"pending"|"approved"|"rejected";createdAt:string;decidedAt?:string;consumedAt?:string;payload?:ApprovalPayload}
export class ApprovalStore{private items:ApprovalRequest[]=[];
 create(action:string,risk:ApprovalRequest["risk"],payload?:ApprovalPayload){const x:ApprovalRequest={id:crypto.randomUUID(),action,risk,status:"pending",createdAt:new Date().toISOString(),payload};this.items.push(x);return {...x}}
 list(){return this.items.map(x=>({...x,payload:x.payload?{...x.payload}:undefined}))}
 get(id:string){const x=this.items.find(v=>v.id===id);return x?{...x,payload:x.payload?{...x.payload}:undefined}:undefined}
 approve(id:string){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="approved";x.decidedAt=new Date().toISOString();return {...x}}
 reject(id:string){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="rejected";x.decidedAt=new Date().toISOString();return {...x}}
 markConsumed(id:string){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="approved"||x.consumedAt)return undefined;x.consumedAt=new Date().toISOString();return {...x}}
}