#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${ROOT_DIR}/apps/api"
TMP_DIR="${ROOT_DIR}/.tmp"
PREVIEW_FILE="${TMP_DIR}/ground-bootstrap-preview.json"
MANIFEST_FILE="${ROOT_DIR}/scripts/local_d1_bootstrap_manifest.json"

source "${ROOT_DIR}/scripts/_ground_local_d1.sh"

mkdir -p "${TMP_DIR}"

SQLITE_PATH="$(require_local_d1_sqlite "${API_DIR}")"
preview_local_d1_bootstrap_state "${SQLITE_PATH}" "${MANIFEST_FILE}" >"${PREVIEW_FILE}"

node - "${PREVIEW_FILE}" <<'NODE'
const fs = require('fs');

const preview = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
console.log(JSON.stringify({
  mode: preview.mode,
  seedVersion: preview.seedVersion,
  seedProjectCount: preview.seedProjects.length,
  seedProjectIds: preview.seedProjects.map((project) => project.id),
  currentProjectCount: preview.currentProjectCount,
  currentProjectIds: preview.currentProjects.map((project) => project.id),
  missingSeedProjectIds: preview.missingSeedProjectIds,
  extraProjectIds: preview.extraProjectIds,
}, null, 2));
NODE

echo "Ground local D1 bootstrap preview fetched."
