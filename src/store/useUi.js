import { create } from "zustand";

const LS_THEME = "rc_theme";

const readTheme = () => {
  try {
    const saved = localStorage.getItem(LS_THEME);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#190a0f" : "#e9ddd8");
};

let toastSeq = 0;

/** Editor-only UI state (never saved with the design). */
const useUi = create((set, get) => {
  const theme = readTheme();
  applyTheme(theme);
  return {
    theme,
    toggleTheme: () => {
      const next = get().theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(LS_THEME, next);
      } catch {
        /* storage unavailable */
      }
      applyTheme(next);
      set({ theme: next });
    },

    preview: false,
    setPreview: (v) => set({ preview: v }),
    togglePreview: () => set((s) => ({ preview: !s.preview })),

    paletteOpen: false,
    setPaletteOpen: (v) => set({ paletteOpen: v }),
    shortcutsOpen: false,
    setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
    exportOpen: false,
    setExportOpen: (v) => set({ exportOpen: v }),

    /* drag & drop: what is being dragged, and where it would land */
    drag: null, // { kind: 'type' | 'move', value: string }
    drop: null, // { id: string, pos: 'before' | 'after' | 'inside' }
    setDrag: (drag) => set({ drag, drop: drag ? get().drop : null }),
    setDrop: (drop) => {
      const cur = get().drop;
      if (cur?.id === drop?.id && cur?.pos === drop?.pos && cur?.horizontal === drop?.horizontal) return;
      set({ drop });
    },

    toasts: [],
    /** toast({ title, tone: 'ok'|'error'|'info', action: { label, run } }) */
    toast: (t) => {
      const id = ++toastSeq;
      set((s) => ({ toasts: [...s.toasts.slice(-3), { id, tone: "ok", ...t }] }));
      setTimeout(() => get().dismissToast(id), t.action ? 6000 : 3200);
      return id;
    },
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  };
});

export default useUi;
