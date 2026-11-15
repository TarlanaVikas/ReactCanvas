import { useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, Download, Trash2, PanelLeft, PanelRight, Eye, EyeOff,
  Sun, Moon, Command, Monitor, Tablet, Smartphone, Check, Keyboard, ArrowLeft,
} from "lucide-react";
import useStore from "../store/useStore";
import useUi from "../store/useUi";
import "./TopBar.css";

const FRAMES = [
  { id: "desktop", label: "Desktop", width: "960px", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobile", width: "390px", icon: Smartphone },
];

function ProjectName() {
  const name = useStore((s) => s.projectName);
  const setName = useStore((s) => s.setProjectName);
  const [draft, setDraft] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (draft !== null) inputRef.current?.select();
  }, [draft]);

  const commit = () => {
    if (draft !== null) setName(draft);
    setDraft(null);
  };

  return draft === null ? (
    <button type="button" className="tb-name" onClick={() => setDraft(name)} title="Rename project">
      {name}
    </button>
  ) : (
    <input
      ref={inputRef}
      className="tb-name-input"
      value={draft}
      maxLength={60}
      aria-label="Project name"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(null);
      }}
    />
  );
}

function SaveState() {
  const lastSaved = useStore((s) => s.lastSaved);
  // Re-keying restarts the CSS pulse each time the document is written.
  return (
    <span className="tb-saved" title="Your work is saved in this browser automatically">
      <Check size={12} strokeWidth={2.6} key={lastSaved} className={lastSaved ? "tb-saved-tick" : ""} />
      Saved locally
    </span>
  );
}

export default function TopBar({ left, right, onToggleLeft, onToggleRight, onExit }) {
  const historyIndex = useStore((s) => s.historyIndex);
  const historyLen = useStore((s) => s.history.length);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const clearCanvas = useStore((s) => s.clearCanvas);
  const rootWidth = useStore((s) => s.layoutTree.styles?.width);
  const preview = useUi((s) => s.preview);
  const theme = useUi((s) => s.theme);
  const { togglePreview, toggleTheme, setPaletteOpen, setExportOpen, setShortcutsOpen, toast } = useUi.getState();

  const setFrame = (frame) => {
    const st = useStore.getState();
    const prev = st.selectedElementId;
    st.setSelectedElement("root");
    st.updateStyles({ width: frame.width });
    st.setSelectedElement(prev);
    toast({ title: `${frame.label} frame`, detail: frame.width, tone: "info" });
    requestAnimationFrame(() => window.dispatchEvent(new Event("rc:fit")));
  };

  const onClear = () => {
    clearCanvas();
    toast({ title: "Canvas cleared", tone: "info", action: { label: "Undo", run: () => useStore.getState().undo() } });
  };

  return (
    <header className="topbar">
      <div className="tb-left">
        <button type="button" className="tb-brand" onClick={onExit} title="Back to the home page">
          <span className="tb-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <rect x="3" y="3" width="26" height="26" fill="currentColor" />
              <circle cx="20.5" cy="20.5" r="8" fill="var(--pop)" />
              <rect x="7" y="7" width="9" height="9" fill="var(--accent-ink)" />
            </svg>
          </span>
          <span className="tb-brand-name">ReactCanvas</span>
          <ArrowLeft size={13} className="tb-brand-back" aria-hidden="true" />
        </button>
        <span className="tb-slash" aria-hidden="true">/</span>
        <ProjectName />
        <SaveState />
      </div>

      <div className="tb-center">
        <div className="tb-seg" role="group" aria-label="History">
          <button type="button" className="tb-ic" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" aria-label="Undo">
            <Undo2 size={15} />
          </button>
          <button type="button" className="tb-ic" onClick={redo} disabled={historyIndex >= historyLen - 1} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">
            <Redo2 size={15} />
          </button>
        </div>
        <div className="tb-seg" role="group" aria-label="Frame size">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`tb-ic${rootWidth === f.width ? " on" : ""}`}
              onClick={() => setFrame(f)}
              title={`${f.label} frame · ${f.width}`}
              aria-label={`${f.label} frame`}
              aria-pressed={rootWidth === f.width}
            >
              <f.icon size={15} />
            </button>
          ))}
        </div>
        <button type="button" className="tb-ic danger" onClick={onClear} title="Clear the artboard" aria-label="Clear the artboard">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="tb-right">
        <button type="button" className={`tb-ic${left ? " on" : ""}`} onClick={onToggleLeft} title="Components & layers" aria-label="Toggle left panel" aria-pressed={left}>
          <PanelLeft size={15} />
        </button>
        <button type="button" className={`tb-ic${right ? " on" : ""}`} onClick={onToggleRight} title="Inspector" aria-label="Toggle inspector" aria-pressed={right}>
          <PanelRight size={15} />
        </button>
        <span className="tb-sep" aria-hidden="true" />
        <button type="button" className="tb-ic" onClick={() => setPaletteOpen(true)} title="Command palette (Ctrl+K)" aria-label="Open command palette">
          <Command size={15} />
        </button>
        <button type="button" className="tb-ic" onClick={() => setShortcutsOpen(true)} title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">
          <Keyboard size={15} />
        </button>
        <button type="button" className="tb-ic" onClick={toggleTheme} title={theme === "dark" ? "Switch to light" : "Switch to dark"} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button type="button" className={`tb-btn${preview ? " on" : ""}`} onClick={togglePreview} title="Preview (P)" aria-pressed={preview}>
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>Preview</span>
        </button>
        <button type="button" className="tb-btn primary" onClick={() => setExportOpen(true)} title="Export (Ctrl+E)">
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
