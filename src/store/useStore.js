import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { DEFAULTS } from "../constants/defaults";
import { isContainer } from "../constants/catalog";
import { buildTemplate } from "../constants/templates";
import { isValidTree } from "../utils/codegen";

/* ── persistence ─────────────────────────────────────────────
   Keys moved from the old `sde_*` names to `rc_*`. Old values are
   still read once so nobody loses their work after upgrading.  */
const KEYS = {
  tree: ["rc_layout_tree", "sde_layout_tree"],
  canvas: ["rc_canvas_bg", "sde_canvas_bg"],
  dot: ["rc_dot_color", "sde_dot_color"],
  name: ["rc_project_name"],
};

const read = (keys) => {
  try {
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v !== null) return v;
    }
  } catch {
    /* storage unavailable (private mode, quota) */
  }
  return null;
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, quota) */
  }
};

export const DEFAULT_CANVAS_BG = "#d9ccc5";
const LEGACY_CANVAS = new Set(["#dfe4dc", "#dde1e9"]);
export const DEFAULT_DOT_COLOR = "rgba(179,25,77,0.24)";
const LEGACY_DOTS = new Set(["rgba(34,54,245,0.22)", "rgba(99,102,241,0.22)"]);
export const DEFAULT_NAME = "Untitled canvas";

const makeRoot = () => ({
  id: "root",
  type: "container",
  styles: {
    padding: "48px",
    backgroundColor: "#ffffff",
    minHeight: "1200px",
    width: "960px",
    display: "block",
    margin: "0 auto",
    position: "relative",
    borderRadius: "4px",
    boxShadow: "0 1px 0 rgba(43,14,21,0.08), 0 18px 60px rgba(43,14,21,0.2)",
  },
  children: [],
});

const loadTree = () => {
  try {
    const raw = read(KEYS.tree);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidTree(parsed)) return parsed;
    }
  } catch {
    /* fall through to a fresh artboard */
  }
  return makeRoot();
};

const makeNode = (type) => {
  const def = DEFAULTS[type] || {};
  return {
    id: `comp-${uuidv4().slice(0, 8)}`,
    type,
    styles: { ...(def.styles || { padding: "12px" }) },
    content: def.content ?? "",
    inputType: def.inputType ?? undefined,
    tableHeaders: def.tableHeaders ?? undefined,
    tableRows: def.tableRows ?? undefined,
    tableCols: def.tableCols ?? undefined,
    tableData: def.tableData ?? undefined,
    gridCols: def.gridCols ?? undefined,
    gridRows: def.gridRows ?? undefined,
    children: [],
  };
};

/* ── tree helpers ─────────────────────────────────────────── */
export const findNode = (node, id) => {
  if (!node) return null;
  if (node.id === id) return node;
  for (const c of node.children || []) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
};

const findParent = (node, id) => {
  for (let i = 0; i < (node.children || []).length; i++) {
    const c = node.children[i];
    if (c.id === id) return { parent: node, index: i };
    const deeper = findParent(c, id);
    if (deeper) return deeper;
  }
  return null;
};

export const containsId = (node, id) =>
  node.id === id || (node.children || []).some((c) => containsId(c, id));

const mapNode = (node, id, fn) => {
  if (node.id === id) return fn(node);
  if (!node.children?.length) return node;
  let changed = false;
  const children = node.children.map((c) => {
    const next = mapNode(c, id, fn);
    if (next !== c) changed = true;
    return next;
  });
  return changed ? { ...node, children } : node;
};

const removeNode = (node, id) => {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)),
  };
};

const insertAt = (tree, parentId, index, child) =>
  mapNode(tree, parentId, (p) => {
    const kids = [...(p.children || [])];
    kids.splice(index < 0 || index > kids.length ? kids.length : index, 0, child);
    return { ...p, children: kids };
  });

const cloneWithNewIds = (node) => ({
  ...node,
  id: `comp-${uuidv4().slice(0, 8)}`,
  styles: { ...node.styles },
  tableData: node.tableData ? node.tableData.map((r) => [...r]) : node.tableData,
  children: (node.children || []).map(cloneWithNewIds),
});

/* ── history ──────────────────────────────────────────────── */
const MAX_HIST = 80;
let lastEditKey = null;
let lastEditAt = 0;

/** Pushes a history entry. Rapid edits with the same key (typing, dragging a
 *  slider) collapse into one undo step instead of flooding the stack. */
const pushHist = (state, tree, coalesceKey = null) => {
  const now = Date.now();
  const atHead = state.historyIndex === state.history.length - 1;
  if (coalesceKey && coalesceKey === lastEditKey && now - lastEditAt < 800 && atHead) {
    lastEditAt = now;
    const h = [...state.history];
    h[h.length - 1] = tree;
    return { history: h, historyIndex: h.length - 1 };
  }
  lastEditKey = coalesceKey;
  lastEditAt = now;
  const h = [...state.history.slice(0, state.historyIndex + 1), tree].slice(-MAX_HIST);
  return { history: h, historyIndex: h.length - 1 };
};

/** Can `movingId` be dropped at `pos` relative to `targetId`? Pass a type string
 *  (not an existing id) as `movingId` with `isNew` for library drags. */
export const canDrop = (tree, movingId, targetId, pos, isNew = false) => {
  const target = findNode(tree, targetId);
  if (!target) return false;
  if (pos === "inside" && !isContainer(target.type)) return false;
  if (pos !== "inside" && targetId === "root") return false;
  if (isNew) return true;
  if (movingId === "root" || movingId === targetId) return false;
  const moving = findNode(tree, movingId);
  return !!moving && !containsId(moving, targetId);
};

const useStore = create((set, get) => {
  const initTree = loadTree();

  /** Commit a new tree: persist, record history, stamp the save time. */
  const commit = (s, tree, extra = {}, coalesceKey = null) => {
    write(KEYS.tree[0], JSON.stringify(tree));
    return { layoutTree: tree, lastSaved: Date.now(), ...pushHist(s, tree, coalesceKey), ...extra };
  };

  return {
    selectedElementId: "root",
    canvasBg: (() => { const v = read(KEYS.canvas); return v && !LEGACY_CANVAS.has(v) ? v : DEFAULT_CANVAS_BG; })(),
    canvasDotColor: (() => { const v = read(KEYS.dot); return v && !LEGACY_DOTS.has(v) ? v : DEFAULT_DOT_COLOR; })(),
    projectName: read(KEYS.name) || DEFAULT_NAME,
    layoutTree: initTree,
    history: [initTree],
    historyIndex: 0,
    lastSaved: 0,

    setProjectName: (name) => {
      const clean = (name || "").trim().slice(0, 60) || DEFAULT_NAME;
      write(KEYS.name[0], clean);
      set({ projectName: clean });
    },
    setCanvasBg: (c) => {
      write(KEYS.canvas[0], c);
      set({ canvasBg: c });
    },
    setCanvasDotColor: (c) => {
      write(KEYS.dot[0], c);
      set({ canvasDotColor: c });
    },

    undo: () =>
      set((s) => {
        if (s.historyIndex <= 0) return s;
        const i = s.historyIndex - 1;
        const t = s.history[i];
        write(KEYS.tree[0], JSON.stringify(t));
        lastEditKey = null;
        const keep = findNode(t, s.selectedElementId) ? s.selectedElementId : "root";
        return { layoutTree: t, historyIndex: i, selectedElementId: keep, lastSaved: Date.now() };
      }),
    redo: () =>
      set((s) => {
        if (s.historyIndex >= s.history.length - 1) return s;
        const i = s.historyIndex + 1;
        const t = s.history[i];
        write(KEYS.tree[0], JSON.stringify(t));
        lastEditKey = null;
        const keep = findNode(t, s.selectedElementId) ? s.selectedElementId : "root";
        return { layoutTree: t, historyIndex: i, selectedElementId: keep, lastSaved: Date.now() };
      }),
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    clearCanvas: () =>
      set((s) => {
        const fresh = { ...makeRoot(), styles: { ...s.layoutTree.styles }, children: [] };
        return commit(s, fresh, { selectedElementId: "root" });
      }),

    /** Replace the whole document (templates, imports). Undoable. */
    loadDocument: ({ tree, name, canvasBg, canvasDotColor }) =>
      set((s) => {
        if (!isValidTree(tree)) return s;
        if (name) write(KEYS.name[0], name);
        if (canvasBg) write(KEYS.canvas[0], canvasBg);
        if (canvasDotColor) write(KEYS.dot[0], canvasDotColor);
        return commit(s, tree, {
          selectedElementId: "root",
          projectName: name || s.projectName,
          canvasBg: canvasBg || s.canvasBg,
          canvasDotColor: canvasDotColor || s.canvasDotColor,
        });
      }),

    /** Append a starter template to the artboard. */
    addTemplate: (id) =>
      set((s) => {
        const kids = buildTemplate(id);
        if (!kids.length) return s;
        const t = { ...s.layoutTree, children: [...(s.layoutTree.children || []), ...kids] };
        return commit(s, t, { selectedElementId: kids[0].id });
      }),

    setSelectedElement: (id) => set({ selectedElementId: id }),

    /** Add a component. With no target it goes inside the selected container,
     *  or right after the selected element when that can't hold children. */
    addComponent: (type, target) =>
      set((s) => {
        const el = makeNode(type);
        let parentId = "root";
        let index = -1;
        if (target) {
          parentId = target.parentId;
          index = target.index ?? -1;
        } else {
          const sel = findNode(s.layoutTree, s.selectedElementId);
          if (sel && isContainer(sel.type)) parentId = sel.id;
          else if (sel) {
            const loc = findParent(s.layoutTree, sel.id);
            if (loc) {
              parentId = loc.parent.id;
              index = loc.index + 1;
            }
          }
        }
        const t = insertAt(s.layoutTree, parentId, index, el);
        return commit(s, t, { selectedElementId: el.id });
      }),

    updateStyles: (ns) =>
      set((s) => {
        const id = s.selectedElementId;
        const t = mapNode(s.layoutTree, id, (n) => ({ ...n, styles: { ...n.styles, ...ns } }));
        return commit(s, t, {}, `style:${id}:${Object.keys(ns).join(",")}`);
      }),

    updateContent: (content) =>
      set((s) => {
        const id = s.selectedElementId;
        const t = mapNode(s.layoutTree, id, (n) => ({ ...n, content }));
        return commit(s, t, {}, `content:${id}`);
      }),

    updateInputType: (inputType) =>
      set((s) => {
        const id = s.selectedElementId;
        const t = mapNode(s.layoutTree, id, (n) => ({ ...n, inputType }));
        return commit(s, t);
      }),

    updateGrid: (gridCols, gridRows) =>
      set((s) => {
        const cols = Math.max(1, parseInt(gridCols) || 1);
        const rows = Math.max(1, parseInt(gridRows) || 1);
        const t = mapNode(s.layoutTree, s.selectedElementId, (n) => ({
          ...n,
          gridCols: cols,
          gridRows: rows,
          styles: {
            ...n.styles,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: rows > 1 ? `repeat(${rows}, auto)` : "auto",
          },
        }));
        return commit(s, t, {}, `grid:${s.selectedElementId}`);
      }),

    updateTableMeta: (patch) =>
      set((s) => {
        const id = s.selectedElementId;
        const t = mapNode(s.layoutTree, id, (n) => ({ ...n, ...patch }));
        return commit(s, t, {}, `table:${id}:${Object.keys(patch).join(",")}`);
      }),

    /** Delete an element (defaults to the selection). The artboard can't be deleted. */
    deleteElement: (id) =>
      set((s) => {
        const target = id ?? s.selectedElementId;
        if (target === "root" || !findNode(s.layoutTree, target)) return s;
        const t = removeNode(s.layoutTree, target);
        const stillThere = findNode(t, s.selectedElementId);
        return commit(s, t, { selectedElementId: stillThere ? s.selectedElementId : "root" });
      }),

    duplicateElement: (id) =>
      set((s) => {
        const target = id ?? s.selectedElementId;
        if (target === "root") return s;
        const loc = findParent(s.layoutTree, target);
        if (!loc) return s;
        const copy = cloneWithNewIds(loc.parent.children[loc.index]);
        const t = insertAt(s.layoutTree, loc.parent.id, loc.index + 1, copy);
        return commit(s, t, { selectedElementId: copy.id });
      }),

    /** Nudge an element up/down among its siblings. */
    moveElement: (id, dir) =>
      set((s) => {
        const loc = findParent(s.layoutTree, id);
        if (!loc) return s;
        const to = dir === "up" ? loc.index - 1 : loc.index + 1;
        if (to < 0 || to >= loc.parent.children.length) return s;
        const t = mapNode(s.layoutTree, loc.parent.id, (p) => {
          const kids = [...p.children];
          [kids[loc.index], kids[to]] = [kids[to], kids[loc.index]];
          return { ...p, children: kids };
        });
        return commit(s, t);
      }),

    /** Drag-and-drop move. position: 'before' | 'after' | 'inside' (relative to targetId). */
    moveNode: (id, targetId, position) =>
      set((s) => {
        if (id === "root" || id === targetId) return s;
        const moving = findNode(s.layoutTree, id);
        const target = findNode(s.layoutTree, targetId);
        if (!moving || !target) return s;
        if (containsId(moving, targetId)) return s; // can't drop into itself
        if (position === "inside" && !isContainer(target.type)) return s;
        if (position !== "inside" && targetId === "root") return s;

        const without = removeNode(s.layoutTree, id);
        let parentId;
        let index;
        if (position === "inside") {
          parentId = targetId;
          index = -1;
        } else {
          const loc = findParent(without, targetId);
          if (!loc) return s;
          parentId = loc.parent.id;
          index = loc.index + (position === "after" ? 1 : 0);
        }
        const t = insertAt(without, parentId, index, moving);
        return commit(s, t, { selectedElementId: id });
      }),
  };
});

export default useStore;
