import {createProject} from "./factory.js";
import {websitePipeline} from "../website-factory/pipeline.js";
import {createGitWorkflow} from "../github-engineering/workflow.js";
import {evaluateGates} from "../testing/gates.js";
import {createDeploymentPlan} from "../deployment/strategy.js";
import type {AgencyRuntime} from "../../core/orchestrator/agency.js";
export class ProjectLifecycle{
 constructor(private readonly runtime:AgencyRuntime){}
 async prepare(companyId:string,requirements:string[]){
  if(this.runtime.control.emergencyStop)throw new Error("Emergency stop is active.");
  const project=createProject(companyId,requirements);
  const web=websitePipeline();
  const git=createGitWorkflow(project.projectId);
  const deployment=createDeploymentPlan();
  const gates=evaluateGates([{name:"requirements",passed:requirements.length>0},{name:"workflow",passed:web.steps.length>0},{name:"git-policy",passed:git.pullRequestRequired&&git.testsRequired},{name:"deployment-policy",passed:deployment.rollbackEnabled}]);
  await this.runtime.events.publish({id:crypto.randomUUID(),type:"project.created",occurredAt:new Date().toISOString(),actor:"project-agent",companyId,payload:{project,workflow:git,gates}});
  return {project,website:web,git,deployment,gates};
 }
}