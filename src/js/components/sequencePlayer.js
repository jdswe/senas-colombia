import { config } from "../core/config.js";
import { clear, h } from "../core/dom.js";
import { figureForLetter, figureForSign } from "./signFigure.js";

const SPEEDS = [["Lento", 1.6], ["Normal", 1], ["Rápido", 0.6]];
const MIN_SIGN_MS = 1700;
const LETTER_MS = 800;

/** Convierte los pasos del traductor en diapositivas reproducibles (una por seña o por letra). */
function toSlides(steps) {
  return steps.flatMap((step) => {
    if (step.type === "sign") return [{ label: step.sign.word, kind: "seña", sign: step.sign }];
    if (step.type === "spell") return step.letters.map((letter) => ({ label: letter.toUpperCase(), kind: `deletreo de «${step.source}»`, letter }));
    return [];
  });
}

/** Reproductor: muestra las señas una tras otra, como un video con controles. */
export function sequencePlayer() {
  const stage = h("div", {});
  const now = h("p", { class: "now", "aria-live": "polite" });
  const kind = h("p", { class: "muted", style: { margin: 0 } });
  const detail = h("p", { style: { marginTop: "0.6rem" } });
  const strip = h("ol", { class: "sequence", "aria-label": "Secuencia de señas" });
  const playButton = h("button", { class: "btn btn-primary", type: "button" });
  const speed = h("select", { class: "select", style: { width: "auto" }, "aria-label": "Velocidad" },
    SPEEDS.map(([name, factor]) => h("option", { value: String(factor), selected: factor === 1 }, name)));
  const root = h("div", { hidden: true },
    h("section", { class: "player card", "aria-label": "Reproductor de señas" },
      stage,
      h("div", {}, kind, now, detail,
        h("div", { class: "player-controls" },
          h("button", { class: "btn btn-ghost btn-icon", type: "button", "aria-label": "Seña anterior", onClick: () => go(index - 1, false) }, "◀"),
          playButton,
          h("button", { class: "btn btn-ghost btn-icon", type: "button", "aria-label": "Seña siguiente", onClick: () => go(index + 1, false) }, "▶"),
          speed))),
    strip);

  let slides = [];
  let index = 0;
  let timer = null;
  let playing = false;

  const paintButton = () => { playButton.textContent = playing ? "❚❚ Pausar" : "▶ Reproducir"; };
  const stop = () => { window.clearTimeout(timer); playing = false; paintButton(); };

  function go(target, keepPlaying) {
    if (!slides.length) return;
    index = (target + slides.length) % slides.length;
    const slide = slides[index];
    const figure = slide.sign ? figureForSign(slide.sign, { autoplay: false, eager: true }) : figureForLetter(slide.letter, { eager: true });
    clear(stage).append(figure);
    figure.play();
    now.textContent = slide.label;
    kind.textContent = `${index + 1} / ${slides.length} · ${slide.kind}`;
    clear(detail).append(slide.sign
      ? h("a", { href: `#/sena/${slide.sign.id}` }, "Ver cómo se hace esta seña")
      : "Letra del alfabeto manual");
    [...strip.children].forEach((item, i) => {
      item.firstChild.setAttribute("aria-current", String(i === index));
      if (i === index) item.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
    window.clearTimeout(timer);
    if (keepPlaying) {
      const base = slide.sign ? Math.max(MIN_SIGN_MS, figure.frames * config.frameMs * 2) : LETTER_MS;
      const last = index === slides.length - 1;
      timer = window.setTimeout(() => (last ? stop() : go(index + 1, true)), base * Number(speed.value));
    } else {
      stop();
    }
  }

  playButton.addEventListener("click", () => {
    if (playing) return stop();
    playing = true;
    paintButton();
    go(index === slides.length - 1 ? 0 : index, true);
  });

  root.load = (steps) => {
    stop();
    slides = toSlides(steps);
    root.hidden = !slides.length;
    clear(strip).append(...slides.map((slide, i) => h("li", {},
      h("button", { class: "seq-item", type: "button", onClick: () => go(i, false) },
        slide.sign ? figureForSign(slide.sign, { autoplay: false }) : figureForLetter(slide.letter),
        h("span", { class: "label" }, slide.label),
        h("span", { class: "kind" }, slide.sign ? "seña" : "letra")))));
    if (slides.length) { playing = true; paintButton(); go(0, true); }
  };
  root.onDispose = stop;
  paintButton();
  return root;
}
