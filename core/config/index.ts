export interface AgencyConfig {
  environment: "development" | "staging" | "production";
  leadGoalPerDay: number;
  requireApprovalForOutboundEmail: boolean;
  autonomousNegotiation: boolean;
  qualityFirst: boolean;
}

export const defaultAgencyConfig: AgencyConfig = {
  environment: "development",
  leadGoalPerDay: 50,
  requireApprovalForOutboundEmail: true,
  autonomousNegotiation: true,
  qualityFirst: true,
};
