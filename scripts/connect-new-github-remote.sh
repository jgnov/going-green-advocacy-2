#!/usr/bin/env bash
# After creating an empty repo on GitHub, point this project at it and print push instructions.
set -euo pipefail

REPO_URL="${1:?Usage: $0 https://github.com/OWNER/going-green-advocacy-2.git}"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
  echo "Updated origin → $REPO_URL"
else
  git remote add origin "$REPO_URL"
  echo "Added origin → $REPO_URL"
fi

echo "Next: git push -u origin main"
