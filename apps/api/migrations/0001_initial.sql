PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jurisdictions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  market_key TEXT NOT NULL,
  government_bodies_json TEXT NOT NULL DEFAULT '[]',
  planning_portal_url TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lens TEXT NOT NULL,
  status TEXT NOT NULL,
  market_key TEXT NOT NULL,
  thesis TEXT NOT NULL,
  jurisdiction_id TEXT NOT NULL,
  next_use_options_json TEXT NOT NULL DEFAULT '[]',
  alert_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

CREATE TABLE IF NOT EXISTS source_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_class TEXT NOT NULL,
  rights_status TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_url TEXT,
  jurisdiction_id TEXT,
  record_type TEXT NOT NULL,
  published_at TEXT,
  retrieved_at TEXT NOT NULL,
  update_cadence TEXT NOT NULL,
  summary TEXT NOT NULL,
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

CREATE TABLE IF NOT EXISTS project_source_records (
  project_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (project_id, source_record_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (source_record_id) REFERENCES source_records(id)
);

CREATE TABLE IF NOT EXISTS site_parcels (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL,
  acreage REAL,
  ownership_status TEXT NOT NULL,
  current_use TEXT,
  geometry_ref TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_parcel_source_records (
  site_parcel_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (site_parcel_id, source_record_id),
  FOREIGN KEY (site_parcel_id) REFERENCES site_parcels(id) ON DELETE CASCADE,
  FOREIGN KEY (source_record_id) REFERENCES source_records(id)
);

CREATE TABLE IF NOT EXISTS evidence_claims (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  claim_bucket TEXT NOT NULL,
  label TEXT NOT NULL,
  value_text TEXT NOT NULL,
  truth_type TEXT NOT NULL,
  confidence REAL,
  materiality TEXT NOT NULL,
  analyst_review_required INTEGER NOT NULL DEFAULT 1,
  last_reviewed_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence_claim_source_records (
  evidence_claim_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (evidence_claim_id, source_record_id),
  FOREIGN KEY (evidence_claim_id) REFERENCES evidence_claims(id) ON DELETE CASCADE,
  FOREIGN KEY (source_record_id) REFERENCES source_records(id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  happened_at TEXT NOT NULL,
  truth_type TEXT NOT NULL,
  confidence REAL,
  why_it_matters TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_source_records (
  event_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (event_id, source_record_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (source_record_id) REFERENCES source_records(id)
);

CREATE TABLE IF NOT EXISTS memos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  memo_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  author TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memo_source_records (
  memo_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (memo_id, source_record_id),
  FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE,
  FOREIGN KEY (source_record_id) REFERENCES source_records(id)
);

CREATE TABLE IF NOT EXISTS watch_states (
  project_id TEXT PRIMARY KEY,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  decided_by TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_market ON projects(market_key, status);
CREATE INDEX IF NOT EXISTS idx_events_project_happened ON events(project_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_project_created ON memos(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_project_bucket ON evidence_claims(project_id, claim_bucket);
