import { createElement, useEffect, useRef, useState } from "react";
import { ArrowRight, Moon, Sun, Plus, Minus } from "lucide-react";
import useUi from "../store/useUi";
import { CATALOGUE } from "../constants/catalog";
import HeroDemo from "./HeroDemo";
import "./Home.css";

const Mark = ({ size = 26 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <rect x="3" y="3" width="26" height="26" fill="currentColor" />
    <circle cx="20.5" cy="20.5" r="8" fill="var(--pop)" />
    <rect x="7" y="7" width="9" height="9" fill="var(--accent-ink)" />
  </svg>
);

/** Adds .in once an element scrolls into view. */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
const Reveal = ({ as = "div", className = "", children, ...rest }) => {
  const ref = useReveal();
  return createElement(as, { ref, className: `reveal ${className}`, ...rest }, children);
};

const STEPS = [
  { title: "Compose", tag: "Drag · drop · edit", body: "Drag components from six colour-coded families onto the artboard, or straight into the layer tree. Double-click any text to rewrite it where it sits." },
  { title: "Refine", tag: "Inspector", body: "Every element has a full inspector: spacing box, typography, borders, shadows, flex and grid controls, transitions and animation presets." },
  { title: "Preview", tag: "Live frames", body: "Switch between desktop, tablet and mobile widths, then press P to hide the chrome and use the toggles, inputs and media for real." },
  { title: "Export", tag: "Real code", body: "Copy the JSX and CSS, or download a runnable Vite + React project as a ZIP. Save the design file to keep editing another day." },
];

const FEATURES = [
  { title: "Command palette", body: "Press Ctrl K to add anything, undo, preview or export without leaving the keyboard." },
  { title: "Layer tree you can drag", body: "Reparent and reorder elements by dragging rows. Duplicate or delete from the row itself." },
  { title: "Undo that understands typing", body: "Fast edits collapse into one step, so a slider drag is one undo, not forty." },
  { title: "Design files", body: "Save the canvas as a .json file and reopen it on another machine." },
];

const NAV = [
  ["01", "Workflow", "#how"],
  ["02", "Components", "#components"],
  ["03", "Details", "#details"],
];

export default function Home({ onEnterStudio }) {
  const theme = useUi((s) => s.theme);
  const toggleTheme = useUi((s) => s.toggleTheme);
  const [step, setStep] = useState(0);
  const heroRef = useRef(null);
  const raf = useRef(0);

  /* The cursor stretches the headline: condensed on the left, wide on the right. */
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const r = el.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        el.style.setProperty("--stretch", String(Math.round(64 + px * 28)));
      });
    };
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="home">
      <header className="h-nav">
        <a className="h-brand" href="#top" aria-label="ReactCanvas home">
          <Mark /> <span>ReactCanvas</span>
        </a>
        <nav aria-label="Sections">
          {NAV.map(([n, label, href]) => (
            <a key={href} href={href}><sup>{n}</sup> {label}</a>
          ))}
        </nav>
        <div className="h-nav-end">
          <button type="button" className="h-theme" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button type="button" className="h-btn small" onClick={onEnterStudio}><span>Open studio</span> <ArrowRight size={14} /></button>
        </div>
      </header>

      <section className="h-hero" id="top" ref={heroRef}>
        <div className="h-meta">
          <span>A visual builder for React</span>
          <span>Artboard in · JSX + CSS out</span>
        </div>

        <h1 className="h-title">
          <span>Paint the interface.</span>
          <span className="alt">Keep the code.</span>
        </h1>

        <div className="h-hero-grid">
          <div className="h-hero-copy">
            <p className="h-lede">
              ReactCanvas is an artboard for composing real React layouts. Place components, shape them in an
              inspector, preview every frame, then take the JSX and CSS with you.
            </p>
            <div className="h-cta">
              <button type="button" className="h-btn" onClick={onEnterStudio}><span>Open the studio</span> <ArrowRight size={16} /></button>
              <a className="h-link" href="#how">See the workflow</a>
            </div>
            <p className="h-fine">Free · no account · saved in your browser</p>
          </div>
          <div className="h-hero-demo"><HeroDemo /></div>
        </div>
      </section>

      <section className="h-section" id="how">
        <Reveal className="h-head">
          <p className="h-kicker">01 — Workflow</p>
          <h2>Blank artboard to working code in four moves.</h2>
        </Reveal>
        <Reveal as="ol" className="h-index">
          {STEPS.map((s, i) => (
            <li key={s.title} className={i === step ? "on" : ""}>
              <button type="button" aria-expanded={i === step} onClick={() => setStep(i)}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <strong>{s.title}</strong>
                <em>{s.tag}</em>
                {i === step ? <Minus size={22} /> : <Plus size={22} />}
              </button>
              <div className="h-index-body"><div><p>{s.body}</p></div></div>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="h-section" id="components">
        <Reveal className="h-head">
          <p className="h-kicker">02 — Components</p>
          <h2>Thirty parts in six colour-coded families.</h2>
        </Reveal>
        <ul className="h-fam">
          {CATALOGUE.map((g, i) => (
            <Reveal as="li" key={g.id} className="h-fam-row" style={{ "--c": g.color, "--d": `${i * 60}ms` }}>
              <span className="bar" aria-hidden="true" />
              <h3>{g.label}</h3>
              <p>{g.items.map((it) => it.label).join("  /  ")}</p>
              <b>{String(g.items.length).padStart(2, "0")}</b>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="h-section" id="details">
        <Reveal className="h-head">
          <p className="h-kicker">03 — Details</p>
          <h2>Small things that keep you moving.</h2>
        </Reveal>
        <ul className="h-rows">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} className="h-row">
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="h-final">
        <Reveal className="h-final-in">
          <h2>Your next layout is one drag away.</h2>
          <button type="button" className="h-btn pop" onClick={onEnterStudio}><span>Open the studio</span> <ArrowRight size={16} /></button>
        </Reveal>
      </section>

      <footer className="h-foot">
        <span className="h-brand static"><Mark size={20} /> <span>ReactCanvas</span></span>
        <span>Compose in the browser. Ship real React.</span>
      </footer>
    </div>
  );
}
