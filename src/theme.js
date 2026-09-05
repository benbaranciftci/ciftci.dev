export const ACCENT_THEMES = {
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
    accent: 0xc084fc,
    accentHot: 0xe9d5ff,
    fog: 0x1a1620,
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

export function readTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return "light";
}

export function createTheme() {
  let name = readTheme();
  let tokens = ACCENT_THEMES[name];

  return {
    get name() {
      return name;
    },
    get tokens() {
      return tokens;
    },
    get accent() {
      return tokens.accent;
    },
    get accentHot() {
      return tokens.accentHot;
    },
    apply(next, { scene, ambient, key, contentHexes, deco, contentCount, onSyncButton } = {}) {
      name = next === "dark" ? "dark" : "light";
      tokens = ACCENT_THEMES[name];
      document.documentElement.setAttribute("data-theme", name);
      try {
        localStorage.setItem("dna-theme", name);
      } catch {
      }

      if (scene?.fog) {
        scene.fog.color.setHex(tokens.fog);
        scene.fog.near = tokens.fogNear;
        scene.fog.far = tokens.fogFar;
      }
      if (ambient) ambient.intensity = tokens.ambient;
      if (key) {
        key.color.setHex(tokens.key);
        key.intensity = tokens.keyI;
      }

      contentHexes?.forEach((entry) => {
        const shade = entry.mesh.userData.contentIdx / Math.max(1, contentCount - 1);
        const L = tokens.contentL0 + shade * tokens.contentL1;
        entry.mesh.userData.baseL = L;
        entry.line.userData.baseL = L;
      });
      deco?.children.forEach((m) => {
        m.material.color.setHex(tokens.decor);
        m.material.opacity = tokens.decorOp;
      });

      onSyncButton?.();
    },
  };
}
