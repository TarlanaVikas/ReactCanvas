import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import useUi from "../store/useUi";
import "./Dialog.css";

const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
const GROUPS = [
  { title: "Edit", rows: [
    ["Undo", [mod, "Z"]], ["Redo", [mod, "Shift", "Z"]], ["Duplicate", [mod, "D"]],
    ["Delete", ["Del"]], ["Move up / down", ["Alt", "↑↓"]], ["Edit text", ["Double-click"]],
  ]},
  { title: "View", rows: [
    ["Pan", ["Space", "drag"]], ["Zoom", [mod, "scroll"]], ["Zoom in / out", [mod, "+ / −"]],
    ["Reset view", [mod, "0"]], ["Fit artboard", [mod, "Shift", "0"]], ["Hide panels", ["\\"]],
  ]},
  { title: "Studio", rows: [
    ["Command palette", [mod, "K"]], ["Preview", ["P"]], ["Export", [mod, "E"]],
    ["Select artboard", ["Esc"]], ["This list", ["?"]],
  ]},
];

export default function ShortcutsDialog() {
  const close = () => useUi.getState().setShortcutsOpen(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="dlg-overlay" onMouseDown={close}>
      <div className="dlg dlg-wide" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onMouseDown={(e) => e.stopPropagation()}>
        <div className="dlg-head">
          <h2>Keyboard shortcuts</h2>
          <button ref={ref} type="button" className="dlg-x" onClick={close} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="sc-grid">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              <dl>
                {g.rows.map(([label, keys]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{keys.map((k) => <kbd key={k}>{k}</kbd>)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
