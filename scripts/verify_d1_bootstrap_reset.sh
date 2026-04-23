#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${ROOT_DIR}/apps/api"
TMP_DIR="${ROOT_DIR}/.tmp"
CREATE_FILE="${TMP_DIR}/ground-bootstrap-verify-create.json"
PREVIEW_FILE="${TMP_DIR}/ground-bootstrap-verify-preview.json"
RESET_FILE="${TMP_DIR}/ground-bootstrap-verify-reset.json"
AFTER_RELOAD_FILE="${TMP_DIR}/ground-bootstrap-verify-after-reload.json"
MANIFEST_FILE="${ROOT_DIR}/scripts/local_d1_bootstrap_manifest.json"
SEED_SQL_FILE="${ROOT_DIR}/scripts/local_d1_bootstrap_seed.sql"

source "${ROOT_DIR}/scripts/_ground_local_d1.sh"

mkdir -p "${TMP_DIR}"

STAMP="$(date '+%Y%m%d%H%M%S')"
PROJECT_NAME="Ground Bootstrap Probe ${STAMP}"
PROJECT_THESIS="Create a temporary local Ground project so bootstrap reset can prove that ad hoc coverage entries are removed and the seed catalog is restored."
PROJECT_ID="project-bootstrap-probe-${STAMP}"
JURISDICTION_ID="jurisdiction-bootstrap-probe-${STAMP}"
PROJECT_TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

SQLITE_PATH="$(require_local_d1_sqlite "${API_DIR}")"

reset_local_d1_bootstrap_state "${SQLITE_PATH}" "${SEED_SQL_FILE}"
insert_local_d1_probe_project "${SQLITE_PATH}" "${PROJECT_ID}" "${JURISDICTION_ID}" "${PROJECT_NAME}" "${PROJECT_THESIS}" "${PROJECT_TS}"

node - "${CREATE_FILE}" "${PROJECT_ID}" "${PROJECT_NAME}" "${PROJECT_THESIS}" "${PROJECT_TS}" <<'NODE'
const fs = require('fs');
const [createPath, projectId, projectName, projectThesis, projectTs] = process.argv.slice(2);
fs.writeFileSync(createPath, JSON.stringify({
  project: {
    id: projectId,
    name: projectName,
    thesis: projectThesis,
    createdAt: projectTs,
  },
}, null, 2));
NODE

preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${PREVIEW_FILE}"
reset_local_d1_bootstrap_state "${SQLITE_PATH}" "${SEED_SQL_FILE}"
preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${AFTER_RELOAD_FILE}"

node - "${CREATE_FILE}" "${PREVIEW_FILE}" "${AFTER_RELOAD_FILE}" <<'NODE'
const fs = require('fs');

const [createPath, previewPath, afterReloadPath] = process.argv.slice(2);
const created = JSON.parse(fs.readFileSync(createPath, 'utf8'));
const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
const afterReload = JSON.parse(fs.readFileSync(afterReloadPath, 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const createdProjectId = created.project.id;
const seededProjectIds = ['project-ti-sherman', 'project-globalwafers-sherman'];

assert(preview.seedProjects.length === 2, 'Bootstrap preview should expose two seeded projects.');
assert(preview.currentProjectCount === 3, 'Preview should show two seed projects plus the temporary probe project.');
assert(preview.extraProjectIds.includes(createdProjectId), 'Preview should classify the probe project as extra coverage.');
assert(afterReload.currentProjectCount === 2, 'Reset should restore the two-project bootstrap catalog.');
assert(afterReload.extraProjectIds.length === 0, 'Reset should clear extra project ids.');
assert(afterReload.missingSeedProjectIds.length === 0, 'Reset should not miss any seed projects.');
assert(JSON.stringify(afterReload.currentProjects.map((project) => project.id)) === JSON.stringify(seededProjectIds), 'Reset should restore the expected seed project order.');

console.log(JSON.stringify({
  ok: true,
  createdProjectId,
  seedProjectIds: seededProjectIds,
  persistedProjectCountAfterReload: afterReload.currentProjectCount,
}, null, 2));
NODE

preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${RESET_FILE}"

echo "Ground local D1 bootstrap reset verification passed."
