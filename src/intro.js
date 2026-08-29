import { geneLogoUrls } from "./content/model.js";

const LOAD_WEIGHTS = {
  boot: 10,
  fonts: 20,
  assets: 40,
  scene: 20,
  frame: 10,
};

export function createIntro({ state }) {
  const introEl = document.getElementById("intro");
  const introLoad = document.getElementById("intro-load");
  const introRing = document.getElementById("intro-ring");
  const introPct = document.getElementById("intro-pct");
  const introSplit = document.getElementById("intro-split");

  let phase = state.introActive ? "load" : "done";
  let timer = 0;
  let readyQueued = false;
  const loadMarks = {
    boot: false,
    fonts: false,
    assets: false,
    scene: false,
    frame: false,
  };

  function setIntroPct(p) {
    const v = Math.max(0, Math.min(100, Math.round(p)));
    if (introRing) introRing.style.setProperty("--p", String(v));
    if (introPct) introPct.textContent = `${v}%`;
  }

  function loadProgress() {
    let p = 0;
    for (const key of Object.keys(LOAD_WEIGHTS)) {
      if (loadMarks[key]) p += LOAD_WEIGHTS[key];
    }
    return p;
  }

  function markLoaded(key) {
    if (loadMarks[key] || phase === "done") return;
    loadMarks[key] = true;
    if (!state.introActive || phase !== "load") return;
    setIntroPct(loadProgress());
    if (loadProgress() < 100 || readyQueued) return;
    readyQueued = true;
    timer = setTimeout(openSplit, 200);
  }

  function preloadGeneAssets() {
    const urls = geneLogoUrls();
    if (!urls.length) {
      markLoaded("assets");
      return Promise.resolve();
    }
    return Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          })
      )
    ).then(() => markLoaded("assets"));
  }

  function finish() {
    if (phase === "done") return;
    phase = "done";
    state.introActive = false;
    clearTimeout(timer);
    state.unfoldTarget = 1;
    state.spreadTarget = 0.3;
    state.flareTarget = 0;
    state.markDirty();
    document.body.classList.remove("is-intro");
    if (!introEl) return;
    introEl.classList.add("is-open");
    introEl.style.pointerEvents = "none";
    setTimeout(() => {
      introEl.hidden = true;
      introEl.classList.remove("is-open");
      if (introLoad) introLoad.classList.remove("is-gone");
      if (introSplit) introSplit.hidden = true;
      setIntroPct(0);
    }, state.reduceMotion ? 0 : 1000);
  }

  function openSplit() {
    if (phase !== "load") return;
    phase = "split";
    clearTimeout(timer);
    setIntroPct(100);
    if (introLoad) introLoad.classList.add("is-gone");
    if (introSplit) introSplit.hidden = false;
    state.unfoldTarget = 1;
    state.spreadTarget = 0.85;
    state.flareTarget = 0.25;
    state.markDirty();
    timer = setTimeout(() => {
      state.flareTarget = 0;
      state.markDirty();
      finish();
    }, state.reduceMotion ? 0 : 720);
  }

  function skip() {
    if (!state.introActive) return;
    if (phase === "load") {
      for (const key of Object.keys(LOAD_WEIGHTS)) loadMarks[key] = true;
      setIntroPct(100);
      openSplit();
      return;
    }
    finish();
  }

  function start() {
    if (!state.introActive || !introEl) {
      state.introActive = false;
      phase = "done";
      document.body.classList.remove("is-intro");
      if (introEl) introEl.hidden = true;
      state.unfoldTarget = 1;
      state.spreadTarget = 0.3;
      return;
    }
    document.body.classList.add("is-intro");
    introEl.hidden = false;
    if (introLoad) introLoad.hidden = false;
    if (introSplit) introSplit.hidden = true;
    setIntroPct(0);
    state.unfoldTarget = 0.2;
    state.spreadTarget = 0.55;
    state.markDirty();
    const onSkip = () => skip();
    introEl.addEventListener("click", onSkip);
    introEl.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        onSkip();
      },
      { passive: false }
    );
    introEl.addEventListener("touchstart", onSkip, { passive: true });
    markLoaded("boot");
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => markLoaded("fonts")).catch(() => markLoaded("fonts"));
    preloadGeneAssets();
  }

  function onFrameReady() {
    if (state.introActive && phase === "load" && loadMarks.scene && !loadMarks.frame) {
      markLoaded("frame");
    }
  }

  function bindSkipLink() {
    const skipLink = document.querySelector(".skip-link");
    if (!skipLink) return;
    skipLink.addEventListener("click", () => {
      if (state.introActive) skip();
    });
  }

  return {
    get phase() {
      return phase;
    },
    start,
    skip,
    markLoaded,
    onFrameReady,
    bindSkipLink,
  };
}
