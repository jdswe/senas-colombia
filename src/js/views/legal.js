import { h } from "../core/dom.js";
import { LEGAL } from "../content/legal.js";

export function legalView({ doc }) {
  const page = LEGAL[doc] ?? LEGAL.terminos;
  return h("div", { dataset: { title: page.title } },
    h("nav", { class: "tabs", "aria-label": "Documentos legales" }, Object.entries(LEGAL).map(([key, item]) =>
      h("a", { href: `#/legal/${key}`, class: "chip", "aria-current": item === page ? "page" : null, style: item === page ? { background: "var(--ink)", color: "var(--canvas)" } : {} }, item.title))),
    h("article", { class: "prose" },
      h("h1", {}, page.title),
      page.sections.map(([title, items]) => [
        h("h2", {}, title),
        items.length > 1 ? h("ul", {}, items.map((item) => h("li", {}, item))) : h("p", {}, items[0]),
      ])));
}
