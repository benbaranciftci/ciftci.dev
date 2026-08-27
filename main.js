import * as THREE from "three";

const GENES = [
  {
    id: "about",
    region: "ABOUT",
    year: "NOW",
    name: "origin",
    sync: "BIO",
    hexes: 5,
    blurb:
      "Computer engineering student split between Torino and Istanbul. I write software, tinker with robots, and ship small games — learning by building, then building again.",
    facts: [
      ["Based in", "Torino · Istanbul"],
      ["Focus", "Software · Robotics · Games"],
      ["Studying", "Computer Engineering"],
    ],
  },
  {
    id: "alfred",
    region: "WORK",
    year: "2024",
    name: "aIfred",
    sync: "SOON",
    hexes: 4,
    logo: "assets/alfred-logo.jpg",
    logoAlt: "aIfred",
    blurb: "Local operator — talks on the machine. No cloud. Coming soon.",
    facts: [
      ["Type", "personal AI operator"],
      ["Status", "private · working on it"],
      ["Stack", "on-device · no API key"],
    ],
  },
  {
    id: "unimind",
    region: "WORK",
    year: "2025",
    name: "unimind",
    sync: "LIVE",
    hexes: 5,
    href: "https://unimind.consulting/",
    logo: "assets/unimind-logo.png",
    logoAlt: "unimind",
    blurb:
      "Personalized university rankings — build a ranking around your priorities: academics, cost, outcomes, and fit.",
    facts: [
      ["Live", "unimind.consulting"],
      ["Focus", "university rankings · admissions data"],
      ["Role", "co-founder / developer"],
    ],
  },
  {
    id: "site",
    region: "WORK",
    year: "2026",
    name: "ciftci.dev",
    sync: "LIVE",
    hexes: 3,
    href: "https://ciftci.dev/",
    blurb: "Personal site. Selected work.",
  },
  {
    id: "robotics",
    region: "WORK",
    year: "—",
    name: "robotics",
    sync: "LOCKED",
    hexes: 3,
    locked: true,
    blurb: "Selected work — robotics. Coming soon.",
  },
  {
    id: "games",
    region: "WORK",
    year: "—",
    name: "games",
    sync: "LOCKED",
    hexes: 3,
    locked: true,
    blurb: "Selected work — games. Coming soon.",
  },
  {
    id: "contact",
    region: "CONTACT",
    year: "NOW",
    name: "contact",
    sync: "OPEN",
    blurb: "Ways to reach me — scroll or use → to switch.",
    nucleotides: [
      {
        id: "github",
        name: "GitHub",
        blurb: "GitHub · benbaranciftci",
        href: "https://github.com/benbaranciftci",
        cta: "Open GitHub",
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        blurb: "LinkedIn · Baran Çiftçi",
        href: "https://www.linkedin.com/in/baran-%C3%A7ift%C3%A7i-a004b9283",
        cta: "Open LinkedIn",
      },
      {
        id: "email",
        name: "Email",
        blurb: "Email · baran@ciftci.dev",
        href: "mailto:baran@ciftci.dev",
        cta: "Send email",
      },
    ],
  },
];

const ACCENT_THEMES = {
  light: {
    accent: 0x7113d7,
    accentHot: 0x9b4aef,
    fog: 0xe8e2ef,
    fogNear: 12,
    fogFar: 40,
    ambient: 1.15,
    key: 0xffffff,
    keyI: 0.45,
    h: 0.72,
    sMesh: 0.05,
    sLine: 0.04,
    padL0: 0.72,
    padL1: 0.06,
    contentL0: 0.08,
    contentL1: 0.78,
    meshOp: 0.12,
    lineOp: 0.72,
    contentOp: 0.05,
    contentOpU: 0.14,
    contentLineOp: 0.28,
    contentLineOpU: 0.55,
    padOp: 0.85,
    padLine: 0.18,
    padLineU: 0.4,
    lineLift: 0.14,
    lineCap: 0.96,
    padLift: 0.12,
    padCap: 0.9,
    decor: 0xffffff,
    decorOp: 0.12,
  },
  dark: {
    accent: 0x8b4de8,
    accentHot: 0xb07aff,
    fog: 0x2a2730,
    fogNear: 14,
    fogFar: 42,
    ambient: 0.95,
    key: 0xe8d8ff,
    keyI: 0.4,
    h: 0.74,
    sMesh: 0.08,
    sLine: 0.1,
    padL0: 0.62,
    padL1: 0.14,
    contentL0: 0.18,
    contentL1: 0.52,
    meshOp: 0.14,
    lineOp: 0.65,
    contentOp: 0.08,
    contentOpU: 0.16,
    contentLineOp: 0.22,
    contentLineOpU: 0.5,
    padOp: 0.8,
    padLine: 0.14,
    padLineU: 0.36,
    lineLift: 0.18,
    lineCap: 0.88,
    padLift: 0.16,
    padCap: 0.82,
    decor: 0xcbb8ef,
    decorOp: 0.1,
  },
};

function readTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return "light";
}

let themeName = readTheme();
let theme = ACCENT_THEMES[themeName];
let ACCENT = theme.accent;
let ACCENT_HOT = theme.accentHot;
const PAD_EACH = 16;
const CURVE_SAMPLES = 180;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONTENT = [];
const GENE_START = [];
{
  let at = 0;
  GENES.forEach((g, gi) => {
    GENE_START[gi] = at;
    const n = g.nucleotides?.length ?? g.hexes ?? 3;
    for (let slot = 0; slot < n; slot++) CONTENT.push({ gene: gi, slot, contentIdx: at++ });
  });
}
const CONTENT_COUNT = CONTENT.length;
const SLOT_COUNT = PAD_EACH * 2 + CONTENT_COUNT;

const hintEl = document.getElementById("hint");
const syncLabel = document.getElementById("sync-label");
const syncVal = document.getElementById("sync-val");
const syncBox = document.getElementById("sync-box");
const panel = document.getElementById("memory-panel");
const panelTitle = document.getElementById("panel-title");
const panelBody = document.getElementById("panel-body");
const panelFacts = document.getElementById("panel-facts");
const panelCta = document.getElementById("panel-cta");
const panelKicker = document.getElementById("panel-kicker");
const panelLogo = document.getElementById("panel-logo");
const panelLogoImg = document.getElementById("panel-logo-img");
const mount = document.getElementById("strand");
const worldEl = document.getElementById("world");
const worldTrack = document.getElementById("world-track");

const introEl = document.getElementById("intro");
const introLoad = document.getElementById("intro-load");
const introRing = document.getElementById("intro-ring");
const introPct = document.getElementById("intro-pct");
const introSplit = document.getElementById("intro-split");
const introActiveStart = Boolean(introEl) && !reduceMotion;

const LOAD_WEIGHTS = {
  boot: 12,
  fonts: 20,
  scene: 38,
  assets: 20,
  frame: 10,
};

const loadMarks = {
  boot: false,
  fonts: false,
  scene: false,
  assets: false,
  frame: false,
};

let introActive = introActiveStart;
let introPhase = introActive ? "load" : "done";
let introTimer = 0;
let introReadyQueued = false;
let selected = 0;
let cursor = 0;
let opened = false;
let nucIndex = 0;
let nucCursor = 0;
let browsing = false;
let unfold = reduceMotion || !introActive ? 1 : 0.05;
let unfoldTarget = introActive ? 0.15 : 1;
let flare = 0;
let flareTarget = 0;
let spread = reduceMotion ? 0.35 : introActive ? 0.4 : 0;
let spreadTarget = introActive ? 0.55 : 0.3;
let curve = null;
let frames = null;
let openBuilt = -1;
let layoutFocus = 0;
let worldY = 0;
let worldTravelPx = 0;
let lastTickMs = 0;
let secHeightPx = 0;
let worldSecs = [];

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0.2, 0.35, 18.5);

const STRAND_POSE = { x: -0.08, y: 0.12, z: -0.05 };

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, theme.ambient);
scene.add(ambient);
const key = new THREE.DirectionalLight(theme.key, theme.keyI);
key.position.set(5, 10, 12);
scene.add(key);

const root = new THREE.Group();
scene.add(root);
const deco = new THREE.Group();
scene.add(deco);

function hexPlateGeo() {
  const shape = new THREE.Shape();
  const rx = 0.78;
  const ry = 0.3;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.016, bevelEnabled: false });
  geo.center();
  geo.rotateY(Math.PI / 2);
  return geo;
}

const plateGeo = hexPlateGeo();
const edgeGeo = new THREE.EdgesGeometry(plateGeo);
const contentHexes = [];
const padHexes = [];

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _tmp = new THREE.Vector3();

function geneHexCount(gi) {
  const g = GENES[gi];
  return g.nucleotides?.length ?? g.hexes ?? 3;
}

function currentGene() {
  return GENES[selected];
}

function geneNucs(g = currentGene()) {
  return g.nucleotides || null;
}

function ctaLabelFor(nuc) {
  if (!nuc) return "Enter";
  if (nuc.cta) return nuc.cta;
  if (nuc.href?.startsWith("mailto:")) return "Send email";
  return nuc.name ? `Open ${nuc.name}` : "Enter";
}

function makeCurve(openAmt) {
  const pts = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let x = THREE.MathUtils.lerp(-9.5, 9.5, t);
    x -= 3.0 * (1 - THREE.MathUtils.smoothstep(t, 0, 0.18));
    x += 3.0 * THREE.MathUtils.smoothstep(t, 0.82, 1);
    const y0 = THREE.MathUtils.lerp(-0.85, 1.05, t);
    const w1 = Math.sin(t * Math.PI * 2.2) * 1.65 * openAmt;
    const w2 = Math.sin(t * Math.PI * 1.25 + 0.8) * 0.7 * openAmt;
    const w3 = Math.cos(t * Math.PI * 2.4 + 0.25) * 0.2 * openAmt;
    const z =
      Math.sin(t * Math.PI * 1.85 + 0.4) * 1.55 * openAmt +
      Math.cos(t * Math.PI * 1.0) * 0.55 * openAmt;
    pts.push(new THREE.Vector3(x, y0 + w1 + w2 + w3, z));
  }
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

function rebuildCurve(openAmt) {
  if (Math.abs(openAmt - openBuilt) < 0.008 && curve) return;
  openBuilt = openAmt;
  curve = makeCurve(Math.max(0.06, openAmt));
  frames = curve.computeFrenetFrames(CURVE_SAMPLES, false);
}

function geneT(i) {
  return (i + 0.5) / GENES.length;
}

function geneCenterHex(gi) {
  return GENE_START[gi] + (geneHexCount(gi) - 1) * 0.5;
}

function geneFromT(t) {
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

function focusHex() {
  if (opened && geneNucs()) return geneCenterHex(selected);
  const gi = Math.floor(cursor);
  const gf = cursor - gi;
  const g2 = Math.min(GENES.length - 1, gi + 1);
  return THREE.MathUtils.lerp(geneCenterHex(gi), geneCenterHex(g2), gf);
}

function hexToT(hexIdx, focus, spreadAmt) {
  const offset = hexIdx - focus;
  const sigma = 2.2;
  const boost = 1 + spreadAmt * 0.55;
  const near = Math.exp(-(offset * offset) / (2 * sigma * sigma));
  const spaced = offset * (1 + (boost - 1) * near * 0.5);
  const step = 0.032;
  return THREE.MathUtils.clamp(0.5 + spaced * step, 0.005, 0.995);
}

function sampleAt(tU) {
  const t = Math.max(0, Math.min(1, tU));
  const f = t * (CURVE_SAMPLES - 1);
  const a = Math.floor(f);
  const b = Math.min(CURVE_SAMPLES - 1, a + 1);
  const u = f - a;
  return {
    pos: curve.getPointAt(t),
    tan: curve.getTangentAt(t).normalize(),
    normal: frames.normals[a].clone().lerp(frames.normals[b], u).normalize(),
    binormal: frames.binormals[a].clone().lerp(frames.binormals[b], u).normalize(),
    t,
  };
}

function orient(obj, tan, normal, binormal) {
  _x.copy(tan).normalize();
  _y.copy(normal).normalize();
  _z.copy(binormal).normalize();
  if (_y.lengthSq() < 0.01) {
    _y.set(0, 1, 0);
    _z.crossVectors(_x, _y).normalize();
    _y.crossVectors(_z, _x).normalize();
  }
  _m.makeBasis(_x, _y, _z);
  _q.setFromRotationMatrix(_m);
  obj.quaternion.copy(_q);
}

function hexStyle(hexIdx, focus, isPad) {
  const offset = hexIdx - focus;
  const along = THREE.MathUtils.clamp((hexIdx + PAD_EACH) / (CONTENT_COUNT + PAD_EACH * 2), 0, 1);
  const baseL = THREE.MathUtils.lerp(theme.padL0, theme.padL1, along);
  const rim = Math.abs(offset) / (PAD_EACH + CONTENT_COUNT * 0.35);
  const fade = 1 - Math.pow(Math.max(0, rim - 0.55) / 0.45, 1.15);
  return { fade: Math.max(0, fade), L: baseL * Math.max(0, fade), isPad };
}

function makeHexEntry(kind, meta) {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(theme.h, theme.sMesh, 0.5),
    transparent: true,
    opacity: theme.meshOp,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(plateGeo, mat);
  mesh.userData = { ...meta, kind };
  root.add(mesh);
  const lm = new THREE.LineBasicMaterial({
    color: new THREE.Color().setHSL(theme.h, theme.sLine, 0.82),
    transparent: true,
    opacity: theme.lineOp,
  });
  const line = new THREE.LineSegments(edgeGeo, lm);
  root.add(line);
  return { mesh, line };
}

function ensureHexes() {
  if (contentHexes.length) return;
  CONTENT.forEach(({ gene, slot, contentIdx }) => {
    const shade = contentIdx / Math.max(1, CONTENT_COUNT - 1);
    const L = theme.contentL0 + shade * theme.contentL1;
    const { mesh, line } = makeHexEntry("content", { gene, slot, contentIdx });
    mesh.userData.baseL = L;
    line.userData.baseL = L;
    contentHexes.push({ mesh, line });
  });
  for (let p = 0; p < PAD_EACH; p++) {
    padHexes.push(makeHexEntry("pad", { side: "left", padIdx: p }));
    padHexes.push(makeHexEntry("pad", { side: "right", padIdx: p }));
  }
}

function layoutHex(entry, hexIdx, focus, style) {
  const { mesh, line } = entry;
  const ud = mesh.userData;
  const t = hexToT(hexIdx, focus, spread);
  const frame = sampleAt(t);
  const pos = frame.pos.clone();
  const isContent = ud.kind === "content";
  const gene = isContent ? ud.gene : -1;
  const slotIdx = isContent ? ud.slot : -1;
  const nucs = opened && gene === selected ? geneNucs() : null;
  const isNuc = !!nucs && isContent;
  const nucDist = isNuc ? Math.abs(slotIdx - nucCursor) : 1;
  const isActiveNuc = isNuc && nucDist < 0.55;
  const focusGene = Math.round(cursor);
  const hot = isContent && (gene === focusGene || isActiveNuc);
  const nearFocus = Math.abs(hexIdx - focus);
  const activeAmt = isNuc ? Math.max(0, 1 - nucDist) : 0;

  if (flare > 0.01 && nearFocus < 2.2 && !(opened && geneNucs())) {
    const g = 1 - nearFocus / 2.2;
    const side = hexIdx < focus ? -1 : 1;
    pos.addScaledVector(frame.binormal, side * g * g * flare * 1.75);
  }
  if (isNuc) {
    pos.y += THREE.MathUtils.lerp(0.08, 0.62, activeAmt);
  }

  const gap = 1 + spread * Math.exp(-(nearFocus * nearFocus) / 8);
  const s =
    (0.95 + unfold * 0.55) *
    (0.88 + Math.min(2.6, gap) * 0.17) *
    (isNuc
      ? THREE.MathUtils.lerp(1.18, 1.45, activeAmt)
      : hot
        ? 1.16 + Math.sin(performance.now() * 0.004) * 0.03
        : 1) *
    (0.88 + style.fade * 0.14);

  mesh.position.copy(pos);
  line.position.copy(pos);
  orient(mesh, frame.tan, frame.normal, frame.binormal);
  line.quaternion.copy(mesh.quaternion);
  mesh.scale.setScalar(s);
  line.scale.setScalar(s);

  const alpha = style.fade * (0.05 + unfold * 0.14);
  if (isNuc && activeAmt > 0.15) {
    const a = activeAmt;
    mesh.material.color.setHex(a > 0.65 ? ACCENT : ACCENT_HOT);
    mesh.material.opacity = THREE.MathUtils.lerp(0.38, 0.72, a);
    line.material.color.setHex(a > 0.65 ? ACCENT_HOT : ACCENT);
    line.material.opacity = THREE.MathUtils.lerp(0.95, 1, a);
  } else if (isNuc) {
    const isNeighbor = Math.abs(slotIdx - nucIndex) === 1;
    const pulse =
      isNeighbor && !reduceMotion
        ? 0.5 + 0.5 * Math.sin(performance.now() * 0.005 + slotIdx)
        : 0;
    mesh.material.color.setHex(ACCENT_HOT);
    mesh.material.opacity = THREE.MathUtils.lerp(0.3, 0.4, pulse);
    line.material.color.setHex(ACCENT);
    line.material.opacity = THREE.MathUtils.lerp(0.5, 1, pulse * 0.8);
    if (pulse > 0) {
      const bump = 1 + pulse * 0.08;
      mesh.scale.setScalar(s * bump);
      line.scale.setScalar(s * bump);
    }
  } else if (hot) {
    mesh.material.color.setHex(ACCENT);
    mesh.material.opacity = 0.5;
    line.material.color.setHex(ACCENT_HOT);
    line.material.opacity = 1;
  } else if (isContent) {
    mesh.material.color.setHSL(theme.h, theme.sMesh, ud.baseL);
    mesh.material.opacity = Math.max(alpha, theme.contentOp + unfold * theme.contentOpU);
    line.material.color.setHSL(theme.h, theme.sLine, Math.min(theme.lineCap, ud.baseL + theme.lineLift));
    line.material.opacity = theme.contentLineOp + unfold * theme.contentLineOpU;
  } else {
    mesh.material.color.setHSL(theme.h, theme.sMesh, style.L);
    mesh.material.opacity = alpha * theme.padOp;
    line.material.color.setHSL(theme.h, theme.sLine, Math.min(theme.padCap, style.L + theme.padLift));
    line.material.opacity = style.fade * (theme.padLine + unfold * theme.padLineU);
  }

  mesh.visible = style.fade > 0.03 && unfold > 0.06;
  line.visible = mesh.visible;
}

function layout() {
  rebuildCurve(unfold);
  ensureHexes();

  const focus = focusHex();
  layoutFocus = focus;

  contentHexes.forEach((entry) => {
    const { contentIdx } = entry.mesh.userData;
    const style = hexStyle(contentIdx, focus, false);
    style.fade = 1;
    layoutHex(entry, contentIdx, focus, style);
  });

  padHexes.forEach((entry) => {
    const { side, padIdx } = entry.mesh.userData;
    const hexIdx = side === "left" ? -(padIdx + 1) : CONTENT_COUNT + padIdx;
    const style = hexStyle(hexIdx, focus, true);
    layoutHex(entry, hexIdx, focus, style);
  });
}

function addDecor() {
  const g = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: theme.decor, transparent: true, opacity: theme.decorOp })
    );
    m.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 11,
      (Math.random() - 0.5) * 9
    );
    m.rotation.z = Math.PI / 4;
    m.userData.phase = Math.random() * 6;
    deco.add(m);
  }
}

function buildWorldPage() {
  if (!worldTrack) return;
  worldTrack.innerHTML = GENES.map(
    (g) => `<section class="world-sec">
      <p class="world-kicker">${g.region}</p>
      <h2 class="world-title">${g.name}</h2>
      <p class="world-year">${g.year}</p>
      <p class="world-blurb">${g.blurb || ""}</p>
      <div class="world-rule" aria-hidden="true"></div>
    </section>`
  ).join("");
  worldSecs = [...worldTrack.querySelectorAll(".world-sec")];
}

function geneScrollY(geneIdx, nucIdx = 0) {
  const span = Math.max(1, GENES.length - 1);
  let p = geneIdx / span;
  const g = GENES[Math.round(THREE.MathUtils.clamp(geneIdx, 0, GENES.length - 1))];
  const nucs = g?.nucleotides;
  if (nucs?.length > 1) {
    p += (nucIdx / Math.max(1, nucs.length - 1)) * (0.12 / span);
  }
  return THREE.MathUtils.clamp(p, 0, 1) * worldTravelPx;
}

function measureWorldTravel() {
  if (!worldEl || !worldTrack) return;
  const h = Math.max(1, worldEl.clientHeight);
  secHeightPx = h;
  worldSecs.forEach((el) => {
    el.style.height = `${h}px`;
  });
  worldTravelPx = Math.max(0, (GENES.length - 1) * h);
}

function applyWorldScroll() {
  if (!worldTrack) return;
  worldTrack.style.transform = `translate3d(0, ${(-worldY).toFixed(2)}px, 0)`;
}

function stepWorld(dt) {
  if (!worldEl || !worldTrack) return;
  const nuc = opened && geneNucs() ? nucCursor : 0;
  const target = geneScrollY(cursor, nuc);
  if (reduceMotion) {
    worldY = target;
  } else {
    const alpha = 1 - Math.exp(-9 * dt);
    worldY += (target - worldY) * alpha;
    if (Math.abs(target - worldY) < 0.15) worldY = target;
  }
  applyWorldScroll();

  worldSecs.forEach((el, i) => {
    const d = Math.abs(cursor - i);
    const near = Math.max(0, 1 - d);
    el.style.opacity = String(0.42 + near * 0.58);
  });
}

function fillFacts(g) {
  if (!g.facts?.length) {
    panelFacts.hidden = true;
    panelFacts.innerHTML = "";
    return;
  }
  panelFacts.hidden = false;
  panelFacts.innerHTML = g.facts
    .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
    .join("");
}

function setCta(href, label = "Enter") {
  if (!href) {
    panelCta.hidden = true;
    panelCta.removeAttribute("href");
    return;
  }
  panelCta.hidden = false;
  panelCta.href = href;
  panelCta.target = href.startsWith("http") ? "_blank" : "_self";
  panelCta.rel = href.startsWith("http") ? "noopener noreferrer" : "";
  panelCta.textContent = label;
}

function setLogo(logo, alt) {
  if (!logo) {
    panelLogo.hidden = true;
    panelLogoImg.removeAttribute("src");
    panelLogoImg.alt = "";
    return;
  }
  panelLogo.hidden = false;
  panelLogoImg.src = logo;
  panelLogoImg.alt = alt || "";
}

function updateHud(instant) {
  const g = currentGene();
  const nucs = opened ? geneNucs(g) : null;
  const nuc = nucs ? nucs[nucIndex] : null;
  if (!instant) {
    hintEl.classList.remove("flash");
    syncBox.classList.remove("flash");
    void hintEl.offsetWidth;
    hintEl.classList.add("flash");
    syncBox.classList.add("flash");
  }
  if (nuc) {
    syncLabel.textContent = "CONTACT";
    syncVal.textContent = `${nucIndex + 1} / ${nucs.length}`;
  } else {
    syncLabel.textContent = "GEN";
    syncVal.textContent = String(selected + 1).padStart(2, "0");
  }
  if (opened && nucs) {
    const hasMore = nucIndex < nucs.length - 1;
    const hasPrev = nucIndex > 0;
    if (hasMore && hasPrev) hintEl.textContent = "Scroll or ← → for next · Enter opens link";
    else if (hasMore) hintEl.textContent = "Scroll or → for next · Enter opens link";
    else if (hasPrev) hintEl.textContent = "Scroll or ← for previous · Enter opens link";
    else hintEl.textContent = "Enter opens link · Esc closes";
  } else if (opened) {
    hintEl.textContent = "Esc closes gene";
  } else if (g.locked) {
    hintEl.textContent = "Locked gene";
  } else if (geneNucs(g)) {
    hintEl.textContent = "Enter opens · then scroll between contacts";
  } else {
    hintEl.textContent = "Enter opens this gene";
  }
  hintEl.classList.toggle("locked", !!g.locked && !opened);

  const sec = worldSecs[selected];
  if (sec) {
    const title = sec.querySelector(".world-title");
    const blurb = sec.querySelector(".world-blurb");
    if (title) title.textContent = nuc ? nuc.name : g.name;
    if (blurb) blurb.textContent = nuc ? nuc.blurb : g.blurb || "";
  }
}

function syncPanel() {
  const g = currentGene();
  const nucs = geneNucs(g);
  if (opened && nucs) {
    const nuc = nucs[nucIndex];
    panelKicker.textContent = "Contact";
    panelTitle.textContent = nuc.name;
    panelBody.textContent = nuc.blurb;
    panelFacts.hidden = true;
    panelFacts.innerHTML = "";
    setLogo(null);
    setCta(nuc.href, ctaLabelFor(nuc));
    return;
  }
  panelKicker.textContent = "Gene";
  panelTitle.textContent = g.name;
  panelBody.textContent = g.blurb;
  fillFacts(g);
  setLogo(g.logo, g.logoAlt || g.name);
  if (!g.href) setCta(null);
  else setCta(g.href, g.name ? `Open ${g.name}` : "Enter");
}

function openPanel() {
  const g = currentGene();
  if (g.locked) {
    syncBox.classList.remove("deny");
    void syncBox.offsetWidth;
    syncBox.classList.add("deny");
    return;
  }
  opened = true;
  nucIndex = 0;
  nucCursor = 0;
  flareTarget = 1;
  spreadTarget = 1;
  panel.hidden = false;
  panel.classList.remove("is-open");
  void panel.offsetWidth;
  requestAnimationFrame(() => panel.classList.add("is-open"));
  document.body.classList.add("memory-open");
  syncPanel();
  updateHud(true);
}

function closePanel() {
  opened = false;
  nucIndex = 0;
  nucCursor = 0;
  flareTarget = 0;
  spreadTarget = browsing ? 1 : 0.3;
  panel.classList.remove("is-open");
  document.body.classList.remove("memory-open");
  setTimeout(() => {
    if (!opened) panel.hidden = true;
  }, 320);
  updateHud(true);
}

function togglePanel() {
  if (opened) closePanel();
  else openPanel();
}

function setNuc(i) {
  const nucs = geneNucs();
  if (!nucs?.length) return;
  const next = Math.max(0, Math.min(nucs.length - 1, i));
  if (next === nucIndex) return;
  nucIndex = next;
  if (!reduceMotion) {
    spreadTarget = 1;
  } else {
    nucCursor = next;
  }
  syncPanel();
  updateHud(false);
}

function pulseTravel() {
  if (reduceMotion) return;
  flareTarget = 0.55;
  spreadTarget = 1;
  setTimeout(() => {
    if (!opened) flareTarget = 0;
  }, 220);
}

function setTarget(i) {
  const next = Math.max(0, Math.min(GENES.length - 1, i));
  if (next === selected) return;
  if (opened) closePanel();
  selected = next;
  pulseTravel();
  if (reduceMotion) {
    cursor = next;
    updateHud(true);
  } else {
    updateHud(false);
  }
}

function pickFromPointer(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  const v = new THREE.Vector3();
  let bestGene = selected;
  let bestSlot = 0;
  let bestD = Infinity;
  let hit = false;

  for (const { mesh } of contentHexes) {
    if (!mesh.visible) continue;
    v.copy(mesh.position).project(camera);
    const sx = (v.x * 0.5 + 0.5) * rect.width;
    const sy = (-v.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(sx - (clientX - rect.left), sy - (clientY - rect.top));
    if (d < bestD) {
      bestD = d;
      bestGene = mesh.userData.gene;
      bestSlot = mesh.userData.slot;
      hit = true;
    }
  }

  const nucs = opened ? geneNucs() : null;
  if (nucs && hit && bestGene === selected) {
    return { gene: selected, nuc: bestSlot, dist: bestD, mode: "nuc" };
  }
  if (hit && bestD < 95) return { gene: bestGene, dist: bestD, mode: "gene" };
  return { gene: selected, dist: bestD, mode: "miss" };
}

function onPointerMove(e) {
  if (introActive || unfold < 0.4) return;
  const pick = pickFromPointer(e.clientX, e.clientY);
  browsing = pick.dist < 120 && pick.mode !== "miss";
  spreadTarget = browsing || opened ? 1 : 0.3;
  renderer.domElement.style.cursor = browsing ? "pointer" : "default";
}

function onPointerLeave() {
  browsing = false;
  spreadTarget = opened ? 0.85 : 0.25;
  renderer.domElement.style.cursor = "default";
}

function onClick(e) {
  if (introActive || unfold < 0.6) return;
  const pick = pickFromPointer(e.clientX, e.clientY);
  if (pick.dist > 140 || pick.mode === "miss") {
    if (opened) closePanel();
    return;
  }

  if (opened && pick.mode === "nuc") {
    setNuc(pick.nuc);
    const nuc = geneNucs()?.[nucIndex];
    if (nuc?.href) window.open(nuc.href, nuc.href.startsWith("http") ? "_blank" : "_self");
    return;
  }

  const same = pick.gene === selected;
  setTarget(pick.gene);
  if (reduceMotion) cursor = pick.gene;
  if (same) {
    togglePanel();
  } else if (!GENES[pick.gene].locked) {
    openPanel();
  }
}

let wheelLock = 0;
let wheelAccum = 0;
const WHEEL_COOLDOWN_MS = 480;
const WHEEL_STEP_PX = 90;

function onWheel(e) {
  e.preventDefault();
  if (introActive) {
    skipIntro();
    return;
  }
  if (unfold < 0.4) return;
  const useY = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
  let delta = useY ? e.deltaY : e.deltaX;
  if (e.deltaMode === 1) delta *= 16;
  else if (e.deltaMode === 2) delta *= worldEl?.clientHeight || innerHeight;
  if (Math.abs(delta) < 0.5) return;

  const now = performance.now();
  if (now < wheelLock) {
    wheelAccum = 0;
    return;
  }

  if (wheelAccum !== 0 && Math.sign(delta) !== Math.sign(wheelAccum)) {
    wheelAccum = 0;
  }
  wheelAccum += delta;
  if (Math.abs(wheelAccum) < WHEEL_STEP_PX) return;

  const dir = wheelAccum > 0 ? 1 : -1;
  wheelAccum = 0;
  wheelLock = now + WHEEL_COOLDOWN_MS;

  if (opened && geneNucs()) {
    setNuc(nucIndex + dir);
    return;
  }
  setTarget(selected + dir);
  spreadTarget = 1;
}

function onKey(e) {
  if (introActive) {
    if (
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "ArrowDown" ||
      e.key === "ArrowRight"
    ) {
      e.preventDefault();
      skipIntro();
    }
    return;
  }
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    if (opened && geneNucs()) setNuc(nucIndex + 1);
    else {
      setTarget(selected + 1);
      spreadTarget = 1;
    }
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    if (opened && geneNucs()) setNuc(nucIndex - 1);
    else {
      setTarget(selected - 1);
      spreadTarget = 1;
    }
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (opened && geneNucs()) {
      const nuc = geneNucs()[nucIndex];
      if (nuc?.href) window.open(nuc.href, nuc.href.startsWith("http") ? "_blank" : "_self");
    } else {
      togglePanel();
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (opened) closePanel();
  }
}

function resize() {
  const w = innerWidth;
  const h = Math.max(1, innerHeight - 48);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  measureWorldTravel();
  applyWorldScroll();
}

function tick(now) {
  const dt = lastTickMs ? Math.min(0.05, (now - lastTickMs) / 1000) : 1 / 60;
  lastTickMs = now;

  unfold += (unfoldTarget - unfold) * (reduceMotion ? 1 : 0.05);
  flare += (flareTarget - flare) * (reduceMotion ? 1 : 0.1);
  spread += (spreadTarget - spread) * (reduceMotion ? 1 : 0.12);

  if (!reduceMotion) {
    cursor += (selected - cursor) * (browsing ? 0.16 : 0.1);
    if (Math.abs(selected - cursor) < 0.001) cursor = selected;
    if (opened && geneNucs()) {
      nucCursor += (nucIndex - nucCursor) * 0.14;
      if (Math.abs(nucIndex - nucCursor) < 0.001) nucCursor = nucIndex;
    } else {
      nucCursor = nucIndex;
    }
  } else {
    cursor = selected;
    nucCursor = nucIndex;
  }

  const t = now * 0.00028;
  camera.position.x = 0.2 + Math.sin(t) * 0.3;
  camera.position.y = 0.35 + Math.cos(t * 0.7) * 0.12;
  camera.position.z = 18.5;
  camera.lookAt(0, 0.05, 0);
  root.rotation.x = STRAND_POSE.x;
  root.rotation.y = STRAND_POSE.y + Math.sin(t * 0.5) * 0.05;
  root.rotation.z = STRAND_POSE.z;

  deco.children.forEach((m) => {
    m.position.y += Math.sin(now * 0.001 + m.userData.phase) * 0.001;
    m.material.opacity = 0.04 + unfold * 0.08;
  });

  layout();
  stepWorld(dt);
  renderer.render(scene, camera);
  if (introActive && introPhase === "load" && loadMarks.scene && !loadMarks.frame) {
    markLoaded("frame");
  }
  requestAnimationFrame(tick);
}

document.getElementById("panel-close").addEventListener("click", closePanel);
document.getElementById("btn-prev").addEventListener("click", () => {
  if (opened && geneNucs()) setNuc(nucIndex - 1);
  else {
    setTarget(selected - 1);
    spreadTarget = 1;
  }
});
document.getElementById("btn-next").addEventListener("click", () => {
  if (opened && geneNucs()) setNuc(nucIndex + 1);
  else {
    setTarget(selected + 1);
    spreadTarget = 1;
  }
});
document.getElementById("btn-select").addEventListener("click", () => {
  if (opened && geneNucs()) {
    const nuc = geneNucs()[nucIndex];
    if (nuc?.href) window.open(nuc.href, nuc.href.startsWith("http") ? "_blank" : "_self");
  } else {
    togglePanel();
  }
});
document.getElementById("btn-back").addEventListener("click", () => {
  if (opened) closePanel();
});

const themeBtn = document.getElementById("btn-theme");

function syncThemeButton() {
  const dark = themeName === "dark";
  themeBtn.textContent = dark ? "Light" : "Dark";
  themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

function applyTheme(next) {
  themeName = next === "dark" ? "dark" : "light";
  theme = ACCENT_THEMES[themeName];
  ACCENT = theme.accent;
  ACCENT_HOT = theme.accentHot;
  document.documentElement.setAttribute("data-theme", themeName);
  try {
    localStorage.setItem("dna-theme", themeName);
  } catch {
  }

  scene.fog.color.setHex(theme.fog);
  scene.fog.near = theme.fogNear;
  scene.fog.far = theme.fogFar;
  ambient.intensity = theme.ambient;
  key.color.setHex(theme.key);
  key.intensity = theme.keyI;

  contentHexes.forEach((entry) => {
    const shade = entry.mesh.userData.contentIdx / Math.max(1, CONTENT_COUNT - 1);
    const L = theme.contentL0 + shade * theme.contentL1;
    entry.mesh.userData.baseL = L;
    entry.line.userData.baseL = L;
  });
  deco.children.forEach((m) => {
    m.material.color.setHex(theme.decor);
    m.material.opacity = theme.decorOp;
  });

  syncThemeButton();
}

themeBtn.addEventListener("click", () => {
  applyTheme(themeName === "dark" ? "light" : "dark");
});
syncThemeButton();

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerleave", onPointerLeave);
renderer.domElement.addEventListener("click", onClick);
renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
document.addEventListener("keydown", onKey);
addEventListener("resize", resize);

addDecor();
buildWorldPage();
resize();
ensureHexes();
rebuildCurve(0.08);
updateHud(true);
measureWorldTravel();
worldY = geneScrollY(selected);
applyWorldScroll();

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
  if (loadMarks[key] || introPhase === "done") return;
  loadMarks[key] = true;
  if (!introActive || introPhase !== "load") return;
  setIntroPct(loadProgress());
  if (loadProgress() < 100 || introReadyQueued) return;
  introReadyQueued = true;
  introTimer = setTimeout(openIntroSplit, 200);
}

function preloadGeneAssets() {
  const urls = [...new Set(GENES.map((g) => g.logo).filter(Boolean))];
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

function finishIntro() {
  if (introPhase === "done") return;
  introPhase = "done";
  introActive = false;
  clearTimeout(introTimer);
  unfoldTarget = 1;
  spreadTarget = 0.3;
  flareTarget = 0;
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
  }, reduceMotion ? 0 : 1000);
}

function openIntroSplit() {
  if (introPhase !== "load") return;
  introPhase = "split";
  clearTimeout(introTimer);
  setIntroPct(100);
  if (introLoad) introLoad.classList.add("is-gone");
  if (introSplit) introSplit.hidden = false;
  unfoldTarget = 1;
  spreadTarget = 0.85;
  flareTarget = 0.25;
  introTimer = setTimeout(() => {
    flareTarget = 0;
    finishIntro();
  }, reduceMotion ? 0 : 720);
}

function skipIntro() {
  if (!introActive) return;
  if (introPhase === "load") {
    for (const key of Object.keys(LOAD_WEIGHTS)) loadMarks[key] = true;
    setIntroPct(100);
    openIntroSplit();
    return;
  }
  finishIntro();
}

function startIntro() {
  if (!introActive || !introEl) {
    introActive = false;
    introPhase = "done";
    document.body.classList.remove("is-intro");
    if (introEl) introEl.hidden = true;
    unfoldTarget = 1;
    spreadTarget = 0.3;
    return;
  }
  document.body.classList.add("is-intro");
  introEl.hidden = false;
  if (introLoad) introLoad.hidden = false;
  if (introSplit) introSplit.hidden = true;
  setIntroPct(0);
  unfoldTarget = 0.2;
  spreadTarget = 0.55;
  const onSkip = () => skipIntro();
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

const skipLink = document.querySelector(".skip-link");
if (skipLink) {
  skipLink.addEventListener("click", () => {
    if (introActive) skipIntro();
  });
}

startIntro();
markLoaded("scene");
requestAnimationFrame(() => {
  if (!introActive) unfoldTarget = 1;
});
requestAnimationFrame(tick);
