import { capitalize, displayWord } from "../text/normalize.js";

/**
 * Secuencia de señas -> texto en español. Traducción literal, glosa por glosa:
 * sirve para comunicar ideas sencillas, no sustituye a una persona intérprete.
 */
export function translateToSpanish(signs) {
  if (!signs.length) return "";
  const isQuestion = signs.some((sign) => sign.word.startsWith("¿"));
  const body = signs.map((sign) => displayWord(sign.word)).join(" ");
  return isQuestion ? `¿${capitalize(body)}?` : `${capitalize(body)}.`;
}

/** Glosa en mayúsculas, como se transcribe la LSC por escrito. */
export const toGloss = (signs) => signs.map((sign) => sign.word.split("/")[0].trim()).join(" ");
