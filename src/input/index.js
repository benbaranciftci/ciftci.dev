import * as THREE from "three";
import { GENES, SCROLL_STOPS, geneNucs } from "../content/model.js";
import { isTypingTarget } from "../content/contact.js";

const FOCUS_PX_PER_UNIT = 300;
const FOCUS_PX_PER_UNIT_TOUCH = 220;
const FOCUS_SETTLE_MS = 180;
const FOCUS_SETTLE_RATE = 10;
const TOUCH_DRAG_THRESHOLD = 10;
const CONTACT_GLIDE_RATE = 4.2;
const CONTACT_PANEL_COMMIT = 0.22;

export function createInput({ state, ui, scene, intro }) {
  let browsing = false;
  let touchDragY = null;
  let touchMoved = false;
  let suppressClickUntil = 0;
  let contactAimStop = null;
  let lastAppliedStop = -1;
  let focusInputUntil = 0;

  function selectionToFocus(gene, nuc = 0) {
    const idx = SCROLL_STOPS.findIndex((s) => s.gene === gene && s.nuc === nuc);
    return idx >= 0 ? idx : 0;
  }

  function stopToVisual(stopIdx) {
    const { gene, nuc } = SCROLL_STOPS[stopIdx];
    const nucs = GENES[gene]?.nucleotides;
    if (nucs?.length > 1) {
      return {
        cursor: gene + (nuc / (nucs.length - 1)) * 0.1,
        nucCursor: nuc,
      };
    }
    return { cursor: gene, nucCursor: 0 };
  }

  function focusToVisual(pos) {
    const max = SCROLL_STOPS.length - 1;
    const clamped = THREE.MathUtils.clamp(pos, 0, max);
    const i0 = Math.floor(clamped);
    const i1 = Math.min(i0 + 1, max);
    const t = clamped - i0;
    const a = stopToVisual(i0);
    const b = stopToVisual(i1);
    return {
      cursor: THREE.MathUtils.lerp(a.cursor, b.cursor, t),
      nucCursor: THREE.MathUtils.lerp(a.nucCursor, b.nucCursor, t),
    };
  }

  function syncFocusVisuals() {
    const v = focusToVisual(state.focus);
    state.cursor = v.cursor;
    state.nucCursor = v.nucCursor;
  }

  function pulseTravel() {
    if (state.reduceMotion) return;
    state.flareTarget = 0.55;
    state.spreadTarget = 1;
    state.markDirty();
    setTimeout(() => {
      state.flareTarget = 0;
      state.markDirty();
    }, 220);
  }

  function applySelectionFromFocus() {
    const max = SCROLL_STOPS.length - 1;
    const rawStop = Math.round(THREE.MathUtils.clamp(state.focus, 0, max));
    const rawGene = SCROLL_STOPS[rawStop].gene;
    let stop = rawStop;
    if (GENES[rawGene]?.nucleotides && Math.abs(state.focus - rawStop) > CONTACT_PANEL_COMMIT) {
      stop = lastAppliedStop >= 0 ? lastAppliedStop : rawStop;
    }
    if (stop === lastAppliedStop) return;
    lastAppliedStop = stop;
    const { gene, nuc } = SCROLL_STOPS[stop];
    const geneChanged = gene !== state.selected;
    state.selected = gene;
    state.nucIndex = nuc;
    if (geneChanged && state.isMobileLayout) ui.resetSheetSnap();
    if (geneChanged) pulseTravel();
    else state.spreadTarget = 1;
    ui.syncPanel();
    ui.updateHud();
    state.markDirty();
  }

  function clearContactAim() {
    contactAimStop = null;
  }

  function aimContactStop(stopIdx) {
    const clamped = THREE.MathUtils.clamp(stopIdx, 0, SCROLL_STOPS.length - 1);
    if (contactAimStop === clamped) return;
    contactAimStop = clamped;
    focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
    state.spreadTarget = 1;
    state.markDirty();
  }

  function setFocusToStop(stopIdx) {
    clearContactAim();
    state.focus = THREE.MathUtils.clamp(stopIdx, 0, SCROLL_STOPS.length - 1);
    focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
    syncFocusVisuals();
    lastAppliedStop = -1;
    applySelectionFromFocus();
    state.spreadTarget = 1;
    state.markDirty();
  }

  function nudgeFocus(dir) {
    ui.dismissHint();
    const next = Math.round(state.focus) + dir;
    if (next < 0 || next >= SCROLL_STOPS.length) return;
    if (next === Math.round(state.focus)) return;
    setFocusToStop(next);
  }

  function markFocusInput() {
    clearContactAim();
    focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
    state.spreadTarget = 1;
    state.markDirty();
  }

  function applyFocusDelta(delta, pxPerUnit = FOCUS_PX_PER_UNIT) {
    if (Math.abs(delta) < 0.5) return;
    ui.dismissHint();
    state.focus += delta / pxPerUnit;
    state.focus = THREE.MathUtils.clamp(state.focus, 0, SCROLL_STOPS.length - 1);
    if (state.reduceMotion) state.focus = Math.round(state.focus);
    markFocusInput();
    syncFocusVisuals();
    applySelectionFromFocus();
  }

  function isTouchScrollBlocked(target) {
    return !!target?.closest?.(".bar, #memory-panel, .bar-btn, .panel-cta, .panel-inner, .panel-grab");
  }

  function onWorldClick(e) {
    if (state.introActive || state.unfold < 0.6) return;

    const dot = e.target.closest(".world-dot");
    if (dot) {
      const sec = dot.closest(".world-sec");
      const gi = ui.worldSecs.indexOf(sec);
      const dots = sec ? [...sec.querySelectorAll(".world-dot")] : [];
      const ni = dots.indexOf(dot);
      if (gi >= 0 && ni >= 0) {
        e.preventDefault();
        e.stopPropagation();
        setFocusToStop(selectionToFocus(gi, ni));
      }
      return;
    }

    const title = e.target.closest(".world-title");
    if (!title) return;
    const sec = title.closest(".world-sec");
    if (!sec) return;
    const i = ui.worldSecs.indexOf(sec);
    if (i < 0 || i === state.selected) return;
    e.preventDefault();
    e.stopPropagation();
    setFocusToStop(selectionToFocus(i, 0));
  }

  function onPointerMove(e) {
    if (state.introActive || state.unfold < 0.4) return;
    const pick = scene.pickFromPointer(e.clientX, e.clientY);
    browsing = pick.dist < 120 && pick.mode !== "miss";
    const nextSpread = browsing || geneNucs(GENES[state.selected]) ? 1 : 0.3;
    if (nextSpread !== state.spreadTarget) {
      state.spreadTarget = nextSpread;
      state.markDirty();
    }
    scene.renderer.domElement.style.cursor = browsing ? "pointer" : "default";

    if (pick.mode === "nuc" && pick.dist < 100 && performance.now() > focusInputUntil) {
      aimContactStop(selectionToFocus(pick.gene, pick.nuc));
    }
  }

  function onPointerLeave() {
    browsing = false;
    const nextSpread = geneNucs(GENES[state.selected]) ? 0.85 : 0.25;
    if (nextSpread !== state.spreadTarget) {
      state.spreadTarget = nextSpread;
      state.markDirty();
    }
    scene.renderer.domElement.style.cursor = "default";
  }

  function onClick(e) {
    if (state.introActive || state.unfold < 0.6) return;
    if (performance.now() < suppressClickUntil) return;
    ui.dismissHint();
    const pick = scene.pickFromPointer(e.clientX, e.clientY);
    const hitRadius = state.isMobileLayout ? 175 : 140;
    if (pick.dist > hitRadius || pick.mode === "miss") return;

    if (pick.mode === "nuc") {
      setFocusToStop(selectionToFocus(pick.gene, pick.nuc));
      if (!state.isMobileLayout) ui.activateCta();
      return;
    }

    if (pick.gene === state.selected) {
      if (!state.isMobileLayout) ui.activateCta();
      return;
    }

    setFocusToStop(selectionToFocus(pick.gene, 0));
  }

  function onWheel(e) {
    if (isTypingTarget(e.target) || e.target.closest?.("#memory-panel")) return;
    e.preventDefault();
    if (state.introActive) {
      intro.skip();
      return;
    }
    if (state.unfold < 0.4) return;
    const useY = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    let delta = useY ? e.deltaY : e.deltaX;
    if (e.deltaMode === 1) delta *= 16;
    else if (e.deltaMode === 2) delta *= ui.worldEl?.clientHeight || innerHeight;
    applyFocusDelta(delta);
  }

  function onTouchStart(e) {
    if (!state.isMobileLayout || state.introActive) return;
    if (isTouchScrollBlocked(e.target)) return;
    if (e.touches.length !== 1) return;
    touchDragY = e.touches[0].clientY;
    touchMoved = false;
  }

  function onTouchMove(e) {
    if (touchDragY === null || state.introActive) return;
    if (isTouchScrollBlocked(e.target)) return;
    if (state.unfold < 0.4) return;
    const y = e.touches[0].clientY;
    const delta = touchDragY - y;
    if (!touchMoved && Math.abs(delta) < TOUCH_DRAG_THRESHOLD) return;
    touchMoved = true;
    e.preventDefault();
    applyFocusDelta(delta, FOCUS_PX_PER_UNIT_TOUCH);
    touchDragY = y;
  }

  function onTouchEnd() {
    if (touchMoved) suppressClickUntil = performance.now() + 350;
    touchDragY = null;
    touchMoved = false;
  }

  function onKey(e) {
    if (isTypingTarget(e.target)) {
      if (e.key === "Escape") {
        e.target.blur?.();
        e.preventDefault();
      }
      return;
    }
    if (state.introActive) {
      if (
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        intro.skip();
      }
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nudgeFocus(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nudgeFocus(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!state.isMobileLayout) ui.activateCta();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (geneNucs(GENES[state.selected]) && state.nucIndex > 0) {
        setFocusToStop(selectionToFocus(state.selected, 0));
      }
    }
  }

  function stepFocus(dt) {
    if (contactAimStop !== null) {
      if (state.reduceMotion) {
        state.focus = contactAimStop;
        clearContactAim();
      } else {
        const d = contactAimStop - state.focus;
        if (Math.abs(d) < 0.006) {
          state.focus = contactAimStop;
          clearContactAim();
        } else {
          state.focus += d * (1 - Math.exp(-CONTACT_GLIDE_RATE * dt));
        }
      }
      syncFocusVisuals();
      applySelectionFromFocus();
    } else if (!state.reduceMotion && performance.now() > focusInputUntil) {
      const snap = Math.round(state.focus);
      const d = snap - state.focus;
      if (Math.abs(d) > 0.0005) {
        state.focus += d * (1 - Math.exp(-FOCUS_SETTLE_RATE * dt));
        syncFocusVisuals();
        applySelectionFromFocus();
      } else if (state.focus !== snap) {
        state.focus = snap;
        syncFocusVisuals();
        applySelectionFromFocus();
      }
    } else if (state.reduceMotion) {
      const snap = Math.round(state.focus);
      if (state.focus !== snap) {
        state.focus = snap;
        syncFocusVisuals();
        applySelectionFromFocus();
      }
    }
  }

  function isFocusBusy() {
    if (contactAimStop !== null) return true;
    if (performance.now() < focusInputUntil) return true;
    if (Math.abs(state.focus - Math.round(state.focus)) > 0.0005) return true;
    return false;
  }

  function isUserBusy() {
    if (browsing) return true;
    if (touchDragY !== null) return true;
    return isFocusBusy();
  }

  function resetFocus() {
    state.focus = 0;
    syncFocusVisuals();
    lastAppliedStop = -1;
    applySelectionFromFocus();
    state.markDirty();
  }

  function bind() {
    const { renderer } = scene;
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);
    ui.worldTrack?.addEventListener("click", onWorldClick);
    document.addEventListener("click", (e) => ui.onDocumentClick(e));
    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.addEventListener("keydown", onKey);

    document.getElementById("btn-prev").addEventListener("click", () => {
      ui.dismissHint();
      nudgeFocus(-1);
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      ui.dismissHint();
      nudgeFocus(1);
    });
    document.getElementById("btn-select").addEventListener("click", () => {
      if (!state.isMobileLayout) ui.activateCta();
    });
  }

  return {
    selectionToFocus,
    setFocusToStop,
    nudgeFocus,
    syncFocusVisuals,
    applySelectionFromFocus,
    stepFocus,
    isFocusBusy,
    isUserBusy,
    resetFocus,
    bind,
  };
}
