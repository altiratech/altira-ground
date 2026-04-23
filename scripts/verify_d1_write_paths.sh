#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${ROOT_DIR}/apps/api"
API_PORT="${GROUND_API_PORT:-8789}"
TMP_DIR="${ROOT_DIR}/.tmp"
LOG_FILE="${TMP_DIR}/ground-d1-write-paths.log"
CREATE_FILE="${TMP_DIR}/ground-create-project.json"
MEMO_FILE="${TMP_DIR}/ground-create-memo.json"
LIST_FILE="${TMP_DIR}/ground-project-list.json"
DETAIL_FILE="${TMP_DIR}/ground-project-detail-after-restart.json"

source "${ROOT_DIR}/scripts/_ground_local_d1.sh"

mkdir -p "${TMP_DIR}"

SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
    SERVER_PID=""
  fi
}

start_server() {
  : > "${LOG_FILE}"
  (
    cd "${API_DIR}"
    npx wrangler dev --port "${API_PORT}"
  ) >"${LOG_FILE}" 2>&1 &
  SERVER_PID="$!"

  for _ in $(seq 1 90); do
    if curl -fsS "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Ground API did not become ready on port ${API_PORT}." >&2
  echo "Recent server log:" >&2
  tail -n 80 "${LOG_FILE}" >&2 || true
  return 1
}

stop_server() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
    SERVER_PID=""
  fi
}

trap cleanup EXIT

STAMP="$(date '+%Y%m%d%H%M%S')"
PROJECT_NAME="Ground Manual Intake ${STAMP}"
PROJECT_THESIS="Track a manually seeded ERCOT corridor project shell and verify that Ground persists dossier-adjacent write paths through D1."
MEMO_TITLE="D1 write-path memo ${STAMP}"
MEMO_BODY="Verification memo for the D1-backed API surface. This note should still be attached to the created project after a Worker restart."

ensure_local_d1_schema "${API_DIR}"

echo "Starting Ground API on port ${API_PORT}..."
cd "${API_DIR}"
start_server

PROJECT_PAYLOAD="$(node -e "process.stdout.write(JSON.stringify({name: process.argv[1], marketKey: 'texas_ercot_corridor', thesis: process.argv[2]}))" "${PROJECT_NAME}" "${PROJECT_THESIS}")"
curl -fsS -X POST "http://127.0.0.1:${API_PORT}/api/v1/projects" \
  -H 'content-type: application/json' \
  --data "${PROJECT_PAYLOAD}" \
  >"${CREATE_FILE}"

PROJECT_ID="$(node -e "const fs=require('fs');const body=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));if(!body.project?.id){throw new Error('Missing created project id');}process.stdout.write(body.project.id);" "${CREATE_FILE}")"

MEMO_PAYLOAD="$(node -e "process.stdout.write(JSON.stringify({memoType: 'screen', title: process.argv[1], bodyMarkdown: process.argv[2], author: 'Ground D1 verification', sourceRecordIds: []}))" "${MEMO_TITLE}" "${MEMO_BODY}")"
curl -fsS -X POST "http://127.0.0.1:${API_PORT}/api/v1/projects/${PROJECT_ID}/memos" \
  -H 'content-type: application/json' \
  --data "${MEMO_PAYLOAD}" \
  >"${MEMO_FILE}"

curl -fsS "http://127.0.0.1:${API_PORT}/api/v1/projects" >"${LIST_FILE}"

echo "Restarting Ground API to verify D1 persistence..."
stop_server
start_server

curl -fsS "http://127.0.0.1:${API_PORT}/api/v1/projects/${PROJECT_ID}" >"${DETAIL_FILE}"

node - "${CREATE_FILE}" "${MEMO_FILE}" "${LIST_FILE}" "${DETAIL_FILE}" <<'NODE'
const fs = require('fs');

const [createPath, memoPath, listPath, detailPath] = process.argv.slice(2);
const created = JSON.parse(fs.readFileSync(createPath, 'utf8'));
const memoPayload = JSON.parse(fs.readFileSync(memoPath, 'utf8'));
const projectList = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const createdProject = created.project;
const createdMemo = memoPayload.memo;
const persistedProject = detail.project;
const persistedMemo = persistedProject.memos.find((memo) => memo.id === createdMemo.id);
const coverageEntry = projectList.projects.find((project) => project.id === createdProject.id);

assert(createdProject.status === 'sourced', 'Created project should start in sourced status.');
assert(createdProject.watchState.decision === 'none', 'Created project should start with watch decision none.');
assert(memoPayload.project.id === createdProject.id, 'Created memo should be attached to the created project.');
assert(memoPayload.project.memos[0]?.id === createdMemo.id, 'Created memo should appear at the top of the immediate memo trail.');
assert(Boolean(coverageEntry), 'Created project should appear in the coverage list.');
assert(projectList.projects[0]?.id === createdProject.id, 'Created project should sort to the top of coverage after creation.');
assert(projectList.projects[0]?.watchDecision === 'none', 'Created project coverage row should show watchDecision none.');
assert(persistedProject.id === createdProject.id, 'Created project should still be available after Worker restart.');
assert(persistedProject.name === createdProject.name, 'Created project name should persist through D1.');
assert(persistedProject.watchState.decision === 'none', 'Created project watch decision should remain none after restart.');
assert(Boolean(persistedMemo), 'Created memo should still be attached to the project after Worker restart.');
assert(persistedMemo.title === createdMemo.title, 'Created memo title should persist through D1.');

console.log(JSON.stringify({
  ok: true,
  projectId: createdProject.id,
  projectName: createdProject.name,
  coverageCount: projectList.projects.length,
  persistedMemoId: createdMemo.id,
  persistedMemoTitle: createdMemo.title,
  persistedWatchDecision: persistedProject.watchState.decision,
}, null, 2));
NODE

echo "Ground D1 write-path verification passed."
