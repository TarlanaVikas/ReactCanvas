import { useMemo, useRef, useState, useEffect } from "react";
import { X, Copy, Download, Check, FileCode, Archive, FileJson, FolderOpen } from "lucide-react";
import useStore from "../store/useStore";
import useUi from "../store/useUi";
import { generateJSX, generateCSS, generateProjectFiles, serializeDesign, parseDesign } from "../utils/codegen";
import { createZip } from "../utils/zip";
import { highlight } from "../utils/highlight";
import "./Dialog.css";
import "./ExportModal.css";

const saveBlob = (filename, data, type) => {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const fileSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "reactcanvas";

export default function ExportModal({ onClose }) {
  const layoutTree = useStore((s) => s.layoutTree);
  const projectName = useStore((s) => s.projectName);
  const canvasBg = useStore((s) => s.canvasBg);
  const canvasDotColor = useStore((s) => s.canvasDotColor);
  const loadDocument = useStore((s) => s.loadDocument);
  const toast = useUi((s) => s.toast);
  const [tab, setTab] = useState("jsx");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  const jsx = useMemo(() => generateJSX(layoutTree), [layoutTree]);
  const css = useMemo(() => generateCSS(layoutTree), [layoutTree]);
  const code = tab === "jsx" ? jsx : css;
  const html = useMemo(() => highlight(code, tab), [code, tab]);
  const count = (layoutTree.children?.length ?? 0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast({ title: `${tab === "jsx" ? "App.jsx" : "App.css"} copied`, tone: "ok" });
    } catch {
      toast({ title: "Couldn’t copy", detail: "Your browser blocked clipboard access. Select the code and copy manually.", tone: "error" });
    }
  };

  const downloadFile = () => {
    saveBlob(tab === "jsx" ? "App.jsx" : "App.css", code, "text/plain");
    toast({ title: `${tab === "jsx" ? "App.jsx" : "App.css"} downloaded`, tone: "ok" });
  };

  const downloadProject = () => {
    const zip = createZip(generateProjectFiles(layoutTree, projectName));
    saveBlob(`${fileSlug(projectName)}.zip`, zip, "application/zip");
    toast({ title: "Project downloaded", detail: "A ready-to-run Vite + React app.", tone: "ok" });
  };

  const saveDesign = () => {
    saveBlob(
      `${fileSlug(projectName)}.reactcanvas.json`,
      serializeDesign({ tree: layoutTree, name: projectName, canvasBg, canvasDotColor }),
      "application/json",
    );
    toast({ title: "Design file saved", detail: "Open it later from this dialog.", tone: "ok" });
  };

  const openDesign = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      loadDocument(parseDesign(await file.text()));
      toast({ title: `Opened ${file.name}`, tone: "ok", action: { label: "Undo", run: () => useStore.getState().undo() } });
      onClose();
    } catch (err) {
      toast({ title: "Couldn’t open that file", detail: err.message, tone: "error" });
    }
  };

  return (
    <div className="dlg-overlay" onMouseDown={onClose}>
      <div className="dlg ex" role="dialog" aria-modal="true" aria-label="Export" onMouseDown={(e) => e.stopPropagation()}>
        <div className="dlg-head">
          <div>
            <h2>Export</h2>
            <p className="ex-sub">{projectName} · {count} top-level {count === 1 ? "element" : "elements"}</p>
          </div>
          <button ref={closeRef} type="button" className="dlg-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="ex-actions">
          <button type="button" className="ex-card primary" onClick={downloadProject}>
            <Archive size={18} />
            <span><strong>Download project</strong><small>Runnable Vite + React app (.zip)</small></span>
          </button>
          <button type="button" className="ex-card" onClick={saveDesign}>
            <FileJson size={18} />
            <span><strong>Save design file</strong><small>Reopen and keep editing later</small></span>
          </button>
          <button type="button" className="ex-card" onClick={() => fileRef.current?.click()}>
            <FolderOpen size={18} />
            <span><strong>Open design file</strong><small>Replaces the current artboard</small></span>
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={openDesign} />
        </div>

        <div className="ex-tabs" role="tablist">
          {[["jsx", "App.jsx"], ["css", "App.css"]].map(([id, name]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
              <FileCode size={13} /> {name}
            </button>
          ))}
          <span className="ex-spacer" />
          <button type="button" className={`ex-mini${copied ? " ok" : ""}`} onClick={copy}>
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
          <button type="button" className="ex-mini" onClick={downloadFile}>
            <Download size={13} /> {tab === "jsx" ? "App.jsx" : "App.css"}
          </button>
        </div>

        <div className="ex-code">
          <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
        </div>
        <div className="ex-foot">
          <span>One class per element · keyframes included only when used</span>
          <span>{code.split("\n").length} lines</span>
        </div>
      </div>
    </div>
  );
}
