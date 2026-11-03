# Link buttons

Three pill buttons under the hero: OMRAY.DEV, X and LINKEDIN.

## Sub-features

- `p[align=center]` with three links: `https://omray.dev`, `https://x.com/OmRayDev`, `https://www.linkedin.com/in/om-ray-0633971a3/`.
- Each is an SVG pill, 32px tall, with alt "omray.dev", "X @OmRayDev" or "LinkedIn", and a dark variant.

## How to get to it (user POV)

Right under the hero on github.com/om-ray.

## Driving it with Aside

`profile.js`, `checkProfile`. Handles: `[data-verify-readme] p[align="center"] a` and each one's `img`.

## Proof

All three pills are readable in `01-profile-1440.png` and `02-profile-390.png`. `run.log` has `link N goes to …`, `alt reads …` and `button decoded at 32px tall` for each link at both widths.

## Charters

```text
links-tap|aside-390|thumb|At 390 wide, try to tap each of the three buttons under the hero accurately with a thumb; report a button that is hard to hit, opens the wrong site, or has text you cannot read
links-keyboard|aside-1440|keyboard|Using only Tab and Enter, reach and open each button under the hero; report a button you cannot reach, one with no visible focus, or one whose name a screen reader would read wrong
```

## Gotchas

- GitHub adds `rel="nofollow"` to every link. That is expected.
- The tap area is 36px tall at 390, under 44px. This is a known issue, see SKILL.md.
