import { h } from "./core/dom.js";
import { route, startRouter } from "./core/router.js";
import { loadLibrary } from "./data/repository.js";
import { alphabetView } from "./views/alphabet.js";
import { brailleView } from "./views/braille.js";
import { contextView } from "./views/context.js";
import { homeView } from "./views/home.js";
import { legalView } from "./views/legal.js";
import { libraryView } from "./views/library.js";
import { moduleView, modulesView } from "./views/modules.js";
import { practiceView } from "./views/practice.js";
import { signView } from "./views/sign.js";
import { translatorView } from "./views/translator.js";

route("/", homeView);
route("/modulos", modulesView, "modulos");
route("/modulo/:id", moduleView, "modulos");
route("/practica/:id", practiceView, "modulos");
route("/sena/:id", signView, "biblioteca");
route("/biblioteca", libraryView, "biblioteca");
route("/traductor", translatorView, "traductor");
route("/alfabeto", alphabetView, "alfabeto");
route("/braille", brailleView, "braille");
route("/contexto", contextView, "contexto");
route("/legal/:doc", legalView);

const app = document.querySelector("#app");

try {
  await loadLibrary();
  startRouter(app);
} catch (error) {
  console.error(error);
  app.replaceChildren(h("div", { class: "note" },
    h("p", {}, h("strong", {}, "No se pudo cargar la biblioteca. ")),
    h("p", {}, "Abre el sitio desde un servidor web (por ejemplo: python3 -m http.server 8000) y no con doble clic sobre el archivo.")));
}
