/** minúsculas, sin tildes (conserva ñ) y sin signos: para comparar palabras. */
export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/ñ/g, "\u0001")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0001/g, "ñ")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/** "¿POR-QUÉ?" -> "por qué"; "COMER/COMIDA" -> "comer" */
export function displayWord(word) {
  return word.split("/")[0].replace(/[¿?¡!]/g, "").replace(/-/g, " ").trim().toLowerCase();
}

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
