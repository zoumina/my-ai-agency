export interface Job<T=unknown>{id:string;type:string;payload:T;attempts:number;maxAttempts:number;status:"queued"|"running"|"completed"|"failed"}
export class InMemoryJobQueue {
 private jobs:Job[]=[];
 enqueue<T>(type:string,payload:T,maxAttempts=3){const job={id:crypto.randomUUID(),type,payload,attempts:0,maxAttempts,status:"queued" as const};this.jobs.push(job);return job}
 list(){return this.jobs.map(j=>({...j}))}
}