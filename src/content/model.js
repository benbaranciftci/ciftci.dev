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
