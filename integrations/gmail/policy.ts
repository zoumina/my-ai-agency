export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  companyId: string;
}

export interface GmailPolicy {
  requireApproval: boolean;
  respectSuppression: boolean;
  preventDuplicates: boolean;
}

export const defaultGmailPolicy: GmailPolicy = {
  requireApproval: true,
  respectSuppression: true,
  preventDuplicates: true
};