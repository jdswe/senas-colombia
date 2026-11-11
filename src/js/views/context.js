import { h } from "../core/dom.js";
import { LINKS, PEOPLE, TIMELINE, WHY } from "../content/context.js";

export function contextView() {
  return h("div", { dataset: { title: "Contexto" } },
    h("header", { class: "page-head" },
      h("p", { class: "eyebrow" }, "Lenguas, sentidos y acceso"),
      h("h1", {}, "Contexto e historia"),
      h("p", { class: "muted" }, "Aprender señas también es entender a quién le hablas. Tres realidades distintas, tres formas de comunicarse.")),
    h("div", { class: "split-3" }, PEOPLE.map((group) => h("article", { class: "card" },
      h("h2", { style: { fontSize: "1.25rem" } }, group.title),
      group.body.map((text) => h("p", {}, text)),
      h("h3", { style: { fontSize: "0.9rem" } }, "Para comunicarte"),
      h("ul", { style: { paddingLeft: "1.1rem", margin: 0 } }, group.tips.map((tip) => h("li", {}, tip)))))),
    h("div", { class: "prose" },
      h("h2", {}, "Un poco de historia"),
      h("ol", { class: "timeline" }, TIMELINE.map(([year, text]) => h("li", {}, h("strong", {}, year), text))),
      h("h2", {}, "Por qué este proyecto"),
      WHY.map((text) => h("p", {}, text)),
      h("h2", {}, "Para seguir aprendiendo"),
      h("ul", {}, LINKS.map(([label, url]) => h("li", {}, h("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, label, " ↗"))))));
}
