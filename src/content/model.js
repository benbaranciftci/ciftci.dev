import { GENES } from "./genes.js";

export { GENES } from "./genes.js";

export const PAD_EACH = 16;

export const SCROLL_STOPS = [];
GENES.forEach((g, gi) => {
  const nucs = g.nucleotides;
  if (nucs?.length) {
    nucs.forEach((_, ni) => SCROLL_STOPS.push({ gene: gi, nuc: ni }));
  } else {
    SCROLL_STOPS.push({ gene: gi, nuc: 0 });
  }
});

export const CONTENT = [];
export const GENE_START = [];
{
  let at = 0;
  GENES.forEach((g, gi) => {
    GENE_START[gi] = at;
    const n = g.nucleotides?.length ?? g.hexes ?? 3;
    for (let slot = 0; slot < n; slot++) CONTENT.push({ gene: gi, slot, contentIdx: at++ });
  });
}
export const CONTENT_COUNT = CONTENT.length;
export const SLOT_COUNT = PAD_EACH * 2 + CONTENT_COUNT;

export function geneHexCount(gi) {
  const g = GENES[gi];
  return g.nucleotides?.length ?? g.hexes ?? 3;
}

export function geneNucs(g) {
  return g?.nucleotides || null;
}

export function ctaLabelFor(nuc) {
  if (!nuc) return "Enter";
  if (nuc.cta) return nuc.cta;
  if (nuc.href?.startsWith("mailto:")) return "Send email";
  return nuc.name ? `Open ${nuc.name}` : "Enter";
}

export function geneCenterHex(gi) {
  return GENE_START[gi] + (geneHexCount(gi) - 1) * 0.5;
}

export function geneT(i) {
  return (i + 0.5) / GENES.length;
}

export function geneFromT(t) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < GENES.length; i++) {
    const d = Math.abs(geneT(i) - t);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function geneWorldDetail(g) {
  if (g.facts?.length) return g.facts[0][1];
  if (g.locked) return "Selected work · coming soon";
  if (g.href) {
    try {
      return new URL(g.href).hostname.replace(/^www\./, "");
    } catch {
      return g.href;
    }
  }
  if (g.nucleotides?.length) return `${g.nucleotides.length} ways to connect`;
  return "";
}

export function worldSideMeta(g, nuc) {
  if (nuc) {
    const parts = nuc.blurb?.split("·").map((s) => s.trim()) || [];
    return {
      sync: "LINK",
      detail: parts[1] || parts[0] || nuc.name,
    };
  }
  return {
    sync: g.locked ? "LOCKED" : g.sync || g.region || "",
    detail: geneWorldDetail(g),
  };
}

export function geneLogoUrls() {
  return [
    ...new Set(
      GENES.flatMap((g) => [
        g.logo,
        ...(g.nucleotides?.map((n) => n.logo) || []),
      ]).filter(Boolean)
    ),
  ];
}
