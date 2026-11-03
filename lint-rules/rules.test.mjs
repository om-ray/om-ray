import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));
const cli = fileURLToPath(new URL("../node_modules/.bin/markdownlint-cli2", import.meta.url));
const lint = (file) => {
  const result = spawnSync(cli, [file], { cwd: fixtures, encoding: "utf8" });
  return { status: result.status, output: result.stdout + result.stderr };
};

test("local-asset-exists passes files whose paths exist with exact case", () => {
  const { status, output } = lint("good.md");
  assert.equal(status, 0, output);
});

test("local-asset-exists flags wrong case, missing srcset entries, missing links and root paths", () => {
  const { status, output } = lint("bad.md");
  assert.equal(status, 1, output);
  for (const target of ["./Assets/dot.svg", "./assets/missing.svg", "./assets/gone.webp", "/assets/dot.svg"])
    assert.match(output, new RegExp(`local-asset-exists.*"${target.replaceAll(".", "\\.")}"`), output);
  assert.equal(output.match(/local-asset-exists/g).length, 4, output);
});
