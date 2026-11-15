import { memo, useEffect, useRef, useState } from "react";
import useStore, { canDrop } from "../store/useStore";
import useUi from "../store/useUi";
import { isContainer } from "../constants/catalog";
import { ICON_MARKUP } from "../constants/icons";
import { buildTransform, cssOnly } from "../utils/styleKeys";
import { performDrop } from "../utils/dnd";
import { TEMPLATES } from "../constants/templates";

/* ───────────────────────────────────────────────────────────
   Shared interaction layer: selection, drag source, drop target
─────────────────────────────────────────────────────────── */
const EDITABLE = new Set(["h1", "h2", "h3", "text", "label", "blockquote", "link", "button"]);

/** Decide where a dragged item would land relative to this element. */
const dropZone = (e, el, container, isRoot) => {
  if (isRoot) return { pos: "inside", horizontal: false };
  const r = el.getBoundingClientRect();
  const parent = el.parentElement && getComputedStyle(el.parentElement);
  const horizontal =
    parent && parent.display.includes("flex") && parent.flexDirection.startsWith("row");
  const t = horizontal ? (e.clientX - r.left) / (r.width || 1) : (e.clientY - r.top) / (r.height || 1);
  if (container) {
    if (t < 0.22) return { pos: "before", horizontal };
    if (t > 0.78) return { pos: "after", horizontal };
    return { pos: "inside", horizontal };
  }
  return { pos: t < 0.5 ? "before" : "after", horizontal };
};

function useNode(element) {
  const id = element.id;
  const isRoot = id === "root";
  const isSelected = useStore((s) => s.selectedElementId === id);
  const preview = useUi((s) => s.preview);
  const drop = useUi((s) => (s.drop?.id === id ? s.drop : null));
  const dropPos = drop?.pos ?? null;
  const container = isContainer(element.type);

  const props = {
    "data-node": id,
    className: `rc-node${isSelected && !preview ? " rc-sel" : ""}`,
  };
  const extraStyle = {};

  if (!preview) {
    props.onClick = (e) => {
      e.stopPropagation();
      useStore.getState().setSelectedElement(id);
    };

    if (!isRoot) {
      props.draggable = true;
      props.onDragStart = (e) => {
        e.stopPropagation();
        e.dataTransfer.setData("application/x-rc-move", id);
        e.dataTransfer.effectAllowed = "move";
        useUi.getState().setDrag({ kind: "move", value: id });
        useStore.getState().setSelectedElement(id);
      };
      props.onDragEnd = () => useUi.getState().setDrag(null);
    }

    props.onDragOver = (e) => {
      const { drag, setDrop } = useUi.getState();
      if (!drag) return;
      e.stopPropagation();
      const { pos, horizontal } = dropZone(e, e.currentTarget, container, isRoot);
      const ok = canDrop(useStore.getState().layoutTree, drag.value, id, pos, drag.kind === "type");
      if (!ok) {
        setDrop(null);
        e.dataTransfer.dropEffect = "none";
        return;
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = drag.kind === "type" ? "copy" : "move";
      setDrop({ id, pos, horizontal });
    };
    props.onDrop = (e) => {
      const { drag, drop } = useUi.getState();
      if (!drag || !drop || drop.id !== id) return;
      e.preventDefault();
      e.stopPropagation();
      performDrop(id, drop.pos);
    };
  }

  if (dropPos === "inside") {
    extraStyle.outline = "2px dashed var(--select)";
    extraStyle.outlineOffset = "-2px";
    extraStyle.backgroundImage = "linear-gradient(rgba(224,36,106,0.1), rgba(224,36,106,0.1))";
  } else if (dropPos) {
    const horizontal = drop.horizontal;
    extraStyle.boxShadow =
      dropPos === "before"
        ? horizontal ? "-3px 0 0 0 var(--select)" : "0 -3px 0 0 var(--select)"
        : horizontal ? "3px 0 0 0 var(--select)" : "0 3px 0 0 var(--select)";
  }

  return { props, extraStyle, isSelected: isSelected && !preview, preview };
}

/* ── media placeholders ───────────────────────────────────── */
const PlaceholderBox = ({ icon, label, hint, bg = "#eee5e0", dark = false }) => (
  <div
    style={{
      width: "100%", height: "100%", minHeight: 120, backgroundColor: bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, color: dark ? "#b89a99" : "#9a8582", borderRadius: "inherit", textAlign: "center", padding: 12,
    }}
  >
    {icon}
    <span style={{ fontSize: 12, fontWeight: 600, color: dark ? "#e2cfc9" : "#6a4f55" }}>{label}</span>
    {hint && <span style={{ fontSize: 10.5, color: dark ? "#b89a99" : "#9a8582" }}>{hint}</span>}
  </div>
);

const svg = (inner, size = 40, stroke = "currentColor") => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: inner }} />
);

const ImageEl = ({ element, node }) => {
  const s = element.styles || {};
  const hasSrc = s.src && s.src.trim();
  return (
    <div {...node.props}
      style={{ ...cssOnly(s), ...node.extraStyle, overflow: "hidden", display: "block", userSelect: "none", boxSizing: "border-box", ...(node.isSelected ? SEL : {}) }}>
      {hasSrc ? (
        <img src={s.src} alt={s.alt || ""} draggable={false}
          style={{ width: "100%", height: "100%", objectFit: s.objectFit || "cover", display: "block", borderRadius: "inherit" }} />
      ) : (
        <PlaceholderBox
          icon={svg('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>')}
          label="Image" hint="Paste an image URL in the Inspector" />
      )}
    </div>
  );
};

const VideoEl = ({ element, node }) => {
  const s = element.styles || {};
  const hasSrc = s.src && s.src.trim();
  return (
    <div {...node.props}
      style={{ ...cssOnly(s), ...node.extraStyle, overflow: "hidden", display: "block", userSelect: "none", boxSizing: "border-box", ...(node.isSelected ? SEL : {}) }}>
      {hasSrc ? (
        <video src={s.src} poster={s.poster} controls={s.controls !== "Hide"}
          autoPlay={s.autoplay === "On"} loop={s.loop === "On"} muted={s.muted === "On"}
          style={{ width: "100%", height: "100%", display: "block", borderRadius: "inherit", backgroundColor: "#000", pointerEvents: node.preview ? "auto" : "none" }} />
      ) : (
        <PlaceholderBox bg="#2b0e15" dark
          icon={svg('<polygon points="5 3 19 12 5 21 5 3"/>', 44, "#e0246a")}
          label="Video player" hint="Paste a video URL in the Inspector" />
      )}
    </div>
  );
};

const AudioEl = ({ element, node }) => {
  const s = element.styles || {};
  const hasSrc = s.src && s.src.trim();
  return (
    <div {...node.props} style={{ ...cssOnly(s), ...node.extraStyle, userSelect: "none", boxSizing: "border-box", ...(node.isSelected ? SEL : {}) }}>
      {hasSrc ? (
        <audio src={s.src} controls={s.controls !== "Hide"} loop={s.loop === "On"} autoPlay={s.autoplay === "On"}
          style={{ width: "100%", pointerEvents: node.preview ? "auto" : "none" }} />
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", backgroundColor: "#f3ebe7", borderRadius: s.borderRadius || 8, border: "1px solid #e0d2cc", width: "100%", boxSizing: "border-box" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#b3194d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3" /></svg>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b2229" }}>Audio player</div>
            <div style={{ height: 4, backgroundColor: "#dccdc7", borderRadius: 2 }}>
              <div style={{ width: "35%", height: "100%", backgroundColor: "#b3194d", borderRadius: 2 }} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#9a8582", flexShrink: 0 }}>0:00</span>
        </div>
      )}
    </div>
  );
};

const IframeEl = ({ element, node }) => {
  const s = element.styles || {};
  const hasSrc = s.src && s.src.trim();
  return (
    <div {...node.props}
      style={{ ...cssOnly(s), ...node.extraStyle, overflow: "hidden", userSelect: "none", boxSizing: "border-box", ...(node.isSelected ? SEL : {}) }}>
      {hasSrc ? (
        <iframe src={s.src} title={s.title || "Embedded content"} sandbox={s.sandbox && s.sandbox !== "none" ? s.sandbox : undefined}
          style={{ width: "100%", height: "100%", border: "none", display: "block", pointerEvents: node.preview ? "auto" : "none" }} />
      ) : (
        <PlaceholderBox
          icon={svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>')}
          label="Embedded page" hint="Paste a page URL in the Inspector" />
      )}
    </div>
  );
};

/* ── data elements ────────────────────────────────────────── */
const TableEl = ({ element, node }) => {
  const s = element.styles || {};
  const headers = (element.tableHeaders || "Col 1,Col 2,Col 3").split(",").map((h) => h.trim());
  const rows = Math.max(0, parseInt(element.tableRows) || 3);
  const data = element.tableData || [];
  return (
    <div {...node.props} style={{ ...node.extraStyle, userSelect: "none", overflowX: "auto", ...(node.isSelected ? SEL : {}) }}>
      <table style={{ ...cssOnly(s), borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "8px 12px", backgroundColor: "#f3ebe7", borderBottom: "2px solid #e0d2cc", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#3b2229", whiteSpace: "nowrap" }}>{h || `Col ${i + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? "#fff" : "#faf5f2" }}>
              {headers.map((_, ci) => (
                <td key={ci} style={{ padding: "8px 12px", borderBottom: "1px solid #ebdfd9", fontSize: 13, color: s.color || "#3b2229" }}>
                  {data[ri]?.[ci] || <span style={{ color: "#cdbdb8" }}>—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ToggleLike = ({ element, node, kind }) => {
  const s = element.styles || {};
  const initial = s.checked === "Checked";
  const [live, setLive] = useState(null); // preview-only local state
  const checked = node.preview && live !== null ? live : initial;
  const accent = s.accentColor || "#b3194d";
  const toggle = () => node.preview && setLive(!checked);
  return (
    <label {...node.props} onClick={node.preview ? toggle : node.props.onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 4px", userSelect: "none", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      {kind === "checkbox" ? (
        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${accent}`, backgroundColor: checked ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
          {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5 5 4 7.5 8.5 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      ) : (
        <div style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: checked ? accent : "#d6c7c0", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff", position: "absolute", top: 3, left: checked ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
        </div>
      )}
      <span style={{ fontSize: s.fontSize || 14, color: s.color || "#333", lineHeight: 1.4 }}>{element.content || (kind === "checkbox" ? "Checkbox" : "Toggle")}</span>
    </label>
  );
};

const ListEl = ({ element, node }) => {
  const s = element.styles || {};
  const items = (element.content || "").split("\n").filter(Boolean);
  const Tag = element.type === "ol" ? "ol" : "ul";
  return (
    <Tag {...node.props}
      style={{ ...cssOnly(s), userSelect: "none", margin: 0,
        listStyleType: s.listStyleType || (element.type === "ol" ? "decimal" : "disc"),
        paddingLeft: s.paddingLeft || "28px", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      {items.length === 0 ? (
        <li style={{ color: "#9a8582", fontStyle: "italic", listStyleType: "none" }}>Empty list — add items in the Inspector</li>
      ) : (
        items.map((item, i) => (
          <li key={i} style={{ marginBottom: 4, lineHeight: s.lineHeight || 1.7, color: s.color || "#333333", fontSize: s.fontSize || "15px" }}>{item}</li>
        ))
      )}
    </Tag>
  );
};

const CodeEl = ({ element, node }) => {
  const s = element.styles || {};
  const lines = (element.content || "").split("\n");
  return (
    <div {...node.props}
      style={{ ...cssOnly(s), userSelect: "none", fontFamily: "monospace", whiteSpace: "pre", overflowX: "auto",
        backgroundColor: s.backgroundColor || "#1e1e2e", padding: s.padding || "16px",
        borderRadius: s.borderRadius || "8px", display: "block", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: 16 }}>
          <span style={{ color: "#525974", minWidth: 24, textAlign: "right", userSelect: "none", fontSize: "0.85em", flexShrink: 0 }}>{i + 1}</span>
          <span style={{ color: s.color || "#cdd6f4" }}>{line || " "}</span>
        </div>
      ))}
    </div>
  );
};

/* ── form controls ────────────────────────────────────────── */
const SelectEl = ({ element, node }) => {
  const s = element.styles || {};
  const options = (element.content || "").split("\n").filter(Boolean);
  return (
    <select {...node.props}
      style={{ ...cssOnly(s), userSelect: "none", appearance: "auto", ...node.extraStyle, ...(node.isSelected ? SEL : {}), pointerEvents: node.preview ? "auto" : "none" }}>
      {options.length === 0 ? <option>No options — add some in the Inspector</option> : options.map((opt, i) => <option key={i}>{opt.trim()}</option>)}
    </select>
  );
};

const DividerEl = ({ element, node }) => {
  const s = element.styles || {};
  return (
    <div {...node.props} style={{ padding: "4px 0", userSelect: "none", width: s.width || "100%", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      <hr style={{ margin: 0, border: "none", borderTopWidth: s.height || "1px", borderTopStyle: "solid", borderTopColor: s.backgroundColor || "#ebdfd9", width: "100%" }} />
    </div>
  );
};

const InputEl = ({ element, node }) => {
  const s = element.styles || {};
  return (
    <div {...node.props} style={{ display: "block", userSelect: "none", width: s.width || "100%", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      <input type={element.inputType || "text"} placeholder={element.content || "Text input…"} readOnly={!node.preview} tabIndex={node.preview ? 0 : -1}
        style={{ ...cssOnly(s), outline: "none", boxSizing: "border-box", pointerEvents: node.preview ? "auto" : "none", width: "100%" }} />
    </div>
  );
};

const TextareaEl = ({ element, node }) => {
  const s = element.styles || {};
  return (
    <div {...node.props} style={{ userSelect: "none", width: s.width || "100%", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
      <textarea placeholder={element.content || "Textarea…"} readOnly={!node.preview} rows={parseInt(s.rows) || undefined} tabIndex={node.preview ? 0 : -1}
        style={{ ...cssOnly(s), outline: "none", boxSizing: "border-box", pointerEvents: node.preview ? "auto" : "none", width: "100%" }} />
    </div>
  );
};

const EmptyArtboard = () => (
  <div className="empty-art" onClick={(e) => e.stopPropagation()}>
    <h2>A blank artboard. Start anywhere.</h2>
    <p>Drag a component from the left panel, double-click text to edit it, or begin from a ready-made layout.</p>
    <ul>
      {TEMPLATES.map((t) => (
        <li key={t.id}>
          <button type="button" onClick={() => useStore.getState().addTemplate(t.id)}>
            <strong>{t.name}</strong>
            <small>{t.blurb}</small>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const SEL = { outline: "2px solid var(--select)", outlineOffset: "-2px" };

/* ── inline text editing (double-click) ───────────────────── */
const TextNode = ({ element, tag, composed, node }) => {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!editing || !ref.current) return;
    const el = ref.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [editing]);

  const finish = (commit) => {
    const el = ref.current;
    setEditing(false);
    if (commit && el) {
      const text = el.innerText.replace(/\u00a0/g, " ");
      if (text !== (element.content || "")) {
        const store = useStore.getState();
        store.setSelectedElement(element.id);
        store.updateContent(text);
      }
    } else if (el) {
      el.innerText = element.content || "";
    }
  };

  const Comp = tag;
  return (
    <Comp
      {...node.props}
      ref={ref}
      draggable={editing ? false : node.props.draggable}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={(e) => {
        if (node.preview) return;
        e.stopPropagation();
        setEditing(true);
      }}
      onBlur={() => editing && finish(true)}
      onKeyDown={(e) => {
        if (!editing) return;
        e.stopPropagation();
        if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
        } else if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          finish(true);
        }
      }}
      style={{
        ...composed,
        userSelect: editing ? "text" : "none",
        cursor: editing ? "text" : composed.cursor,
        ...(editing ? { outline: "2px solid var(--select)", outlineOffset: "2px" } : {}),
      }}
    >
      {element.content || null}
    </Comp>
  );
};

/* ───────────────────────────────────────────────────────────
   MAIN StudioElement
─────────────────────────────────────────────────────────── */
const TAG_MAP = {
  h1: "h1", h2: "h2", h3: "h3", text: "p", label: "label", button: "button", link: "a",
  nav: "nav", section: "section", blockquote: "blockquote", flex: "div", grid: "div",
  card: "div", "form-group": "div", spacer: "div", container: "div",
};

const StudioElement = memo(function StudioElement({ element }) {
  const node = useNode(element);

  switch (element.type) {
    case "image": return <ImageEl element={element} node={node} />;
    case "video": return <VideoEl element={element} node={node} />;
    case "audio": return <AudioEl element={element} node={node} />;
    case "iframe": return <IframeEl element={element} node={node} />;
    case "table": return <TableEl element={element} node={node} />;
    case "checkbox": return <ToggleLike element={element} node={node} kind="checkbox" />;
    case "toggle": return <ToggleLike element={element} node={node} kind="toggle" />;
    case "ul":
    case "ol": return <ListEl element={element} node={node} />;
    case "code": return <CodeEl element={element} node={node} />;
    case "select": return <SelectEl element={element} node={node} />;
    case "divider": return <DividerEl element={element} node={node} />;
    case "input": return <InputEl element={element} node={node} />;
    case "textarea": return <TextareaEl element={element} node={node} />;
    case "icon": {
      const s = element.styles || {};
      const sz = parseInt(s.width) || 40;
      const markup = ICON_MARKUP[element.content] || ICON_MARKUP.Star;
      return (
        <div {...node.props}
          style={{ ...cssOnly(s), display: "inline-flex", alignItems: "center", justifyContent: "center", userSelect: "none", ...node.extraStyle, ...(node.isSelected ? SEL : {}) }}>
          <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={s.color || "currentColor"}
            strokeWidth={parseFloat(s.strokeWidth) || 1.8} strokeLinecap="round" strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: markup }} />
        </div>
      );
    }
    default:
  }

  const Tag = TAG_MAP[element.type] || "div";
  const s = element.styles || {};
  const transform = buildTransform(s);
  const composed = {
    ...cssOnly(s),
    ...(transform ? { transform } : {}),
    ...node.extraStyle,
    ...(node.isSelected ? SEL : {}),
    userSelect: "none",
  };

  if (EDITABLE.has(element.type)) {
    return <TextNode element={element} tag={Tag} composed={composed} node={node} />;
  }

  const container = isContainer(element.type);
  const isEmpty = container && !element.children?.length;

  return (
    <Tag {...node.props} style={composed}>
      {element.content || null}
      {isEmpty && !node.preview && (element.id === "root" ? <EmptyArtboard /> : <div className="rc-hint">Drop components here</div>)}
      {element.children?.map((child) => <StudioElement key={child.id} element={child} />)}
    </Tag>
  );
});

export default StudioElement;
