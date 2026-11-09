# om-ray

This repo is Om's GitHub profile: `README.md` is what github.com/om-ray shows.

Follow the ArgoDesk agent rules in [.agents/agent-rules.md](.agents/agent-rules.md) for all work here.

Every issue you find gets a lint rule that bans it, in the local rules folder `lint-rules/` (wired into `npm run lint` through `customRules` in `.markdownlint-cli2.jsonc`), with a fixture case in `lint-rules/rules.test.mjs`. Use a check in the verify skill when lint can't express it.

Prove a change with the verify skill in [.agents/skills/verify-om-ray/SKILL.md](.agents/skills/verify-om-ray/SKILL.md). It renders the README with GitHub's own renderer and checks it in Aside.

Before you push, run `npm run lint`, `npm test` and the verify skill's `run`.

There is no state model here (no reducer, state machine, queue or lifecycle), so there is no formal verification skill. Add one with `/create-formal-verification-skill` if one appears.
