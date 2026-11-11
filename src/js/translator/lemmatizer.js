import { IRREGULAR } from "./lexicon.js";

const VERB_ENDINGS = [
  "abamos", "aremos", "eremos", "iremos", "ieron", "iendo", "ando", "aron", "amos", "emos", "imos",
  "aste", "iste", "aban", "ian", "ado", "ido", "ada", "ida", "are", "ere", "ire", "ara", "era", "ira",
  "aba", "ia", "an", "en", "as", "es", "io", "o", "a", "e", "i",
];
const STEM_CHANGES = [["ie", "e"], ["ue", "o"], ["i", "e"]];

/**
 * Posibles formas de diccionario de una palabra normalizada, de la más
 * probable a la menos: tal cual, singular, masculino e infinitivos.
 */
export function lemmaCandidates(word) {
  const out = [word];
  const add = (candidate) => { if (candidate.length > 1 && !out.includes(candidate)) out.push(candidate); };

  if (IRREGULAR[word]) add(IRREGULAR[word]);
  if (word.endsWith("ces")) add(word.slice(0, -3) + "z");
  if (word.endsWith("es")) add(word.slice(0, -2));
  if (word.endsWith("s")) add(word.slice(0, -1));
  for (const base of [...out]) {
    if (base.endsWith("a")) add(base.slice(0, -1) + "o");
    if (base.endsWith("ita") || base.endsWith("ito")) add(base.slice(0, -3) + "o");
  }
  const bare = word.replace(/(se|me|te|nos|lo|la|le)$/, "");
  for (const form of new Set([word, bare])) {
    for (const ending of VERB_ENDINGS) {
      if (!form.endsWith(ending) || form.length - ending.length < 2) continue;
      const stem = form.slice(0, -ending.length);
      const stems = [stem, ...STEM_CHANGES.filter(([from]) => stem.includes(from)).map(([from, to]) => {
        const at = stem.lastIndexOf(from);
        return stem.slice(0, at) + to + stem.slice(at + from.length);
      })];
      for (const s of stems) for (const infinitive of ["ar", "er", "ir"]) add(s + infinitive);
    }
  }
  return out;
}
