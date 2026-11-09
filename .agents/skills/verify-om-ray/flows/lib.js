const sendShot = async (name) => {
  const png = await page.screenshot({ fullPage: true });
  const base64 = png.toString("base64");
  const size = 8_000;
  const parts = Math.ceil(base64.length / size);
  for (let i = 0; i < parts; i++) {
    console.log(`SHOT_PNG ${name}.png ${i + 1}/${parts} ${base64.slice(i * size, (i + 1) * size)}#`);
  }
};

const deadline = Date.now() + 105_000;
const step = (message) => console.log(`step: ${message}`);
const check = (ok, message) => {
  if (!ok) throw new Error(`FAILED: ${message}`);
  console.log(`ok: ${message}`);
};
const until = async (predicate, message, ms = 15000) => {
  const end = Math.min(Date.now() + ms, deadline);
  while (Date.now() < end) {
    if (await predicate().catch(() => false)) return check(true, message);
    await sleep(250);
  }
  check(false, message);
};

const problems = [];
const softCheck = (ok, kind, message) => {
  if (ok) return console.log(`ok: ${message}`);
  problems.push(kind);
  console.log(`${kind} FAILED: ${message}`);
};

const page = await openTab(`${V.origin}/`);
check(page != null, "opened a tab on the preview");
console.log(`TAB_TARGET=${page.targetId}`);

const imagesSettled = () =>
  page.evaluate(() => [...document.images].every((img) => img.complete));

const shot = async (name) => {
  await until(imagesSettled, `every image finished loading before ${name}`);
  await page.evaluate(() => document.activeElement?.blur());
  await sendShot(name);
  console.log(`shot: ${name}.png`);
};

const run = async (body) => {
  try {
    await until(
      () => page.evaluate(() => document.querySelector("[data-verify-readme]") !== null),
      "rendered README article is on the page",
    );
    await body();
    if (problems.length > 0) throw new Error(`FAILED: ${[...new Set(problems)].join(", ")}`);
    console.log("FLOW_OK");
  } catch (error) {
    await sendShot("zz-failure").catch(() => {});
    console.log(String(error));
  } finally {
    await closeTab(page).catch(() => {});
    console.log("TAB_CLOSED");
  }
};
