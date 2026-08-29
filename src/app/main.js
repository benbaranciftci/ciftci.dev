import { CONTENT_COUNT } from "../content/model.js";
import { createState } from "./state.js";
import { createTheme } from "../theme.js";
import { createUI } from "../ui/index.js";
import { createScene } from "../scene/index.js";
import { createInput } from "../input/index.js";
import { createIntro } from "../intro.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileMq = matchMedia("(max-width: 640px)");

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
}

const themeBtn = document.getElementById("btn-theme");
themeBtn.addEventListener("click", () => {
  applyTheme(theme.name === "dark" ? "light" : "dark");
});
syncThemeButton();

let lastTickMs = 0;

function tick(now) {
  const dt = lastTickMs ? Math.min(0.05, (now - lastTickMs) / 1000) : 1 / 60;
  lastTickMs = now;

  state.unfold += (state.unfoldTarget - state.unfold) * (reduceMotion ? 1 : 0.05);
  state.flare += (state.flareTarget - state.flare) * (reduceMotion ? 1 : 0.1);
  state.spread += (state.spreadTarget - state.spread) * (reduceMotion ? 1 : 0.12);

  input.stepFocus(dt);
  scene.stepCamera(now);
  scene.layout();
  ui.stepWorld();
  ui.stepPanelTilt();
  scene.render();

  intro.onFrameReady();
  requestAnimationFrame(tick);
}

input.bind();
ui.bindSheetGrab();
ui.bindPanelTilt();
ui.buildGeneRail();
ui.syncMobileLayout();
intro.bindSkipLink();

addEventListener("resize", () => scene.resize());
mobileMq.addEventListener("change", () => {
  state.isMobileLayout = mobileMq.matches;
  ui.syncMobileLayout();
  scene.resize();
  ui.updateHud();
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
});
requestAnimationFrame(tick);
