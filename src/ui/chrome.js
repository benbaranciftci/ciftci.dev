import { GENES, geneNucs } from "../content/model.js";

export function createChrome({ state, nav, world }) {
  const hintEl = document.getElementById("hint");
  const syncLabel = document.getElementById("sync-label");
  const syncNow = document.getElementById("sync-now");
  const syncTotal = document.getElementById("sync-total");
  const syncBox = document.getElementById("sync-box");
  const barRail = document.getElementById("bar-rail");

  let hintDismissed = false;

  function dismissHint() {
    if (hintDismissed || !state.isMobileLayout || !hintEl) return;
    hintDismissed = true;
    hintEl.classList.add("is-hidden");
  }

  function buildGeneRail() {
    if (!barRail) return;
    barRail.innerHTML = GENES.map(
      (g, i) =>
        `<button type="button" class="rail-dot" data-gene="${i}" role="tab" aria-label="${g.name}" aria-selected="false"></button>`
    ).join("");
    barRail.addEventListener("click", (e) => {
      const btn = e.target.closest(".rail-dot");
      if (!btn) return;
      dismissHint();
      nav.setFocusToStop(nav.selectionToFocus(Number(btn.dataset.gene), 0));
    });
  }

  function updateGeneRail() {
    if (!barRail) return;
    barRail.querySelectorAll(".rail-dot").forEach((btn, i) => {
      const active = i === state.selected;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function updateHud() {
    const g = GENES[state.selected];
    const nucs = geneNucs(g);
    const nuc = nucs ? nucs[state.nucIndex] : null;
    if (nuc) {
      syncLabel.textContent = "Contact";
      syncLabel.hidden = false;
      syncNow.textContent = String(state.nucIndex + 1);
      syncTotal.textContent = String(nucs.length);
    } else {
      syncLabel.hidden = true;
      syncNow.textContent = String(state.selected + 1).padStart(2, "0");
      syncTotal.textContent = String(GENES.length).padStart(2, "0");
    }
    syncBox.classList.toggle("is-contact", !!nuc);
    syncBox.classList.toggle("is-locked", !!g.locked && !nuc);
    if (nucs) {
      const hasMore = state.nucIndex < nucs.length - 1;
      const hasPrev = state.nucIndex > 0;
      if (state.isMobileLayout) {
        if (hasMore && hasPrev) hintEl.textContent = "Drag to browse contacts";
        else if (hasMore) hintEl.textContent = "Drag down for next contact";
        else if (hasPrev) hintEl.textContent = "Drag up for previous contact";
        else hintEl.textContent = "Pull card up for details";
      } else if (hasMore && hasPrev) hintEl.textContent = "Move to switch contact · Enter opens";
      else if (hasMore) hintEl.textContent = "Keep moving for next contact · Enter opens";
      else if (hasPrev) hintEl.textContent = "Move back for previous contact · Enter opens";
      else hintEl.textContent = "Enter opens link";
    } else if (g.locked) {
      hintEl.textContent = "Locked gene";
    } else if (g.href) {
      hintEl.textContent = state.isMobileLayout
        ? "Drag to browse · Pull card up for details"
        : "Move along the strand · Enter opens link";
    } else {
      hintEl.textContent = state.isMobileLayout
        ? "Drag to browse · Pull card up for details"
        : "Move along the strand";
    }
    hintEl.classList.toggle("locked", !!g.locked);

    world.applyWorldDots();
    updateGeneRail();
  }

  return {
    dismissHint,
    buildGeneRail,
    updateGeneRail,
    updateHud,
  };
}
