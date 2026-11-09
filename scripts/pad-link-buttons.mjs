import fs from "node:fs";

const PAD_X = 4;
const PAD_Y = 7;
const files = fs.readdirSync("assets").filter((f) => /^link-.*\.svg$/.test(f));

for (const file of files) {
  const path = `assets/${file}`;
  const svg = fs.readFileSync(path, "utf8");
  if (svg.includes('data-tap-padding')) continue;
  const m = /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="(\d+)" height="(\d+)" viewBox="0 0 \d+ \d+">([\s\S]*)<\/svg>\s*$/.exec(svg);
  if (!m) throw new Error(`${path}: unexpected svg header`);
  const [, w, h, body] = m;
  const width = Number(w) + PAD_X * 2;
  const height = Number(h) + PAD_Y * 2;
  fs.writeFileSync(
    path,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-tap-padding="${PAD_X} ${PAD_Y}"><g transform="translate(${PAD_X} ${PAD_Y})">${body}</g></svg>\n`,
  );
  console.log(`${path}: ${w}x${h} -> ${width}x${height}`);
}
