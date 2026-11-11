import { config } from "../core/config.js";
import { normalize } from "../text/normalize.js";

/**
 * Acceso a la biblioteca de señas.
 * Seña: { id, word, module, page, images[], senses[{def,type,gloss,tr}], how[] }
 * Para ampliar la biblioteca agrega entradas en data/custom-signs.json
 * (mismo formato) y, si hace falta, un módulo nuevo en data/modules.json.
 */
const state = { signs: [], modules: [], byId: new Map(), byModule: new Map(), phrases: new Map(), hasPdf: false };

async function getJson(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return await response.json();
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

/** Todas las formas en español con las que se puede pedir una seña. */
function aliases(word) {
  return word.split("/").map(normalize).filter(Boolean);
}

export async function loadLibrary() {
  const [signs, custom, modules] = await Promise.all([
    getJson(config.paths.signs),
    getJson(config.paths.customSigns, []),
    getJson(config.paths.modules),
  ]);
  // El PDF de referencia es opcional: no se distribuye con el sitio publicado.
  state.hasPdf = await fetch(config.paths.dictionaryPdf, { method: "HEAD" }).then((r) => r.ok, () => false);
  state.signs = [...signs, ...custom];
  state.modules = modules;
  for (const sign of state.signs) {
    state.byId.set(sign.id, sign);
    if (!state.byModule.has(sign.module)) state.byModule.set(sign.module, []);
    state.byModule.get(sign.module).push(sign);
    for (const alias of aliases(sign.word)) {
      if (!state.phrases.has(alias)) state.phrases.set(alias, sign);
    }
  }
  for (const module of state.modules) module.count = state.byModule.get(module.id)?.length ?? 0;
}

export const library = {
  signs: () => state.signs,
  hasReferencePdf: () => state.hasPdf,
  modules: () => state.modules,
  module: (id) => state.modules.find((module) => module.id === id),
  sign: (id) => state.byId.get(id),
  inModule: (id) => state.byModule.get(id) ?? [],
  /** Busca una seña por palabra o frase ya normalizada. */
  byPhrase: (phrase) => state.phrases.get(phrase),
  search(query, moduleId = "") {
    const needle = normalize(query);
    return state.signs.filter((sign) => {
      if (moduleId && sign.module !== moduleId) return false;
      if (!needle) return true;
      return normalize(sign.word).includes(needle)
        || sign.senses.some((sense) => normalize(sense.def).includes(needle));
    });
  },
};

export const imageUrl = (file) => config.paths.signImages + file;
export const letterUrl = (letter) => `${config.paths.letterImages}${letter === "ñ" ? "enie" : letter}.webp`;
export const pdfUrl = (printedPage) => `${config.paths.dictionaryPdf}#page=${printedPage + config.pdfPageOffset}`;
