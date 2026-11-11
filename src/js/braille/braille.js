/** Braille español integral (grado 1). Cada valor es la lista de puntos 1–6 en relieve. */
export const LETTERS = {
  a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125", i: "24", j: "245",
  k: "13", l: "123", m: "134", n: "1345", ñ: "12456", o: "135", p: "1234", q: "12345", r: "1235",
  s: "234", t: "2345", u: "136", v: "1236", w: "2456", x: "1346", y: "13456", z: "1356",
  á: "12356", é: "2346", í: "34", ó: "346", ú: "23456", ü: "1256",
};
export const PUNCTUATION = { ".": "3", ",": "2", ";": "23", ":": "25", "?": "26", "¿": "26", "!": "235", "¡": "235", "-": "36", "(": "126", ")": "345" };
export const CAPITAL = "46";
export const NUMBER = "3456";
const DIGIT_LETTERS = "jabcdefghi";

/** Puntos ("145") -> carácter Unicode del bloque braille. */
export const cell = (dots) => String.fromCharCode(0x2800 + [...dots].reduce((bits, dot) => bits | (1 << (Number(dot) - 1)), 0));

export function toBraille(text) {
  let out = "";
  let inNumber = false;
  for (const char of text) {
    const lower = char.toLowerCase();
    if (/\d/.test(char)) {
      if (!inNumber) out += cell(NUMBER);
      inNumber = true;
      out += cell(LETTERS[DIGIT_LETTERS[Number(char)]]);
      continue;
    }
    inNumber = false;
    if (LETTERS[lower]) out += (char !== lower ? cell(CAPITAL) : "") + cell(LETTERS[lower]);
    else if (PUNCTUATION[char]) out += cell(PUNCTUATION[char]);
    else if (/\s/.test(char)) out += char === "\n" ? "\n" : "⠀";
    else out += char;
  }
  return out;
}
