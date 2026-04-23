#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${ROOT_DIR}/apps/api"

source "${ROOT_DIR}/scripts/_ground_local_d1.sh"

SQLITE_PATH="$(require_local_d1_sqlite "${API_DIR}")"

node "${ROOT_DIR}/scripts/verify_d1_write_paths_inprocess.mjs" "${ROOT_DIR}" "${SQLITE_PATH}"

echo "Ground D1 in-process write-path verification passed."
