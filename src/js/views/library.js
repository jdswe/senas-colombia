import { clear, h, stagger } from "../core/dom.js";
import { library } from "../data/repository.js";
import { normalize } from "../text/normalize.js";
import { signCard } from "../components/signCard.js";

const PAGE_SIZE = 48;
const LETTERS = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];

export function libraryView() {
  const state = { query: "", module: "", letter: "", shown: PAGE_SIZE };
  const grid = h("ul", { class: "sign-grid" });
  const summary = h("p", { class: "muted", role: "status", "aria-live": "polite" });
  const more = h("button", { class: "btn btn-ghost", type: "button" }, "Mostrar más señas");

  const results = () => library.search(state.query, state.module)
    .filter((sign) => !state.letter || normalize(sign.word).startsWith(normalize(state.letter)))
    .sort((a, b) => a.word.replace(/[¿¡]/g, "").localeCompare(b.word.replace(/[¿¡]/g, ""), "es"));

  const render = () => {
    const found = results();
    clear(grid).append(...found.slice(0, state.shown).map((sign) => signCard(sign, { showModule: true })));
    stagger(grid);
    summary.textContent = found.length ? `${found.length} señas` : "No hay señas con ese filtro. Prueba otra palabra.";
    more.hidden = found.length <= state.shown;
  };
  const update = (patch) => { Object.assign(state, patch, { shown: PAGE_SIZE }); render(); };

  const letterBar = h("div", { class: "letter-bar", role: "group", "aria-label": "Filtrar por letra inicial" }, LETTERS.map((letter) =>
    h("button", { type: "button", "aria-pressed": "false", onClick: (event) => {
      const active = state.letter === letter;
      letterBar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
      if (!active) event.currentTarget.setAttribute("aria-pressed", "true");
      update({ letter: active ? "" : letter });
    } }, letter)));
  more.addEventListener("click", () => { state.shown += PAGE_SIZE; render(); });

  const view = h("div", { dataset: { title: "Biblioteca" } },
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, "Todas las señas"), h("h1", {}, "Biblioteca")),
    h("div", { class: "library-controls" },
      h("label", { class: "field" }, "Buscar palabra o significado",
        h("input", { class: "input", type: "search", placeholder: "Ej.: casa, familia, feliz", autocomplete: "off", onInput: (e) => update({ query: e.target.value }) })),
      h("label", { class: "field" }, "Módulo",
        h("select", { class: "select", onChange: (e) => update({ module: e.target.value }) },
          h("option", { value: "" }, "Todos los módulos"),
          library.modules().map((module) => h("option", { value: module.id }, module.name))))),
    letterBar, summary, grid, h("div", { class: "load-more" }, more));
  render();
  return view;
}
