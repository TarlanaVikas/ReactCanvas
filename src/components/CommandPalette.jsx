import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Download, Eye, Undo2, Redo2, Copy, Trash2, Moon, Layers, Maximize2, RotateCcw, Keyboard, Upload } from "lucide-react";
import useStore from "../store/useStore";
import useUi from "../store/useUi";
import { CATALOGUE } from "../constants/catalog";
import { TEMPLATES } from "../constants/templates";
import "./CommandPalette.css";

export default function CommandPalette({ actions }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const items = useMemo(() => {
    const ui = useUi.getState();
    const st = useStore.getState();
    const list = [
      { id: "export", group: "Studio", label: "Export code…", icon: Download, run: () => ui.setExportOpen(true) },
      { id: "preview", group: "Studio", label: "Toggle preview", icon: Eye, run: ui.togglePreview },
      { id: "theme", group: "Studio", label: "Switch light / dark theme", icon: Moon, run: ui.toggleTheme },
      { id: "layers", group: "Studio", label: "Show layers panel", icon: Layers, run: () => window.dispatchEvent(new Event("rc:show-layers")) },
      { id: "keys", group: "Studio", label: "Keyboard shortcuts", icon: Keyboard, run: () => ui.setShortcutsOpen(true) },
      { id: "undo", group: "Edit", label: "Undo", icon: Undo2, run: st.undo },
      { id: "redo", group: "Edit", label: "Redo", icon: Redo2, run: st.redo },
      { id: "dup", group: "Edit", label: "Duplicate selection", icon: Copy, run: () => st.duplicateElement() },
      { id: "del", group: "Edit", label: "Delete selection", icon: Trash2, run: () => st.deleteElement() },
      { id: "fit", group: "View", label: "Fit artboard to screen", icon: Maximize2, run: actions.fitView },
      { id: "reset", group: "View", label: "Reset zoom", icon: RotateCcw, run: actions.resetView },
      ...TEMPLATES.map((t) => ({ id: `tpl-${t.id}`, group: "Starters", label: `Add ${t.name.toLowerCase()}`, icon: Upload, run: () => st.addTemplate(t.id) })),
      ...CATALOGUE.flatMap((g) =>
        g.items.map((i) => ({ id: `add-${i.type}`, group: "Add component", label: `Add ${i.label.toLowerCase()}`, icon: i.icon, color: g.color, run: () => st.addComponent(i.type) })),
      ),
    ];
    const needle = q.trim().toLowerCase();
    return needle ? list.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(needle)) : list;
  }, [q, actions]);

  const close = () => useUi.getState().setPaletteOpen(false);
  const run = (item) => {
    close();
    item?.run();
  };

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(items[idx]); }
  };

  return (
    <div className="dlg-overlay cp-overlay" onMouseDown={close}>
      <div className="cp" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cp-input">
          <Search size={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={onKey}
            placeholder="Type a command or component…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-list"
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="cp-list" id="cp-list" role="listbox" ref={listRef}>
          {items.map((it, i) => (
            <li
              key={it.id}
              role="option"
              aria-selected={i === idx}
              className={i === idx ? "on" : ""}
              onMouseMove={() => setIdx(i)}
              onClick={() => run(it)}
            >
              <it.icon size={15} style={it.color ? { color: it.color } : undefined} />
              <span>{it.label}</span>
              <em>{it.group}</em>
            </li>
          ))}
          {items.length === 0 && <li className="cp-none">Nothing matches “{q}”.</li>}
        </ul>
      </div>
    </div>
  );
}
