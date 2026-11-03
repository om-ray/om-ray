const fs = require("node:fs");
const path = require("node:path");

const attributePattern = /\b(src|srcset|href)\s*=\s*(["'])(.*?)\2/gi;
const markdownLinkPattern = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g;
const externalPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

const candidates = (attribute, value) =>
  attribute.toLowerCase() === "srcset"
    ? value.split(",").map((entry) => entry.trim().split(/\s+/)[0])
    : [value];

const existsWithExactCase = (root, relativePath) => {
  let directory = root;
  for (const segment of relativePath.split(/[\\/]/).filter((s) => s && s !== ".")) {
    if (segment === "..") {
      directory = path.dirname(directory);
      continue;
    }
    let entries;
    try {
      entries = fs.readdirSync(directory);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    directory = path.join(directory, segment);
  }
  return fs.existsSync(directory);
};

module.exports = {
  names: ["local-asset-exists"],
  description: "Relative src, srcset, href and Markdown links must name a file in the repo, with exact case, because GitHub serves them case-sensitively",
  tags: ["links", "images"],
  parser: "none",
  function: (params, onError) => {
    const root = path.dirname(path.resolve(params.name));
    params.lines.forEach((line, index) => {
      const targets = [];
      for (const [, attribute, , value] of line.matchAll(attributePattern))
        targets.push(...candidates(attribute, value));
      for (const [, value] of line.matchAll(markdownLinkPattern)) targets.push(value);
      for (const target of targets) {
        if (!target || externalPattern.test(target)) continue;
        const filePath = decodeURI(target.split(/[?#]/)[0]);
        if (filePath.startsWith("/") || !existsWithExactCase(root, filePath))
          onError({ lineNumber: index + 1, detail: `"${target}" is not a file in the repo (paths are case-sensitive)`, context: target });
      }
    });
  },
};
