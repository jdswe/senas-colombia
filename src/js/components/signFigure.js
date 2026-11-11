import { config } from "../core/config.js";
import { h } from "../core/dom.js";
import { imageUrl, letterUrl } from "../data/repository.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Ilustración animada: alterna los fotogramas de una seña.
 * Devuelve el nodo con `play()`, `stop()` y `frames` (cantidad).
 */
export function signFigure(urls, alt, { autoplay = true, letter = false, eager = false } = {}) {
  const images = urls.map((url, index) => h("img", {
    src: url, alt: index === 0 ? alt : "", loading: eager ? "eager" : "lazy", decoding: "async",
    class: index === 0 ? "is-active" : "",
  }));
  const dots = urls.length > 1 ? h("div", { class: "frame-dots", "aria-hidden": "true" }, urls.map((_, i) => h("span", { class: i === 0 ? "is-active" : "" }))) : null;
  const figure = h("div", { class: `sign-figure${letter ? " is-letter" : ""}` },
    images.length ? images : h("span", { class: "empty" }, "Ilustración no disponible"), dots);

  let current = 0;
  let timer = null;
  const show = (index) => {
    current = index % images.length;
    images.forEach((img, i) => img.classList.toggle("is-active", i === current));
    dots?.childNodes.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  };
  figure.frames = images.length;
  figure.stop = () => { window.clearInterval(timer); timer = null; };
  figure.play = () => {
    figure.stop();
    show(0);
    if (images.length > 1 && !reducedMotion.matches) timer = window.setInterval(() => show(current + 1), config.frameMs);
  };
  if (images.length > 1) {
    figure.addEventListener("click", () => { figure.stop(); show(current + 1); });
    if (autoplay) {
      const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? figure.play() : figure.stop()));
      observer.observe(figure);
    }
  }
  return figure;
}

export const figureForSign = (sign, options) =>
  signFigure(sign.images.map(imageUrl), `Seña de ${sign.word}: ${sign.how[0] ?? ""}`, options);

export const figureForLetter = (letter, options) =>
  signFigure([letterUrl(letter)], `Letra ${letter.toUpperCase()} en el alfabeto manual`, { ...options, letter: true });
