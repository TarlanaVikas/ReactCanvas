// Tiny single-pass tokenizer → HTML string for the export preview.
// Single pass means highlighted markup is never re-highlighted.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

const JSX_RE =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?)([A-Za-z][\w.-]*)?|(\b(?:import|from|export|default|function|return|const)\b)|(\b[a-zA-Z-]+)(?==)/g;

const CSS_RE =
  /(\/\*[\s\S]*?\*\/)|(@[\w-]+)|(\.[\w-]+)(?=[^{;}]*\{)|([\w-]+)(?=\s*:)|(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|%|rem|em|vh|vw|s|ms|deg)?\b)/g;

export const highlight = (code, lang) => {
  const re = lang === "css" ? CSS_RE : lang === "jsx" ? JSX_RE : null;
  if (!re) return esc(code);
  let out = "";
  let last = 0;
  code.replace(re, (...m) => {
    const idx = m[m.length - 2];
    out += esc(code.slice(last, idx));
    last = idx + m[0].length;
    if (lang === "jsx") {
      const [full, cmt, str, open, tag, kw, attrName] = m;
      if (cmt) out += span("tok-cmt", cmt);
      else if (str) out += span("tok-str", str);
      else if (open) out += esc(open) + (tag ? span(/^[A-Z]/.test(tag) ? "tok-comp" : "tok-tag", tag) : "");
      else if (kw) out += span("tok-kw", kw);
      else if (attrName) out += span("tok-attr", attrName);
      else out += esc(full);
    } else {
      const [full, cmt, at, sel, prop, val] = m;
      if (cmt) out += span("tok-cmt", cmt);
      else if (at) out += span("tok-kw", at);
      else if (sel) out += span("tok-sel", sel);
      else if (prop) out += span("tok-attr", prop);
      else if (val) out += span("tok-val", val);
      else out += esc(full);
    }
    return "";
  });
  return out + esc(code.slice(last));
};
