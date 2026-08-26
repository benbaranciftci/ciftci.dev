import * as THREE from "three";

const GENOMES = [
  {
    id: "projects",
    region: "PROJECTS",
    year: "SEQ",
    name: "PROJECTS",
    sync: "GEN",
    kind: "marker",
    blurb: "Selected work genomes. Step forward along the strand.",
  },
  {
    id: "alfred",
    region: "PROJECTS",
    year: "2024",
    name: "ALFRED",
    sync: "LOCKED",
    locked: true,
    blurb: "Selected work — Alfred. Coming soon.",
  },
  {
    id: "site",
    region: "PROJECTS",
    year: "2026",
    name: "CIFTCI.DEV",
    sync: "LIVE",
    href: "https://ciftci.dev/",
    blurb: "Personal site. Selected work.",
  },
  {
    id: "robotics",
    region: "PROJECTS",
    year: "—",
    name: "ROBOTICS",
    sync: "LOCKED",
    locked: true,
    blurb: "Selected work — Robotics. Coming soon.",
  },
  {
    id: "games",
    region: "PROJECTS",
    year: "—",
    name: "GAMES",
    sync: "LOCKED",
    locked: true,
    blurb: "Selected work — Games. Coming soon.",
  },
  {
    id: "about",
    region: "ABOUT",
    year: "NOW",
    name: "ABOUT",
    sync: "BIO",
    blurb:
      "Computer engineering student split between Torino and Istanbul. I write software, tinker with robots, and ship small games — learning by building, then building again.",
    facts: [
      ["Based in", "Torino · Istanbul"],
      ["Focus", "Software · Robotics · Games"],
      ["Studying", "Computer Engineering"],
    ],
  },
  {
    id: "contact",
    region: "CONTACT",
    year: "SEQ",
    name: "CONTACT",
    sync: "GEN",
    kind: "marker",
    blurb: "Secondary genomes — find me online.",
  },
  {
    id: "github",
    region: "CONTACT",
    year: "NOW",
    name: "GITHUB",
    sync: "OPEN",
    href: "https://github.com/benbaranciftci",
    blurb: "Find me — GitHub · benbaranciftci",
  },
  {
    id: "linkedin",
    region: "CONTACT",
    year: "NOW",
    name: "LINKEDIN",
    sync: "OPEN",
    href: "https://www.linkedin.com/in/baran-%C3%A7ift%C3%A7i-a004b9283",
    blurb: "Find me — LinkedIn · Baran Çiftçi",
  },
  {
    id: "email",
    region: "CONTACT",
    year: "NOW",
    name: "EMAIL",
    sync: "OPEN",
    href: "mailto:baran@ciftci.dev",
    blurb: "Find me — Email · baran@ciftci.dev",
  },
];

const ACCENT = 0x7113d7;
const ACCENT_HOT = 0x9b4aef;
const PLATE_COUNT = 280;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const yearEl = document.getElementById("year");
const nameEl = document.getElementById("mem-name");
const hintEl = document.getElementById("hint");
const syncLabel = document.getElementById("sync-label");
const syncVal = document.getElementById("sync-val");
const syncBox = document.getElementById("sync-box");
const hudTl = document.getElementById("hud-tl");
const regionLabel = document.getElementById("region-label");
const regionSub = document.getElementById("region-sub");
const marker = document.getElementById("marker");
const panel = document.getElementById("memory-panel");
const panelTitle = document.getElementById("panel-title");
const panelBody = document.getElementById("panel-body");
const panelFacts = document.getElementById("panel-facts");
const panelCta = document.getElementById("panel-cta");
const panelKicker = document.getElementById("panel-kicker");
const mount = document.getElementById("strand");
const secBtns = [...document.querySelectorAll(".sec-btn[data-jump]")];

let selected = 0;
let cursor = 0;
let opened = false;
let browsing = false;
let unfold = reduceMotion ? 1 : 0;
let unfoldTarget = 1;
let flare = 0;
let flareTarget = 0;
let spread = reduceMotion ? 0.35 : 0;
let spreadTarget = 0.3;
let curve = null;
let frames = null;
let openBuilt = -1;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8e2ef, 12, 40);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0.15, 0.25, 17);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.15));
const key = new THREE.DirectionalLight(0xffffff, 0.45);
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
const plates = [];
const edges = [];
const geneMarkers = [];

function makeCurve(openAmt) {
  const pts = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = THREE.MathUtils.lerp(-10, 10, t);
    const y0 = THREE.MathUtils.lerp(-3.6, 3.4, t);
    const w1 = Math.sin(t * Math.PI * 3.4) * 3.1 * openAmt;
    const w2 = Math.sin(t * Math.PI * 1.7 + 0.8) * 1.35 * openAmt;
    const w3 = Math.cos(t * Math.PI * 5.1 + 0.3) * 0.65 * openAmt;
    const z =
      Math.sin(t * Math.PI * 2.8 + 0.4) * 2.7 * openAmt +
      Math.cos(t * Math.PI * 1.4) * 1.1 * openAmt;
    pts.push(new THREE.Vector3(x, y0 + w1 + w2 + w3, z));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.58);
}

function rebuildCurve(openAmt) {
  if (Math.abs(openAmt - openBuilt) < 0.008 && curve) return;
  openBuilt = openAmt;
  curve = makeCurve(Math.max(0.06, openAmt));
  frames = curve.computeFrenetFrames(PLATE_COUNT, false);
}

function genomeT(i) {
  return (i + 0.5) / GENOMES.length;
}

function ensurePlates() {
  if (plates.length) return;
  for (let i = 0; i < PLATE_COUNT; i++) {
    const shade = i / (PLATE_COUNT - 1);
    const L = 0.08 + shade * 0.78;
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.72, 0.05, L),
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(plateGeo, mat);
    mesh.userData.baseL = L;
    root.add(mesh);
    plates.push(mesh);

    const lm = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(0.72, 0.04, Math.min(0.96, L + 0.16)),
      transparent: true,
      opacity: 0.72,
    });
    const line = new THREE.LineSegments(edgeGeo, lm);
    line.userData.baseL = L;
    root.add(line);
    edges.push(line);
  }

  const g = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  GENOMES.forEach((_, i) => {
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      })
    );
    m.rotation.z = Math.PI / 4;
    m.userData.genome = i;
    root.add(m);
    geneMarkers.push(m);
  });
}

function warpedTs(selT, spreadAmt) {
  const n = PLATE_COUNT;
  const weights = new Float64Array(n - 1);
  let sumW = 0;
  const sigma = 0.045 + spreadAmt * 0.04;
  const boost = 1 + spreadAmt * 5.8;
  for (let i = 0; i < n - 1; i++) {
    const tMid = (i + 0.5) / (n - 1);
    const d = tMid - selT;
    const near = Math.exp(-(d * d) / (2 * sigma * sigma));
    weights[i] = 1 + near * (boost - 1);
    sumW += weights[i];
  }
  const ts = new Float64Array(n);
  ts[0] = 0;
  let acc = 0;
  for (let i = 0; i < n - 1; i++) {
    acc += weights[i] / sumW;
    ts[i + 1] = Math.min(1, acc);
  }
  ts[n - 1] = 1;
  return { ts, weights, sumW };
}

function sampleAt(tU) {
  const t = Math.max(0, Math.min(1, tU));
  const f = t * (PLATE_COUNT - 1);
  const a = Math.floor(f);
  const b = Math.min(PLATE_COUNT - 1, a + 1);
  const u = f - a;
  return {
    pos: curve.getPointAt(t),
    tan: curve.getTangentAt(t).normalize(),
    normal: frames.normals[a].clone().lerp(frames.normals[b], u).normalize(),
    binormal: frames.binormals[a].clone().lerp(frames.binormals[b], u).normalize(),
    t,
  };
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _tmp = new THREE.Vector3();

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

function layout() {
  rebuildCurve(unfold);
  ensurePlates();
  const selT = genomeT(cursor);
  const { ts, weights, sumW } = warpedTs(selT, spread);
  const avgW = sumW / (PLATE_COUNT - 1);
  const visible = Math.floor(PLATE_COUNT * Math.max(0.12, unfold));

  for (let i = 0; i < PLATE_COUNT; i++) {
    const mesh = plates[i];
    const line = edges[i];
    if (i >= visible) {
      mesh.visible = false;
      line.visible = false;
      continue;
    }
    mesh.visible = true;
    line.visible = true;

    const frame = sampleAt(ts[i]);
    const pos = frame.pos.clone();
    const nearT = Math.abs(frame.t - selT);
    const hot = nearT < 0.038;

    if (flare > 0.01 && nearT < 0.13) {
      const g = 1 - nearT / 0.13;
      const side = frame.t < selT ? -1 : 1;
      pos.addScaledVector(frame.binormal, side * g * g * flare * 1.75);
    }

    const gap = i < PLATE_COUNT - 1 ? weights[i] / avgW : 1;
    const s =
      (0.72 + unfold * 0.48) *
      (0.88 + Math.min(2.6, gap) * 0.17) *
      (hot ? 1.16 + Math.sin(performance.now() * 0.004) * 0.03 : 1);

    mesh.position.copy(pos);
    line.position.copy(pos);
    orient(mesh, frame.tan, frame.normal, frame.binormal);
    line.quaternion.copy(mesh.quaternion);
    mesh.scale.setScalar(s);
    line.scale.setScalar(s);

    if (hot) {
      mesh.material.color.setHex(ACCENT);
      mesh.material.opacity = 0.5;
      line.material.color.setHex(ACCENT_HOT);
      line.material.opacity = 1;
    } else {
      mesh.material.color.setHSL(0.72, 0.05, mesh.userData.baseL);
      mesh.material.opacity = 0.05 + unfold * 0.14;
      line.material.color.setHSL(0.72, 0.04, Math.min(0.96, mesh.userData.baseL + 0.14));
      line.material.opacity = 0.28 + unfold * 0.55;
    }
  }

  GENOMES.forEach((_, gi) => {
    const m = geneMarkers[gi];
    const frame = sampleAt(genomeT(gi));
    m.position.copy(frame.pos);
    const active = Math.round(cursor) === gi;
    m.scale.setScalar(active ? 1.35 : GENOMES[gi].kind === "marker" ? 1.1 : 0.85);
    m.material.color.setHex(active ? ACCENT : GENOMES[gi].kind === "marker" ? ACCENT_HOT : 0xffffff);
    m.material.opacity = 0.55 + unfold * 0.45;
  });
}

function projectMarker() {
  if (!curve) return;
  const frame = sampleAt(genomeT(cursor));
  _tmp.copy(frame.pos).project(camera);
  marker.style.left = `${(_tmp.x * 0.5 + 0.5) * innerWidth}px`;
  marker.style.top = `${(-_tmp.y * 0.5 + 0.5) * innerHeight}px`;
  marker.classList.toggle("on", unfold > 0.35 && _tmp.z < 1);
  marker.classList.toggle("opened", opened);
}

function addDecor() {
  const g = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
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

function fillFacts(m) {
  if (!m.facts?.length) {
    panelFacts.hidden = true;
    panelFacts.innerHTML = "";
    return;
  }
  panelFacts.hidden = false;
  panelFacts.innerHTML = m.facts
    .map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`)
    .join("");
}

function updateHud(instant) {
  const m = GENOMES[Math.round(cursor)];
  if (!instant) {
    hudTl.classList.remove("flash");
    syncBox.classList.remove("flash");
    void hudTl.offsetWidth;
    hudTl.classList.add("flash");
    syncBox.classList.add("flash");
  }
  yearEl.textContent = m.year;
  nameEl.textContent = m.name;
  syncLabel.textContent = m.kind === "marker" ? "SEQ" : "GEN";
  syncVal.textContent = String(Math.round(cursor) + 1).padStart(2, "0");
  regionLabel.textContent = m.region;
  regionSub.textContent = m.region === "CONTACT" ? "SECONDARY" : "GENOMES";
  hintEl.textContent = opened
    ? "Esc closes"
    : m.locked
      ? "Locked nucleotide"
      : "Enter opens this nucleotide";
  hintEl.classList.toggle("locked", !!m.locked);
  selected = Math.round(cursor);

  secBtns.forEach((btn) => {
    const jump = btn.dataset.jump;
    const on =
      (jump === "projects" && m.region === "PROJECTS") ||
      (jump === "about" && m.region === "ABOUT") ||
      (jump === "contact" && m.region === "CONTACT");
    btn.classList.toggle("is-active", on);
  });
}

function syncPanel(m) {
  panelKicker.textContent = m.kind === "marker" ? "Sequence" : "Nucleotide";
  panelTitle.textContent = m.name;
  panelBody.textContent = m.blurb;
  fillFacts(m);
  if (m.locked || !m.href) {
    panelCta.hidden = true;
  } else {
    panelCta.hidden = false;
    panelCta.href = m.href;
    panelCta.target = m.href.startsWith("http") ? "_blank" : "_self";
    panelCta.rel = m.href.startsWith("http") ? "noopener noreferrer" : "";
    panelCta.textContent = "Enter";
  }
}

function openPanel() {
  const m = GENOMES[Math.round(cursor)];
  opened = true;
  flareTarget = 1;
  spreadTarget = 1;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add("is-open"));
  syncPanel(m);
  updateHud(true);
}

function closePanel() {
  opened = false;
  flareTarget = 0;
  spreadTarget = browsing ? 1 : 0.3;
  panel.classList.remove("is-open");
  setTimeout(() => {
    if (!opened) panel.hidden = true;
  }, 300);
  updateHud(true);
}

function togglePanel() {
  if (opened) closePanel();
  else openPanel();
}

function setTarget(i) {
  const next = Math.max(0, Math.min(GENOMES.length - 1, i));
  if (next !== selected) updateHud(false);
  selected = next;
  if (reduceMotion) {
    cursor = next;
    updateHud(true);
  }
  if (opened) syncPanel(GENOMES[next]);
}

function jumpRegion(regionKey) {
  const map = { projects: "PROJECTS", about: "ABOUT", contact: "CONTACT" };
  const region = map[regionKey];
  const idx = GENOMES.findIndex((g) => g.region === region);
  if (idx >= 0) {
    setTarget(idx);
    cursor = idx;
    spreadTarget = 1;
  }
}

function pickFromPointer(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  let best = 0;
  let bestD = Infinity;
  const v = new THREE.Vector3();
  for (let i = 0; i < geneMarkers.length; i++) {
    v.copy(geneMarkers[i].position).project(camera);
    const sx = (v.x * 0.5 + 0.5) * rect.width;
    const sy = (-v.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(sx - (clientX - rect.left), sy - (clientY - rect.top));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  let plateBest = 0;
  let plateD = Infinity;
  for (let i = 0; i < plates.length; i++) {
    if (!plates[i].visible) continue;
    v.copy(plates[i].position).project(camera);
    const sx = (v.x * 0.5 + 0.5) * rect.width;
    const sy = (-v.y * 0.5 + 0.5) * rect.height;
    const d = Math.hypot(sx - (clientX - rect.left), sy - (clientY - rect.top));
    if (d < plateD) {
      plateD = d;
      plateBest = i;
    }
  }
  if (bestD < 50) return { genome: best, dist: bestD };
  const t = plateBest / (PLATE_COUNT - 1);
  const genome = Math.round(t * (GENOMES.length - 1));
  return { genome, dist: plateD };
}

function onPointerMove(e) {
  if (unfold < 0.4) return;
  const pick = pickFromPointer(e.clientX, e.clientY);
  browsing = pick.dist < 110;
  spreadTarget = browsing || opened ? 1 : 0.3;
  renderer.domElement.style.cursor = browsing ? "ew-resize" : "default";
  if (browsing) {
    cursor = pick.genome;
    if (Math.round(cursor) !== selected) {
      selected = Math.round(cursor);
      updateHud(false);
      if (opened) syncPanel(GENOMES[selected]);
    }
  }
}

function onPointerLeave() {
  browsing = false;
  spreadTarget = opened ? 0.85 : 0.25;
  renderer.domElement.style.cursor = "default";
  if (!opened) cursor = selected;
}

function onClick(e) {
  if (unfold < 0.6) return;
  const pick = pickFromPointer(e.clientX, e.clientY);
  if (pick.dist > 130) {
    if (opened) closePanel();
    return;
  }
  setTarget(pick.genome);
  cursor = pick.genome;
  togglePanel();
}

function onWheel(e) {
  e.preventDefault();
  if (unfold < 0.4) return;
  const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
  setTarget(selected + dir);
  cursor = selected;
  spreadTarget = 1;
}

function onKey(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    setTarget(selected + 1);
    cursor = selected;
    spreadTarget = 1;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    setTarget(selected - 1);
    cursor = selected;
    spreadTarget = 1;
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    togglePanel();
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (opened) closePanel();
    else {
      unfoldTarget = 0;
      setTimeout(() => {
        location.href = "/";
      }, reduceMotion ? 0 : 420);
    }
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
}

function tick(now) {
  unfold += (unfoldTarget - unfold) * (reduceMotion ? 1 : 0.05);
  flare += (flareTarget - flare) * (reduceMotion ? 1 : 0.1);
  spread += (spreadTarget - spread) * (reduceMotion ? 1 : 0.12);

  if (!browsing && !reduceMotion) {
    cursor += (selected - cursor) * 0.14;
    if (Math.abs(selected - cursor) < 0.001) cursor = selected;
  }

  const t = now * 0.00028;
  camera.position.x = Math.sin(t) * 0.35;
  camera.position.y = 0.2 + Math.cos(t * 0.7) * 0.18;
  camera.lookAt(0, 0.1, 0);
  root.rotation.y = Math.sin(t * 0.5) * 0.07;

  deco.children.forEach((m) => {
    m.position.y += Math.sin(now * 0.001 + m.userData.phase) * 0.001;
    m.material.opacity = 0.05 + unfold * 0.1;
  });

  layout();
  projectMarker();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

secBtns.forEach((btn) => {
  btn.addEventListener("click", () => jumpRegion(btn.dataset.jump));
});
document.getElementById("panel-close").addEventListener("click", closePanel);
document.getElementById("btn-prev").addEventListener("click", () => {
  setTarget(selected - 1);
  cursor = selected;
  spreadTarget = 1;
});
document.getElementById("btn-next").addEventListener("click", () => {
  setTarget(selected + 1);
  cursor = selected;
  spreadTarget = 1;
});
document.getElementById("btn-select").addEventListener("click", togglePanel);
document.getElementById("btn-back").addEventListener("click", () => {
  if (opened) closePanel();
  else {
    unfoldTarget = 0;
    setTimeout(() => {
      location.href = "/";
    }, reduceMotion ? 0 : 420);
  }
});

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerleave", onPointerLeave);
renderer.domElement.addEventListener("click", onClick);
renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
document.addEventListener("keydown", onKey);
addEventListener("resize", resize);

addDecor();
resize();
ensurePlates();
rebuildCurve(0.08);
updateHud(true);
requestAnimationFrame(() => {
  unfoldTarget = 1;
});
requestAnimationFrame(tick);
