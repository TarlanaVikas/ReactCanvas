import { useMemo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import useStore from "../store/useStore";
import { CATALOGUE } from "../constants/catalog";
import { TEMPLATES } from "../constants/templates";
import { startTypeDrag, endDrag } from "../utils/dnd";
import useUi from "../store/useUi";
import "./Library.css";

export default function Library() {
  const [query, setQuery] = useState("");
  const addComponent = useStore((s) => s.addComponent);
  const addTemplate = useStore((s) => s.addTemplate);
  const toast = useUi((s) => s.toast);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOGUE;
    return CATALOGUE.map((g) => ({
      ...g,
      items: g.items.filter((i) =>
        [i.label, i.short, i.type, i.hint].some((t) => t.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.items.length);
  }, [query]);

  const add = (item) => {
    addComponent(item.type);
    toast({ title: `${item.label} added`, tone: "ok" });
  };

  return (
    <div className="lib">
      <div className="lib-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a component"
          aria-label="Find a component"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="lib-scroll">
        {!query && (
          <section className="lib-group">
            <h3 className="lib-heading">
              <span className="lib-pigment" style={{ background: "var(--ink)" }} />
              Starters
              <em>{TEMPLATES.length}</em>
            </h3>
            <ul className="lib-starters">
              {TEMPLATES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="lib-starter"
                    onClick={() => {
                      addTemplate(t.id);
                      toast({ title: `${t.name} added`, tone: "ok" });
                    }}
                  >
                    <span>
                      <strong>{t.name}</strong>
                      <small>{t.blurb}</small>
                    </span>
                    <Plus size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {groups.map((g) => (
          <section key={g.id} className="lib-group">
            <h3 className="lib-heading">
              <span className="lib-pigment" style={{ background: g.color }} />
              {g.label}
              <em>{g.items.length}</em>
            </h3>
            <div className="lib-grid">
              {g.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className="lib-tile"
                  style={{ "--pigment": g.color }}
                  draggable
                  onDragStart={(e) => startTypeDrag(e, item.type)}
                  onDragEnd={endDrag}
                  onClick={() => add(item)}
                  title={`${item.label} — ${item.hint}. Click to add, or drag onto the canvas.`}
                >
                  <item.icon size={17} strokeWidth={1.8} />
                  <span>{item.short}</span>
                </button>
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="lib-empty">
            <strong>No match for “{query}”</strong>
            <span>Try “button”, “grid” or “image”.</span>
          </div>
        )}
      </div>

      <p className="lib-foot">Click to add into the selection, or drag onto the canvas or Layers.</p>
    </div>
  );
}
