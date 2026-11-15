// Keyframes behind the Inspector → Motion → Animation presets.
// The same text is injected into the canvas and written into exported CSS.
export const KEYFRAMES = {
  "fade-in": "from { opacity: 0; } to { opacity: 1; }",
  "slide-up": "from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); }",
  "slide-left": "from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); }",
  bounce: "0%, 100% { transform: translateY(0); } 30% { transform: translateY(-14px); } 60% { transform: translateY(0); } 80% { transform: translateY(-5px); }",
  pulse: "0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); }",
  float: "0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); }",
  spin: "from { transform: rotate(0deg); } to { transform: rotate(360deg); }",
  shake: "0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); }",
  "zoom-in": "from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); }",
};

export const keyframesCSS = (names = Object.keys(KEYFRAMES)) =>
  names
    .filter((n) => KEYFRAMES[n])
    .map((n) => `@keyframes ${n} {\n  ${KEYFRAMES[n]}\n}`)
    .join("\n\n");
