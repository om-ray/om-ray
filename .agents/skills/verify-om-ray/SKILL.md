---
name: verify-om-ray
description: Prove a change to Om's GitHub profile README (om-ray) the way a visitor sees it. Renders README.md with GitHub's own /markdown API, serves it on om-mac's loopback, and drives it in Aside at 1440 and 390 in light and dark, checking the hero splash, the three link buttons and their theme variants, with screenshots. Use before calling any README, asset or link change done.
---

# Verify om-ray

## Read first

Everything goes through `verify.sh` in this folder. The features it proves are in [features/README.md](features/README.md), one file per feature with its proof and charters. This skill follows the shape of e2e's `create-verification-skill` (see the sibling e2e skill), but drives Aside instead of an e2e engine. Om allows no Playwright, Puppeteer or headless Chromium, so `e2e mcp`, `e2e run` and `e2e explore` are not used here.

```sh
V=.agents/skills/verify-om-ray/verify.sh
$V run              # up, drive every flow in flows/, down; exit 0 only if every flow printed FLOW_OK and sent shots back
$V up               # render, copy the site to om-mac, serve it on 127.0.0.1:4811 there, doctor
$V drive profile.js # one flow; writes .verify/shots/profile/
$V bash <slug>      # one charter from features/*.md, run by Aside's own agent
$V down             # stop the preview by its recorded PID, delete the copy on om-mac
```

## Launch

`render` posts README.md to GitHub's `/markdown` API (`gh api`, gfm, context `om-ray/om-ray`) and wraps the HTML in `github-markdown-css` 5.8.1 at GitHub's 896px column, with GitHub's dark background under `prefers-color-scheme: dark`. It copies every tracked asset beside it, so relative `src` and `srcset` paths resolve as they do on github.com. It needs `gh` signed in.

`up` copies `.verify/site/` to `~/.cache/verify-om-ray/site` on om-mac and starts `python3 -m http.server 4811 --bind 127.0.0.1` there, so Aside reaches it on the Mac's loopback and nothing is exposed. It refuses to start when 4811 already answers.

## Doctor

`$V doctor` is read-only. It checks that the PID in `~/.cache/verify-om-ray/server.pid` is this skill's server on 4811, that `/` answers 200 with the `data-verify-readme` article, and that the README hash on om-mac matches the worktree's. `STALE` means you edited README.md after `up`: run `down` and `up`. `drive` and `bash` run doctor first.

## Drive

`drive <flow>` sends `const V = { origin, name }` + `flows/lib.js` + the flow as one `aside repl` call over ssh, and pipes the output through `shots.mjs`. Aside 1.26 deletes the REPL's session folder when the call ends and locks `fs` to it, so `shot()` prints each PNG as numbered base64 chunks ending in `#` (`SHOT_PNG <name> i/n <data>#`). `shots.mjs` rejoins chunks the REPL split with its own `[ok | Nms]` text and writes `.verify/shots/<flow>/<name>`. `shots.test.mjs` pins that. `drive` fails unless the flow printed `FLOW_OK` and every shot it announced arrived whole.

`lib.js` opens one tab on the preview, gives the flow a 105s budget, and always closes its tab. It provides `check` (stops the flow), `softCheck` (logs `<kind> FAILED` and fails the flow at the end, so one bug never hides the next), `until`, and `shot(name)` (waits for every image, then sends a full-page PNG back over stdout).

`profile.js` checks at 1440 and 390: the hero links to omray.dev, its alt text, that it decodes and spans the column, that both hero WebPs are animated, the three link buttons' hrefs, alt text and 32px height, no horizontal scroll, and that all eight theme assets decode. Then it forces `light` and `dark` with `page.emulateMedia` and reloads. `<picture>` picks its source at load, so without the reload it keeps the old variant. It checks that every image shows that theme's file.

To add a flow, copy `profile.js`, wrap the body in `await run(async () => { ... })`, name shots `NN-what.png`, and add or update its feature file.

## Evidence

Each flow keeps `.verify/shots/<flow>/run.log` (header with time, git head, README hash) and its `NN-what.png` shots, `zz-failure.png` on failure. Charters keep `.verify/bugbash/<slug>/run.log`. `down` keeps both. Open every screenshot before you claim a pass. It must show the hero and the three buttons readable, in the theme its name says, with nothing covering them. A verdict counts only from a run whose header shows the PR's head with no uncommitted changes.

The preview shows what GitHub's renderer outputs, not github.com's page chrome. On github.com the `themed-picture` element follows the GitHub theme setting, and here it follows `prefers-color-scheme`. The checks cover both cases because they force each scheme.

## Bug bash

Each feature file ends in `Charters`, one line each as `slug|target|persona|charter`, where the target is `aside-1440` or `aside-390`. `$V bash <slug>` hands that charter to Aside's own agent (`aside exec`) on the preview, tells it to stay in one tab and end with a Findings list, and logs it to `.verify/bugbash/<slug>/run.log`. A finding is a bug only once a flow check or a lint rule fails on it.

## Cleanup

`$V down` kills only the PID it recorded, after checking that its command line is this skill's server, and deletes `~/.cache/verify-om-ray` on om-mac. It keeps `.verify/`. Never kill by name or port.

## Rules

- Browse and screenshot only in Aside, through `drive` or `bash`. Never Playwright, Puppeteer, headless Chromium, gstack browse or the T3 preview.
- Keep the server on om-mac's loopback. Never expose it.
- Every issue a run finds gets a lint rule in `lint-rules/` or a check in a flow.

## Known issues

- At 390 the link buttons' tap area is 36px tall (`profile.js` logs it), under the 44px the UI rules ask for. The buttons are README product content, so changing them is a separate page.
