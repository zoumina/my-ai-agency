export interface DeploymentAdapter{deploy(projectId:string):Promise<{url:string;deploymentId:string}>;rollback(deploymentId:string):Promise<void>}
export function createDeploymentAdapter():DeploymentAdapter{
 const endpoint=process.env.DEPLOYMENT_WEBHOOK_URL;
 const token=process.env.DEPLOYMENT_WEBHOOK_TOKEN;
 if(!endpoint)throw new Error("DEPLOYMENT_WEBHOOK_URL is required.");
 return {
  async deploy(projectId){
   const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",...(token?{authorization:"Bearer "+token}:{})},body:JSON.stringify({projectId,environment:"production"})});
   if(!r.ok)throw new Error("Deployment provider rejected request: "+r.status);
   const data=await r.json() as {url?:string;deploymentId?:string};
   if(!data.url||!data.deploymentId)throw new Error("Deployment provider response must include url and deploymentId.");
   return {url:data.url,deploymentId:data.deploymentId};
  },
  async rollback(deploymentId){
   const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",...(token?{authorization:"Bearer "+token}:{})},body:JSON.stringify({deploymentId,action:"rollback",environment:"production"})});
   if(!r.ok)throw new Error("Deployment rollback rejected: "+r.status);
  }
 };
}