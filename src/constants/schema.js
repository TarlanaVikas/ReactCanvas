import { TYPE_META } from "./catalog";

// ─────────────────────────────────────────────────────────────
// schema.js  –  drives Inspector panels dynamically.
//
// IMPORTANT: All style property field-keys here map directly to
// camelCase React style object keys. The Inspector reads these
// strings and dispatches { camelCaseKey: value } to updateStyles.
//
// Field-key → style key mapping (all camelCase):
//   "background"        → backgroundColor
//   "color"             → color
//   "fontSize"          → fontSize
//   "fontWeight"        → fontWeight
//   "fontFamily"        → fontFamily
//   "textAlign"         → textAlign
//   "lineHeight"        → lineHeight
//   "letterSpacing"     → letterSpacing
//   "textDecoration"    → textDecoration
//   "textTransform"     → textTransform
//   "borderRadius"      → borderRadius
//   "boxShadow"         → boxShadow
//   "opacity"           → opacity
//   "cursor"            → cursor
//   "visibility"        → visibility
//   "objectFit"         → objectFit
//   "resize"            → resize
//   "listStyleType"     → listStyleType
//   "accentColor"       → accentColor
//
// Field-key → special inspector widget:
//   "textContent"       → <textarea> for element.content
//   "href"              → text input → styles.href
//   "src"               → text input → styles.src
//   "width" / "height"  → UnitInput  → styles.width/height
//   "padding"           → SpacingBox → paddingTop/Right/Bottom/Left
//   "margin"            → SpacingBox → marginTop/Right/Bottom/Left
//   "border"            → group: borderWidth + borderStyle + borderColor
//   "borderRadius"      → RangeField → styles.borderRadius
//   "borderLeft"        → group: borderLeftWidth + borderLeftColor
//   "display"           → Chips
//   "flexDirection"     → Chips
//   "justifyContent"    → Chips
//   "alignItems"        → Chips
//   "flexWrap"          → SelectInput
//   "gap"               → UnitInput → styles.gap
//   "gridCols"          → NumInput + updateGrid()
//   "gridRows"          → NumInput + GridPlacementPanel + updateGrid()
//   "overflow"          → dual SelectInput (overflowX / overflowY)
//   "position"          → SelectInput + conditional TRBL
//   "zIndex"            → TextInput → styles.zIndex
//   "transition"        → property + duration + easing
//   "animation"         → preset chips + duration + repeat
//   "transform"         → translateX, translateY, rotate, scale
//   "placeholder"       → text input for element.content
//   "inputType"         → SelectInput for el.inputType
//   "rows"              → NumInput
//   "options"           → TextArea (one per line) for el.content
//   "checked"           → Chips → styles.checked
//   "controls"          → Chips → styles.controls
//   "autoplay"          → Chips → styles.autoplay
//   "loop"              → Chips → styles.loop
//   "muted"             → Chips → styles.muted
//   "poster"            → TextInput → styles.poster
//   "sandbox"           → SelectInput → styles.sandbox
//   "language"          → SelectInput → styles.language
//   "iconName"          → IconPicker for el.content
//   "iconSize"          → UnitInput → styles.width + styles.height
//   "strokeWidth"       → RangeField → styles.strokeWidth
//   "cite"              → TextInput → styles.cite
//   "for"               → TextInput → styles.htmlFor
//   "table-editor"      → full TableEditor component
// ─────────────────────────────────────────────────────────────

const RAW_SCHEMA = {

  // ── LAYOUT ─────────────────────────────────────────────────
  flex: {
    content: [],
    layout:  ['display','flexDirection','justifyContent','alignItems','flexWrap','gap','width','height','padding','margin','overflow','position','zIndex'],
    style:   ['background','border','borderRadius','boxShadow','opacity','visibility'],
    motion:  ['transition','animation','transform'],
  },
  grid: {
    content: [],
    layout:  ['display','gridCols','gridRows','gap','alignItems','width','height','padding','margin','overflow','position','zIndex'],
    style:   ['background','border','borderRadius','boxShadow','opacity','visibility'],
    motion:  ['transition','animation','transform'],
  },
  section: {
    content: [],
    layout:  ['display','width','height','padding','margin','overflow','position','zIndex'],
    style:   ['background','border','borderRadius','boxShadow','opacity','visibility'],
    motion:  ['transition','animation'],
  },
  nav: {
    content: [],
    layout:  ['display','flexDirection','justifyContent','alignItems','gap','width','height','padding','margin','position','zIndex'],
    style:   ['background','border','borderRadius','boxShadow','opacity'],
    motion:  ['transition'],
  },
  spacer: {
    content: [],
    layout:  ['width','height','margin'],
    style:   ['background','opacity'],
    motion:  ['transition'],
  },

  // ── PRESETS ────────────────────────────────────────────────
  card: {
    content: [],
    layout:  ['display','flexDirection','justifyContent','alignItems','gap','width','height','padding','margin','position','zIndex'],
    style:   ['background','border','borderRadius','boxShadow','opacity','cursor'],
    motion:  ['transition','animation','transform'],
  },
  'form-group': {
    content: [],
    layout:  ['display','flexDirection','gap','width','padding','margin'],
    style:   ['background','border','borderRadius','opacity'],
    motion:  ['transition'],
  },
  divider: {
    content: [],
    layout:  ['width','margin'],
    style:   ['background','border','opacity'],
    motion:  ['transition'],
  },

  // ── TYPOGRAPHY ─────────────────────────────────────────────
  h1: {
    content: ['textContent'],
    layout:  ['width','padding','margin','position','zIndex'],
    style:   ['color','fontSize','fontWeight','fontFamily','textAlign','lineHeight','letterSpacing','textTransform','textDecoration','background','opacity'],
    motion:  ['transition','animation'],
  },
  h2: {
    content: ['textContent'],
    layout:  ['width','padding','margin','position','zIndex'],
    style:   ['color','fontSize','fontWeight','fontFamily','textAlign','lineHeight','letterSpacing','textTransform','textDecoration','background','opacity'],
    motion:  ['transition','animation'],
  },
  h3: {
    content: ['textContent'],
    layout:  ['width','padding','margin','position','zIndex'],
    style:   ['color','fontSize','fontWeight','fontFamily','textAlign','lineHeight','letterSpacing','textTransform','textDecoration','background','opacity'],
    motion:  ['transition','animation'],
  },
  text: {
    content: ['textContent'],
    layout:  ['width','padding','margin','position','zIndex'],
    style:   ['color','fontSize','fontWeight','fontFamily','textAlign','lineHeight','letterSpacing','textDecoration','background','opacity'],
    motion:  ['transition','animation'],
  },
  label: {
    content: ['textContent','for'],
    layout:  ['margin','padding'],
    style:   ['color','fontSize','fontWeight','fontFamily','textTransform','letterSpacing','opacity'],
    motion:  ['transition'],
  },
  blockquote: {
    content: ['textContent','cite'],
    layout:  ['width','padding','margin'],
    style:   ['color','fontSize','fontFamily','textAlign','background','borderLeft','borderRadius','opacity'],
    motion:  ['transition'],
  },
  link: {
    content: ['textContent','href'],
    layout:  ['padding','margin'],
    style:   ['color','fontSize','fontWeight','fontFamily','textDecoration','background','borderRadius','opacity','cursor'],
    motion:  ['transition'],
  },

  // ── FORMS & UI ─────────────────────────────────────────────
  button: {
    content: ['textContent'],
    layout:  ['width','height','padding','margin','display','position','zIndex'],
    style:   ['background','color','fontSize','fontWeight','fontFamily','textAlign','border','borderRadius','boxShadow','opacity','cursor'],
    motion:  ['transition','animation','transform'],
  },
  input: {
    content: ['inputType','placeholder'],
    layout:  ['width','height','padding','margin'],
    style:   ['background','color','fontSize','fontFamily','border','borderRadius','boxShadow','opacity'],
    motion:  ['transition'],
  },
  textarea: {
    content: ['placeholder','rows'],
    layout:  ['width','height','padding','margin'],
    style:   ['background','color','fontSize','fontFamily','border','borderRadius','resize','opacity'],
    motion:  ['transition'],
  },
  select: {
    content: ['options'],
    layout:  ['width','height','padding','margin'],
    style:   ['background','color','fontSize','border','borderRadius','opacity','cursor'],
    motion:  ['transition'],
  },
  checkbox: {
    content: ['checked'],
    layout:  ['margin'],
    style:   ['accentColor','opacity'],
    motion:  ['transition'],
  },
  toggle: {
    content: ['checked'],
    layout:  ['margin'],
    style:   ['accentColor','opacity'],
    motion:  ['transition'],
  },

  // ── MULTIMEDIA ─────────────────────────────────────────────
  image: {
    content: ['src','alt','objectFit'],
    layout:  ['width','height','margin','position','zIndex'],
    style:   ['border','borderRadius','boxShadow','opacity'],
    motion:  ['transition','animation','transform'],
  },
  video: {
    content: ['src','poster','controls','autoplay','loop','muted'],
    layout:  ['width','height','margin'],
    style:   ['background','border','borderRadius','opacity'],
    motion:  ['transition'],
  },
  audio: {
    content: ['src','controls','loop','autoplay'],
    layout:  ['width','margin'],
    style:   ['background','borderRadius','opacity'],
    motion:  ['transition'],
  },
  iframe: {
    content: ['src','title','sandbox'],
    layout:  ['width','height','margin'],
    style:   ['border','borderRadius','opacity'],
    motion:  ['transition'],
  },
  icon: {
    content: ['iconName','iconSize','strokeWidth'],
    layout:  ['margin','padding'],
    style:   ['color','background','borderRadius','opacity'],
    motion:  ['transition','transform'],
  },

  // ── DATA & STRUCTURE ───────────────────────────────────────
  table: {
    content: ['table-editor'],
    layout:  ['width','padding','margin'],
    style:   ['background','color','fontSize','border','borderRadius','opacity'],
    motion:  ['transition'],
  },
  ul: {
    content: ['textContent','listStyleType'],
    layout:  ['width','padding','margin'],
    style:   ['color','fontSize','fontFamily','background','opacity'],
    motion:  ['transition'],
  },
  ol: {
    content: ['textContent','listStyleType'],
    layout:  ['width','padding','margin'],
    style:   ['color','fontSize','fontFamily','background','opacity'],
    motion:  ['transition'],
  },
  code: {
    content: ['textContent','language'],
    layout:  ['width','height','padding','margin'],
    style:   ['background','color','fontSize','border','borderRadius','opacity'],
    motion:  ['transition'],
  },
};

// ─────────────────────────────────────────────────────────────
// The Inspector's renderers are keyed in kebab-case ("font-size"),
// while the raw schema above is written in camelCase. Normalising
// here is what makes those controls actually appear.
// ─────────────────────────────────────────────────────────────
const SPECIAL = {
  textContent: ["textContent"],
  gridCols: ["grid-template-columns"],
  gridRows: ["grid-template-rows"],
  "table-editor": ["table-rows", "table-cols", "table-headers", "table-cells"],
};
const kebab = (f) => f.replace(/([A-Z])/g, "-$1").toLowerCase();
const normaliseFields = (fields = []) => [
  ...new Set(fields.flatMap((f) => SPECIAL[f] || [kebab(f)])),
];

export const ELEMENT_SCHEMA = Object.fromEntries(
  Object.entries(RAW_SCHEMA).map(([type, tabs]) => [
    type,
    Object.fromEntries(Object.entries(tabs).map(([tab, list]) => [tab, normaliseFields(list)])),
  ]),
);

// Type → pigment colour and display name, shared with the library.
export const TYPE_COLOR = Object.fromEntries(
  Object.entries(TYPE_META).map(([t, m]) => [t, m.color]),
);
export const TYPE_LABEL = Object.fromEntries(
  Object.entries(TYPE_META).map(([t, m]) => [t, m.label]),
);
