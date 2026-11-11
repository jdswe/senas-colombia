import { h, stagger } from "../core/dom.js";
import { progress } from "../core/store.js";
import { library } from "../data/repository.js";
import { figureForLetter } from "../components/signFigure.js";

const FEATURES = [
  ["/modulos", "✋", "Aprende por módulos", "39 temas: familia, comida, ciudad, sentimientos… con práctica al final de cada uno."],
  ["/traductor", "⇄", "Traductor español ↔ señas", "Escribe o dicta una frase y mira las señas en secuencia, o arma una frase con señas y escúchala."],
  ["/biblioteca", "🔎", "Biblioteca", "Busca cualquier seña: ilustración, significado, cómo se hace y ejemplo de uso."],
  ["/alfabeto", "Aa", "Alfabeto manual", "Las 27 letras para deletrear nombres y palabras sin seña propia."],
  ["/braille", "⠃", "Braille", "Conoce el sistema de lectura táctil y convierte texto a braille."],
  ["/contexto", "📖", "Contexto e historia", "Comunidad Sorda, ceguera y sordoceguera: por qué importa y cómo comunicarse con respeto."],
];

export function homeView() {
  const total = library.signs().length;
  return h("div", { dataset: { title: "" } },
    h("section", { class: "hero" },
      h("div", {},
        h("p", { class: "eyebrow" }, "Lengua de Señas Colombiana"),
        h("h1", {}, "Aprende a conversar con las manos."),
        h("p", { class: "lead" }, "Una biblioteca ilustrada de la LSC, organizada por módulos, con traductor en ambos sentidos. Gratis, accesible y hecha para crecer con la comunidad."),
        h("div", { class: "hero-actions" },
          h("a", { class: "btn btn-primary", href: "#/modulos" }, "Empezar a aprender"),
          h("a", { class: "btn btn-sun", href: "#/traductor" }, "Probar el traductor")),
        h("ul", { class: "stats" },
          h("li", {}, h("strong", {}, String(total)), h("span", {}, "señas ilustradas")),
          h("li", {}, h("strong", {}, String(library.modules().length)), h("span", {}, "módulos temáticos")),
          h("li", {}, h("strong", {}, String(progress.total())), h("span", {}, "aprendidas por ti")))),
      h("div", { class: "hero-spell", role: "img", "aria-label": "Las letras L, S y C en el alfabeto manual" },
        ["l", "s", "c"].map((letter) => h("figure", {}, figureForLetter(letter, { eager: true }), h("figcaption", { "aria-hidden": "true" }, letter.toUpperCase()))))),
    h("section", {},
      h("h2", {}, "¿Qué puedes hacer aquí?"),
      stagger(h("div", { class: "feature-grid" }, FEATURES.map(([path, glyph, title, text]) =>
        h("a", { class: "feature card", href: `#${path}` },
          h("span", { class: "glyph", "aria-hidden": "true" }, glyph), h("h3", {}, title), h("p", {}, text)))))),
    h("div", { class: "note" },
      h("p", {}, h("strong", {}, "Una lengua, no un código. "), "La LSC tiene gramática propia y vive en la comunidad Sorda. Esta web te ayuda con vocabulario; para aprenderla de verdad, busca cursos con personas sordas señantes.")));
}
