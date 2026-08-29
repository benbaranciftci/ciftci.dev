import { GENES, worldSideMeta } from "../content/model.js";

export function createWorld({ state }) {
  const worldEl = document.getElementById("world");
  const worldTrack = document.getElementById("world-track");

  let worldSecs = [];
  let worldY = 0;
  let worldTravelPx = 0;
  let worldSecHeight = 0;
  let worldStepPx = 0;
  let secHeightPx = 0;

  function buildWorldPage() {
    if (!worldTrack) return;
    worldTrack.innerHTML = GENES.map((g) => {
      const { sync, detail } = worldSideMeta(g);
      const copy = `<p class="world-kicker">${g.region}</p>
      <h2 class="world-title">${g.name}</h2>
      <p class="world-year">${g.year}</p>
      <p class="world-sync${g.locked ? " is-locked" : ""}">${sync}</p>
      <p class="world-detail">${detail}</p>
      <div class="world-rule" aria-hidden="true"></div>`;
      if (g.nucleotides?.length) {
        const dots = `<div class="world-dots" role="tablist" aria-label="Contact links">${g.nucleotides
          .map(
            (n) =>
              `<span class="world-dot" role="tab" aria-label="${n.name}" aria-selected="false"></span>`
          )
          .join("")}</div>`;
        return `<section class="world-sec world-sec--contact">
      <div class="world-row">
        ${dots}
        <div class="world-copy">${copy}</div>
      </div>
    </section>`;
      }
      return `<section class="world-sec">${copy}</section>`;
    }).join("");
    worldSecs = [...worldTrack.querySelectorAll(".world-sec")];
  }

  function geneScrollY(geneIdx, nucIdx = 0) {
    let idx = geneIdx;
    const g = GENES[Math.round(Math.min(Math.max(geneIdx, 0), GENES.length - 1))];
    const nucs = g?.nucleotides;
    if (nucs?.length > 1) {
      idx += (nucIdx / Math.max(1, nucs.length - 1)) * 0.1;
    }
    return idx * worldStepPx;
  }

  function measureWorldTravel() {
    if (!worldEl || !worldTrack || !worldSecs.length) return;
    let h;
    let step;
    if (state.isMobileLayout) {
      const vp = worldEl.querySelector(".world-viewport");
      h = Math.max(1, vp?.clientHeight || 200);
      step = Math.max(96, Math.round(h * 0.58));
    } else {
      h = Math.max(1, worldEl.clientHeight);
      step = Math.max(112, Math.round(h * 0.36));
    }
    worldSecHeight = h;
    worldStepPx = step;
    worldTrack.style.paddingTop = "0";
    worldTrack.style.paddingBottom = "0";
    worldSecs.forEach((el, i) => {
      el.style.height = `${h}px`;
      el.style.marginTop = i === 0 ? "0" : `${worldStepPx - h}px`;
    });
    secHeightPx = h;
    worldTravelPx = Math.max(0, (GENES.length - 1) * worldStepPx);
  }

  function applyWorldScroll() {
    if (!worldTrack) return;
    worldTrack.style.transform = `translate3d(0, ${(-worldY).toFixed(2)}px, 0)`;
  }

  function applyWorldDots() {
    const focusGene = Math.round(Math.min(Math.max(state.cursor, 0), GENES.length - 1));
    const g = GENES[focusGene];
    const nucs = g?.nucleotides;
    const sec = worldSecs[focusGene];
    if (!sec) return;
    const dots = sec.querySelectorAll(".world-dot");
    if (!dots.length) return;
    const onContact = nucs && Math.abs(state.cursor - focusGene) < 0.45;
    const idx = onContact ? Math.round(state.nucCursor) : -1;
    dots.forEach((dot, i) => {
      const on = idx >= 0 && i === idx;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function applyWorldOpacity() {
    const focusGene = Math.round(Math.min(Math.max(state.cursor, 0), GENES.length - 1));
    worldSecs.forEach((el, i) => {
      const d = Math.abs(state.cursor - i);
      const focusAmt = Math.max(0, 1 - d * 0.58);
      const opacity = 0.3 + focusAmt * 0.7;
      const scale = 0.94 + focusAmt * 0.06;
      el.style.opacity = String(opacity);
      el.style.transform = `scale(${scale.toFixed(3)})`;
      el.classList.toggle("is-active", d < 0.22);
      el.classList.toggle("is-adjacent", Math.abs(i - focusGene) === 1);
    });
  }

  function updateWorldLabels() {
    const gi = Math.round(Math.min(Math.max(state.cursor, 0), GENES.length - 1));
    const g = GENES[gi];
    if (!g) return;
    const nucs = g.nucleotides;
    const onContact = nucs && Math.abs(state.cursor - gi) < 0.45;
    const nuc = onContact
      ? nucs[Math.round(Math.min(Math.max(state.nucCursor, 0), nucs.length - 1))]
      : null;
    const sec = worldSecs[gi];
    if (!sec) return;
    const meta = worldSideMeta(g, nuc);
    const title = sec.querySelector(".world-title");
    const sync = sec.querySelector(".world-sync");
    const detail = sec.querySelector(".world-detail");
    if (title) title.textContent = nuc ? nuc.name : g.name;
    if (sync) {
      sync.textContent = meta.sync;
      sync.classList.toggle("is-locked", !!g.locked && !nuc);
    }
    if (detail) detail.textContent = meta.detail;
  }

  function stepWorld() {
    if (!worldEl || !worldTrack) return;
    const focusGene = Math.round(Math.min(Math.max(state.cursor, 0), GENES.length - 1));
    const nucs = GENES[focusGene]?.nucleotides;
    const onContact = nucs && Math.abs(state.cursor - focusGene) < 0.45;
    const nuc = onContact ? state.nucCursor : 0;
    worldY = geneScrollY(state.cursor, nuc);
    applyWorldScroll();
    applyWorldOpacity();
    applyWorldDots();
    updateWorldLabels();
  }

  return {
    worldEl,
    worldTrack,
    get worldSecs() {
      return worldSecs;
    },
    get secHeightPx() {
      return secHeightPx;
    },
    get worldTravelPx() {
      return worldTravelPx;
    },
    get worldSecHeight() {
      return worldSecHeight;
    },
    buildWorldPage,
    measureWorldTravel,
    applyWorldScroll,
    applyWorldDots,
    stepWorld,
  };
}
