import { library } from "../data/repository.js";
import { normalize } from "../text/normalize.js";
import { lemmaCandidates } from "./lemmatizer.js";
import { DIGITS, SKIPPED, SYNONYMS } from "./lexicon.js";

const MAX_PHRASE = 5;
const LETTERS = /[a-zñ]/;

/** Un paso de la traducción: seña de la biblioteca, palabra deletreada u omitida. */
const signStep = (sign, source) => ({ type: "sign", sign, source });
const spellStep = (source) => ({ type: "spell", source, letters: [...source].filter((c) => LETTERS.test(c)) });
const skipStep = (source) => ({ type: "skip", source });

function findSingle(token) {
  const direct = library.byPhrase(token);
  if (direct && !SYNONYMS[token]) return direct;
  if (SYNONYMS[token]) {
    const viaSynonym = library.byPhrase(SYNONYMS[token]);
    if (viaSynonym) return viaSynonym;
  }
  if (direct) return direct;
  for (const candidate of lemmaCandidates(token)) {
    const sign = library.byPhrase(candidate) ?? library.byPhrase(SYNONYMS[candidate] ?? "");
    if (sign) return sign;
  }
  return null;
}

function numberSteps(token) {
  const whole = library.byPhrase(token);
  if (whole) return [signStep(whole, token)];
  return [...token].map((digit) => {
    const sign = library.byPhrase(DIGITS[Number(digit)]);
    return sign ? signStep(sign, digit) : spellStep(DIGITS[Number(digit)]);
  });
}

/**
 * Español -> secuencia de señas. Es una ayuda palabra por palabra
 * (español signado): no reproduce la gramática propia de la LSC.
 */
export function translateToSigns(text) {
  const tokens = normalize(text).split(" ").filter(Boolean);
  const steps = [];
  let index = 0;
  while (index < tokens.length) {
    let matched = false;
    for (let size = Math.min(MAX_PHRASE, tokens.length - index); size > 1; size -= 1) {
      const phrase = tokens.slice(index, index + size).join(" ");
      const sign = library.byPhrase(phrase) ?? library.byPhrase(SYNONYMS[phrase] ?? "");
      if (sign) {
        steps.push(signStep(sign, phrase));
        index += size;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const token = tokens[index];
    index += 1;
    if (/^\d+$/.test(token)) { steps.push(...numberSteps(token)); continue; }
    const pronounOrLink = SKIPPED.has(token) && !SYNONYMS[token];
    const sign = pronounOrLink ? null : findSingle(token);
    if (sign) steps.push(signStep(sign, token));
    else if (SKIPPED.has(token)) steps.push(skipStep(token));
    else steps.push(spellStep(token));
  }
  return steps;
}
