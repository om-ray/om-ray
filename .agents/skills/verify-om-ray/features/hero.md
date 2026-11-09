# Hero splash

A wide animated WebP of a water drop falling and splashing under OM RAY. Clicking it opens omray.dev.

## Sub-features

- `<a href="https://omray.dev">` around a `<picture>` with dark and light sources.
- `img` alt "OM RAY. A drop of water falls into the page and splashes.", `width="100%"`.
- Both `assets/hero.webp` and `assets/hero-dark.webp` are animated (RIFF with an `ANIM` chunk).

## How to get to it (user POV)

Open github.com/om-ray, signed in or not. It is the first thing on the page.

## Driving it with Aside

`profile.js`, `checkProfile`. Handles: `[data-verify-readme] > a` and its `img`. `img.currentSrc` names the variant shown.

## Proof

`01-profile-1440.png` and `02-profile-390.png` show the hero across the column. `run.log` has `hero spans the content width (864px of 864px)` at 1440 and `358px of 358px` at 390, and `is an animated WebP` for both files.

## Charters

```text
hero-click|aside-1440|stranger|Look at the profile as a first-time visitor and try to work out who this is and where to learn more from the hero alone; report anything that looks cropped, blurry, frozen or that does not open omray.dev when clicked
hero-phone|aside-390|thumb|At 390 wide, scroll the whole profile and tap the hero; report any cropping, sideways scroll, or text in the hero too small to read
```

## Gotchas

- The splash plays once and then holds, so a late screenshot shows the end frame. That is not a frozen image.
- Full-page shots are tall and mostly empty, because the profile is short.
