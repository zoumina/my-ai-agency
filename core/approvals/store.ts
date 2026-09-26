export interface ApprovalRequest{id:string;action:string;risk:"low"|"medium"|"high"|"critical";status:"pending"|"approved"|"rejected";createdAt:string;decidedAt?:string}
export class ApprovalStore{private items:ApprovalRequest[]=[];
 create(action:string,risk:ApprovalRequest["risk"]){const x={id:crypto.randomUUID(),action,risk,status:"pending" as const,createdAt:new Date().toISOString()};this.items.push(x);return {...x}}
 list(){return this.items.map(x=>({...x}))} get(id:string){const x=this.items.find(v=>v.id===id);return x?{...x}:undefined}
 approve(id:string){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="approved";x.decidedAt=new Date().toISOString();return {...x}}
 reject(id:string){const x=this.items.find(v=>v.id===id);if(!x||x.status!=="pending")return undefined;x.status="rejected";x.decidedAt=new Date().toISOString();return {...x}}
}