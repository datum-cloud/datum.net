#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 [GHSA-id[=YYYY-MM-DD]]..." >&2
  echo "  An ignore with a date stops applying on that date (UTC), or as soon as" >&2
  echo "  the registry has a release past the advisory's '<=x.y.z' range." >&2
  echo "  NPM_AUDIT_LEVEL=low|moderate|high|critical sets the lowest failing severity (default low)." >&2
}

declare -A rank=([info]=0 [low]=1 [moderate]=2 [high]=3 [critical]=4)
level=${NPM_AUDIT_LEVEL:-low}
if [[ -z ${rank[$level]:-} ]]; then
  echo "unknown NPM_AUDIT_LEVEL: $level" >&2
  usage
  exit 2
fi
today=${NPM_AUDIT_TODAY:-$(date -u +%F)}

ids=()
declare -A expires=()
for arg in "$@"; do
  id=${arg%%=*}
  if [[ ! $id =~ ^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$ ]]; then
    echo "not a GHSA id: $arg" >&2
    usage
    exit 2
  fi
  if [[ $arg == *=* ]]; then
    expiry=${arg#*=}
    if [[ ! $expiry =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      echo "not a YYYY-MM-DD expiry: $arg" >&2
      usage
      exit 2
    fi
    expires[$id]=$expiry
  fi
  ids+=("$id")
done

errors=$(mktemp)
trap 'rm -f "$errors"' EXIT
report=$(npm audit --json 2>"$errors" || true)

if [[ "$(jq -r '.auditReportVersion // empty' <<<"$report" 2>/dev/null)" != 2 ]]; then
  echo "npm audit returned no report:" >&2
  printf '%s\n' "$report" >&2
  cat "$errors" >&2
  exit 1
fi

advisories=$(jq -r '
  [.vulnerabilities[].via[] | objects
    | "\(.url | sub(".*/"; ""))\t\(.severity)\t\(.name) \(.range)\t\(.title)"]
  | unique[]' <<<"$report")

skip=()
lapsed=()
for id in "${ids[@]}"; do
  rows=$(awk -F'\t' -v id="$id" '$1 == id' <<<"$advisories")
  if [[ -z $rows ]]; then
    echo "note: ignored advisory ${id} is no longer reported; drop it from the ignore list"
    continue
  fi
  expiry=${expires[$id]:-}
  if [[ -z $expiry ]]; then
    skip+=("$id")
    continue
  fi
  if [[ ! $today < $expiry ]]; then
    lapsed+=("${id}: ignore expired on ${expiry}")
    continue
  fi
  patched=""
  while IFS=$'\t' read -r _ _ pkg _; do
    name=${pkg% *}
    range=${pkg#* }
    [[ $range =~ ^\<=([0-9]+\.[0-9]+\.[0-9]+)$ ]] || continue
    spec="${name}@>${BASH_REMATCH[1]}"
    if ! view=$(npm view "$spec" version 2>&1); then
      grep -q E404 <<<"$view" || { echo "npm view $spec failed:" >&2; printf "%s\n" "$view" >&2; exit 1; }
      view=""
    fi
    newer=$(awk 'NF { v = $NF } END { gsub(/\x27/, "", v); print v }' <<<"$view")
    [[ -z $newer ]] || patched+="${name}@${newer} "
  done <<<"$rows"
  if [[ -n $patched ]]; then
    lapsed+=("${id}: ignore ended early, release past the vulnerable range exists: ${patched% }")
    continue
  fi
  echo "note: ignoring ${id} until ${expiry} or until a patched release ships"
  skip+=("$id")
done

failing=$(awk -F'\t' -v ignored="${skip[*]:-}" -v min="${rank[$level]}" '
  BEGIN {
    n = split(ignored, ids, " "); for (i = 1; i <= n; i++) skip[ids[i]] = 1
    r["info"] = 0; r["low"] = 1; r["moderate"] = 2; r["high"] = 3; r["critical"] = 4
  }
  NF && !($1 in skip) && r[$2] >= min
' <<<"$advisories")

status=0
if (( ${#lapsed[@]} )); then
  echo "npm audit ignores that no longer apply; upgrade or re-decide, then update the ignore list:" >&2
  printf '%s\n' "${lapsed[@]}" >&2
  status=1
fi
if [[ -n $failing ]]; then
  echo "npm audit found advisories that are not ignored:" >&2
  printf '%s\n' "$failing" >&2
  status=1
fi
(( status == 0 )) || exit "$status"

echo "npm audit: no ${level}+ advisories beyond the ignore list (${skip[*]:-none})"
