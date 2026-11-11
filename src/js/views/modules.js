import { h, stagger } from "../core/dom.js";
import { progress } from "../core/store.js";
import { library } from "../data/repository.js";
import { figureForSign } from "../components/signFigure.js";
import { signCard } from "../components/signCard.js";

const progressBar = (done, total, label) =>
  h("div", { class: "progress", role: "progressbar", "aria-label": label, "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(done) },
    h("span", { style: { transform: `scaleX(${total ? done / total : 0})` } }));

export function modulesView() {
  const groups = [...new Set(library.modules().map((module) => module.group))];
  return h("div", { dataset: { title: "Módulos" } },
    h("header", { class: "page-head" },
      h("p", { class: "eyebrow" }, "Ruta de aprendizaje"),
      h("h1", {}, "Módulos"),
      h("p", { class: "muted" }, "Elige un tema, estudia sus señas y luego practica. Tu avance se guarda solo en este dispositivo.")),
    groups.map((group) => h("section", { class: "module-group" },
      h("h2", {}, group),
      stagger(h("ul", { class: "module-grid" }, library.modules().filter((m) => m.group === group && m.count).map((module) => {
        const signs = library.inModule(module.id);
        const done = progress.countIn(signs);
        const cover = signs.find((sign) => sign.images.length) ?? signs[0];
        return h("li", {}, h("a", { class: "module-card card", href: `#/modulo/${module.id}` },
          figureForSign(cover, { autoplay: false }),
          h("div", {}, h("h3", {}, module.name), h("span", { class: "count" }, `${done} de ${module.count} señas`),
            progressBar(done, module.count, `Avance en ${module.name}`))));
      }))))));
}

export function moduleView({ id }) {
  const module = library.module(id);
  if (!module) return h("div", {}, h("p", {}, "Ese módulo no existe."), h("a", { href: "#/modulos" }, "Ver todos los módulos"));
  const signs = library.inModule(id);
  const done = progress.countIn(signs);
  return h("div", { dataset: { title: module.name } },
    h("a", { class: "back-link", href: "#/modulos" }, "← Todos los módulos"),
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, module.group), h("h1", {}, module.name)),
    h("div", { class: "module-toolbar" },
      h("span", {}, h("strong", {}, `${done} de ${signs.length}`), " señas aprendidas"),
      progressBar(done, signs.length, `Avance en ${module.name}`),
      h("a", { class: "btn btn-primary", href: `#/practica/${id}` }, "Practicar este módulo")),
    stagger(h("ul", { class: "sign-grid" }, signs.map((sign) => signCard(sign)))));
}
