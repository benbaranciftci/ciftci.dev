import * as THREE from "three";

const GENES = [
  {
    id: "about",
    region: "ABOUT",
    year: "NOW",
    name: "origin",
    sync: "BIO",
    hexes: 5,
    logo: "assets/origin.jpg",
    logoAlt: "Baran Çiftçi",
    logoFull: true,
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
    logo: "assets/ciftci-dev-logo.jpg",
    logoAlt: "ciftci.dev",
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
    logo: "assets/coming-soon-logo.jpg",
    logoAlt: "robotics",
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
    logo: "assets/coming-soon-logo.jpg",
    logoAlt: "games",
    blurb: "Selected work — games. Coming soon.",
  },
  {
    id: "contact",
    region: "CONTACT",
    year: "NOW",
    name: "contact",
    sync: "OPEN",
    blurb: "Ways to reach me — move along the strand or use →.",
    nucleotides: [
      {
        id: "github",
        name: "GitHub",
        blurb: "GitHub · benbaranciftci",
        href: "https://github.com/benbaranciftci",
        cta: "Open GitHub",
        logo: "assets/github-logo.svg",
        logoAlt: "GitHub",
        logoPad: true,
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        blurb: "LinkedIn · Baran Çiftçi",
        href: "https://www.linkedin.com/in/baran-%C3%A7ift%C3%A7i-a004b9283",
        cta: "Open LinkedIn",
        logo: "assets/linkedin-logo-full.svg",
        logoAlt: "LinkedIn",
        logoBg: "light",
        logoPad: true,
      },
      {
        id: "email",
        name: "Email",
        blurb: "Email · baran@ciftci.dev",
        href: "mailto:baran@ciftci.dev",
        cta: "Send email",
        logo: "assets/email-logo.svg",
        logoAlt: "Email",
        logoPad: true,
      },
    ],
  },
];

const SCROLL_STOPS = [];
GENES.forEach((g, gi) => {
  const nucs = g.nucleotides;
  if (nucs?.length) {
    nucs.forEach((_, ni) => SCROLL_STOPS.push({ gene: gi, nuc: ni }));
  } else {
    SCROLL_STOPS.push({ gene: gi, nuc: 0 });
  }
});

const ACCENT_THEMES = {
  light: {
    accent: 0x7113d7,
    accentHot: 0x9b4aef,
    fog: 0xddd6e8,
    fogNear: 13,
    fogFar: 38,
    ambient: 1.0,
    key: 0xeee4ff,
    keyI: 0.42,
    h: 0.72,
    sMesh: 0.08,
    sLine: 0.09,
    padL0: 0.64,
    padL1: 0.08,
    contentL0: 0.12,
    contentL1: 0.72,
    meshOp: 0.15,
    lineOp: 0.78,
    contentOp: 0.07,
    contentOpU: 0.16,
    contentLineOp: 0.32,
    contentLineOpU: 0.58,
    padOp: 0.82,
    padLine: 0.22,
    padLineU: 0.44,
    lineLift: 0.16,
    lineCap: 0.94,
    padLift: 0.14,
    padCap: 0.88,
    decor: 0x000000,
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
const mobileMq = matchMedia("(max-width: 640px)");
let isMobileLayout = mobileMq.matches;

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
const syncNow = document.getElementById("sync-now");
const syncTotal = document.getElementById("sync-total");
const syncBox = document.getElementById("sync-box");
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
const barRail = document.getElementById("bar-rail");
const SHEET_SNAPS = ["peek", "full"];
const SHEET_DRAG_THRESHOLD = 36;
let sheetSnap = "peek";
let sheetDragY = null;
let sheetDragSnap = "peek";
let hintDismissed = false;
const PANEL_REST = { rx: 5, ry: -8, tz: 6 };
let panelSwapTimer = 0;
let panelHeightTimer = 0;
let panelSwapGen = 0;
const PANEL_SWAP_MS = 160;
const PANEL_HEIGHT_MS = 340;
let panelRx = PANEL_REST.rx;
let panelRy = PANEL_REST.ry;
let panelTz = PANEL_REST.tz;
let panelRxT = PANEL_REST.rx;
let panelRyT = PANEL_REST.ry;
let panelTzT = PANEL_REST.tz;
const panelTiltOk = !reduceMotion && matchMedia("(pointer: fine)").matches;

function setPanelTilt(rx, ry, tz) {
  if (!panel) return;
  panel.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
  panel.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  panel.style.setProperty("--tz", `${tz.toFixed(2)}px`);
}

function onPanelPointerMove(e) {
  if (!panelTiltOk || introActive) return;
  const r = panel.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return;
  const x = ((e.clientX - r.left) / r.width) * 2 - 1;
  const y = ((e.clientY - r.top) / r.height) * 2 - 1;
  panelRyT = PANEL_REST.ry + x * 9;
  panelRxT = PANEL_REST.rx - y * 7;
  panelTzT = PANEL_REST.tz + 10;
}

function onPanelPointerLeave() {
  panelRxT = PANEL_REST.rx;
  panelRyT = PANEL_REST.ry;
  panelTzT = PANEL_REST.tz;
}

function stepPanelTilt() {
  if (!panelTiltOk) return;
  panelRx += (panelRxT - panelRx) * 0.14;
  panelRy += (panelRyT - panelRy) * 0.14;
  panelTz += (panelTzT - panelTz) * 0.14;
  if (Math.abs(panelRx - PANEL_REST.rx) < 0.02) panelRx = PANEL_REST.rx;
  if (Math.abs(panelRy - PANEL_REST.ry) < 0.02) panelRy = PANEL_REST.ry;
  if (Math.abs(panelTz - PANEL_REST.tz) < 0.02) panelTz = PANEL_REST.tz;
  setPanelTilt(panelRx, panelRy, panelTz);
}
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
let worldSecHeight = 0;
let worldStepPx = 0;
let lastTickMs = 0;
let secHeightPx = 0;
let worldSecs = [];
/** Single travel axis — wheel, keys, and clicks all write here; visuals read it. */
let focus = 0;
let focusInputUntil = 0;
let lastAppliedStop = -1;
let contactAimStop = null;
const FOCUS_PX_PER_UNIT = 300;
const FOCUS_PX_PER_UNIT_TOUCH = 220;
const FOCUS_SETTLE_MS = 180;
const FOCUS_SETTLE_RATE = 10;
const TOUCH_DRAG_THRESHOLD = 10;
let touchDragY = null;
let touchMoved = false;
let suppressClickUntil = 0;
const CONTACT_GLIDE_RATE = 4.2;
const CONTACT_PANEL_COMMIT = 0.22;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0.2, 0.35, 18.5);

const STRAND_POSE = { x: -0.08, y: 0.12, z: -0.05 };

const renderer = new THREE.WebGLRenderer({ antialias: !isMobileLayout, alpha: true });
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
    x -= 4.2 * (1 - THREE.MathUtils.smoothstep(t, 0, 0.17));
    x += 3.0 * THREE.MathUtils.smoothstep(t, 0.82, 1);
    const y0 = THREE.MathUtils.lerp(-0.95, 1.05, t);
    const leftLift = (1 - THREE.MathUtils.smoothstep(t, 0, 0.34)) * 2.35;
    const w1Taper = THREE.MathUtils.lerp(0.72, 1, THREE.MathUtils.smoothstep(t, 0.08, 0.3));
    const w1 = Math.sin(t * Math.PI * 2.2) * 1.65 * openAmt * w1Taper;
    const w2 = Math.sin(t * Math.PI * 1.25 + 0.8) * 0.7 * openAmt * 0.85;
    const w3 = Math.cos(t * Math.PI * 2.4 + 0.25) * 0.2 * openAmt;
    const z =
      Math.sin(t * Math.PI * 1.85 + 0.4) * 1.55 * openAmt +
      Math.cos(t * Math.PI * 1.0) * 0.55 * openAmt;
    pts.push(new THREE.Vector3(x, y0 + leftLift + w1 + w2 + w3, z));
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
  const focusGene = Math.round(cursor);
  const geneNucsLocal = gene >= 0 ? GENES[gene]?.nucleotides : null;
  const atContact =
    gene === focusGene && geneNucsLocal && Math.abs(cursor - focusGene) < 0.45;
  const nucs = atContact ? geneNucsLocal : null;
  const isNuc = !!nucs && isContent;
  const nucDist = isNuc ? Math.abs(slotIdx - nucCursor) : 1;
  const isActiveNuc = isNuc && nucDist < 0.55;
  const hot = isContent && (gene === focusGene || isActiveNuc);
  const nearFocus = Math.abs(hexIdx - focus);
  const activeAmt = isNuc ? Math.max(0, 1 - nucDist) : 0;

  if (flare > 0.01 && nearFocus < 2.2 && !geneNucs()) {
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
  const count = isMobileLayout ? 20 : 50;
  const minDist = isMobileLayout ? 1.7 : 1.45;
  const maxAttempts = 50;
  const placed = [];

  for (let i = 0; i < count; i++) {
    let pos = null;
    let bestMin = -1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 11,
        z: (Math.random() - 0.5) * 9,
      };
      if (!placed.length) {
        pos = candidate;
        break;
      }

      let nearest = Infinity;
      for (const p of placed) {
        const d = Math.hypot(candidate.x - p.x, candidate.y - p.y, candidate.z - p.z);
        if (d < nearest) nearest = d;
      }
      if (nearest >= minDist) {
        pos = candidate;
        break;
      }
      if (nearest > bestMin) {
        bestMin = nearest;
        pos = candidate;
      }
    }

    placed.push(pos);
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: theme.decor, transparent: true, opacity: theme.decorOp })
    );
    m.position.set(pos.x, pos.y, pos.z);
    m.rotation.z = Math.PI / 4;
    m.userData.phase = Math.random() * 6;
    deco.add(m);
  }
}

function geneWorldDetail(g) {
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

function worldSideMeta(g, nuc) {
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
  const g = GENES[Math.round(THREE.MathUtils.clamp(geneIdx, 0, GENES.length - 1))];
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
  if (isMobileLayout) {
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
  const focusGene = Math.round(THREE.MathUtils.clamp(cursor, 0, GENES.length - 1));
  const g = GENES[focusGene];
  const nucs = g?.nucleotides;
  const sec = worldSecs[focusGene];
  if (!sec) return;
  const dots = sec.querySelectorAll(".world-dot");
  if (!dots.length) return;
  const onContact = nucs && Math.abs(cursor - focusGene) < 0.45;
  const idx = onContact ? Math.round(nucCursor) : -1;
  dots.forEach((dot, i) => {
    const on = idx >= 0 && i === idx;
    dot.classList.toggle("is-active", on);
    dot.setAttribute("aria-selected", on ? "true" : "false");
  });
}

function applyWorldOpacity() {
  const focusGene = Math.round(THREE.MathUtils.clamp(cursor, 0, GENES.length - 1));
  worldSecs.forEach((el, i) => {
    const d = Math.abs(cursor - i);
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
  const gi = Math.round(THREE.MathUtils.clamp(cursor, 0, GENES.length - 1));
  const g = GENES[gi];
  if (!g) return;
  const nucs = g.nucleotides;
  const onContact = nucs && Math.abs(cursor - gi) < 0.45;
  const nuc = onContact
    ? nucs[Math.round(THREE.MathUtils.clamp(nucCursor, 0, nucs.length - 1))]
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
  const focusGene = Math.round(THREE.MathUtils.clamp(cursor, 0, GENES.length - 1));
  const nucs = GENES[focusGene]?.nucleotides;
  const onContact = nucs && Math.abs(cursor - focusGene) < 0.45;
  const nuc = onContact ? nucCursor : 0;
  worldY = geneScrollY(cursor, nuc);
  applyWorldScroll();
  applyWorldOpacity();
  applyWorldDots();
  updateWorldLabels();
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

function dismissHint() {
  if (hintDismissed || !isMobileLayout || !hintEl) return;
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
    setFocusToStop(selectionToFocus(Number(btn.dataset.gene), 0));
  });
}

function updateGeneRail() {
  if (!barRail) return;
  barRail.querySelectorAll(".rail-dot").forEach((btn, i) => {
    const active = i === selected;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
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
  if (!isMobileLayout || introActive || sheetSnap !== "full") return;
  if (e.target.closest("#memory-panel")) return;
  resetSheetSnap();
}

function syncSheetChrome() {
  if (!panel) return;
  if (!isMobileLayout) {
    panel.removeAttribute("data-sheet");
    panel.classList.remove("is-sheet-dragging");
    return;
  }
  setSheetSnap(sheetSnap, { force: true });
}

function syncMobileLayout() {
  document.documentElement.classList.toggle("is-mobile", isMobileLayout);
  if (!isMobileLayout) resetSheetSnap();
  syncSheetChrome();
  updateGeneRail();
  measureWorldTravel();
  applyWorldScroll();
  if (isMobileLayout) requestAnimationFrame(measureWorldTravel);
}

function updateHud() {
  const g = currentGene();
  const nucs = geneNucs(g);
  const nuc = nucs ? nucs[nucIndex] : null;
  if (nuc) {
    syncLabel.textContent = "Contact";
    syncLabel.hidden = false;
    syncNow.textContent = String(nucIndex + 1);
    syncTotal.textContent = String(nucs.length);
  } else {
    syncLabel.hidden = true;
    syncNow.textContent = String(selected + 1).padStart(2, "0");
    syncTotal.textContent = String(GENES.length).padStart(2, "0");
  }
  syncBox.classList.toggle("is-contact", !!nuc);
  syncBox.classList.toggle("is-locked", !!g.locked && !nuc);
  if (nucs) {
    const hasMore = nucIndex < nucs.length - 1;
    const hasPrev = nucIndex > 0;
    if (isMobileLayout) {
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
    hintEl.textContent = isMobileLayout
      ? "Drag to browse · Pull card up for details"
      : "Move along the strand · Enter opens link";
  } else {
    hintEl.textContent = isMobileLayout
      ? "Drag to browse · Pull card up for details"
      : "Move along the strand";
  }
  hintEl.classList.toggle("locked", !!g.locked);

  applyWorldDots();
  updateGeneRail();
}

function applyPanelContent() {
  const g = currentGene();
  const nucs = geneNucs(g);
  panel.classList.toggle("is-locked", !!g.locked);

  if (nucs) {
    const nuc = nucs[nucIndex];
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

  if (instant || reduceMotion) {
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
  const href = nucs ? nucs[nucIndex]?.href : g.href;
  if (!href) return;
  window.open(href, href.startsWith("http") ? "_blank" : "_self");
}

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
  const v = focusToVisual(focus);
  cursor = v.cursor;
  nucCursor = v.nucCursor;
}

function applySelectionFromFocus() {
  const max = SCROLL_STOPS.length - 1;
  const rawStop = Math.round(THREE.MathUtils.clamp(focus, 0, max));
  const rawGene = SCROLL_STOPS[rawStop].gene;
  let stop = rawStop;
  if (GENES[rawGene]?.nucleotides && Math.abs(focus - rawStop) > CONTACT_PANEL_COMMIT) {
    stop = lastAppliedStop >= 0 ? lastAppliedStop : rawStop;
  }
  if (stop === lastAppliedStop) return;
  lastAppliedStop = stop;
  const { gene, nuc } = SCROLL_STOPS[stop];
  const geneChanged = gene !== selected;
  selected = gene;
  nucIndex = nuc;
  if (geneChanged && isMobileLayout) resetSheetSnap();
  if (geneChanged) pulseTravel();
  else spreadTarget = 1;
  applyPanelContent();
  updateHud();
}

function clearContactAim() {
  contactAimStop = null;
}

function aimContactStop(stopIdx) {
  const clamped = THREE.MathUtils.clamp(stopIdx, 0, SCROLL_STOPS.length - 1);
  if (contactAimStop === clamped) return;
  contactAimStop = clamped;
  focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
  spreadTarget = 1;
}

function setFocusToStop(stopIdx) {
  clearContactAim();
  focus = THREE.MathUtils.clamp(stopIdx, 0, SCROLL_STOPS.length - 1);
  focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
  syncFocusVisuals();
  lastAppliedStop = -1;
  applySelectionFromFocus();
  spreadTarget = 1;
}

function nudgeFocus(dir) {
  dismissHint();
  const next = Math.round(focus) + dir;
  if (next < 0 || next >= SCROLL_STOPS.length) return;
  if (next === Math.round(focus)) return;
  setFocusToStop(next);
}

function markFocusInput() {
  clearContactAim();
  focusInputUntil = performance.now() + FOCUS_SETTLE_MS;
  spreadTarget = 1;
}

function pulseTravel() {
  if (reduceMotion) return;
  flareTarget = 0.55;
  spreadTarget = 1;
  setTimeout(() => {
    flareTarget = 0;
  }, 220);
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

  const nucs = GENES[bestGene]?.nucleotides;
  const onContact =
    nucs && hit && Math.abs(cursor - bestGene) < 0.45;
  if (onContact) {
    return { gene: bestGene, nuc: bestSlot, dist: bestD, mode: "nuc" };
  }
  if (hit && bestD < 95) return { gene: bestGene, dist: bestD, mode: "gene" };
  return { gene: selected, dist: bestD, mode: "miss" };
}

function onWorldClick(e) {
  if (introActive || unfold < 0.6) return;

  const dot = e.target.closest(".world-dot");
  if (dot) {
    const sec = dot.closest(".world-sec");
    const gi = worldSecs.indexOf(sec);
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
  const i = worldSecs.indexOf(sec);
  if (i < 0 || i === selected) return;
  e.preventDefault();
  e.stopPropagation();
  setFocusToStop(selectionToFocus(i, 0));
}

function onPointerMove(e) {
  if (introActive || unfold < 0.4) return;
  const pick = pickFromPointer(e.clientX, e.clientY);
  browsing = pick.dist < 120 && pick.mode !== "miss";
  spreadTarget = browsing || geneNucs() ? 1 : 0.3;
  renderer.domElement.style.cursor = browsing ? "pointer" : "default";

  if (pick.mode === "nuc" && pick.dist < 100 && performance.now() > focusInputUntil) {
    aimContactStop(selectionToFocus(pick.gene, pick.nuc));
  }
}

function onPointerLeave() {
  browsing = false;
  spreadTarget = geneNucs() ? 0.85 : 0.25;
  renderer.domElement.style.cursor = "default";
}

function onClick(e) {
  if (introActive || unfold < 0.6) return;
  if (performance.now() < suppressClickUntil) return;
  dismissHint();
  const pick = pickFromPointer(e.clientX, e.clientY);
  const hitRadius = isMobileLayout ? 175 : 140;
  if (pick.dist > hitRadius || pick.mode === "miss") return;

  if (pick.mode === "nuc") {
    setFocusToStop(selectionToFocus(pick.gene, pick.nuc));
    if (!isMobileLayout) activateCta();
    return;
  }

  if (pick.gene === selected) {
    if (!isMobileLayout) activateCta();
    return;
  }

  setFocusToStop(selectionToFocus(pick.gene, 0));
}

function isTouchScrollBlocked(target) {
  return !!target?.closest?.(".bar, #memory-panel, .bar-btn, .panel-cta, .panel-inner, .panel-grab");
}

function applyFocusDelta(delta, pxPerUnit = FOCUS_PX_PER_UNIT) {
  if (Math.abs(delta) < 0.5) return;
  dismissHint();
  focus += delta / pxPerUnit;
  focus = THREE.MathUtils.clamp(focus, 0, SCROLL_STOPS.length - 1);
  if (reduceMotion) focus = Math.round(focus);
  markFocusInput();
  syncFocusVisuals();
  applySelectionFromFocus();
}

function onWheel(e) {
  if (e.target.closest?.("#memory-panel")) return;
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
  applyFocusDelta(delta);
}

function onTouchStart(e) {
  if (!isMobileLayout || introActive) return;
  if (isTouchScrollBlocked(e.target)) return;
  if (e.touches.length !== 1) return;
  touchDragY = e.touches[0].clientY;
  touchMoved = false;
}

function onTouchMove(e) {
  if (touchDragY === null || introActive) return;
  if (isTouchScrollBlocked(e.target)) return;
  if (unfold < 0.4) return;
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
    nudgeFocus(1);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    nudgeFocus(-1);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (!isMobileLayout) activateCta();
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (geneNucs() && nucIndex > 0) {
      setFocusToStop(selectionToFocus(selected, 0));
    }
  }
}

function barInset() {
  const bar = document.querySelector(".bar");
  return bar?.offsetHeight || 48;
}

function syncPixelRatio() {
  const cap = isMobileLayout ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(devicePixelRatio, cap));
}

function applyCameraProfile() {
  camera.fov = isMobileLayout ? 40 : 34;
  camera.updateProjectionMatrix();
}

function resize() {
  const w = innerWidth;
  const h = Math.max(1, innerHeight - barInset());
  syncPixelRatio();
  applyCameraProfile();
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

  if (contactAimStop !== null) {
    if (reduceMotion) {
      focus = contactAimStop;
      clearContactAim();
    } else {
      const d = contactAimStop - focus;
      if (Math.abs(d) < 0.006) {
        focus = contactAimStop;
        clearContactAim();
      } else {
        focus += d * (1 - Math.exp(-CONTACT_GLIDE_RATE * dt));
      }
    }
    syncFocusVisuals();
    applySelectionFromFocus();
  } else if (!reduceMotion && performance.now() > focusInputUntil) {
    const snap = Math.round(focus);
    const d = snap - focus;
    if (Math.abs(d) > 0.0005) {
      focus += d * (1 - Math.exp(-FOCUS_SETTLE_RATE * dt));
      syncFocusVisuals();
      applySelectionFromFocus();
    } else if (focus !== snap) {
      focus = snap;
      syncFocusVisuals();
      applySelectionFromFocus();
    }
  } else if (reduceMotion) {
    const snap = Math.round(focus);
    if (focus !== snap) {
      focus = snap;
      syncFocusVisuals();
      applySelectionFromFocus();
    }
  }

  const t = now * 0.00028;
  const camSway = isMobileLayout ? 0.14 : 0.3;
  const camYBase = isMobileLayout ? 0.58 : 0.35;
  const camYWave = isMobileLayout ? 0.05 : 0.12;
  const camZ = isMobileLayout ? 21.5 : 18.5;
  const lookY = isMobileLayout ? 0.18 : 0.05;
  camera.position.x = 0.2 + Math.sin(t) * camSway;
  camera.position.y = camYBase + Math.cos(t * 0.7) * camYWave;
  camera.position.z = camZ;
  camera.lookAt(0, lookY, 0);
  root.rotation.x = STRAND_POSE.x;
  root.rotation.y = STRAND_POSE.y + Math.sin(t * 0.5) * (isMobileLayout ? 0.03 : 0.05);
  root.rotation.z = STRAND_POSE.z;

  deco.children.forEach((m) => {
    m.position.y += Math.sin(now * 0.001 + m.userData.phase) * 0.001;
    m.material.opacity = 0.04 + unfold * 0.08;
  });

  layout();
  stepWorld();
  stepPanelTilt();
  renderer.render(scene, camera);
  if (introActive && introPhase === "load" && loadMarks.scene && !loadMarks.frame) {
    markLoaded("frame");
  }
  requestAnimationFrame(tick);
}

document.getElementById("btn-prev").addEventListener("click", () => {
  dismissHint();
  nudgeFocus(-1);
});
document.getElementById("btn-next").addEventListener("click", () => {
  dismissHint();
  nudgeFocus(1);
});
document.getElementById("btn-select").addEventListener("click", () => {
  if (!isMobileLayout) activateCta();
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
worldTrack?.addEventListener("click", onWorldClick);
document.addEventListener("click", onDocumentClick);
document.addEventListener("wheel", onWheel, { passive: false });
document.addEventListener("touchstart", onTouchStart, { passive: true });
document.addEventListener("touchmove", onTouchMove, { passive: false });
document.addEventListener("touchend", onTouchEnd, { passive: true });
document.addEventListener("touchcancel", onTouchEnd, { passive: true });
document.addEventListener("keydown", onKey);
addEventListener("resize", resize);
mobileMq.addEventListener("change", () => {
  isMobileLayout = mobileMq.matches;
  syncMobileLayout();
  resize();
  updateHud();
});

if (panelGrab) {
  panelGrab.addEventListener("pointerdown", (e) => {
    if (!isMobileLayout || e.button !== 0) return;
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
      /* capture already released */
    }
  });

  panelGrab.addEventListener("pointercancel", () => {
    sheetDragY = null;
    panel?.classList.remove("is-sheet-dragging");
  });
}

buildGeneRail();
syncMobileLayout();

if (panel && panelTiltOk) {
  panel.addEventListener("pointermove", onPanelPointerMove);
  panel.addEventListener("pointerleave", onPanelPointerLeave);
}

addDecor();
buildWorldPage();
resize();
ensureHexes();
rebuildCurve(0.08);
focus = 0;
syncFocusVisuals();
lastAppliedStop = -1;
applySelectionFromFocus();
measureWorldTravel();
stepWorld();
document.body.classList.add("memory-open");

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
  const urls = [
    ...new Set(
      GENES.flatMap((g) => [
        g.logo,
        ...(g.nucleotides?.map((n) => n.logo) || []),
      ]).filter(Boolean)
    ),
  ];
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
