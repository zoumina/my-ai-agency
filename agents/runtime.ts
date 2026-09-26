import type { AgentDefinition, AgentName } from "../core/agents/types.js";

export interface AgentTask<T = unknown> { id:string; agent:AgentName; input:T; }
export interface AgentResult<T = unknown> { taskId:string; success:boolean; output?:T; error?:string; }

export class AgentRuntime {
  constructor(private readonly definitions:AgentDefinition[]) {}
  isEnabled(agent:AgentName):boolean { return this.definitions.some(d=>d.name===agent && d.enabled); }
  listEnabled():AgentName[] { return this.definitions.filter(d=>d.enabled).map(d=>d.name); }
  assertEnabled(agent:AgentName):void { if(!this.isEnabled(agent)) throw new Error("Agent is disabled: "+agent); }
}