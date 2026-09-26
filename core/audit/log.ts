export interface AuditRecord {
  id: string;
  action: string;
  actor: string;
  outcome: "allowed" | "blocked" | "approved" | "failed";
  risk: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export class AuditLog {
  private readonly records: AuditRecord[] = [];

  append(record: AuditRecord): void { this.records.push(structuredClone(record)); }
  list(): AuditRecord[] { return this.records.map(r => structuredClone(r)); }
}