// ─────────────────────────────────────────────────────────────
// catalog.js — single source of truth for every component type:
// its label, icon, pigment (colour family) and whether it can
// hold children. Used by the library, layers, inspector,
// command palette and landing page.
// ─────────────────────────────────────────────────────────────
import {
  Layers,
  LayoutGrid,
  PanelTop,
  MoveVertical,
  CreditCard,
  CheckSquare,
  Minus,
  Hash,
  AlignLeft,
  Type,
  Link,
  MessageSquare,
  Table,
  List,
  ListOrdered,
  Terminal,
  MousePointer2,
  TextCursorInput,
  ToggleLeft,
  Globe,
  Image,
  Video,
  Music,
  Star,
  Navigation,
  Box,
} from "lucide-react";

/** Pigments name the six component families. */
export const PIGMENTS = {
  layout: { name: "Verdigris", color: "#2e8b7a" },
  presets: { name: "Amaranth", color: "#b3194d" },
  text: { name: "Ochre", color: "#c48a12" },
  forms: { name: "Vermilion", color: "#e2572b" },
  media: { name: "Mauve", color: "#8b6bae" },
  data: { name: "Moss", color: "#6b8a2a" },
};

export const CATALOGUE = [
  {
    id: "layout",
    label: "Layout",
    items: [
      { label: "Flexbox", short: "Flex", type: "flex", icon: Layers, hint: "Row or column container" },
      { label: "Grid", short: "Grid", type: "grid", icon: LayoutGrid, hint: "Columns and rows" },
      { label: "Section", short: "Section", type: "section", icon: PanelTop, hint: "Full-width block" },
      { label: "Navigation", short: "Nav", type: "nav", icon: Navigation, hint: "Header bar" },
      { label: "Spacer", short: "Spacer", type: "spacer", icon: MoveVertical, hint: "Vertical breathing room" },
    ],
  },
  {
    id: "presets",
    label: "Presets",
    items: [
      { label: "Card", short: "Card", type: "card", icon: CreditCard, hint: "Padded surface" },
      { label: "Form group", short: "Form", type: "form-group", icon: CheckSquare, hint: "Stacked fields" },
      { label: "Divider", short: "Divider", type: "divider", icon: Minus, hint: "Horizontal rule" },
    ],
  },
  {
    id: "text",
    label: "Text",
    items: [
      { label: "Heading 1", short: "H1", type: "h1", icon: Hash, hint: "Page title" },
      { label: "Heading 2", short: "H2", type: "h2", icon: Hash, hint: "Section title" },
      { label: "Heading 3", short: "H3", type: "h3", icon: Hash, hint: "Sub-section title" },
      { label: "Paragraph", short: "Para", type: "text", icon: AlignLeft, hint: "Body copy" },
      { label: "Label", short: "Label", type: "label", icon: Type, hint: "Small caption" },
      { label: "Quote", short: "Quote", type: "blockquote", icon: MessageSquare, hint: "Pull quote" },
      { label: "Link", short: "Link", type: "link", icon: Link, hint: "Anchor" },
    ],
  },
  {
    id: "forms",
    label: "Forms",
    items: [
      { label: "Button", short: "Button", type: "button", icon: MousePointer2, hint: "Call to action" },
      { label: "Input", short: "Input", type: "input", icon: TextCursorInput, hint: "Single-line field" },
      { label: "Textarea", short: "Textarea", type: "textarea", icon: AlignLeft, hint: "Multi-line field" },
      { label: "Dropdown", short: "Select", type: "select", icon: List, hint: "Choose one option" },
      { label: "Checkbox", short: "Checkbox", type: "checkbox", icon: CheckSquare, hint: "Tick box" },
      { label: "Toggle", short: "Toggle", type: "toggle", icon: ToggleLeft, hint: "On / off switch" },
    ],
  },
  {
    id: "media",
    label: "Media",
    items: [
      { label: "Image", short: "Image", type: "image", icon: Image, hint: "Picture from a URL" },
      { label: "Video", short: "Video", type: "video", icon: Video, hint: "Video player" },
      { label: "Audio", short: "Audio", type: "audio", icon: Music, hint: "Audio player" },
      { label: "Iframe", short: "Iframe", type: "iframe", icon: Globe, hint: "Embedded page" },
      { label: "Icon", short: "Icon", type: "icon", icon: Star, hint: "Vector icon" },
    ],
  },
  {
    id: "data",
    label: "Data",
    items: [
      { label: "Table", short: "Table", type: "table", icon: Table, hint: "Rows and columns" },
      { label: "Bulleted list", short: "UL", type: "ul", icon: List, hint: "Unordered list" },
      { label: "Numbered list", short: "OL", type: "ol", icon: ListOrdered, hint: "Ordered list" },
      { label: "Code block", short: "Code", type: "code", icon: Terminal, hint: "Monospace snippet" },
    ],
  },
].map((group) => ({
  ...group,
  pigment: PIGMENTS[group.id].name,
  color: PIGMENTS[group.id].color,
}));

/** type → { label, short, icon, color, group, hint } */
export const TYPE_META = Object.fromEntries(
  CATALOGUE.flatMap((g) =>
    g.items.map((i) => [i.type, { ...i, color: g.color, group: g.id }]),
  ),
);
TYPE_META.container = {
  label: "Artboard",
  short: "Artboard",
  type: "container",
  icon: Box,
  color: PIGMENTS.layout.color,
  group: "layout",
  hint: "The root frame",
};

/** Types that may contain children. */
export const CONTAINER_TYPES = new Set([
  "container",
  "flex",
  "grid",
  "section",
  "nav",
  "card",
  "form-group",
]);
export const isContainer = (type) => CONTAINER_TYPES.has(type);
