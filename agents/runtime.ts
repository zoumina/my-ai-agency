import type { AgentDefinition, AgentName } from "../core/agents/types.js";

export interface AgentTask<T = unknown> {
  id: string;
  agent: AgentName;
  input: T;
}

export interface AgentResult<T = unknown> {
  taskId: string;
  success: boolean;
  output?: T;
  error?: string;
}

export class AgentRuntime {
  constructor(private readonly definitions: AgentDefinition[]) {}

  isEnabled(agent: AgentName): boolean {
    return this.definitions.some(d => d.name === agent && d.enabled);
  }
}