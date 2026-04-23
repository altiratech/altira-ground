#!/usr/bin/env bash

set -euo pipefail

find_local_d1_sqlite() {
  local api_dir="$1"
  local d1_dir="${api_dir}/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"

  if [[ ! -d "${d1_dir}" ]]; then
    return 0
  fi

  find "${d1_dir}" -maxdepth 1 -type f -name '*.sqlite' | sort | head -n 1
}

local_d1_has_schema() {
  local sqlite_path="$1"

  if [[ -z "${sqlite_path}" || ! -f "${sqlite_path}" ]]; then
    return 1
  fi

  local result
  result="$(sqlite3 "${sqlite_path}" "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects';" 2>/dev/null || true)"
  [[ "${result}" == "projects" ]]
}

ensure_local_d1_schema() {
  local api_dir="$1"
  local sqlite_path

  sqlite_path="$(find_local_d1_sqlite "${api_dir}")"
  if local_d1_has_schema "${sqlite_path}"; then
    echo "Found existing local Ground D1 schema at ${sqlite_path}."
    return 0
  fi

  echo "Applying local Ground D1 migrations..."
  (
    cd "${api_dir}"
    printf 'y\n' | npx wrangler d1 migrations apply altira-ground-db --local
  )
}

require_local_d1_sqlite() {
  local api_dir="$1"
  local sqlite_path

  sqlite_path="$(find_local_d1_sqlite "${api_dir}")"
  if ! local_d1_has_schema "${sqlite_path}"; then
    echo "Ground local D1 schema was not found. Run the local migration path first." >&2
    return 1
  fi

  printf '%s\n' "${sqlite_path}"
}

preview_local_d1_bootstrap_state() {
  local sqlite_path="$1"
  local manifest_path="$2"

  node - "${sqlite_path}" "${manifest_path}" <<'NODE'
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const [sqlitePath, manifestPath] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function query(sql) {
  const output = execFileSync('sqlite3', [sqlitePath, '-json', sql], { encoding: 'utf8' }).trim();
  return output ? JSON.parse(output) : [];
}

const currentProjects = query(`
  SELECT
    p.id,
    p.name,
    p.lens,
    p.status,
    p.market_key AS marketKey,
    p.thesis,
    (
      SELECT MAX(e.happened_at)
      FROM events e
      WHERE e.project_id = p.id
    ) AS latestEventAt,
    COALESCE((
      SELECT w.decision
      FROM watch_states w
      WHERE w.project_id = p.id
    ), 'none') AS watchDecision
  FROM projects p
  ORDER BY p.updated_at DESC, p.name ASC
`);

const seedProjectIds = new Set(manifest.seedProjects.map((project) => project.id));
const currentProjectIds = new Set(currentProjects.map((project) => project.id));

const state = {
  mode: 'd1',
  seedVersion: manifest.seedVersion,
  seedProjects: manifest.seedProjects,
  currentProjects,
  currentProjectCount: currentProjects.length,
  missingSeedProjectIds: manifest.seedProjects
    .map((project) => project.id)
    .filter((projectId) => !currentProjectIds.has(projectId)),
  extraProjectIds: currentProjects
    .map((project) => project.id)
    .filter((projectId) => !seedProjectIds.has(projectId)),
  canResetToSeed: true,
};

process.stdout.write(JSON.stringify(state, null, 2));
NODE
}

reset_local_d1_bootstrap_state() {
  local sqlite_path="$1"
  local seed_sql_path="$2"

  sqlite3 "${sqlite_path}" < "${seed_sql_path}"
}

sqlite_escape_text() {
  local value="$1"

  node -e "process.stdout.write(process.argv[1].replace(/\r?\n/g, ' ').replace(/'/g, \"''\"))" "${value}"
}

insert_local_d1_probe_project() {
  local sqlite_path="$1"
  local project_id="$2"
  local jurisdiction_id="$3"
  local project_name="$4"
  local project_thesis="$5"
  local timestamp="$6"
  local escaped_project_name
  local escaped_project_thesis

  escaped_project_name="$(sqlite_escape_text "${project_name}")"
  escaped_project_thesis="$(sqlite_escape_text "${project_thesis}")"

  sqlite3 "${sqlite_path}" <<SQL
PRAGMA foreign_keys = ON;
BEGIN;
INSERT OR REPLACE INTO jurisdictions
  (id, name, state, market_key, government_bodies_json, planning_portal_url, notes)
VALUES
  ('${jurisdiction_id}', 'Unknown jurisdiction', 'TX', 'texas_ercot_corridor', '[]', NULL, NULL);
INSERT OR REPLACE INTO projects
  (id, name, lens, status, market_key, thesis, jurisdiction_id, next_use_options_json, alert_ids_json, created_at, updated_at)
VALUES
  ('${project_id}', '${escaped_project_name}', 'industrial_development', 'sourced', 'texas_ercot_corridor', '${escaped_project_thesis}', '${jurisdiction_id}', '[]', '[]', '${timestamp}', '${timestamp}');
INSERT OR REPLACE INTO watch_states
  (project_id, decision, reason, decided_at, decided_by)
VALUES
  ('${project_id}', 'none', 'No decision captured yet.', '${timestamp}', 'system');
COMMIT;
SQL
}
