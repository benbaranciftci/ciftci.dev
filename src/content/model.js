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

export const CONTACT_INDEX = GENES.findIndex((g) => g.id === "contact");

export function asPlateCta(text) {
  const core = String(text || "OPEN").replace(/[▸►]/g, "").trim().toUpperCase();
  return `${core} ▸`;
}

export function ctaLabelFor(nuc) {
  if (!nuc) return asPlateCta("OPEN");
  if (nuc.cta) return asPlateCta(nuc.cta);
  if (nuc.href?.startsWith("mailto:")) return asPlateCta("SEND MAIL");
  return asPlateCta(nuc.name ? `OPEN ${nuc.name}` : "OPEN");
}

export function geneCtaLabel(g) {
  return asPlateCta(g?.name ? `OPEN ${g.name}` : "OPEN");
}

export function geneCenterHex(gi) {
  return GENE_START[gi] + (geneHexCount(gi) - 1) * 0.5;
}

export function geneLogoUrls() {
  return [
    ...new Set(
      GENES.flatMap((g) => [
        g.logo,
        ...(g.links?.map((n) => n.logo) || []),
        ...(g.nucleotides?.map((n) => n.logo) || []),
      ]).filter(Boolean)
    ),
  ];
}
