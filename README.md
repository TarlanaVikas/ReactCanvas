<div align="center">

<img src="public/favicon.svg" width="72" alt="ReactCanvas logo" />

# ReactCanvas

**Paint the interface. Keep the code.**

A visual builder for React. Compose layouts on an artboard, shape them in an inspector,
preview every frame, and export real JSX and CSS.

![React](https://img.shields.io/badge/React-19-b3194d?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-2b0e15?style=flat-square&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-c48a12?style=flat-square)
![Backend](https://img.shields.io/badge/Backend-none%20(runs%20in%20the%20browser)-bddc84?style=flat-square&labelColor=2b0e15)

</div>

---

## Screenshots

> Screenshots are not bundled with the repository. Add them to `docs/` and link them here.

| Home | Studio | Export |
| :-: | :-: | :-: |
| `docs/home.png` | `docs/studio.png` | `docs/export.png` |

## Visual identity

A printed-poster look instead of a dashboard: blush-ash stock, oxblood ink, amaranth as the single action colour and
pistachio as a highlighter. Headlines use a variable-width face that stretches with the cursor, panels are square-cut
with hairline rules, and the dark theme swaps to a deep bordeaux with a pistachio accent. Design tokens live in
`src/index.css`.

## What it does

ReactCanvas is a front-end-only application. Everything, including the document, history and export, runs in the
browser and is saved to `localStorage`. There is no server or API.

- **Artboard** with pan, zoom, fit-to-screen and a dot grid that lights up around the cursor.
- **Thirty components** in six colour-coded families: Layout, Presets, Text, Forms, Media and Data.
- **Drag and drop** from the library onto the canvas or the layer tree, and between layers to reorder or reparent.
  Click-to-add still works.
- **Inspector** with content, layout, style and motion tabs: spacing box, typography, borders, shadows, flex and grid
  controls, transitions and animation presets.
- **Live preview** (`P`): hides the editor chrome so inputs, toggles, video and iframes behave like the real page.
  Frame buttons switch the artboard between desktop, tablet and mobile widths.
- **Export** to `App.jsx` and `App.css`, a runnable Vite + React project (`.zip`), or a design file to reopen later.

## New in this version

| Area | Addition |
| --- | --- |
| Editing | Double-click text to edit it in place; duplicate (`Ctrl D`); delete; undo and redo with working shortcuts |
| Navigation | Command palette (`Ctrl K`), shortcut sheet (`?`), hash routing so the browser back button works |
| Layout | Starter layouts (landing hero, pricing tiers, sign-up card), frame presets, fit-to-screen |
| Projects | Editable project name, save and open design files (`.reactcanvas.json`), ZIP export |
| Appearance | Oxblood, amaranth and pistachio identity in light and dark themes, reduced-motion support, toast feedback with undo actions |
| History | Rapid edits (typing, slider drags) collapse into one undo step |

## Fixes from the original codebase

- Inspector controls for typography, flex alignment, border radius, shadows, icon and input type never rendered,
  because the schema used camelCase field names while the renderers were keyed in kebab-case. They are now mapped.
- Animation presets (`fade-in`, `slide-up`, and the rest) referenced keyframes that did not exist, on the canvas and in
  exported CSS. Keyframes are now defined and included in exports only when used.
- Table rows, columns and headers were written to the wrong place and never reached the canvas. A cell editor was added.
- Undo and redo had no mounted UI or keyboard shortcut.
- Deleting from a layer row removed the selected element instead of the row that was clicked.
- Adding a component while a heading or button was selected nested it inside that element.
- Exported code lost `object-fit` and `accent-color`, emitted stray `cite` and `rows` declarations, flattened
  checkboxes, toggles and icons into empty `div`s, and did not escape quotes or braces in text.
- The export syntax highlighter re-highlighted its own markup. It is now a single-pass tokenizer.
- Every canvas element re-rendered on every store update. Elements now subscribe to the state they use.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, plain CSS with design tokens |
| State | Zustand (document store and a separate editor-UI store) |
| Build | Vite |
| Icons | lucide-react |
| Type | Anybody (variable width), Instrument Sans, JetBrains Mono, self-hosted via Fontsource |
| Export | Pure string generators plus a small dependency-free ZIP writer |

## Project structure

```
src/
├─ App.jsx                 Hash router, paint-wipe transition, lazy-loaded studio
├─ Home/                   Landing page and the interactive hero demo
├─ Studio.jsx              Editor shell: docks, canvas, pan/zoom, shortcuts
├─ components/
│  ├─ TopBar.jsx           Project name, history, frames, preview, theme, export
│  ├─ Library.jsx          Searchable, draggable component library and starters
│  ├─ LayersPanel.jsx      Layer tree with drag reorder and reparent
│  ├─ Inspector.jsx        Schema-driven property panel
│  ├─ StudioElement.jsx    Canvas renderer, drop targets, inline text editing
│  ├─ ExportModal.jsx      Code view, ZIP export, design file save and open
│  └─ CommandPalette.jsx, ShortcutsDialog.jsx, ToastHost.jsx
├─ constants/              catalog, defaults, schema, templates, icons, motion keyframes
├─ store/                  useStore (document) and useUi (editor UI)
└─ utils/                  codegen, zip, highlight, dnd, style helpers
```

## Implementation notes

- **One catalogue.** `constants/catalog.js` defines every component's label, icon, family colour and whether it can hold
  children. The library, layers, inspector, palette and landing page all read from it.
- **Code generation is pure.** `utils/codegen.js` turns the layout tree into JSX, CSS or a project file map, with one
  readable class per element (`rc-button-1`) and no inline styles.
- **Pan and zoom bypass React.** Transform, grid position and the cursor glow are written straight to the DOM through
  refs, so dragging the canvas never re-renders the tree.
- **Storage.** The document is stored under `rc_*` keys. Values saved under the previous key names are still read once
  so existing work carries over.
- **Accessibility.** Visible focus rings, labelled controls, keyboard-operable layer tree and palette, and
  `prefers-reduced-motion` respected across the interface.

## Keyboard shortcuts

| Action | Keys |
| --- | --- |
| Command palette | `Ctrl/⌘ K` |
| Undo / redo | `Ctrl/⌘ Z` / `Ctrl/⌘ Shift Z` |
| Duplicate / delete | `Ctrl/⌘ D` / `Del` |
| Preview | `P` |
| Export | `Ctrl/⌘ E` |
| Pan | `Space` + drag |
| Zoom / fit | `Ctrl/⌘ scroll` / `Ctrl/⌘ Shift 0` |
| Hide panels | `\` |
| Shortcut sheet | `?` |
