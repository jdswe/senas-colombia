import { clear, h, stagger } from "../core/dom.js";
import { figureForLetter } from "../components/signFigure.js";
import { normalize } from "../text/normalize.js";

const LETTERS = [..."abcdefghijklmnñopqrstuvwxyz"];

export function alphabetView() {
  const spelled = h("ul", { class: "alphabet-grid", "aria-live": "polite" });
  const spell = (text) => clear(spelled).append(...[...normalize(text)].filter((c) => LETTERS.includes(c)).map((letter) =>
    h("li", { class: "card" }, figureForLetter(letter, { eager: true }), h("span", { class: "letter" }, letter.toUpperCase()))));
  return h("div", { dataset: { title: "Alfabeto manual" } },
    h("header", { class: "page-head" },
      h("p", { class: "eyebrow" }, "Dactilología"),
      h("h1", {}, "Alfabeto manual"),
      h("p", { class: "muted" }, "Se usa para deletrear nombres propios y palabras que no tienen seña. No reemplaza a las señas: es un apoyo.")),
    h("label", { class: "field", style: { maxWidth: "420px", marginBottom: "1rem" } }, "Deletrea tu nombre",
      h("input", { class: "input", type: "text", placeholder: "Escribe tu nombre", autocomplete: "off", onInput: (e) => spell(e.target.value) })),
    spelled,
    h("h2", {}, "Las 27 letras"),
    stagger(h("ul", { class: "alphabet-grid" }, LETTERS.map((letter) =>
      h("li", { class: "card" }, figureForLetter(letter), h("span", { class: "letter" }, letter.toUpperCase()))))));
}
