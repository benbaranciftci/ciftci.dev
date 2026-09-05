import { createPanel } from "./panel.js";
import { createWorld } from "./world.js";
import { createChrome } from "./chrome.js";

export function createUI({ state, nav }) {
  const panel = createPanel({ state });
  const world = createWorld({ state });
  const chrome = createChrome({ state, nav, world });

  function syncMobileLayout() {
    document.documentElement.classList.toggle("is-mobile", state.isMobileLayout);
    if (!state.isMobileLayout) panel.resetSheetSnap();
    panel.syncSheetChrome();
    chrome.updateGeneRail();
    world.measureWorldTravel();
    world.applyWorldScroll();
    if (state.isMobileLayout) requestAnimationFrame(world.measureWorldTravel);
  }

  return {
    panel: panel.panel,
    get sheetSnap() {
      return panel.sheetSnap;
    },
    resetSheetSnap: panel.resetSheetSnap,
    syncSheetChrome: panel.syncSheetChrome,
    onDocumentClick: panel.onDocumentClick,
    applyPanelContent: panel.applyPanelContent,
    syncPanel: panel.syncPanel,
    activateCta: panel.activateCta,
    bindSheetGrab: panel.bindSheetGrab,

    worldEl: world.worldEl,
    worldTrack: world.worldTrack,
    get worldSecs() {
      return world.worldSecs;
    },
    get secHeightPx() {
      return world.secHeightPx;
    },
    get worldTravelPx() {
      return world.worldTravelPx;
    },
    get worldSecHeight() {
      return world.worldSecHeight;
    },
    buildWorldPage: world.buildWorldPage,
    measureWorldTravel: world.measureWorldTravel,
    applyWorldScroll: world.applyWorldScroll,
    applyWorldDots: world.applyWorldDots,
    stepWorld: world.stepWorld,

    dismissHint: chrome.dismissHint,
    buildGeneRail: chrome.buildGeneRail,
    updateGeneRail: chrome.updateGeneRail,
    updateHud: chrome.updateHud,

    syncMobileLayout,
  };
}
