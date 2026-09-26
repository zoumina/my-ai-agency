import type { CompanyProfile } from "./types.js";

export class CompanyMemoryStore {
  private readonly companies = new Map<string, CompanyProfile>();

  upsert(profile: CompanyProfile): void {
    this.companies.set(profile.companyId, structuredClone(profile));
  }

  get(companyId: string): CompanyProfile | undefined {
    const profile = this.companies.get(companyId);
    return profile ? structuredClone(profile) : undefined;
  }

  suppress(companyId: string): void {
    const profile = this.companies.get(companyId);
    if (profile) this.companies.set(companyId, { ...profile, suppressed: true });
  }
}