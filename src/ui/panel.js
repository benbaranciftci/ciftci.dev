import { GENES, geneNucs, ctaLabelFor } from "../content/model.js";

export function createPanel({ state }) {
  const panel = document.getElementById("memory-panel");
  const panelInner = document.getElementById("panel-inner");
  const panelTitle = document.getElementById("panel-title");
  const panelBody = document.getElementById("panel-body");
  const panelFacts = document.getElementById("panel-facts");
  const panelCta = document.getElementById("panel-cta");
  const panelKicker = document.getElementById("panel-kicker");
  const panelLogo = document.getElementById("panel-logo");
  const panelLogoImg = document.getElementById("panel-logo-img");
  const panelGrab = document.getElementById("panel-grab");

  const SHEET_SNAPS = ["peek", "full"];
  const SHEET_DRAG_THRESHOLD = 36;
  const PANEL_SWAP_MS = 160;
  const PANEL_HEIGHT_MS = 340;

  let sheetSnap = "peek";
  let sheetDragY = null;
  let sheetDragSnap = "peek";
  let panelSwapTimer = 0;
  let panelHeightTimer = 0;
  let panelSwapGen = 0;

  function currentGene() {
    return GENES[state.selected];
  }

  function fillFacts(g) {
    if (!g.facts?.length) {
      panelFacts.classList.add("is-collapsed");
      panelFacts.innerHTML = "";
      return;
    }
    panelFacts.classList.remove("is-collapsed");
    panelFacts.innerHTML = g.facts
      .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
      .join("");
  }

  function setCta(href, label = "Enter") {
    if (!href) {
      panelCta.classList.add("is-collapsed");
      panelCta.removeAttribute("href");
      return;
    }
    panelCta.classList.remove("is-collapsed");
    panelCta.href = href;
    panelCta.target = href.startsWith("http") ? "_blank" : "_self";
    panelCta.rel = href.startsWith("http") ? "noopener noreferrer" : "";
    panelCta.textContent = label;
  }

  function setLogo(logo, alt, bg, full, pad) {
    if (!logo) {
      panelLogo.classList.add("is-collapsed");
      panelLogoImg.removeAttribute("src");
      panelLogoImg.alt = "";
      panelLogo.classList.remove("is-light", "is-full", "is-padded");
      return;
    }
    panelLogo.classList.remove("is-collapsed");
    panelLogoImg.src = logo;
    panelLogoImg.alt = alt || "";
    panelLogo.classList.toggle("is-light", bg === "light" || bg === "white");
    panelLogo.classList.toggle("is-full", !!full);
    panelLogo.classList.toggle("is-padded", !!pad);
  }

  function setSheetSnap(next, { force = false } = {}) {
    if (!panel) return;
    const snap = SHEET_SNAPS.includes(next) ? next : "peek";
    if (!force && snap === sheetSnap) return;
    sheetSnap = snap;
    panel.dataset.sheet = snap;
    panel.classList.remove("is-sheet-dragging");
    if (panelGrab) {
      panelGrab.setAttribute("aria-expanded", snap !== "peek" ? "true" : "false");
      panelGrab.setAttribute(
        "aria-label",
        snap === "peek" ? "Expand details" : "Collapse details"
      );
    }
  }

  function resetSheetSnap() {
    setSheetSnap("peek", { force: true });
  }

  function cycleSheetSnap() {
    const i = SHEET_SNAPS.indexOf(sheetSnap);
    setSheetSnap(SHEET_SNAPS[(i + 1) % SHEET_SNAPS.length]);
  }

  function sheetSnapFromDrag(dy) {
    const i = SHEET_SNAPS.indexOf(sheetDragSnap);
    if (dy <= -SHEET_DRAG_THRESHOLD && i < SHEET_SNAPS.length - 1) {
      return SHEET_SNAPS[i + 1];
    }
    if (dy >= SHEET_DRAG_THRESHOLD && i > 0) {
      return SHEET_SNAPS[i - 1];
    }
    return sheetDragSnap;
  }

  function onDocumentClick(e) {
    if (!state.isMobileLayout || state.introActive || sheetSnap !== "full") return;
    if (e.target.closest("#memory-panel")) return;
    resetSheetSnap();
  }

  function syncSheetChrome() {
    if (!panel) return;
    if (!state.isMobileLayout) {
      panel.removeAttribute("data-sheet");
      panel.classList.remove("is-sheet-dragging");
      return;
    }
    setSheetSnap(sheetSnap, { force: true });
  }

  function applyPanelContent() {
    const g = currentGene();
    const nucs = geneNucs(g);
    panel.classList.toggle("is-locked", !!g.locked);

    if (nucs) {
      const nuc = nucs[state.nucIndex];
      panelKicker.textContent = "Contact";
      panelTitle.textContent = nuc.name;
      panelBody.textContent = nuc.blurb;
      panelFacts.classList.add("is-collapsed");
      panelFacts.innerHTML = "";
      setLogo(nuc.logo, nuc.logoAlt || nuc.name, nuc.logoBg, nuc.logoFull, nuc.logoPad);
      setCta(nuc.href, ctaLabelFor(nuc));
      return;
    }

    if (g.locked) {
      panelKicker.textContent = "Locked";
      panelTitle.textContent = g.name;
      panelBody.textContent = g.blurb;
      fillFacts(g);
      setLogo(g.logo, g.logoAlt || g.name, g.logoBg, g.logoFull, g.logoPad);
      setCta(null);
      return;
    }

    panelKicker.textContent = g.region || "Gene";
    panelTitle.textContent = g.name;
    panelBody.textContent = g.blurb;
    fillFacts(g);
    setLogo(g.logo, g.logoAlt || g.name, g.logoBg, g.logoFull, g.logoPad);
    if (!g.href) setCta(null);
    else setCta(g.href, g.name ? `Open ${g.name}` : "Enter");
  }

  function resetPanelTransition() {
    panelSwapGen++;
    clearTimeout(panelSwapTimer);
    clearTimeout(panelHeightTimer);
    panel.classList.remove("is-swapping");
    panel.style.height = "";
    delete panel.dataset.swapStartH;
  }

  function panelContentHeight() {
    if (!panel || !panelInner) return panel?.offsetHeight || 0;
    const cs = getComputedStyle(panel);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    return Math.ceil(panelInner.scrollHeight + padY + borderY);
  }

  function commitPanelSwap(gen) {
    if (gen !== panelSwapGen || !panel) return;

    applyPanelContent();

    const startH = Number(panel.dataset.swapStartH) || panel.offsetHeight;
    const endH = panelContentHeight();

    if (Math.abs(endH - startH) < 2) {
      panel.style.height = "";
      delete panel.dataset.swapStartH;
      panel.classList.remove("is-swapping");
      return;
    }

    void panel.offsetHeight;
    panel.style.height = `${endH}px`;
    panel.classList.remove("is-swapping");

    panelHeightTimer = setTimeout(() => {
      if (gen !== panelSwapGen) return;
      panel.style.height = "";
      delete panel.dataset.swapStartH;
    }, PANEL_HEIGHT_MS);
  }

  function syncPanel(instant = false) {
    if (!panel) return;

    if (instant || state.reduceMotion) {
      resetPanelTransition();
      applyPanelContent();
      return;
    }

    const alreadyHidden = panel.classList.contains("is-swapping");
    if (!alreadyHidden || !panel.dataset.swapStartH) {
      panel.dataset.swapStartH = String(panel.getBoundingClientRect().height);
      panel.style.height = `${panel.dataset.swapStartH}px`;
      panel.classList.add("is-swapping");
    }

    panelSwapGen++;
    const gen = panelSwapGen;
    clearTimeout(panelSwapTimer);
    clearTimeout(panelHeightTimer);

    panelSwapTimer = setTimeout(() => commitPanelSwap(gen), alreadyHidden ? 0 : PANEL_SWAP_MS);
  }

  function activateCta() {
    const g = currentGene();
    if (g.locked) return;
    const nucs = geneNucs(g);
    const href = nucs ? nucs[state.nucIndex]?.href : g.href;
    if (!href) return;
    window.open(href, href.startsWith("http") ? "_blank" : "_self");
  }

  function bindSheetGrab() {
    if (!panelGrab) return;
    panelGrab.addEventListener("pointerdown", (e) => {
      if (!state.isMobileLayout || e.button !== 0) return;
      sheetDragY = e.clientY;
      sheetDragSnap = sheetSnap;
      panel?.classList.add("is-sheet-dragging");
      panelGrab.setPointerCapture(e.pointerId);
    });

    panelGrab.addEventListener("pointerup", (e) => {
      if (sheetDragY === null) return;
      const dy = e.clientY - sheetDragY;
      if (Math.abs(dy) < SHEET_DRAG_THRESHOLD) cycleSheetSnap();
      else setSheetSnap(sheetSnapFromDrag(dy));
      sheetDragY = null;
      panel?.classList.remove("is-sheet-dragging");
      try {
        panelGrab.releasePointerCapture(e.pointerId);
      } catch {
      }
    });

    panelGrab.addEventListener("pointercancel", () => {
      sheetDragY = null;
      panel?.classList.remove("is-sheet-dragging");
    });
  }

  return {
    panel,
    get sheetSnap() {
      return sheetSnap;
    },
    resetSheetSnap,
    syncSheetChrome,
    onDocumentClick,
    applyPanelContent,
    syncPanel,
    activateCta,
    bindSheetGrab,
  };
}
