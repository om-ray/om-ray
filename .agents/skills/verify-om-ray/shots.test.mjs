import { test } from "node:test";
import assert from "node:assert/strict";
import { createShotCollector } from "./shots.mjs";

const png = Buffer.from("\x89PNG fake image bytes for the collector test, long enough to split");
const base64 = png.toString("base64");
const chunks = [base64.slice(0, 30), base64.slice(30, 60), base64.slice(60)];
const chunkLines = chunks.map((data, i) => `SHOT_PNG a.png ${i + 1}/3 ${data}#`);

const collect = (lines) => {
  const saved = new Map();
  const collector = createShotCollector((file, bytes) => saved.set(file, bytes));
  const printed = lines.map(collector).filter((line) => line !== null);
  return { saved, printed };
};

test("chunks reassemble into the original PNG, other lines pass through", () => {
  const { saved, printed } = collect(["ok: before", ...chunkLines, "shot: a.png"]);
  assert.deepEqual(saved.get("a.png"), png);
  assert.deepEqual(printed, ["ok: before", "shot saved: a.png", "shot: a.png"]);
});

test("a chunk the REPL split mid-line with its status text in between still reassembles", () => {
  const broken = chunkLines[1];
  const lines = [chunkLines[0], `${broken.slice(0, 25)}\x1b[2m[ok | 4088ms]\x1b[0m`, broken.slice(25), chunkLines[2]];
  const { saved, printed } = collect(lines);
  assert.deepEqual(saved.get("a.png"), png);
  assert.deepEqual(printed, ["shot saved: a.png"]);
});

test("a missing chunk reports the shot incomplete and saves nothing", () => {
  const { saved, printed } = collect([chunkLines[0], chunkLines[2]]);
  assert.equal(saved.size, 0);
  assert.deepEqual(printed, ["shot incomplete: a.png"]);
});
