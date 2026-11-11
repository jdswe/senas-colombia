import { h } from "../core/dom.js";
import { progress } from "../core/store.js";
import { library } from "../data/repository.js";
import { figureForSign } from "./signFigure.js";

/** Tarjeta enlazada a la ficha de una seña. */
export function signCard(sign, { showModule = false } = {}) {
  return h("li", {},
    h("a", { class: `sign-card${progress.isLearned(sign.id) ? " is-learned" : ""}`, href: `#/sena/${sign.id}` },
      figureForSign(sign),
      h("span", { class: "sign-word" }, sign.word),
      h("span", { class: "sign-meta" }, showModule ? library.module(sign.module)?.name ?? "" : "")));
}
