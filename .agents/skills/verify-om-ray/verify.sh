#!/usr/bin/env bash
# Render README.md with GitHub's renderer, serve it on om-mac's loopback, drive it in Aside. See SKILL.md.
#   verify.sh render           write .verify/site/ (index.html from GitHub's /markdown API, plus tracked assets)
#   verify.sh up               render, copy the site to om-mac, serve it on 127.0.0.1:$PORT there, run doctor
#   verify.sh doctor           is the preview on om-mac this worktree's current render?
#   verify.sh drive <flow.js>  run a flow in Aside on om-mac; shots and run.log land in .verify/shots/<flow>/
#   verify.sh bash <slug>      hand one feature-map charter to Aside's own agent on the preview
#   verify.sh down             stop the preview server by its recorded PID and delete the site copy on om-mac
#   verify.sh run              up, drive every flow, down
set -euo pipefail

SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
WT="$(cd "$SKILL/../../.." && pwd -P)"
[[ -f "$WT/README.md" && -f "$WT/AGENTS.md" ]] || { echo "verify: $WT is not the om-ray repo" >&2; exit 1; }
OUT="$WT/.verify"
SITE="$OUT/site"
SHOTS="$OUT/shots"
PORT=4811
ORIGIN="http://127.0.0.1:$PORT"
MAC_DIR=".cache/verify-om-ray"
ASIDE='export PATH=$HOME/.local/bin:/opt/homebrew/bin:$PATH; aside'

die() { echo "verify: $*" >&2; exit 1; }
mac() { ssh -o ConnectTimeout=10 om-mac "$@"; }

cmd_render() {
  rm -rf "$SITE"; mkdir -p "$SITE"
  local body
  body="$(gh api /markdown -f mode=gfm -f context=om-ray/om-ray -F text=@"$WT/README.md")" \
    || die "GitHub's /markdown API failed; is gh signed in? (gh auth status)"
  {
    cat <<'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>om-ray README preview</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
<style>
  body { margin: 0; background: #ffffff; }
  @media (prefers-color-scheme: dark) { body { background: #0d1117; } }
  .markdown-body { box-sizing: border-box; max-width: 896px; margin: 0 auto; padding: 32px 16px; }
</style>
</head>
<body>
<article class="markdown-body" data-verify-readme>
HTML
    echo "$body"
    echo '</article>'
    echo '</body>'
    echo '</html>'
  } > "$SITE/index.html"
  (cd "$WT" && git ls-files -z --cached --others --exclude-standard \
    | grep -zvE '^(\.|node_modules/|lint-rules/)|\.md$|^package(-lock)?\.json$' \
    | xargs -0 -r cp --parents -t "$SITE")
  sha256sum "$WT/README.md" | cut -d' ' -f1 > "$SITE/.readme-sha"
  echo "rendered $SITE ($(find "$SITE" -type f | wc -l) files)"
}

mac_pid() { mac "cat ~/$MAC_DIR/server.pid 2>/dev/null" || true; }
mac_ours() {
  local pid="$1"
  [[ -n "$pid" ]] && mac "ps -o command= -p $pid 2>/dev/null" | grep -q "http.server $PORT --bind 127.0.0.1 --directory $MAC_DIR/site"
}

cmd_up() {
  cmd_render
  local pid; pid="$(mac_pid)"
  if mac_ours "$pid"; then die "a preview is already running on om-mac (pid $pid); run down first"; fi
  if mac "curl -s -o /dev/null -m 3 $ORIGIN/" ; then die "port $PORT on om-mac answers but is not this skill's server; nothing started"; fi
  mac "rm -rf ~/$MAC_DIR/site && mkdir -p ~/$MAC_DIR"
  scp -q -r "$SITE" "om-mac:$MAC_DIR/site"
  mac "cd ~ && nohup /opt/homebrew/bin/python3 -m http.server $PORT --bind 127.0.0.1 --directory $MAC_DIR/site > $MAC_DIR/server.log 2>&1 & echo \$! > ~/$MAC_DIR/server.pid"
  for _ in $(seq 20); do mac "curl -s -o /dev/null -m 2 $ORIGIN/" && break; sleep 0.5; done
  cmd_doctor
}

cmd_doctor() {
  local pid code local_sha mac_sha
  pid="$(mac_pid)"
  mac_ours "$pid" || die "no preview server of this skill on om-mac (pid file: ${pid:-none}); run up"
  code="$(mac "curl -s -o /dev/null -w '%{http_code}' -m 5 $ORIGIN/")"
  [[ "$code" == 200 ]] || die "preview answered $code on om-mac"
  mac "curl -s -m 5 $ORIGIN/ | grep -q data-verify-readme" || die "preview page has no data-verify-readme article"
  local_sha="$(sha256sum "$WT/README.md" | cut -d' ' -f1)"
  mac_sha="$(mac "cat ~/$MAC_DIR/site/.readme-sha")"
  [[ "$local_sha" == "$mac_sha" ]] || die "preview is STALE: om-mac serves README $mac_sha, worktree has $local_sha; run down and up"
  echo "doctor ok: pid $pid serves $ORIGIN on om-mac loopback, README ${local_sha:0:12} current"
}

session_dir() {
  local dir
  dir="$(grep -oE '^SESSION_DIR=/Users/[A-Za-z0-9_.-]+/\.aside/[A-Za-z0-9_/-]+/sessions/[A-Za-z0-9_-]+$' "$1" | tail -1 | cut -d= -f2 || true)"
  if [[ -n "$dir" ]]; then echo "${dir#/Users/*/}"; fi
}

cmd_drive() {
  local flow="$1" name out session shots_ok=0
  [[ -f "$flow" ]] || flow="$SKILL/flows/$flow"
  [[ -f "$flow" ]] || die "no flow $1"
  cmd_doctor >/dev/null
  name="$(basename "$flow" .js)"
  out="$SHOTS/$name"; rm -rf "$out"; mkdir -p "$out"
  {
    echo "flow:   $name"
    echo "time:   $(date -Is)"
    echo "head:   $(git -C "$WT" rev-parse HEAD)$([[ -z "$(git -C "$WT" status --porcelain)" ]] || echo " (uncommitted changes)")"
    echo "readme: $(sha256sum "$WT/README.md" | cut -c1-12)"
  } > "$out/run.log"
  set +e
  ORIGIN="$ORIGIN" NAME="$name" LIB="$SKILL/flows/lib.js" FLOW="$flow" README="$WT/README.md" node -e '
      const fs = require("node:fs");
      const e = process.env;
      const V = { origin: e.ORIGIN, name: e.NAME };
      const code = `const V = ${JSON.stringify(V)};\n${fs.readFileSync(e.LIB, "utf8")}\n${fs.readFileSync(e.FLOW, "utf8")}`;
      console.log(`await (new (Object.getPrototypeOf(async function () {}).constructor)(${JSON.stringify(code)}))()`);' \
    | timeout 150 ssh om-mac "$ASIDE repl" 2>&1 | tee -a "$out/run.log"
  set -e
  session="$(session_dir "$out/run.log")"
  if [[ -n "$session" ]]; then
    scp -q "om-mac:$session/artifacts/$name/*.png" "$out/" 2>/dev/null && compgen -G "$out/*.png" >/dev/null && shots_ok=1
    mac "rm -rf ~/'$session'"
  fi
  { ((shots_ok)) && echo "screenshots: $out" || echo "no screenshots came back"; } | tee -a "$out/run.log"
  grep -qx 'FLOW_OK' "$out/run.log" || die "flow $name failed; see $out/run.log"
  ((shots_ok)) || die "flow $name passed but no screenshots came back from om-mac"
}

cmd_bash() {
  local slug="$1" line charter out
  line="$(grep -h "^$slug|" "$SKILL"/features/*.md | head -1)"
  [[ -n "$line" ]] || die "no charter $slug in features/"
  charter="$(cut -d'|' -f4- <<<"$line")"
  cmd_doctor >/dev/null
  out="$OUT/bugbash/$slug"; mkdir -p "$out"
  echo "charter: $line" > "$out/run.log"
  timeout 600 ssh om-mac "$ASIDE exec $(printf '%q' "$charter Work only in one new tab at $ORIGIN/ and close it when done. Do not open any other site. End with a list titled Findings, one line each, or 'Findings: none'.")" 2>&1 | tee -a "$out/run.log"
  echo "bug bash log: $out/run.log"
}

cmd_down() {
  local pid; pid="$(mac_pid)"
  if mac_ours "$pid"; then mac "kill $pid"; echo "stopped preview pid $pid"; else echo "no preview server of this skill running"; fi
  mac "rm -rf ~/$MAC_DIR"
  echo "removed ~/$MAC_DIR on om-mac; evidence kept in $SHOTS"
}

cmd_run() {
  cmd_up
  local rc=0 flow
  for flow in "$SKILL"/flows/*.js; do
    [[ "$(basename "$flow")" == lib.js ]] && continue
    (cmd_drive "$flow") || rc=1
  done
  cmd_down
  return $rc
}

case "${1:-}" in
  render) cmd_render ;;
  up) cmd_up ;;
  doctor) cmd_doctor ;;
  drive) cmd_drive "${2:?flow}" ;;
  bash) cmd_bash "${2:?charter slug}" ;;
  down) cmd_down ;;
  run) cmd_run ;;
  *) sed -n '2,9p' "$0"; exit 2 ;;
esac
