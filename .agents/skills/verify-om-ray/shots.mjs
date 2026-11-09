import fs from "node:fs";
import readline from "node:readline";
import { pathToFileURL } from "node:url";

const replNoise = /\x1b\[[0-9;]*m|\[(ok|error) \| \d+ms\]/g;
const chunkLine = /^SHOT_PNG ([A-Za-z0-9_-]+\.png) (\d+)\/(\d+) ([A-Za-z0-9+/=]+)$/;

export const createShotCollector = (saveShot) => {
  const pending = new Map();
  let partial = "";
  return (raw) => {
    let line = raw;
    if (partial || raw.startsWith("SHOT_PNG ")) {
      partial += raw.replace(replNoise, "");
      if (!partial.endsWith("#")) return null;
      line = partial.slice(0, -1);
      partial = "";
    }
    const m = chunkLine.exec(line);
    if (!m) return line;
    const [, file, part, parts, data] = m;
    const chunks = pending.get(file) ?? [];
    chunks[Number(part) - 1] = data;
    pending.set(file, chunks);
    if (Number(part) !== Number(parts)) return null;
    pending.delete(file);
    if (chunks.filter(Boolean).length !== Number(parts)) return `shot incomplete: ${file}`;
    saveShot(file, Buffer.from(chunks.join(""), "base64"));
    return `shot saved: ${file}`;
  };
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [out] = process.argv.slice(2);
  const log = fs.createWriteStream(`${out}/run.log`, { flags: "a" });
  const collect = createShotCollector((file, png) => fs.writeFileSync(`${out}/${file}`, png));
  readline.createInterface({ input: process.stdin }).on("line", (raw) => {
    const line = collect(raw);
    if (line === null) return;
    console.log(line);
    log.write(`${line}\n`);
  });
}
