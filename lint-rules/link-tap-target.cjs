const MIN_TAP_PX = 44;
const linkPattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
const imgHeightPattern = /<img\b[^>]*\bheight\s*=\s*(["']?)(\d+)\1/gi;

module.exports = {
  names: ["link-tap-target"],
  description: `An image inside a link with a set height must be at least ${MIN_TAP_PX}px tall, so the link is big enough to tap on a phone`,
  tags: ["accessibility", "images"],
  parser: "none",
  function: (params, onError) => {
    params.lines.forEach((line, index) => {
      for (const [, inner] of line.matchAll(linkPattern)) {
        for (const [, , height] of inner.matchAll(imgHeightPattern)) {
          if (Number(height) < MIN_TAP_PX)
            onError({ lineNumber: index + 1, detail: `height="${height}" makes a ${height}px tap target; use at least ${MIN_TAP_PX}`, context: `height="${height}"` });
        }
      }
    });
  },
};
