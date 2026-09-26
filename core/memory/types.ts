export interface CompanyProfile {
  companyId: string;
  legalName: string;
  domain?: string;
  country?: string;
  industry?: string;
  opportunityScore?: number;
  suppressed: boolean;
  sources: Array<{
    url: string;
    fact: string;
    confidence: number;
    collectedAt: string;
  }>;
}
