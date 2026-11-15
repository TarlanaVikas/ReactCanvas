// Starter layouts offered from the empty-canvas state and the
// command palette. Written with a tiny builder so they stay readable.
import { v4 as uuidv4 } from "uuid";

const uid = () => `comp-${uuidv4().slice(0, 8)}`;
const n = (type, styles = {}, extra = {}, children = []) => ({
  id: uid(),
  type,
  styles,
  content: "",
  children,
  ...extra,
});

const INK = "#2b0e15";
const MUTED = "#6a4f55";
const ACCENT = "#b3194d";

const hero = () => [
  n("nav", {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 0 24px", width: "100%",
  }, {}, [
    n("h3", { fontSize: "20px", fontWeight: "700", color: INK, display: "block" }, { content: "Northlight" }),
    n("flex", { display: "flex", gap: "20px" }, {}, [
      n("link", { color: MUTED, textDecoration: "none", display: "inline-block", fontSize: "14px" }, { content: "Product" }),
      n("link", { color: MUTED, textDecoration: "none", display: "inline-block", fontSize: "14px" }, { content: "Pricing" }),
      n("link", { color: MUTED, textDecoration: "none", display: "inline-block", fontSize: "14px" }, { content: "Journal" }),
    ]),
  ]),
  n("section", {
    display: "block", padding: "72px 0 56px", width: "100%",
  }, {}, [
    n("label", { fontSize: "13px", fontWeight: "600", color: ACCENT, display: "block", padding: "0 0 12px" }, { content: "Now in open beta" }),
    n("h1", { fontSize: "64px", fontWeight: "800", color: INK, lineHeight: "1.02", letterSpacing: "-0.03em", display: "block", padding: "0 0 16px", width: "640px" }, { content: "Plan the whole week in one calm view." }),
    n("text", { fontSize: "18px", color: MUTED, lineHeight: "1.6", display: "block", padding: "0 0 28px", width: "520px" }, { content: "Northlight turns scattered tasks into a single timeline you can actually finish." }),
    n("flex", { display: "flex", gap: "12px", padding: "0" }, {}, [
      n("button", { backgroundColor: ACCENT, color: "#ffffff", borderRadius: "10px", cursor: "pointer", border: "none", padding: "14px 24px", fontSize: "15px", fontWeight: "600", display: "inline-block" }, { content: "Start free" }),
      n("button", { backgroundColor: "transparent", color: INK, borderRadius: "10px", cursor: "pointer", borderWidth: "1px", borderStyle: "solid", borderColor: "#d6c7c0", padding: "14px 24px", fontSize: "15px", fontWeight: "600", display: "inline-block" }, { content: "See a demo" }),
    ]),
  ]),
];

const pricingCard = (name, price, blurb, accent) =>
  n("card", {
    display: "flex", flexDirection: "column", gap: "12px", padding: "28px",
    backgroundColor: accent ? INK : "#ffffff", borderRadius: "14px",
    borderWidth: "1px", borderStyle: "solid", borderColor: accent ? INK : "#e6d9d3",
    width: "260px",
  }, {}, [
    n("label", { fontSize: "13px", fontWeight: "600", color: accent ? "#f2a9c0" : ACCENT, display: "block" }, { content: name }),
    n("h2", { fontSize: "40px", fontWeight: "800", color: accent ? "#ffffff" : INK, display: "block", padding: "0" }, { content: price }),
    n("text", { fontSize: "14px", color: accent ? "#e2cfc9" : MUTED, lineHeight: "1.5", display: "block", padding: "0 0 8px" }, { content: blurb }),
    n("button", { backgroundColor: accent ? "#ffffff" : ACCENT, color: accent ? INK : "#ffffff", borderRadius: "8px", cursor: "pointer", border: "none", padding: "12px 18px", fontSize: "14px", fontWeight: "600", display: "block", width: "100%" }, { content: "Choose plan" }),
  ]);

const pricing = () => [
  n("h2", { fontSize: "36px", fontWeight: "800", color: INK, display: "block", padding: "8px 0 4px", letterSpacing: "-0.02em" }, { content: "Simple pricing" }),
  n("text", { fontSize: "16px", color: MUTED, display: "block", padding: "0 0 32px", lineHeight: "1.6" }, { content: "Start small, upgrade when your team does." }),
  n("flex", { display: "flex", gap: "20px", padding: "0", flexWrap: "wrap" }, {}, [
    pricingCard("Solo", "$0", "One person, unlimited boards.", false),
    pricingCard("Team", "$12", "Shared timelines and comments.", true),
    pricingCard("Studio", "$32", "Roles, audit log and priority help.", false),
  ]),
];

const signup = () => [
  n("flex", { display: "flex", justifyContent: "center", padding: "40px 0", width: "100%" }, {}, [
    n("card", {
      display: "flex", flexDirection: "column", gap: "14px", padding: "32px",
      backgroundColor: "#ffffff", borderRadius: "16px", borderWidth: "1px",
      borderStyle: "solid", borderColor: "#e6d9d3", width: "380px",
      boxShadow: "0 12px 40px rgba(20,32,28,0.08)",
    }, {}, [
      n("h2", { fontSize: "28px", fontWeight: "800", color: INK, display: "block", padding: "0" }, { content: "Create your account" }),
      n("text", { fontSize: "14px", color: MUTED, display: "block", padding: "0 0 8px", lineHeight: "1.5" }, { content: "Takes less than a minute." }),
      n("form-group", { display: "flex", flexDirection: "column", gap: "12px", padding: "0", width: "100%" }, {}, [
        n("label", { fontSize: "13px", fontWeight: "600", color: INK, display: "block", padding: "0" }, { content: "Email" }),
        n("input", { padding: "12px 14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#d6c7c0", borderRadius: "8px", width: "100%", fontSize: "14px", backgroundColor: "#ffffff", color: INK, display: "block", boxSizing: "border-box" }, { inputType: "email", content: "you@company.com" }),
        n("label", { fontSize: "13px", fontWeight: "600", color: INK, display: "block", padding: "0" }, { content: "Password" }),
        n("input", { padding: "12px 14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#d6c7c0", borderRadius: "8px", width: "100%", fontSize: "14px", backgroundColor: "#ffffff", color: INK, display: "block", boxSizing: "border-box" }, { inputType: "password", content: "At least 8 characters" }),
        n("checkbox", { display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", fontSize: "13px", color: MUTED, accentColor: ACCENT }, { content: "Send me product updates" }),
        n("button", { backgroundColor: ACCENT, color: "#ffffff", borderRadius: "8px", cursor: "pointer", border: "none", padding: "13px 20px", fontSize: "15px", fontWeight: "600", display: "block", width: "100%" }, { content: "Create account" }),
      ]),
    ]),
  ]),
];

export const TEMPLATES = [
  { id: "hero", name: "Landing hero", blurb: "Nav, headline and two buttons", build: hero },
  { id: "pricing", name: "Pricing tiers", blurb: "Three plans side by side", build: pricing },
  { id: "signup", name: "Sign-up card", blurb: "Centered form with fields", build: signup },
];

/** Returns a fresh array of children to place inside the artboard. */
export const buildTemplate = (id) => TEMPLATES.find((t) => t.id === id)?.build() ?? [];
