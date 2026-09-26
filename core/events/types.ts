export type EventType =
  | "workflow.created" | "workflow.started" | "workflow.paused" | "workflow.completed" | "workflow.failed"
  | "lead.discovered" | "lead.qualified" | "lead.suppressed"
  | "outreach.drafted" | "outreach.approved" | "outreach.sent" | "reply.received"
  | "project.created" | "build.started" | "build.completed" | "deployment.completed"
  | "incident.detected" | "incident.recovered";

export interface AgencyEvent<T = unknown> {
  id: string;
  type: EventType;
  occurredAt: string;
  actor: string;
  tenantId?: string;
  companyId?: string;
  projectId?: string;
  payload: T;
}