import { h } from "../core/dom.js";
import { progress } from "../core/store.js";
import { library, pdfUrl } from "../data/repository.js";
import { figureForSign } from "../components/signFigure.js";

export function signView({ id }) {
  const sign = library.sign(id);
  if (!sign) return h("div", {}, h("p", {}, "No encontramos esa seña."), h("a", { href: "#/biblioteca" }, "Ir a la biblioteca"));
  const module = library.module(sign.module);
  const siblings = library.inModule(sign.module);
  const index = siblings.indexOf(sign);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];

  const learnButton = h("button", { class: "btn btn-sun", type: "button", "aria-pressed": String(progress.isLearned(id)) });
  const paintLearn = () => {
    const learned = progress.isLearned(id);
    learnButton.textContent = learned ? "✓ Aprendida" : "Marcar como aprendida";
    learnButton.setAttribute("aria-pressed", String(learned));
  };
  learnButton.addEventListener("click", () => { progress.toggle(id); paintLearn(); });
  paintLearn();

  const frames = sign.images.length;
  return h("div", { dataset: { title: sign.word } },
    h("a", { class: "back-link", href: `#/modulo/${sign.module}` }, `← ${module?.name ?? "Módulo"}`),
    h("article", { class: "sign-detail" },
      h("div", { class: "stage-col" },
        figureForSign(sign, { eager: true }),
        h("p", { class: "muted", style: { fontSize: "0.85rem", margin: 0 } },
          frames > 1 ? `Animación de ${frames} momentos. Toca la imagen para avanzar paso a paso.` : "Las flechas indican el movimiento de la seña."),
        h("div", { class: "sign-actions" }, learnButton,
          library.hasReferencePdf() && h("a", { class: "btn btn-ghost", href: pdfUrl(sign.page), target: "_blank", rel: "noopener noreferrer" }, `Ver referencia · p. ${sign.page}`)),
        h("p", { class: "muted", style: { fontSize: "0.8rem", margin: 0 } }, `Fuente: Diccionario Básico de la LSC (INSOR / Instituto Caro y Cuervo, 2006), p. ${sign.page}.`)),
      h("div", {},
        h("p", { class: "eyebrow" }, module?.name ?? ""),
        h("h1", {}, sign.word),
        h("section", { class: "sign-section card" },
          h("h2", {}, "Significado"),
          sign.senses.map((sense, i) => h("div", { class: "sense" },
            sense.def && h("p", { style: { margin: 0 } }, sign.senses.filter((s) => s.def).length > 1 ? `${i + 1}. ` : "", sense.type && h("em", {}, `${sense.type} `), sense.def),
            sense.gloss && h("span", { class: "gloss", title: "Ejemplo en glosa de LSC" }, sense.gloss),
            sense.tr && h("span", { class: "tr" }, sense.tr)))),
        h("section", { class: "sign-section card" },
          h("h2", {}, "Cómo se hace la seña"),
          sign.how.length ? h("ol", { class: "how-list" }, sign.how.map((step) => h("li", {}, step)))
            : h("p", { class: "muted" }, "Sin descripción en la fuente.")),
        h("nav", { class: "pager", "aria-label": "Señas del módulo" },
          previous ? h("a", { class: "btn btn-ghost", href: `#/sena/${previous.id}` }, `← ${previous.word}`) : h("span", {}),
          next ? h("a", { class: "btn btn-ghost", href: `#/sena/${next.id}` }, `${next.word} →`) : h("span", {})))));
}
