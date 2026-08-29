import * as THREE from "three";
import {
  GENES,
  CONTENT,
  CONTENT_COUNT,
  PAD_EACH,
  geneCenterHex,
  geneNucs,
} from "../content/model.js";

const CURVE_SAMPLES = 180;
const STRAND_POSE = { x: -0.08, y: 0.12, z: -0.05 };

export function createScene({ state, theme, ui }) {
  const mount = document.getElementById("strand");

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(theme.tokens.fog, theme.tokens.fogNear, theme.tokens.fogFar);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0.2, 0.35, 18.5);

  const renderer = new THREE.WebGLRenderer({ antialias: !state.isMobileLayout, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, theme.tokens.ambient);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(theme.tokens.key, theme.tokens.keyI);
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
  const _pos = new THREE.Vector3();
  const _tan = new THREE.Vector3();
  const _normal = new THREE.Vector3();
  const _binormal = new THREE.Vector3();
  const _posWork = new THREE.Vector3();

  let curve = null;
  let frames = null;
  let openBuilt = -1;
  let layoutFocus = 0;

  function tokens() {
    return theme.tokens;
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

  function focusHex() {
    const gi = Math.floor(state.cursor);
    const gf = state.cursor - gi;
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
    curve.getPointAt(t, _pos);
    curve.getTangentAt(t, _tan).normalize();
    _normal.copy(frames.normals[a]).lerp(frames.normals[b], u).normalize();
    _binormal.copy(frames.binormals[a]).lerp(frames.binormals[b], u).normalize();
    return { pos: _pos, tan: _tan, normal: _normal, binormal: _binormal, t };
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

  function hexStyle(hexIdx) {
    const offset = hexIdx - layoutFocus;
    const along = THREE.MathUtils.clamp((hexIdx + PAD_EACH) / (CONTENT_COUNT + PAD_EACH * 2), 0, 1);
    const th = tokens();
    const baseL = THREE.MathUtils.lerp(th.padL0, th.padL1, along);
    const rim = Math.abs(offset) / (PAD_EACH + CONTENT_COUNT * 0.35);
    const fade = 1 - Math.pow(Math.max(0, rim - 0.55) / 0.45, 1.15);
    return { fade: Math.max(0, fade), L: baseL * Math.max(0, fade) };
  }

  function makeHexEntry(kind, meta) {
    const th = tokens();
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(th.h, th.sMesh, 0.5),
      transparent: true,
      opacity: th.meshOp,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(plateGeo, mat);
    mesh.userData = { ...meta, kind };
    root.add(mesh);
    const lm = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(th.h, th.sLine, 0.82),
      transparent: true,
      opacity: th.lineOp,
    });
    const line = new THREE.LineSegments(edgeGeo, lm);
    root.add(line);
    return { mesh, line };
  }

  function ensureHexes() {
    if (contentHexes.length) return;
    const th = tokens();
    CONTENT.forEach(({ gene, slot, contentIdx }) => {
      const shade = contentIdx / Math.max(1, CONTENT_COUNT - 1);
      const L = th.contentL0 + shade * th.contentL1;
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
    const th = tokens();
    const t = hexToT(hexIdx, focus, state.spread);
    const frame = sampleAt(t);
    const pos = _posWork.copy(frame.pos);
    const isContent = ud.kind === "content";
    const gene = isContent ? ud.gene : -1;
    const slotIdx = isContent ? ud.slot : -1;
    const focusGene = Math.round(state.cursor);
    const geneNucsLocal = gene >= 0 ? GENES[gene]?.nucleotides : null;
    const atContact =
      gene === focusGene && geneNucsLocal && Math.abs(state.cursor - focusGene) < 0.45;
    const nucs = atContact ? geneNucsLocal : null;
    const isNuc = !!nucs && isContent;
    const nucDist = isNuc ? Math.abs(slotIdx - state.nucCursor) : 1;
    const isActiveNuc = isNuc && nucDist < 0.55;
    const hot = isContent && (gene === focusGene || isActiveNuc);
    const nearFocus = Math.abs(hexIdx - focus);
    const activeAmt = isNuc ? Math.max(0, 1 - nucDist) : 0;

    if (state.flare > 0.01 && nearFocus < 2.2 && !geneNucs(GENES[state.selected])) {
      const g = 1 - nearFocus / 2.2;
      const side = hexIdx < focus ? -1 : 1;
      pos.addScaledVector(frame.binormal, side * g * g * state.flare * 1.75);
    }
    if (isNuc) {
      pos.y += THREE.MathUtils.lerp(0.08, 0.62, activeAmt);
    }

    const gap = 1 + state.spread * Math.exp(-(nearFocus * nearFocus) / 8);
    const hotPulse =
      hot && !state.reduceMotion ? 1.16 + Math.sin(performance.now() * 0.004) * 0.03 : hot ? 1.16 : 1;
    const s =
      (0.95 + state.unfold * 0.55) *
      (0.88 + Math.min(2.6, gap) * 0.17) *
      (isNuc ? THREE.MathUtils.lerp(1.18, 1.45, activeAmt) : hotPulse) *
      (0.88 + style.fade * 0.14);

    mesh.position.copy(pos);
    line.position.copy(pos);
    orient(mesh, frame.tan, frame.normal, frame.binormal);
    line.quaternion.copy(mesh.quaternion);
    mesh.scale.setScalar(s);
    line.scale.setScalar(s);

    const alpha = style.fade * (0.05 + state.unfold * 0.14);
    if (isNuc && activeAmt > 0.15) {
      const a = activeAmt;
      mesh.material.color.setHex(a > 0.65 ? theme.accent : theme.accentHot);
      mesh.material.opacity = THREE.MathUtils.lerp(0.38, 0.72, a);
      line.material.color.setHex(a > 0.65 ? theme.accentHot : theme.accent);
      line.material.opacity = THREE.MathUtils.lerp(0.95, 1, a);
    } else if (isNuc) {
      const isNeighbor = Math.abs(slotIdx - state.nucIndex) === 1;
      const pulse =
        isNeighbor && !state.reduceMotion
          ? 0.5 + 0.5 * Math.sin(performance.now() * 0.005 + slotIdx)
          : 0;
      mesh.material.color.setHex(theme.accentHot);
      mesh.material.opacity = THREE.MathUtils.lerp(0.3, 0.4, pulse);
      line.material.color.setHex(theme.accent);
      line.material.opacity = THREE.MathUtils.lerp(0.5, 1, pulse * 0.8);
      if (pulse > 0) {
        const bump = 1 + pulse * 0.08;
        mesh.scale.setScalar(s * bump);
        line.scale.setScalar(s * bump);
      }
    } else if (hot) {
      mesh.material.color.setHex(theme.accent);
      mesh.material.opacity = 0.5;
      line.material.color.setHex(theme.accentHot);
      line.material.opacity = 1;
    } else if (isContent) {
      mesh.material.color.setHSL(th.h, th.sMesh, ud.baseL);
      mesh.material.opacity = Math.max(alpha, th.contentOp + state.unfold * th.contentOpU);
      line.material.color.setHSL(th.h, th.sLine, Math.min(th.lineCap, ud.baseL + th.lineLift));
      line.material.opacity = th.contentLineOp + state.unfold * th.contentLineOpU;
    } else {
      mesh.material.color.setHSL(th.h, th.sMesh, style.L);
      mesh.material.opacity = alpha * th.padOp;
      line.material.color.setHSL(th.h, th.sLine, Math.min(th.padCap, style.L + th.padLift));
      line.material.opacity = style.fade * (th.padLine + state.unfold * th.padLineU);
    }

    mesh.visible = style.fade > 0.03 && state.unfold > 0.06;
    line.visible = mesh.visible;
  }

  function layout() {
    rebuildCurve(state.unfold);
    ensureHexes();

    const focus = focusHex();
    layoutFocus = focus;

    contentHexes.forEach((entry) => {
      const { contentIdx } = entry.mesh.userData;
      const style = hexStyle(contentIdx);
      style.fade = 1;
      layoutHex(entry, contentIdx, focus, style);
    });

    padHexes.forEach((entry) => {
      const { side, padIdx } = entry.mesh.userData;
      const hexIdx = side === "left" ? -(padIdx + 1) : CONTENT_COUNT + padIdx;
      const style = hexStyle(hexIdx);
      layoutHex(entry, hexIdx, focus, style);
    });
  }

  function addDecor() {
    const g = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const count = state.isMobileLayout ? 20 : 50;
    const minDist = state.isMobileLayout ? 1.7 : 1.45;
    const maxAttempts = 50;
    const placed = [];
    const th = tokens();

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
        new THREE.MeshBasicMaterial({ color: th.decor, transparent: true, opacity: th.decorOp })
      );
      m.position.set(pos.x, pos.y, pos.z);
      m.rotation.z = Math.PI / 4;
      m.userData.phase = Math.random() * 6;
      deco.add(m);
    }
  }

  function pickFromPointer(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector3();
    let bestGene = state.selected;
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
    const onContact = nucs && hit && Math.abs(state.cursor - bestGene) < 0.45;
    if (onContact) {
      return { gene: bestGene, nuc: bestSlot, dist: bestD, mode: "nuc" };
    }
    if (hit && bestD < 95) return { gene: bestGene, dist: bestD, mode: "gene" };
    return { gene: state.selected, dist: bestD, mode: "miss" };
  }

  function barInset() {
    const bar = document.querySelector(".bar");
    return bar?.offsetHeight || 48;
  }

  function syncPixelRatio() {
    const cap = state.isMobileLayout ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(devicePixelRatio, cap));
  }

  function applyCameraProfile() {
    camera.fov = state.isMobileLayout ? 40 : 34;
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
    ui.measureWorldTravel();
    ui.applyWorldScroll();
  }

  function stepCamera(now) {
    const camYBase = state.isMobileLayout ? 0.58 : 0.35;
    const camZ = state.isMobileLayout ? 21.5 : 18.5;
    const lookY = state.isMobileLayout ? 0.18 : 0.05;

    if (state.reduceMotion) {
      camera.position.set(0.2, camYBase, camZ);
      camera.lookAt(0, lookY, 0);
      root.rotation.set(STRAND_POSE.x, STRAND_POSE.y, STRAND_POSE.z);
      const op = 0.04 + state.unfold * 0.08;
      deco.children.forEach((m) => {
        m.material.opacity = op;
      });
      return;
    }

    const t = now * 0.00028;
    const camSway = state.isMobileLayout ? 0.14 : 0.3;
    const camYWave = state.isMobileLayout ? 0.05 : 0.12;
    camera.position.x = 0.2 + Math.sin(t) * camSway;
    camera.position.y = camYBase + Math.cos(t * 0.7) * camYWave;
    camera.position.z = camZ;
    camera.lookAt(0, lookY, 0);
    root.rotation.x = STRAND_POSE.x;
    root.rotation.y = STRAND_POSE.y + Math.sin(t * 0.5) * (state.isMobileLayout ? 0.03 : 0.05);
    root.rotation.z = STRAND_POSE.z;

    deco.children.forEach((m) => {
      m.position.y += Math.sin(now * 0.001 + m.userData.phase) * 0.001;
      m.material.opacity = 0.04 + state.unfold * 0.08;
    });
  }

  function render() {
    renderer.render(scene, camera);
  }

  return {
    scene,
    camera,
    renderer,
    ambient,
    key,
    root,
    deco,
    contentHexes,
    ensureHexes,
    rebuildCurve,
    layout,
    addDecor,
    pickFromPointer,
    resize,
    stepCamera,
    render,
  };
}
