# Agent rules

Follow these rules for all work in this thread. Each block names its source. The quoted text is the author's own words.

<!-- source: https://x.com/poteto/status/2111133080526495985 (Lauren Tan, @poteto); author's wording, verbatim -->
## Whenever you correct your agent

1. codebase improvements: this is just good software engineering - better
   architecture, stronger types and invariants, clear boundaries. agents love
   to copy what exists and take the shortest path, so make the easy thing the
   right thing. categorically eliminate problems through code and you won't
   need to think about it again.
2. static analysis: lint rules, tests, CI, verification (eg TLA+). very token
   efficient ways to catch issues ahead of time.
3. prose: comments, rules, AGENTS.md, skills - anything that can't be enforced
   and requires agent judgment. use it minimally, but do use
   /create-verification-skill.
4. human review: the hardest to scale. at the rate agents land code, it's
   pretty much impossible to thoroughly review every PR, so spend that effort
   on the highest leverage point, designing an environment where agents do the
   right thing by default.

this forms an inverse pyramid: you want most of your effort at the top, least
at the bottom. codebase improvements are deterministic, making it more token
efficient, and lets you sleep more soundly at night.

<!-- source: https://x.com/0xChaseTM/status/2116666972544831853 (Chase, @0xChaseTM, summarizing Lauren Tan's pstack) and its "pstack Agent Execution Map" image; author's wording, verbatim -->
## pstack flow

start with /poteto-mode to route the task through the right playbook

> Define the task

goal / constraints / observable_success

/poteto-mode selects the playbook. skills such as /how, /why and /architect
supply context and design work when needed

> Verify the running app

/create-verification-skill

Builds and trials a repo-specific procedure:

launch → doctor → drive → evidence → cleanup

The proof depends on the change:

→ UI: complete the affected user journey
→ CLI: capture the command, output and exit status
→ storage: read back the written value
→ performance: compare profiles under equivalent conditions

> Hand off the tested change

tested_commit / diff / commands + results / evidence_paths

Failed checks send the change back for repair

Unavailable checks stay listed under unverified_checks, with the missing
dependency explained

> Prevent recurring failures

/reflect - captures the lesson

/correct - helps encode it through architecture, types, lint, CI or tests

predictable mechanical work moves into scripts so the next run can reuse it

From the map: PASS - Evidence supports required checks. FAIL - Repair the
observed defect and rerun. BLOCKED - Report missing access or tools.

<!-- source: https://x.com/cu30rry_/status/2117205829791424926 (kaito, @cu30rry_), X's translation from Japanese; author's wording. Their "/thermos for code review" line is left out: it conflicts with the review rule below. -->
- When coming up with ideas for new features/requirements, draw from user
  usage patterns and tutorials, then use /grill-with-docs for RGDD
- When diving into development, use /poteto-mode or /in-your-own-words
- /create-verification-skill ⋯ Don't use the pstack one—use the e2e version
  (It adds a section called "Charters" to the Feature Map, incorporating test
  objectives, scope, and guidelines for exploratory testing). Installed as
  /e2e:create-verification-skill; grill-with-docs is
  /mattpocock-skills:grill-with-docs.
- Use e2e tests in tandem with verification skills
- Daily: /maintain-verification-skill
- Run /create-formal-verification-skill a few times, and for models with high
  impact/importance, perform formal verification
- Use /statechart to explore with TLA+ whether the model truly has no defects,
  and actually review it
- /maintain-formal-verification-skill
- /correct + /retro to systematize learnings from the past

<!-- source: https://x.com/poteto/status/2117043478140276847 (Lauren Tan, @poteto); author's wording, verbatim. Game-only lines (music, art, engine) left out. -->
## Encode lessons in the code

- every time i found an issue in the code i asked bot to make a lint rule
  against it
- used TLA+ heavily to find bugs in the game's various state machines: the
  story, cutscenes, the game's systems. there are many formal verification
  skills, one for each major system
- i put context into the filepaths: code that runs every frame or every tick
  gets a .hot.ts extension, and a lint rule bans allocating in it (no object
  literals, closures, new, etc.), so the game loop creates almost no garbage
  and GC doesn't cause stutters
- the simulation is fully deterministic, so every run replays exactly from its
  inputs
- the build fails if the first download goes over budget
- bots play the game headless to tune each difficulty against target survival
  rates
- comments are banned by a lint rule. if code needs explaining, the fix is a
  better name or a test

<!-- source: https://x.com/Ash_uxi/status/2117459181636829650 (Ashish, @Ash_uxi); author's wording, verbatim -->
## UI craft

Things i often say when working in code

- before you build anything, find our existing tokens and components and use
  those
- design every state, not just the happy path: hover, focus, loading, empty,
  error, and the really long name
- only animate transform and opacity, ease-out for anything coming in, and keep
  it under 250ms
- reserve space for images and async content so nothing jumps around on load
- nested corners should feel concentric, so make the outer radius equal the
  inner radius plus the padding
- every tap target is at least 44px, even when the icon inside is tiny

<!-- source: https://x.com/n___vc/status/2117286927728624074 (nick, @n___vc), "visual alignment easily explained". The video has no spoken or written words; these lines describe what it shows. -->
- Line every element up on a few shared edges. In a list, sidebar or menu,
  each row uses the same left padding, the same icon-to-label gap and the same
  right padding, so icons and logos share one left edge, labels share a
  second, and trailing items (shortcuts, counts, times, status dots, "+") share
  one right edge. Rows without an icon start their text on the icon edge.
- Use one value per spacing role, not a value per row (the video replaces
  left insets of 6/12/10, icon gaps of 8/9/10 and right insets of 6/7/8/11 with
  9, 6 and 9). Neighbouring panes use the same top inset so their headers line
  up.

<!-- source: https://x.com/heydamir/status/2116158176336970008 (Damir Sokolovsky, @heydamir); author's wording, verbatim. Installed as /unslop-ui so it doesn't replace the writing unslop skill. -->
- I turned my unslopping process into a free Claude skill. It works on landing
  pages, dashboards and mobile apps. Go unslop your stuff: /unslop-ui

<!-- source: https://x.com/jarredsumner/status/2117037940031496252 (Jarred Sumner, @jarredsumner), quoted in Ash's post; author's wording, verbatim -->
## Performance

some things I often say to claude when doing perf optimization work:

- how do we rewrite this to better leverage data-oriented design principles
- can you replace those hash tables with a flat array? can we make the pointers
  an index into the array? can we pack the most commonly used data into upper
  bits of the index?
- caching is cope for a slow design. do not add caches and delete all existing
  caches. instead, redesign it to be faster
- should this be a structure of arrays instead of an array of structures?

## Review

<!-- source: https://x.com/poteto/status/2117437607940681849 (Lauren Tan, @poteto); author's wording, verbatim -->
- maybe a hot take but i now consider adversarial reviews mostly a waste of
  tokens. far better to use those tokens on empirical combined with formal
  verification. i have found very little value with code review in the
  abstract, agents tend to just get lost in the nitpicks and yagnis
<!-- source: https://x.com/poteto/status/2117440753551204735 and https://x.com/poteto/status/2117445316043825393 (Lauren Tan, @poteto); author's wording, verbatim -->
- to clarify i mean just having agents review code without running it
  empirically or using a deterministic checker like with formal verification
- i think you can get into overfitting or "overcooking" a PR by going through
  multiple rounds of abstract code review from agents. the reviewers likely
  have 0 context around your goals and intent, and they tend to pick up things
  that don't matter or steer the authoring agent in the wrong direction. and
  the author agent is usually too sycophantic and will accept and all feedback
  without really thinking about whether it makes sense
<!-- source: https://x.com/poteto/status/2117453342477852824 (Lauren Tan, @poteto); author's wording, verbatim -->
- did not use CI at all. just got my agents to run the checks before merging.
