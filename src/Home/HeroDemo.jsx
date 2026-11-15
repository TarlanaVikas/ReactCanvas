import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";

const PIECES = {
  heading: { label: "Heading", jsx: (n) => `<h1 className="rc-h1-${n}">Hello, canvas</h1>` },
  text: { label: "Paragraph", jsx: (n) => `<p className="rc-text-${n}">Drag, drop, refine.</p>` },
  button: { label: "Button", jsx: (n) => `<button className="rc-button-${n}">Get started</button>` },
  card: { label: "Card", jsx: (n) => `<div className="rc-card-${n}">…</div>` },
  image: { label: "Image", jsx: (n) => `<img className="rc-image-${n}" alt="" />` },
};

const START = [
  { id: 1, kind: "heading" },
  { id: 2, kind: "button" },
];

function Piece({ kind }) {
  switch (kind) {
    case "heading": return <div className="hd-heading">Hello, canvas</div>;
    case "text": return <div className="hd-text">Drag, drop, refine.</div>;
    case "button": return <span className="hd-button">Get started</span>;
    case "card": return <div className="hd-card"><i /><b /><b className="s" /></div>;
    default: return <div className="hd-image" aria-hidden="true" />;
  }
}

/** A tiny, real mini-editor: click or drag a pigment chip onto the artboard. */
export default function HeroDemo() {
  const [blocks, setBlocks] = useState(START);
  const [over, setOver] = useState(false);
  const [seq, setSeq] = useState(3);

  const add = (kind) => {
    setBlocks((b) => (b.length >= 6 ? b : [...b, { id: seq, kind }]));
    setSeq((n) => n + 1);
  };
  const remove = (id) => setBlocks((b) => b.filter((x) => x.id !== id));

  const counts = {};
  const lines = blocks.map((b) => {
    counts[b.kind] = (counts[b.kind] || 0) + 1;
    return { id: b.id, text: PIECES[b.kind].jsx(counts[b.kind]) };
  });

  return (
    <div className="easel" aria-label="Interactive ReactCanvas demo">
      <div className="easel-bar">
        <span className="easel-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="easel-title">Proof sheet — add a piece</span>
        <button type="button" className="easel-reset" onClick={() => setBlocks(START)} aria-label="Reset demo">
          <RotateCcw size={13} />
        </button>
      </div>

      <div className="easel-chips">
        {Object.entries(PIECES).map(([kind, p]) => (
          <button
            key={kind}
            type="button"
            className="easel-chip"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", kind)}
            onClick={() => add(kind)}
            disabled={blocks.length >= 6}
          >
            <Plus size={12} strokeWidth={2.6} /> {p.label}
          </button>
        ))}
      </div>

      <div className="easel-grid">
        <div
          className={`easel-art${over ? " over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const kind = e.dataTransfer.getData("text/plain");
            if (PIECES[kind]) add(kind);
          }}
        >
          {blocks.length === 0 && <p className="easel-empty">Drop a piece here</p>}
          {blocks.map((b) => (
            <button key={b.id} type="button" className="easel-piece" onClick={() => remove(b.id)} title="Click to remove">
              <Piece kind={b.kind} />
            </button>
          ))}
        </div>

        <pre className="easel-code" aria-label="Generated JSX">
          <code>
            <span className="c-dim">{"<div className=\"rc-artboard\">"}</span>
            {lines.map((l, i) => (
              <span key={l.id} className={`c-line${i === lines.length - 1 ? " fresh" : ""}`}>{"\n  " + l.text}</span>
            ))}
            <span className="c-dim">{"\n</div>"}</span>
          </code>
        </pre>
      </div>
      <p className="easel-note">Click a block to remove it · the code on the right is generated live.</p>
    </div>
  );
}
