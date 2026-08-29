import { CONTENT_COUNT } from "../content/model.js";
import { createState } from "./state.js";
import { createTheme } from "../theme.js";
import { createUI } from "../ui/index.js";
import { createScene } from "../scene/index.js";
import { createInput } from "../input/index.js";
import { createIntro } from "../intro.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileMq = matchMedia("(max-width: 640px)");
const SETTLE_EPS = 0.0008;

const state = createState({
  reduceMotion,
  withIntro: Boolean(document.getElementById("intro")),
});
state.isMobileLayout = mobileMq.matches;

const theme = createTheme();

const nav = {
  setFocusToStop() {},
  selectionToFocus() {
    return 0;
  },
};

const ui = createUI({ state, nav });
const scene = createScene({ state, theme, ui });
const intro = createIntro({ state });
const input = createInput({ state, ui, scene, intro });

nav.setFocusToStop = (stop) => input.setFocusToStop(stop);
nav.selectionToFocus = (gene, nuc) => input.selectionToFocus(gene, nuc);

function syncThemeButton() {
  const themeBtn = document.getElementById("btn-theme");
  const dark = theme.name === "dark";
  themeBtn.textContent = dark ? "Light" : "Dark";
  themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

function applyTheme(next) {
  theme.apply(next, {
    scene: scene.scene,
    ambient: scene.ambient,
    key: scene.key,
    contentHexes: scene.contentHexes,
    deco: scene.deco,
    contentCount: CONTENT_COUNT,
    onSyncButton: syncThemeButton,
  });
  state.markDirty();
}

const themeBtn = document.getElementById("btn-theme");
themeBtn.addEventListener("click", () => {
  applyTheme(theme.name === "dark" ? "light" : "dark");
});
syncThemeButton();

let lastTickMs = 0;
let rafId = 0;
let running = false;

function isAnimating() {
  if (state.introActive) return true;
  if (Math.abs(state.unfold - state.unfoldTarget) > SETTLE_EPS) return true;
  if (Math.abs(state.flare - state.flareTarget) > SETTLE_EPS) return true;
  if (Math.abs(state.spread - state.spreadTarget) > SETTLE_EPS) return true;
  if (input.isFocusBusy()) return true;
  return false;
}

function snapLerps() {
  if (Math.abs(state.unfold - state.unfoldTarget) <= SETTLE_EPS) state.unfold = state.unfoldTarget;
  if (Math.abs(state.flare - state.flareTarget) <= SETTLE_EPS) state.flare = state.flareTarget;
  if (Math.abs(state.spread - state.spreadTarget) <= SETTLE_EPS) state.spread = state.spreadTarget;
}

function tick(now) {
  rafId = 0;
  if (document.hidden) {
    running = false;
    return;
  }

  const dt = lastTickMs ? Math.min(0.05, (now - lastTickMs) / 1000) : 1 / 60;
  lastTickMs = now;

  const rate = reduceMotion ? 1 : 0.05;
  state.unfold += (state.unfoldTarget - state.unfold) * rate;
  state.flare += (state.flareTarget - state.flare) * (reduceMotion ? 1 : 0.1);
  state.spread += (state.spreadTarget - state.spread) * (reduceMotion ? 1 : 0.12);
  snapLerps();

  input.stepFocus(dt);

  const needsFull = state.dirty || isAnimating();
  state.dirty = false;

  if (!needsFull) {
    if (state.reduceMotion) {
      running = false;
      return;
    }
    scene.stepCamera(now);
    scene.render();
  } else {
    scene.stepCamera(now);
    scene.layout();
    ui.stepWorld();
    ui.stepPanelTilt();
    scene.render();
    intro.onFrameReady();
  }

  if (!document.hidden) {
    running = true;
    rafId = requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

function startLoop() {
  if (document.hidden) return;
  if (running) return;
  running = true;
  lastTickMs = 0;
  state.dirty = true;
  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  running = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

const markDirty = state.markDirty;
state.markDirty = () => {
  markDirty();
  startLoop();
};

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopLoop();
  else startLoop();
});

input.bind();
ui.bindSheetGrab();
ui.bindPanelTilt();
ui.buildGeneRail();
ui.syncMobileLayout();
intro.bindSkipLink();

addEventListener("resize", () => {
  scene.resize();
  state.markDirty();
});
mobileMq.addEventListener("change", () => {
  state.isMobileLayout = mobileMq.matches;
  ui.syncMobileLayout();
  scene.resize();
  ui.updateHud();
  state.markDirty();
});

scene.addDecor();
ui.buildWorldPage();
scene.resize();
scene.ensureHexes();
scene.rebuildCurve(0.08);
input.resetFocus();
ui.measureWorldTravel();
ui.stepWorld();
document.body.classList.add("memory-open");

intro.start();
intro.markLoaded("scene");
requestAnimationFrame(() => {
  if (!state.introActive) state.unfoldTarget = 1;
  state.markDirty();
});
startLoop();
