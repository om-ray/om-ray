const shotDir = `./artifacts/${V.name}`;
await fs.mkdir(shotDir, { recursive: true });

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
  await page.screenshot({ path: `${shotDir}/${name}.png`, fullPage: true });
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
    await page.screenshot({ path: `${shotDir}/zz-failure.png`, fullPage: true }).catch(() => {});
    console.log(String(error));
  } finally {
    await closeTab(page).catch(() => {});
    console.log("TAB_CLOSED");
  }
};
