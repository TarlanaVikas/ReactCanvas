// Keys stored in `element.styles` that are element attributes or
// editor metadata rather than real CSS declarations.
export const NON_CSS_KEYS = new Set([
  "src",
  "alt",
  "poster",
  "href",
  "sandbox",
  "title",
  "htmlFor",
  "cite",
  "controls",
  "autoplay",
  "loop",
  "muted",
  "checked",
  "placeholder",
  "language",
  "rows",
  "tableRows",
  "tableCols",
  "tableHeaders",
  "iconSize",
  "strokeWidth",
  // transform helpers are composed into a single `transform`
  "translateX",
  "translateY",
  "rotate",
  "scale",
  "animationPreset",
]);

export const isCssKey = (key) => !NON_CSS_KEYS.has(key);

/** Returns only the real CSS declarations of a styles object. */
export const cssOnly = (styles = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(styles)) {
    if (isCssKey(k) && v !== "" && v != null) out[k] = v;
  }
  return out;
};

/** Composes translate/rotate/scale helper fields into a CSS transform. */
export const buildTransform = (s = {}) => {
  const parts = [];
  if (s.translateX && s.translateX !== "0px") parts.push(`translateX(${s.translateX})`);
  if (s.translateY && s.translateY !== "0px") parts.push(`translateY(${s.translateY})`);
  if (s.rotate && s.rotate !== "0deg") parts.push(`rotate(${s.rotate})`);
  if (s.scale && parseFloat(s.scale) !== 1) parts.push(`scale(${s.scale})`);
  return parts.length ? parts.join(" ") : undefined;
};
