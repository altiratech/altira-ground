#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${ROOT_DIR}/apps/api"
TMP_DIR="${ROOT_DIR}/.tmp"
BEFORE_FILE="${TMP_DIR}/ground-bootstrap-before-reset.json"
RESET_FILE="${TMP_DIR}/ground-bootstrap-reset.json"
AFTER_FILE="${TMP_DIR}/ground-bootstrap-after-reset.json"
MANIFEST_FILE="${ROOT_DIR}/scripts/local_d1_bootstrap_manifest.json"
SEED_SQL_FILE="${ROOT_DIR}/scripts/local_d1_bootstrap_seed.sql"

source "${ROOT_DIR}/scripts/_ground_local_d1.sh"

mkdir -p "${TMP_DIR}"

SQLITE_PATH="$(require_local_d1_sqlite "${API_DIR}")"
preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${BEFORE_FILE}"
reset_local_d1_bootstrap_state "${SQLITE_PATH}" "${SEED_SQL_FILE}"
preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${AFTER_FILE}"

node - "${BEFORE_FILE}" "${AFTER_FILE}" "${RESET_FILE}" <<'NODE'
const fs = require('fs');

const before = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const after = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const resetFile = process.argv[4];
const payload = {
  before,
  after,
  resetAppliedAt: new Date().toISOString(),
};

fs.writeFileSync(resetFile, JSON.stringify(payload, null, 2));

console.log(JSON.stringify({
  resetAppliedAt: payload.resetAppliedAt,
  beforeProjectCount: before.currentProjectCount,
  beforeProjectIds: before.currentProjects.map((project) => project.id),
  beforeExtraProjectIds: before.extraProjectIds,
  afterProjectCount: after.currentProjectCount,
  afterProjectIds: after.currentProjects.map((project) => project.id),
  afterExtraProjectIds: after.extraProjectIds,
  missingSeedProjectIdsAfterReset: after.missingSeedProjectIds,
}, null, 2));
NODE

echo "Ground local D1 bootstrap reset applied."
