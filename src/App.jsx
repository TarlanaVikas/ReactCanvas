import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import Home from "./Home/Home";
import ToastHost from "./components/ToastHost";
import "./store/useUi"; // applies the saved theme before first paint
import "./App.css";

// The editor is the heavy part of the app, so it loads on demand.
const Studio = lazy(() => import("./Studio"));

const routeFromHash = () => (window.location.hash.startsWith("#/studio") ? "studio" : "home");
const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function applyMode(page) {
  const mode = page === "studio" ? "mode-studio" : "mode-home";
  for (const el of [document.documentElement, document.body]) {
    el.classList.remove("mode-home", "mode-studio");
    el.classList.add(mode);
  }
  window.scrollTo(0, 0);
}

export default function App() {
  const [page, setPage] = useState(routeFromHash);
  const [wipe, setWipe] = useState("idle"); // idle | cover | reveal
  const timers = useRef([]);

  useEffect(() => {
    applyMode(page);
    document.title = page === "studio" ? "Studio · ReactCanvas" : "ReactCanvas — design in React, export real code";
  }, [page]);

  // Browser back / forward and manual hash edits
  useEffect(() => {
    const onHash = () => setPage(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** Navigate with a paint-wipe between the two screens. */
  const go = useCallback((to) => {
    const setHash = () => {
      window.history.pushState(null, "", to === "studio" ? "#/studio" : window.location.pathname + window.location.search);
      setPage(to);
    };
    if (prefersReducedMotion()) {
      setHash();
      return;
    }
    setWipe("cover");
    timers.current.push(
      setTimeout(() => {
        setHash();
        setWipe("reveal");
      }, 400),
      setTimeout(() => setWipe("idle"), 900),
    );
  }, []);

  return (
    <>
      {page === "studio" ? (
        <Suspense fallback={<div className="boot" role="status">Preparing your canvas…</div>}>
          <Studio onExit={() => go("home")} />
        </Suspense>
      ) : (
        <Home onEnterStudio={() => go("studio")} />
      )}
      <div className={`wipe ${wipe === "idle" ? "" : wipe}`} aria-hidden="true" />
      <ToastHost />
    </>
  );
}
