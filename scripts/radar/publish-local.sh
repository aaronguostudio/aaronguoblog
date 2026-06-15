#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
ENV_FILE="${RADAR_ENV_FILE:-$HOME/.config/aaronguo/radar.env}"
LOCK_DIR="$REPO_ROOT/.data/radar/publish.lock"

cd "$REPO_ROOT"
mkdir -p "$REPO_ROOT/.data/radar"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Radar publish is already running; lock exists at $LOCK_DIR"
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Refusing to publish from a dirty worktree."
  git status --short
  exit 1
fi

git fetch origin
git pull --rebase --autostash

pnpm radar:migrate
pnpm radar:run --cadence daily

if [ "${RADAR_ALLOW_LOCAL_RANKING:-}" = "1" ]; then
  pnpm radar:export --allow-local-ranking
else
  pnpm radar:export
fi

rm -rf .nuxt .output
pnpm run generate

git add public/radar

if git diff --cached --quiet; then
  echo "Radar snapshot unchanged; nothing to commit."
else
  git commit -m "chore(radar): update signal snapshot $(date +%F)"
  git push
fi

if [ "$(date +%u)" = "1" ]; then
  pnpm radar:run --cadence weekly
fi
