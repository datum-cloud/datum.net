#!/usr/bin/env bash
set -euo pipefail

script="$(cd "$(dirname "$0")" && pwd)/npm-audit.sh"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

mkdir "$work/bin"
cat >"$work/bin/npm" <<'EOF'
#!/usr/bin/env bash
case $1 in
  audit) cat "$FAKE_AUDIT" ;;
  view)
    case ${FAKE_VIEW:-} in
      E404) echo "npm error code E404" >&2; exit 1 ;;
      ETIMEDOUT) echo "npm error code ETIMEDOUT" >&2; exit 1 ;;
      *) printf '%s' "${FAKE_VIEW:-}" ;;
    esac ;;
  *) exit 64 ;;
esac
EOF
chmod +x "$work/bin/npm"

advisory() {
  jq -n --arg id "$1" --arg sev "$2" --arg name "$3" --arg range "$4" '{
    source: 1, name: $name, dependency: $name, title: "fixture \($id)",
    url: "https://github.com/advisories/\($id)", severity: $sev, range: $range
  }'
}

report() {
  jq -s '{auditReportVersion: 2, vulnerabilities: (map({(.name): {name: .name, via: [.]}}) | add // {})}'
}

pico=$(advisory GHSA-fc5q-39xc-vjpf high picomatch '<=4.0.7')
other=$(advisory GHSA-rv95-896h-c2vc high express '<4.19.2')
minor=$(advisory GHSA-qw6h-vgh9-j6wx moderate send '<0.19.0')

printf '%s\n' "$pico" | report >"$work/pico.json"
printf '%s\n' "$pico" "$other" | report >"$work/pico-other.json"
printf '%s\n' "$pico" "$minor" | report >"$work/pico-minor.json"
printf '%s\n' "$other" | report >"$work/other.json"
echo '{"error": {"code": "ENOLOCK"}}' >"$work/broken.json"

pass=0
fail=0
check() {
  local name=$1 want=$2 fixture=$3 today=$4 view=$5 pattern=$6
  shift 6
  local out got=0
  out=$(PATH="$work/bin:$PATH" FAKE_AUDIT="$work/$fixture" FAKE_VIEW="$view" \
    NPM_AUDIT_TODAY="$today" NPM_AUDIT_LEVEL="${LEVEL:-low}" bash "$script" "$@" 2>&1) || got=$?
  if [[ $got -ne $want ]] || ! grep -qE -- "$pattern" <<<"$out" \
    || { [[ -n ${ABSENT:-} ]] && grep -qE -- "$ABSENT" <<<"$out"; }; then
    echo "FAIL: $name (exit $got, want $want, pattern '$pattern')"
    printf '%s\n' "$out" | sed 's/^/  | /'
    fail=$((fail + 1))
  else
    echo "ok: $name"
    pass=$((pass + 1))
  fi
}

ignore=GHSA-fc5q-39xc-vjpf=2026-12-01

check "dated ignore holds before expiry" 0 pico.json 2026-11-17 "" \
  "ignoring GHSA-fc5q-39xc-vjpf until 2026-12-01" "$ignore"
check "dated ignore holds on the last day" 0 pico.json 2026-11-30 "" \
  "no low\+ advisories" "$ignore"
check "dated ignore lapses on the expiry date" 1 pico.json 2026-12-01 "" \
  "GHSA-fc5q-39xc-vjpf: ignore expired on 2026-12-01" "$ignore"
check "dated ignore lapses after the expiry date" 1 pico.json 2027-01-15 "" \
  "ignore expired" "$ignore"
check "dated ignore ends early once a patched release ships" 1 pico.json 2026-11-17 "4.0.8" \
  "release past the vulnerable range exists: picomatch@4.0.8" "$ignore"
check "dated ignore ends early with several newer releases" 1 pico.json 2026-11-17 \
  "$(printf "picomatch@4.0.8 '4.0.8'\npicomatch@4.1.0 '4.1.0'\n")" "picomatch@4.1.0" "$ignore"
check "no newer release on the registry keeps the ignore" 0 pico.json 2026-11-17 E404 \
  "ignoring GHSA-fc5q-39xc-vjpf" "$ignore"
check "registry error fails loudly" 1 pico.json 2026-11-17 ETIMEDOUT \
  "npm view picomatch@>4.0.7 failed" "$ignore"
check "another high advisory still fails" 1 pico-other.json 2026-11-17 "" \
  "GHSA-rv95-896h-c2vc	high	express" "$ignore"
ABSENT=picomatch check "the ignored advisory is not among the failures" 1 pico-other.json 2026-11-17 "" \
  "^GHSA-rv95-896h-c2vc" "$ignore"
check "undated ignore never lapses" 0 pico.json 2030-01-01 "4.0.8" \
  "no low\+ advisories beyond the ignore list \(GHSA-fc5q-39xc-vjpf\)" GHSA-fc5q-39xc-vjpf
check "no ignore fails on the advisory" 1 pico.json 2026-11-17 "" \
  "GHSA-fc5q-39xc-vjpf	high	picomatch"
check "stale ignore is reported" 1 other.json 2026-11-17 "" \
  "GHSA-fc5q-39xc-vjpf is no longer reported" "$ignore"
LEVEL=high check "audit level high passes a moderate advisory" 0 pico-minor.json 2026-11-17 "" \
  "no high\+ advisories" "$ignore"
check "default level fails a moderate advisory" 1 pico-minor.json 2026-11-17 "" \
  "GHSA-qw6h-vgh9-j6wx	moderate" "$ignore"
check "missing report fails loudly" 1 broken.json 2026-11-17 "" \
  "returned no report" "$ignore"
check "malformed id is refused" 2 pico.json 2026-11-17 "" \
  "not a GHSA id" picomatch
check "malformed date is refused" 2 pico.json 2026-11-17 "" \
  "not a YYYY-MM-DD expiry" GHSA-fc5q-39xc-vjpf=12/01/2026

echo "$pass passed, $fail failed"
[[ $fail -eq 0 && $pass -gt 0 ]]
