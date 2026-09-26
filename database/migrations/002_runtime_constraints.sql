CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, legal_name TEXT NOT NULL, domain TEXT, country TEXT, industry TEXT, opportunity_score INTEGER, suppressed BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS company_sources (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, url TEXT NOT NULL, fact TEXT NOT NULL, confidence REAL NOT NULL, collected_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, actor TEXT NOT NULL, outcome TEXT NOT NULL, risk TEXT NOT NULL, timestamp TIMESTAMPTZ NOT NULL, metadata JSONB NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, current_step TEXT, company_id TEXT, project_id TEXT, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS idx_runtime_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_runtime_companies_suppressed ON companies(suppressed);
CREATE INDEX IF NOT EXISTS idx_runtime_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_runtime_approvals_status ON approvals(status);

ALTER TABLE approvals ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS payload JSONB;
