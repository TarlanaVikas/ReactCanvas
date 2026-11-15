import { useState, useRef, useCallback, useEffect } from "react";
import { Minus, Plus, Maximize2, RotateCcw, Hand, X } from "lucide-react";
import useStore, { DEFAULT_CANVAS_BG, DEFAULT_DOT_COLOR } from "./store/useStore";
import useUi from "./store/useUi";
import TopBar from "./components/TopBar";
import Library from "./components/Library";
import LayersPanel from "./components/LayersPanel";
import Inspector from "./components/Inspector";
import StudioElement from "./components/StudioElement";
import ExportModal from "./components/ExportModal";
import CommandPalette from "./components/CommandPalette";
import ShortcutsDialog from "./components/ShortcutsDialog";
import { keyframesCSS } from "./constants/motion";
import "./Studio.css";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const HOME_OFFSET = { x: 80, y: 80 };
const CONTENT_PAD = 160; // matches .canvas-content padding

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const isTyping = (t) =>
  !!t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable);

export default function Studio({ onExit }) {
  const layoutTree = useStore((s) => s.layoutTree);
  const canvasBg = useStore((s) => s.canvasBg);
  const canvasDotColor = useStore((s) => s.canvasDotColor);
  const preview = useUi((s) => s.preview);
  const theme = useUi((s) => s.theme);
  const exportOpen = useUi((s) => s.exportOpen);
  const paletteOpen = useUi((s) => s.paletteOpen);
  const shortcutsOpen = useUi((s) => s.shortcutsOpen);

  /* panels — closed by default on small screens */
  const narrow = typeof window !== "undefined" && window.innerWidth < 960;
  const [showLeft, setShowLeft] = useState(!narrow);
  const [showRight, setShowRight] = useState(!narrow);
  const [leftTab, setLeftTab] = useState("add");

  /* zoom / pan live in refs so dragging never triggers React renders */
  const zoomRef = useRef(1);
  const offsetRef = useRef({ ...HOME_OFFSET });
  const viewportRef = useRef(null);
  const transformRef = useRef(null);
  const bgLayerRef = useRef(null);
  const glowRef = useRef(null);
  const zoomLabelRef = useRef(null);
  const isPanning = useRef(false);
  const spaceHeld = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset0 = useRef({ x: 0, y: 0 });
  const rafGlow = useRef(0);

  const commit = useCallback(() => {
    const z = zoomRef.current;
    const { x, y } = offsetRef.current;
    if (transformRef.current) transformRef.current.style.transform = `translate(${x}px,${y}px) scale(${z})`;
    if (bgLayerRef.current) {
      const size = 24 * z;
      const bx = ((x % size) + size) % size;
      const by = ((y % size) + size) % size;
      bgLayerRef.current.style.backgroundSize = `${size}px ${size}px`;
      bgLayerRef.current.style.backgroundPosition = `${bx}px ${by}px`;
      if (glowRef.current) {
        glowRef.current.style.backgroundSize = `${size}px ${size}px`;
        glowRef.current.style.backgroundPosition = `${bx}px ${by}px`;
      }
    }
    if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(z * 100)}%`;
  }, []);

  const doZoom = useCallback(
    (nextZ, fx, fy) => {
      const prevZ = zoomRef.current;
      nextZ = clamp(nextZ, MIN_ZOOM, MAX_ZOOM);
      const k = nextZ / prevZ;
      const { x, y } = offsetRef.current;
      offsetRef.current = { x: fx - (fx - x) * k, y: fy - (fy - y) * k };
      zoomRef.current = nextZ;
      commit();
    },
    [commit],
  );

  const centerFocal = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return { fx: 400, fy: 300 };
    const r = vp.getBoundingClientRect();
    return { fx: r.width / 2, fy: r.height / 2 };
  }, []);

  const zoomIn = useCallback(() => { const { fx, fy } = centerFocal(); doZoom(zoomRef.current + ZOOM_STEP, fx, fy); }, [doZoom, centerFocal]);
  const zoomOut = useCallback(() => { const { fx, fy } = centerFocal(); doZoom(zoomRef.current - ZOOM_STEP, fx, fy); }, [doZoom, centerFocal]);
  const zoomTo = useCallback((v) => { const { fx, fy } = centerFocal(); doZoom(parseFloat(v), fx, fy); }, [doZoom, centerFocal]);
  const resetView = useCallback(() => {
    zoomRef.current = 1;
    offsetRef.current = { ...HOME_OFFSET };
    commit();
  }, [commit]);

  /** Fit the artboard's width into the viewport and centre it. */
  const fitView = useCallback(() => {
    const vp = viewportRef.current;
    const art = transformRef.current?.querySelector('[data-node="root"]');
    if (!vp || !art) return;
    const r = vp.getBoundingClientRect();
    const w = art.offsetWidth || 960;
    const z = clamp((r.width - 96) / w, MIN_ZOOM, 1.5);
    zoomRef.current = z;
    offsetRef.current = { x: (r.width - w * z) / 2 - CONTENT_PAD * z, y: 28 - CONTENT_PAD * z };
    commit();
  }, [commit]);

  /* wheel: Ctrl/⌘ zooms, plain scroll pans */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;
      if (e.ctrlKey || e.metaKey) {
        const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        doZoom(zoomRef.current + (px > 0 ? -ZOOM_STEP : ZOOM_STEP), fx, fy);
      } else {
        offsetRef.current = { x: offsetRef.current.x - e.deltaX, y: offsetRef.current.y - e.deltaY };
        commit();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [doZoom, commit]);

  const isBackground = (t) => t === viewportRef.current || t.dataset?.bg === "true";

  const startPan = useCallback((e) => {
    const should =
      e.button === 1 ||
      (e.button === 0 && (e.altKey || spaceHeld.current || isBackground(e.target)));
    if (!should) return;
    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOffset0.current = { ...offsetRef.current };
    viewportRef.current.classList.add("panning");
  }, []);

  const movePan = useCallback(
    (e) => {
      if (isPanning.current) {
        offsetRef.current = {
          x: panOffset0.current.x + (e.clientX - panStart.current.x),
          y: panOffset0.current.y + (e.clientY - panStart.current.y),
        };
        commit();
      }
      // cursor-following glow on the dot grid
      if (glowRef.current && !rafGlow.current) {
        const { clientX, clientY } = e;
        rafGlow.current = requestAnimationFrame(() => {
          rafGlow.current = 0;
          const r = viewportRef.current?.getBoundingClientRect();
          if (!r || !glowRef.current) return;
          glowRef.current.style.setProperty("--mx", `${clientX - r.left}px`);
          glowRef.current.style.setProperty("--my", `${clientY - r.top}px`);
        });
      }
    },
    [commit],
  );

  const endPan = useCallback(() => {
    isPanning.current = false;
    viewportRef.current?.classList.remove("panning");
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafGlow.current), []);

  /* Space = hand tool */
  useEffect(() => {
    const dn = (e) => {
      if (e.code === "Space" && !isTyping(e.target)) {
        e.preventDefault();
        spaceHeld.current = true;
        viewportRef.current?.classList.add("hand");
      }
    };
    const up = (e) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
        viewportRef.current?.classList.remove("hand");
      }
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      const ui = useUi.getState();
      const st = useStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === "k") {
        e.preventDefault();
        ui.setPaletteOpen(!ui.paletteOpen);
        return;
      }
      if (e.key === "Escape") {
        if (ui.paletteOpen) return ui.setPaletteOpen(false);
        if (ui.shortcutsOpen) return ui.setShortcutsOpen(false);
        if (ui.exportOpen) return ui.setExportOpen(false);
        if (ui.preview) return ui.setPreview(false);
        if (!isTyping(e.target)) st.setSelectedElement("root");
        return;
      }
      if (isTyping(e.target) || ui.paletteOpen || ui.exportOpen || ui.shortcutsOpen) return;

      if (mod && key === "z") { e.preventDefault(); e.shiftKey ? st.redo() : st.undo(); return; }
      if (mod && key === "y") { e.preventDefault(); st.redo(); return; }
      if (mod && key === "d") { e.preventDefault(); st.duplicateElement(); return; }
      if (mod && key === "e") { e.preventDefault(); ui.setExportOpen(true); return; }
      if (mod && (e.key === "=" || e.key === "+")) { e.preventDefault(); zoomIn(); return; }
      if (mod && e.key === "-") { e.preventDefault(); zoomOut(); return; }
      if (mod && e.key === "0") { e.preventDefault(); e.shiftKey ? fitView() : resetView(); return; }
      if (mod) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (st.selectedElementId !== "root") {
          e.preventDefault();
          st.deleteElement();
        }
      } else if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        st.moveElement(st.selectedElementId, "up");
      } else if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        st.moveElement(st.selectedElementId, "down");
      } else if (key === "p") {
        ui.togglePreview();
      } else if (e.key === "\\") {
        const both = showLeft || showRight;
        setShowLeft(!both);
        setShowRight(!both);
      } else if (e.key === "?") {
        ui.setShortcutsOpen(true);
      } else if (key === "f" && e.shiftKey) {
        fitView();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, resetView, fitView, showLeft, showRight]);

  // Frame the artboard on first paint
  useEffect(() => {
    fitView();
  }, [fitView]);

  useEffect(() => {
    window.addEventListener("rc:fit", fitView);
    return () => window.removeEventListener("rc:fit", fitView);
  }, [fitView]);

  /* Pick a layer from the palette → reveal it in the layers tab */
  useEffect(() => {
    const onReveal = () => {
      setShowLeft(true);
      setLeftTab("layers");
    };
    window.addEventListener("rc:show-layers", onReveal);
    return () => window.removeEventListener("rc:show-layers", onReveal);
  }, []);

  const onCanvasClick = useCallback((e) => {
    if (isBackground(e.target)) useStore.getState().setSelectedElement("root");
  }, []);

  const bgColor = theme === "dark" && canvasBg === DEFAULT_CANVAS_BG ? "#120609" : canvasBg;
  const dotColor = theme === "dark" && canvasDotColor === DEFAULT_DOT_COLOR ? "rgba(189,220,132,0.2)" : canvasDotColor;
  const dotStyle = {
    backgroundColor: bgColor,
    backgroundImage: `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)`,
  };

  const closePanels = () => {
    setShowLeft(false);
    setShowRight(false);
  };

  return (
    <div className={`app-shell${preview ? " is-preview" : ""}`}>
      <style>{keyframesCSS()}</style>

      <TopBar
        left={showLeft}
        right={showRight}
        onToggleLeft={() => setShowLeft((v) => !v)}
        onToggleRight={() => setShowRight((v) => !v)}
        onExit={onExit}
      />

      <div className="app-body">
        {(showLeft || showRight) && <button type="button" className="dock-scrim" onClick={closePanels} aria-label="Close panels" />}

        <aside className={`dock dock-left${showLeft && !preview ? " open" : ""}`} aria-label="Components and layers" inert={!showLeft || preview}>
          <div className="dock-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={leftTab === "add"} className={leftTab === "add" ? "on" : ""} onClick={() => setLeftTab("add")}>Add</button>
            <button type="button" role="tab" aria-selected={leftTab === "layers"} className={leftTab === "layers" ? "on" : ""} onClick={() => setLeftTab("layers")}>Layers</button>
            <button type="button" className="dock-close" onClick={() => setShowLeft(false)} aria-label="Close panel"><X size={14} /></button>
          </div>
          <div className="dock-body">{leftTab === "add" ? <Library /> : <LayersPanel />}</div>
        </aside>

        <main
          className="canvas-vp"
          ref={viewportRef}
          data-bg="true"
          onMouseDown={startPan}
          onMouseMove={movePan}
          onMouseUp={endPan}
          onMouseLeave={endPan}
          onClick={onCanvasClick}
          onScroll={(e) => {
            // focus on editable text can scroll this overflow:hidden box; keep it pinned
            e.currentTarget.scrollTop = 0;
            e.currentTarget.scrollLeft = 0;
          }}
          aria-label="Canvas"
        >
          <div ref={bgLayerRef} className="canvas-bg" style={dotStyle} aria-hidden="true" />
          <div
            ref={glowRef}
            className="canvas-glow"
            aria-hidden="true"
            style={{ backgroundImage: `radial-gradient(circle, var(--select) 1.6px, transparent 1.7px)` }}
          />
          <div ref={transformRef} className="canvas-content" data-bg="true">
            <StudioElement element={layoutTree} />
          </div>

          <div className="zoom-dock" role="group" aria-label="Zoom">
            <button type="button" onClick={zoomOut} title="Zoom out (Ctrl −)" aria-label="Zoom out"><Minus size={14} /></button>
            <label className="zoom-pick" title="Zoom level">
              <span ref={zoomLabelRef}>100%</span>
              <select
                aria-label="Zoom preset"
                value=""
                onChange={(e) => e.target.value && zoomTo(e.target.value)}
              >
                <option value="" disabled>Zoom</option>
                {ZOOM_PRESETS.map((p) => (
                  <option key={p} value={p}>{Math.round(p * 100)}%</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={zoomIn} title="Zoom in (Ctrl +)" aria-label="Zoom in"><Plus size={14} /></button>
            <span className="zoom-sep" aria-hidden="true" />
            <button type="button" onClick={fitView} title="Fit artboard (Ctrl Shift 0)" aria-label="Fit artboard to screen"><Maximize2 size={14} /></button>
            <button type="button" onClick={resetView} title="Reset view (Ctrl 0)" aria-label="Reset view"><RotateCcw size={14} /></button>
          </div>

          <p className="canvas-hint"><Hand size={12} aria-hidden="true" /> Hold <kbd>Space</kbd> and drag to pan · <kbd>Ctrl</kbd> + scroll to zoom</p>

          {preview && (
            <button type="button" className="preview-exit" onClick={() => useUi.getState().setPreview(false)}>
              Exit preview <kbd>Esc</kbd>
            </button>
          )}
        </main>

        <aside className={`dock dock-right${showRight && !preview ? " open" : ""}`} aria-label="Inspector" inert={!showRight || preview}>
          <div className="dock-body"><Inspector /></div>
        </aside>
      </div>

      {exportOpen && <ExportModal onClose={() => useUi.getState().setExportOpen(false)} />}
      {paletteOpen && <CommandPalette actions={{ fitView, resetView, zoomIn, zoomOut }} />}
      {shortcutsOpen && <ShortcutsDialog />}
    </div>
  );
}
