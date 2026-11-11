import { h, stagger } from "../core/dom.js";
import { CAPITAL, LETTERS, NUMBER, toBraille } from "../braille/braille.js";

const dotCell = (dots) => h("span", { class: "braille-cell", "aria-hidden": "true" }, [1, 2, 3, 4, 5, 6].map((dot) => h("i", { class: dots.includes(String(dot)) ? "on" : "" })));
const describe = (dots) => `puntos ${[...dots].join(", ")}`;

export function brailleView() {
  const output = h("p", { class: "braille-out", "aria-label": "Texto en braille", lang: "es-Brai" });
  const entries = [...Object.entries(LETTERS), ["Mayúscula", CAPITAL], ["Número", NUMBER]];
  return h("div", { dataset: { title: "Braille" } },
    h("header", { class: "page-head" },
      h("p", { class: "eyebrow" }, "Lectura y escritura táctil"),
      h("h1", {}, "Braille"),
      h("p", { class: "muted" }, "El braille no es una lengua ni una lengua de señas: es un sistema para leer y escribir con el tacto. Cada celda combina seis puntos en relieve. Lo creó Louis Braille en Francia en el siglo XIX y hoy se usa en todo el mundo.")),
    h("section", { class: "translator-input card", style: { marginBottom: "2rem" } },
      h("label", { class: "field" }, "Convierte un texto a braille español (grado 1)",
        h("input", { class: "input", type: "text", placeholder: "Ej.: Hola Colombia 2026", autocomplete: "off", onInput: (e) => { output.textContent = toBraille(e.target.value); } })),
      output,
      h("p", { class: "muted", style: { margin: 0, fontSize: "0.88rem" } }, "En pantalla los puntos solo se ven; el braille real se lee en relieve, en papel o en una línea braille. Las mayúsculas y los números llevan un signo delante.")),
    h("h2", {}, "Alfabeto braille"),
    stagger(h("ul", { class: "braille-grid" }, entries.map(([name, dots]) =>
      h("li", { class: "card" }, dotCell(dots), h("div", {}, h("strong", {}, name.length === 1 ? name.toUpperCase() : name)), h("span", { class: "muted", style: { fontSize: "0.75rem" } }, describe(dots)))))),
    h("div", { class: "note", style: { marginTop: "2rem" } },
      h("p", {}, "Para aprender braille y conseguir materiales en Colombia consulta al ",
        h("a", { href: "https://www.inci.gov.co/", target: "_blank", rel: "noopener noreferrer" }, "Instituto Nacional para Ciegos (INCI)"), ".")));
}
