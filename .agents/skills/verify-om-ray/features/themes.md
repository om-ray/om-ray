# Light and dark themes

Every image has a light file and a `-dark` file. A visitor in dark mode sees white text on black, and in light mode black text on near-white.

## Sub-features

- Hero: `hero.webp` and `hero-dark.webp`.
- Buttons: `link-{site,x,linkedin}.svg` and their `-dark.svg` files.

## How to get to it (user POV)

github.com: Settings, Appearance, theme. On the preview, the browser's colour scheme.

## Driving it with Aside

`profile.js` forces each scheme with `page.emulateMedia({ colorScheme })`, reloads, and compares every `img.currentSrc` with that theme's file. It also decodes all eight files with `new Image()`.

## Proof

`03-profile-1440-light.png` and `03-profile-1440-dark.png`. `run.log` has `shows the light variant …` and `shows the dark variant …` for the hero and every button, and `both themes: … decodes` for all eight files.

## Charters

```text
themes-contrast|aside-1440|low-vision|Compare the profile in the browser's light and dark appearance; report any image whose text has poor contrast against the page, a light image showing on the dark page or the reverse, or a visible box edge around an image
```

## Gotchas

- `<picture>` picks its source at load. Switching the scheme without a reload keeps the old file. That is a browser behaviour, not a README bug.
- On github.com, `themed-picture` follows the GitHub theme setting rather than the OS setting.
