export type WorkflowStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface WorkflowContext {
  workflowId: string;
  name: string;
  status: WorkflowStatus;
  currentStep?: string;
  companyId?: string;
  projectId?: string;
  metadata: Record<string, unknown>;
}
