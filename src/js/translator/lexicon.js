/**
 * Vocabulario de apoyo del traductor. Las claves van normalizadas (sin tildes).
 * Amplía estas tablas para mejorar la cobertura; no hace falta tocar el motor.
 */

/** Palabra en español -> lema del diccionario (normalizado). */
export const SYNONYMS = {
  hola: "decir hola", adios: "decir adios", chao: "decir adios",
  gracias: "agradecer", perdon: "pedir perdon", disculpa: "pedir perdon", disculpe: "pedir perdon",
  mi: "mio", mis: "mio", mia: "mio", mios: "mio", mias: "mio",
  tu: "tu", tus: "tuyo", tuya: "tuyo", tuyos: "tuyo",
  su: "suyo", sus: "suyo", suya: "suyo", suyos: "suyo",
  nuestra: "nuestro", nuestros: "nuestro", nuestras: "nuestro",
  el: "el ella", ella: "el ella", ellos: "ellas ellos", ellas: "ellas ellos",
  usted: "tu", vos: "tu", nosotras: "nosotros",
  mama: "mama", papa: "papa", si: "si", no: "no",
  porque: "por que", quien: "quien", que: "que", como: "como", donde: "donde", cuando: "cuando",
  cuanto: "cuanto", cuantos: "cuanto", cual: "cual",
  muy: "mucho", muchos: "mucho", muchas: "mucho", pocos: "poco",
  buenos: "bien", bueno: "bien", buena: "bien", malo: "mal", mala: "mal",
};

/** Palabras que la LSC normalmente no seña por separado (artículos, enlaces, cópula). */
export const SKIPPED = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "le", "les", "se", "me", "te", "nos",
  "de", "del", "al", "a", "en", "y", "e", "o", "u", "que", "es", "son", "soy", "eres", "somos",
  "esta", "estan", "estoy", "estas", "estamos", "ha", "he", "han", "has", "hemos", "por", "para", "con",
]);

/** Formas irregulares frecuentes -> infinitivo. */
export const IRREGULAR = {
  voy: "ir", vas: "ir", va: "ir", vamos: "ir", van: "ir", fui: "ir", fue: "ir", fuimos: "ir", fueron: "ir", iba: "ir",
  tengo: "tener", tienes: "tener", tiene: "tener", tienen: "tener", tuve: "tener", tuvo: "tener",
  hago: "hacer", hace: "hacer", hizo: "hacer", hice: "hacer", hecho: "hacer",
  puedo: "poder", puedes: "poder", puede: "poder", pueden: "poder", pude: "poder", pudo: "poder",
  digo: "decir", dice: "decir", dices: "decir", dicen: "decir", dijo: "decir", dije: "decir", dicho: "decir",
  veo: "ver", ves: "ver", ve: "ver", ven: "ver", vi: "ver", vio: "ver", visto: "ver",
  doy: "dar", da: "dar", dan: "dar", di: "dar", dio: "dar",
  se: "saber", sabe: "saber", sabes: "saber", supo: "saber",
  vengo: "venir", viene: "venir", vienes: "venir", vino: "venir",
  quiero: "querer", quieres: "querer", quiere: "querer", quieren: "querer", quiso: "querer",
  pongo: "poner", pone: "poner", puso: "poner", salgo: "salir", sale: "salir",
  duermo: "dormir", duerme: "dormir", juego: "jugar", juega: "jugar", juegan: "jugar",
  hay: "haber", habia: "haber", hubo: "haber",
};

export const DIGITS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
