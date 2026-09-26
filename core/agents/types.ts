export type AgentName =
  | "research"
  | "verification"
  | "opportunity"
  | "decision-maker"
  | "outreach"
  | "conversation"
  | "pricing"
  | "proposal"
  | "negotiation"
  | "project"
  | "website-engineering"
  | "github-engineering"
  | "testing"
  | "deployment"
  | "learning"
  | "reporting";

export interface AgentDefinition {
  name: AgentName;
  description: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  enabled: boolean;
}
