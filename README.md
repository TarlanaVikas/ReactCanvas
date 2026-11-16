<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:2b0e15,50:b3194d,100:c04b70&height=170&section=header&text=ReactCanvas&fontSize=48&fontColor=f7e8e8&fontAlignY=38&animation=fadeIn" alt="ReactCanvas wavy header" />

<img src="public/favicon.svg" width="76" alt="ReactCanvas logo" />

# ReactCanvas

**Paint the interface. Keep the code.**

A visual builder for React. Compose layouts on an artboard, shape them in an inspector,
preview every frame, and export real JSX and CSS.

[![React](https://img.shields.io/badge/React-19-b3194d?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-2b0e15?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
![Zustand](https://img.shields.io/badge/State-Zustand-c48a12?style=flat-square)
![Browser](https://img.shields.io/badge/Backend-None%20%7C%20Browser--based-bddc84?style=flat-square&labelColor=2b0e15)

[Live Demo](https://react-canvas-wine.vercel.app) · [Repository](https://github.com/TarlanaVikas/ReactCanvas)

</div>

---

## Overview

ReactCanvas is a browser-based visual editor for building React interfaces without losing control of the code. Arrange components on an interactive artboard, fine-tune their properties, preview responsive layouts, and export clean JSX and CSS.

The application is entirely front-end based. The document, editing history and export workflow run in the browser, with project data saved to `localStorage`. No server or API is required.

## Features

- **Interactive artboard** — Pan, zoom, fit to screen and work against a dot grid with a cursor-responsive glow.
- **Component library** — Thirty components across six families: Layout, Presets, Text, Forms, Media and Data.
- **Drag and drop** — Add components to the canvas or layer tree, reorder them, and move elements between parent layers. Click-to-add is also supported.
- **Property inspector** — Edit content, layout, style and motion properties, including spacing, typography, borders, shadows, flex, grid, transitions and animation presets.
- **Responsive frames** — Switch between desktop, tablet and mobile artboard widths.
- **Live preview** — Press `P` to hide the editor interface and interact with inputs, toggles, video and iframes as they would behave on the page.
- **Code export** — Generate `App.jsx` and `App.css`, export a Vite + React project as a ZIP, or save a design file to continue editing later.
- **Project management** — Rename projects and save or reopen `.reactcanvas.json` design files.
- **Editing history** — Undo and redo, with rapid edits such as typing and slider changes grouped into sensible history steps.

## What's new

| Area | Updates |
| --- | --- |
| Editing | Inline text editing, duplicate and delete actions, plus working undo/redo shortcuts |
| Navigation | Command palette (`Ctrl/⌘ K`), shortcut reference (`?`) and hash-based routing with browser back-button support |
| Layout | Starter layouts for landing heroes, pricing tiers and sign-up cards, along with frame presets and fit-to-screen |
| Projects | Editable project names, design-file save/open support and ZIP export |
| Appearance | Oxblood, amaranth and pistachio visual identity across light and dark themes, reduced-motion support and undoable toast feedback |
| History | Consecutive typing and slider changes are consolidated into a single undo step |

## Design direction

ReactCanvas uses a printed-poster visual language rather than a conventional dashboard. Blush-ash surfaces, oxblood ink, amaranth actions and pistachio highlights create its visual identity. Variable-width headlines, square-cut panels and fine rules carry the editorial feel into the studio. The dark theme shifts to deep bordeaux with pistachio accents.

Design tokens are maintained in `src/index.css`.

## Fixes and refinements

- Mapped camelCase schema fields to the kebab-case inspector renderers so typography, flex alignment, border radius, shadows, icons and input-type controls render correctly.
- Added the missing animation keyframes for presets such as `fade-in` and `slide-up`, and include them in exported CSS only when used.
- Corrected table row, column and header placement and added a cell editor.
- Restored accessible undo and redo controls and keyboard shortcuts.
- Fixed layer deletion so it removes the row that was clicked rather than whichever element was selected.
- Prevented newly added components from being nested inside a selected heading or button.
- Improved export handling for `object-fit`, `accent-color`, checkboxes, toggles, icons and text containing quotes or braces; removed invalid generated declarations.
- Reworked syntax highlighting into a single-pass tokenizer to prevent the highlighter from processing its own markup.
- Reduced unnecessary canvas updates by making elements subscribe only to the store state they use.

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, CSS and design tokens |
| State | Zustand — document store and editor UI store |
| Build tool | Vite |
| Icons | lucide-react |
| Typography | Anybody, Instrument Sans and JetBrains Mono via Fontsource |
| Export | Pure string generators and a small dependency-free ZIP writer |

## Project structure

```text
src/
├─ App.jsx                 Hash router, paint-wipe transition and lazy-loaded studio
├─ Home/                   Landing page and interactive hero demo
├─ Studio.jsx              Editor shell, docks, canvas, pan/zoom and shortcuts
├─ components/
│  ├─ TopBar.jsx           Project name, history, frames, preview, theme and export
│  ├─ Library.jsx          Searchable, draggable component library and starters
│  ├─ LayersPanel.jsx      Layer tree with drag reorder and reparent
│  ├─ Inspector.jsx        Schema-driven property panel
│  ├─ StudioElement.jsx    Canvas renderer, drop targets and inline text editing
│  ├─ ExportModal.jsx      Code view, ZIP export and design-file save/open
│  └─ CommandPalette.jsx, ShortcutsDialog.jsx, ToastHost.jsx
├─ constants/              Catalog, defaults, schema, templates, icons and motion keyframes
├─ store/                  Document store and editor UI store
└─ utils/                  Code generation, ZIP, highlighting, drag-and-drop and style helpers
```

## Implementation notes

- **Shared component catalogue:** `constants/catalog.js` defines each component's label, icon, family colour and child support. The library, layers, inspector, command palette and landing page use the same catalogue.
- **Pure code generation:** `utils/codegen.js` converts the layout tree into JSX, CSS or a project file map. Generated elements receive readable classes such as `rc-button-1`, without relying on inline styles.
- **Direct canvas transforms:** Pan, zoom, grid position and cursor glow are updated through DOM refs, avoiding React tree re-renders while the canvas is being moved.
- **Persistent documents:** Project data is stored under `rc_*` keys in `localStorage`. Values under previous key names are read once to preserve existing work.
- **Accessibility:** The interface includes visible focus rings, labelled controls, a keyboard-operable layer tree and command palette, and support for `prefers-reduced-motion`.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Command palette | `Ctrl/⌘ K` |
| Undo / redo | `Ctrl/⌘ Z` / `Ctrl/⌘ Shift Z` |
| Duplicate / delete | `Ctrl/⌘ D` / `Del` |
| Live preview | `P` |
| Export | `Ctrl/⌘ E` |
| Pan canvas | `Space` + drag |
| Zoom / fit | `Ctrl/⌘` + scroll / `Ctrl/⌘ Shift 0` |
| Hide panels | `\` |
| Shortcut reference | `?` |

---

<div align="center">

**Design visually. Export confidently.**

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:c04b70,50:b3194d,100:2b0e15&height=100&section=footer" alt="ReactCanvas wavy footer" />

</div>
