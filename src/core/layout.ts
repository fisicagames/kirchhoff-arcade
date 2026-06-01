/**
 * Sizes the game so the ENTIRE layout always fits the visible viewport — the
 * game must never depend on a scrollbar.
 *
 * Strategy (adapted from the Babylon.js `adjustCanvasSize` approach):
 *   gameW = min( widthLimit, heightLimit )
 *     • widthLimit  = viewportWidth × 0.96       → use the width
 *     • heightLimit = (svh − chrome) / aspect    → guarantee vertical fit
 *
 * The whole UI derives from the single CSS variable `--game-w` (header, canvas
 * and touch controls all reference it), so controlling that one value keeps the
 * layout proportionally constant and the canvas keeps its 2:3 aspect (no
 * deformation, ever).
 *
 * Height is measured with the SMALL viewport unit (`svh`): the height that is
 * guaranteed visible while the browser UI (address bar) is shown. Because `svh`
 * does not change when the address bar hides/shows, the layout fits without a
 * scrollbar and without jumping while scrolling.
 */

const ASPECT = 1.5;   // canvas height / width (450 / 300)
const W_FILL = 0.96;  // fraction of the width used
const SAFE   = 6;     // px breathing room so nothing clips
const MIN_W  = 200;   // never collapse below this
const MAX_W  = 480;   // sane ceiling (keeps the up-scaled canvas crisp on desktop)

/** Height (px) of the small viewport — the area guaranteed visible with browser UI shown. */
function smallViewportHeight(): number {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h > 0 ? h : (window.visualViewport?.height ?? window.innerHeight);
}

/** Fixed vertical UI around the canvas, measured live so it never drifts from the CSS. */
function chromeHeight(): number {
  const header   = document.getElementById('header');
  const controls = document.getElementById('touchControls');
  const measured = (header?.offsetHeight ?? 124) + (controls?.offsetHeight ?? 105);
  return measured + 22; // #container padding (12) + two 5px gaps between its rows
}

function compute(): void {
  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = smallViewportHeight();

  const widthLimit  = vw * W_FILL;
  const heightLimit = (vh - chromeHeight() - SAFE) / ASPECT;

  const gameW = Math.max(MIN_W, Math.min(MAX_W, widthLimit, heightLimit));
  document.documentElement.style.setProperty('--game-w', Math.floor(gameW) + 'px');

  // Tutorial/menu UI scale. Anchored to the same gameW the board uses, but
  // capped at 1 so it never grows past the design size (no inflation on wide
  // desktops) and shrinks together with the board under browser zoom.
  const ts = Math.max(0.6, Math.min(1, gameW / 300));
  document.documentElement.style.setProperty('--ts', ts.toFixed(3));
}

export function setupLayout(): void {
  let raf = 0;
  const schedule = (): void => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(compute);
  };

  compute();

  window.addEventListener('resize', schedule);                 // window resize / desktop zoom
  window.visualViewport?.addEventListener('resize', schedule); // pinch zoom
  window.addEventListener('orientationchange', () => {
    setTimeout(compute, 250);                                  // let new metrics settle
  });
}
