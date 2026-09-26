export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface GovernanceDecision {
  action: string;
  risk: RiskLevel;
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
  actor: string;
  createdAt: string;
}
