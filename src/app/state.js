export function createState({ reduceMotion, withIntro }) {
  const introActive = Boolean(withIntro) && !reduceMotion;

  return {
    reduceMotion,
    isMobileLayout: matchMedia("(max-width: 640px)").matches,

    selected: 0,
    cursor: 0,
    nucIndex: 0,
    nucCursor: 0,
    focus: 0,

    unfold: reduceMotion || !introActive ? 1 : 0.05,
    unfoldTarget: introActive ? 0.15 : 1,
    flare: 0,
    flareTarget: 0,
    spread: reduceMotion ? 0.35 : introActive ? 0.4 : 0,
    spreadTarget: introActive ? 0.55 : 0.3,

    introActive,
  };
}
