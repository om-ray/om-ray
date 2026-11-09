# Link buttons

Three pill buttons under the hero: OMRAY.DEV, X and LINKEDIN.

## Sub-features

- `p[align=center]` with three links: `https://omray.dev`, `https://x.com/OmRayDev`, `https://www.linkedin.com/in/om-ray-0633971a3/`.
- Each is an SVG drawn at 44px tall: a pill about 32px tall inside transparent padding, so the tap area is at least 44x44px. `scripts/pad-link-buttons.mjs` adds the padding, and the `link-tap-target` lint rule bans a linked image under 44px. Alt "omray.dev", "X @OmRayDev" or "LinkedIn", and a dark variant.

## How to get to it (user POV)

Right under the hero on github.com/om-ray.

## Driving it with Aside

`profile.js`, `checkProfile`. Handles: `[data-verify-readme] p[align="center"] a` and each one's `img`.

## Proof

All three pills are readable in `01-profile-1440.png` and `02-profile-390.png`. `run.log` has `link N goes to …`, `alt reads …`, `button decoded at 44px tall`, `tap area at least 44x44px` and `opens from all four edges of its image` for each link at both widths, `tap areas of links N and N+1 are at least 8px apart`, and `all three buttons sit on one row` at 390.

## Charters

```text
links-tap|aside-390|thumb|At 390 wide, try to tap each of the three buttons under the hero accurately with a thumb; report a button that is hard to hit, opens the wrong site, or has text you cannot read
links-keyboard|aside-1440|keyboard|Using only Tab and Enter, reach and open each button under the hero; report a button you cannot reach, one with no visible focus, or one whose name a screen reader would read wrong
```

## Gotchas

- GitHub adds `rel="nofollow"` to every link. That is expected.
- An `&ensp;` after the first two links keeps their tap areas at least 8px apart.
- The visible pill is about 32px tall. The padding around it is transparent and still part of the link.
