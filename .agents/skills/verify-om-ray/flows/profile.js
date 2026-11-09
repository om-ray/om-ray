const LINKS = [
  { href: "https://omray.dev/", alt: "omray.dev", light: "assets/link-site.svg", dark: "assets/link-site-dark.svg" },
  { href: "https://x.com/OmRayDev", alt: "X @OmRayDev", light: "assets/link-x.svg", dark: "assets/link-x-dark.svg" },
  { href: "https://www.linkedin.com/in/om-ray-0633971a3/", alt: "LinkedIn", light: "assets/link-linkedin.svg", dark: "assets/link-linkedin-dark.svg" },
];
const HERO = { alt: "OM RAY. A drop of water falls into the page and splashes.", light: "assets/hero.webp", dark: "assets/hero-dark.webp" };

const readProfile = () =>
  page.evaluate(() => {
    const article = document.querySelector("[data-verify-readme]");
    const image = (img) => ({
      alt: img.alt,
      src: new URL(img.currentSrc).pathname.slice(1),
      loaded: img.complete && img.naturalWidth > 0,
      width: Math.round(img.getBoundingClientRect().width),
      height: Math.round(img.getBoundingClientRect().height),
      top: Math.round(img.getBoundingClientRect().top),
    });
    const heroLink = article.querySelector(":scope > a");
    const row = article.querySelector('p[align="center"]');
    return {
      dark: matchMedia("(prefers-color-scheme: dark)").matches,
      articleWidth: Math.round(article.getBoundingClientRect().width - parseFloat(getComputedStyle(article).paddingLeft) * 2),
      heroHref: heroLink?.href,
      hero: heroLink?.querySelector("img") ? image(heroLink.querySelector("img")) : null,
      links: [...(row?.querySelectorAll("a") ?? [])].map((a) => {
        const boxes = [a, a.querySelector("img")].map((el) => el.getBoundingClientRect());
        const tapHeight = Math.max(...boxes.map((b) => b.bottom)) - Math.min(...boxes.map((b) => b.top));
        const tapWidth = Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left));
        const hit = (x, y) => document.elementFromPoint(x, y)?.closest("a") === a;
        const img = a.querySelector("img").getBoundingClientRect();
        const edgesHit = [
          [img.left + img.width / 2, img.top + 1],
          [img.left + img.width / 2, img.bottom - 1],
          [img.left + 1, img.top + img.height / 2],
          [img.right - 1, img.top + img.height / 2],
        ].every(([x, y]) => hit(x, y));
        return { href: a.href, img: image(a.querySelector("img")), tapHeight: Math.round(tapHeight), tapWidth: Math.round(tapWidth), tapLeft: Math.min(...boxes.map((b) => b.left)), tapRight: Math.max(...boxes.map((b) => b.right)), edgesHit };
      }),
      horizontalScroll: document.documentElement.scrollWidth > innerWidth,
    };
  });

const checkProfile = async (where) => {
  const p = await readProfile();
  const theme = p.dark ? "dark" : "light";
  step(`${where}: colour scheme ${theme}, content width ${p.articleWidth}px`);
  check(p.hero !== null && p.heroHref === "https://omray.dev/", `${where}: hero links to https://omray.dev/`);
  check(p.hero.alt === HERO.alt, `${where}: hero alt text reads "${HERO.alt}"`);
  softCheck(p.hero.loaded, "hero", `${where}: hero image decoded (${p.hero.src})`);
  softCheck(p.hero.src === HERO[theme], "theme", `${where}: hero shows the ${theme} variant ${HERO[theme]} (got ${p.hero.src})`);
  softCheck(Math.abs(p.hero.width - p.articleWidth) <= 1, "hero", `${where}: hero spans the content width (${p.hero.width}px of ${p.articleWidth}px)`);
  check(p.links.length === LINKS.length, `${where}: link row has ${LINKS.length} links (got ${p.links.length})`);
  LINKS.forEach((want, i) => {
    const got = p.links[i];
    softCheck(got.href === want.href, "links", `${where}: link ${i + 1} goes to ${want.href} (got ${got.href})`);
    softCheck(got.img.alt === want.alt, "links", `${where}: link ${i + 1} alt reads "${want.alt}" (got "${got.img.alt}")`);
    softCheck(got.img.loaded && got.img.height === 44, "links", `${where}: link ${i + 1} button decoded at 44px tall (got ${got.img.height}px)`);
    softCheck(got.tapHeight >= 44 && got.tapWidth >= 44, "tap", `${where}: link ${i + 1} tap area at least 44x44px (got ${got.tapWidth}x${got.tapHeight}px)`);
    softCheck(got.edgesHit, "tap", `${where}: link ${i + 1} opens from all four edges of its image`);
    softCheck(got.img.src === want[theme], "theme", `${where}: link ${i + 1} shows the ${theme} variant ${want[theme]} (got ${got.img.src})`);
  });
  for (let i = 1; i < p.links.length; i++) {
    const gap = Math.round(p.links[i].tapLeft - p.links[i - 1].tapRight);
    softCheck(gap >= 8, "tap", `${where}: tap areas of links ${i} and ${i + 1} are at least 8px apart (got ${gap}px)`);
  }
  softCheck(!p.horizontalScroll, "layout", `${where}: no horizontal scroll`);
  return p;
};

await run(async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await checkProfile("1440");
  await shot("01-profile-1440");

  const variants = await page.evaluate(async (paths) => {
    const decode = (path) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ path, ok: img.naturalWidth > 0 });
        img.onerror = () => resolve({ path, ok: false });
        img.src = `/${path}`;
      });
    return Promise.all(paths.map(decode));
  }, [HERO.light, HERO.dark, ...LINKS.flatMap((l) => [l.light, l.dark])]);
  for (const v of variants) softCheck(v.ok, "assets", `both themes: ${v.path} decodes`);

  const animated = await page.evaluate(async (paths) => {
    const out = [];
    for (const path of paths) {
      const bytes = new Uint8Array(await (await fetch(`/${path}`)).arrayBuffer());
      const text = new TextDecoder("latin1").decode(bytes.subarray(0, 4096));
      out.push({ path, animated: text.startsWith("RIFF") && text.includes("ANIM") });
    }
    return out;
  }, [HERO.light, HERO.dark]);
  for (const a of animated) softCheck(a.animated, "hero", `${a.path} is an animated WebP (the splash plays)`);

  await page.setViewportSize({ width: 390, height: 844 });
  const phone = await checkProfile("390");
  const tops = phone.links.map((l) => l.img.top);
  softCheck(new Set(tops).size === 1, "layout", `390: all three buttons sit on one row (tops ${tops.join("/")}px)`);
  await shot("02-profile-390");
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const colorScheme of ["light", "dark"]) {
    check(typeof page.emulateMedia === "function", "Aside can force a colour scheme (page.emulateMedia)");
    await page.emulateMedia({ colorScheme });
    await until(
      () => page.evaluate((dark) => matchMedia("(prefers-color-scheme: dark)").matches === dark, colorScheme === "dark"),
      `page reports prefers-color-scheme ${colorScheme}`,
    );
    await page.reload();
    await until(
      () => page.evaluate(() => document.querySelector("[data-verify-readme]") !== null),
      `README reloaded under ${colorScheme}, since <picture> picks its source at load`,
    );
    await until(imagesSettled, `images loaded after the ${colorScheme} reload`);
    await checkProfile(`1440 ${colorScheme}`);
    await shot(`03-profile-1440-${colorScheme}`);
  }
  await page.emulateMedia({ colorScheme: null });
});
