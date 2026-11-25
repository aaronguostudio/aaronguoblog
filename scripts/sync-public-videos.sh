#!/usr/bin/env bash
# Sync in an isolated main checkout, so local blog drafts are never included.
set -euo pipefail

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
env_file=${YOUTUBE_ENV_FILE:-"$repo/.env"}
remote=$(git -C "$repo" remote get-url origin)
sync_dir=$(mktemp -d)
trap 'rm -rf "$sync_dir"' EXIT
git clone --quiet --depth 1 --filter=blob:none --sparse --branch main "$remote" "$sync_dir"
cd "$sync_dir"
git sparse-checkout set scripts data
node --env-file-if-exists="$env_file" scripts/fetch-youtube-data.js --scheduled "$@"
if git diff --quiet -- data/youtube.json; then
  echo "Video catalog is current."
  exit 0
fi
git add -- data/youtube.json
git commit -m "Refresh public YouTube videos"
git push origin HEAD:main
