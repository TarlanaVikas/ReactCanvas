import { useState } from "react";
import { ChevronRight, Trash2, ArrowUp, ArrowDown, Copy, GripVertical } from "lucide-react";
import useStore, { containsId, canDrop } from "../store/useStore";
import useUi from "../store/useUi";
import { TYPE_META, isContainer } from "../constants/catalog";
import { performDrop } from "../utils/dnd";
import "./LayersPanel.css";

const zoneFor = (e, container, isRoot) => {
  if (isRoot) return "inside";
  const r = e.currentTarget.getBoundingClientRect();
  const t = (e.clientY - r.top) / (r.height || 1);
  if (container) return t < 0.28 ? "before" : t > 0.72 ? "after" : "inside";
  return t < 0.5 ? "before" : "after";
};

const Row = ({ node, depth }) => {
  const isSel = useStore((s) => s.selectedElementId === node.id);
  const hasSel = useStore((s) => containsId(node, s.selectedElementId));
  const dropPos = useUi((s) => (s.drop?.id === node.id ? s.drop.pos : null));
  const [openState, setOpen] = useState(null);
  const isRoot = node.id === "root";
  const container = isContainer(node.type);
  const hasKids = (node.children?.length || 0) > 0;
  const open = openState ?? (depth < 2 || hasSel);
  const meta = TYPE_META[node.type] || TYPE_META.container;
  const Icon = meta.icon;
  const preview = node.content ? String(node.content).split("\n")[0].slice(0, 18) : "";

  const select = () => useStore.getState().setSelectedElement(node.id);
  const act = (fn) => (e) => {
    e.stopPropagation();
    fn(useStore.getState());
  };

  const onDragOver = (e) => {
    const { drag, setDrop } = useUi.getState();
    if (!drag) return;
    e.stopPropagation();
    const pos = zoneFor(e, container, isRoot);
    if (!canDrop(useStore.getState().layoutTree, drag.value, node.id, pos, drag.kind === "type")) {
      setDrop(null);
      return;
    }
    e.preventDefault();
    setDrop({ id: node.id, pos, horizontal: false });
  };

  return (
    <li className="layer-node" role="none">
      <div
        className={`layer-row${isSel ? " selected" : ""}${dropPos ? ` drop-${dropPos}` : ""}`}
        style={{ "--depth": depth }}
        role="treeitem"
        aria-selected={isSel}
        aria-expanded={hasKids || container ? open : undefined}
        tabIndex={0}
        draggable={!isRoot}
        onClick={select}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select();
          }
          if (e.key === "ArrowRight" && (hasKids || container)) setOpen(true);
          if (e.key === "ArrowLeft") setOpen(false);
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData("application/x-rc-move", node.id);
          e.dataTransfer.effectAllowed = "move";
          useUi.getState().setDrag({ kind: "move", value: node.id });
        }}
        onDragEnd={() => useUi.getState().setDrag(null)}
        onDragOver={onDragOver}
        onDrop={(e) => {
          const { drag, drop } = useUi.getState();
          if (!drag || !drop || drop.id !== node.id) return;
          e.preventDefault();
          e.stopPropagation();
          performDrop(node.id, drop.pos);
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          className={`layer-chevron${open ? " open" : ""}`}
          style={{ visibility: hasKids ? "visible" : "hidden" }}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <ChevronRight size={12} strokeWidth={2.4} />
        </button>
        {!isRoot && <GripVertical size={11} className="layer-grip" aria-hidden="true" />}
        <span className="layer-icon" style={{ color: meta.color }}>
          <Icon size={13} strokeWidth={2} />
        </span>
        <span className="layer-label">{meta.label}</span>
        {preview && <span className="layer-preview">{preview}</span>}
        {!isRoot && (
          <span className="layer-actions">
            <button type="button" title="Move up" aria-label="Move up" onClick={act((s) => s.moveElement(node.id, "up"))}><ArrowUp size={11} /></button>
            <button type="button" title="Move down" aria-label="Move down" onClick={act((s) => s.moveElement(node.id, "down"))}><ArrowDown size={11} /></button>
            <button type="button" title="Duplicate" aria-label="Duplicate" onClick={act((s) => s.duplicateElement(node.id))}><Copy size={11} /></button>
            <button type="button" title="Delete" aria-label="Delete" className="layer-del" onClick={act((s) => s.deleteElement(node.id))}><Trash2 size={11} /></button>
          </span>
        )}
      </div>
      {open && hasKids && (
        <ul role="group" className="layer-children">
          {node.children.map((c) => (
            <Row key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
      {open && container && !hasKids && (
        <div className="layer-empty-hint" style={{ "--depth": depth + 1 }}>
          Empty — drag a component here
        </div>
      )}
    </li>
  );
};

export default function LayersPanel() {
  const layoutTree = useStore((s) => s.layoutTree);
  return (
    <div className="layers-wrapper">
      <ul className="layers-body" role="tree" aria-label="Layers">
        <Row node={layoutTree} depth={0} />
      </ul>
    </div>
  );
}
