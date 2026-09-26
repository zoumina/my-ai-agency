export interface Permission {
  resource: string;
  actions: string[];
}

export interface AgentIdentity {
  agent: string;
  permissions: Permission[];
}

export function can(identity: AgentIdentity, resource: string, action: string): boolean {
  return identity.permissions.some(p => p.resource === resource && p.actions.includes(action));
}