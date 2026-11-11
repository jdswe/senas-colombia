import { clear, h } from "../core/dom.js";
import { library } from "../data/repository.js";
import { speech } from "../services/speech.js";
import { translateToSigns } from "../translator/toSigns.js";
import { toGloss, translateToSpanish } from "../translator/toSpanish.js";
import { figureForSign } from "../components/signFigure.js";
import { sequencePlayer } from "../components/sequencePlayer.js";

const EXAMPLES = ["Hola, ¿cómo está?", "Yo quiero comer arroz", "Mi mamá trabaja en la casa", "Buenos días, gracias"];
const PICKER_LIMIT = 60;

/** Español (texto o voz) -> señas en secuencia. */
function spanishToSigns() {
  const player = sequencePlayer();
  const input = h("textarea", { class: "textarea", id: "frase", placeholder: "Escribe una frase u oración…", rows: 3 });
  const glossLine = h("p", { class: "gloss-line", "aria-live": "polite" });
  const skipped = h("p", { class: "skipped" });

  const translate = () => {
    const steps = translateToSigns(input.value);
    const signs = steps.filter((s) => s.type === "sign").length;
    const spelled = steps.filter((s) => s.type === "spell").map((s) => s.source);
    const omitted = steps.filter((s) => s.type === "skip").map((s) => s.source);
    glossLine.textContent = steps.length
      ? `Glosa: ${steps.filter((s) => s.type !== "skip").map((s) => (s.type === "sign" ? s.sign.word.split("/")[0] : s.source.toUpperCase().split("").join("-"))).join("  ")}`
      : "";
    skipped.textContent = [
      steps.length ? `${signs} señas de la biblioteca.` : "",
      spelled.length ? `Deletreadas (sin seña en la biblioteca): ${spelled.join(", ")}.` : "",
      omitted.length ? `Omitidas (la LSC no las seña por separado): ${omitted.join(", ")}.` : "",
    ].filter(Boolean).join(" ");
    player.load(steps);
  };

  let stopListening = null;
  const mic = h("button", { class: "btn btn-ghost", type: "button", hidden: !speech.canListen }, "🎤 Dictar");
  mic.addEventListener("click", () => {
    if (stopListening) { stopListening(); return; }
    mic.textContent = "● Escuchando… (detener)";
    stopListening = speech.listen({
      onText: (text) => { input.value = text; },
      onEnd: () => { stopListening = null; mic.textContent = "🎤 Dictar"; if (input.value.trim()) translate(); },
      onError: () => { skipped.textContent = "No se pudo usar el micrófono. Revisa el permiso del navegador."; },
    });
  });

  const root = h("div", { class: "translator" },
    h("form", { class: "translator-input card", onSubmit: (event) => { event.preventDefault(); translate(); } },
      h("label", { class: "field", for: "frase" }, "Frase en español"), input,
      h("div", { class: "translator-row" },
        h("button", { class: "btn btn-primary", type: "submit" }, "Traducir a señas"), mic,
        h("span", { class: "muted", style: { fontSize: "0.85rem" } }, "Prueba:"),
        EXAMPLES.map((example) => h("button", { class: "chip", type: "button", onClick: () => { input.value = example; translate(); } }, example))),
      glossLine, skipped),
    player);
  root.onDispose = () => { stopListening?.(); player.onDispose(); };
  return root;
}

/** Señas elegidas -> texto en español y voz. */
function signsToSpanish() {
  const chosen = [];
  const output = h("p", { class: "output-text", "aria-live": "polite" });
  const gloss = h("p", { class: "gloss-line" });
  const selected = h("div", { class: "selected-row", "aria-label": "Señas elegidas" });
  const results = h("div", { class: "picker-results" });
  const speakButton = h("button", { class: "btn btn-primary", type: "button", hidden: !speech.canSpeak, onClick: () => speech.speak(translateToSpanish(chosen)) }, "🔊 Decir en voz alta");
  let autoSpeak = false;

  const paint = () => {
    const text = translateToSpanish(chosen);
    output.textContent = text || "Toca las señas en orden para formar la frase.";
    gloss.textContent = chosen.length ? `Glosa: ${toGloss(chosen)}` : "";
    clear(selected).append(...chosen.map((sign, i) =>
      h("button", { type: "button", title: "Quitar", "aria-label": `Quitar ${sign.word}`, onClick: () => { chosen.splice(i, 1); paint(); } }, `${sign.word.split("/")[0]} ✕`)));
    speakButton.disabled = !chosen.length;
  };
  const add = (sign) => { chosen.push(sign); paint(); if (autoSpeak) speech.speak(sign.word.split("/")[0].replace(/[-¿?¡!]/g, " ")); };

  const search = (query) => {
    const found = library.search(query).filter((sign) => sign.images.length).slice(0, PICKER_LIMIT);
    clear(results).append(...found.map((sign) =>
      h("button", { class: "seq-item", type: "button", onClick: () => add(sign) },
        figureForSign(sign, { autoplay: false }), h("span", { class: "label" }, sign.word))));
    if (!found.length) results.append(h("p", { class: "muted" }, "Sin resultados."));
  };

  const root = h("div", { class: "translator" },
    h("section", { class: "translator-input card" },
      h("h2", { style: { fontSize: "1rem", margin: 0 } }, "Traducción al español"), output, gloss, selected,
      h("div", { class: "translator-row" }, speakButton,
        h("button", { class: "btn btn-ghost", type: "button", onClick: () => { chosen.pop(); paint(); } }, "Borrar última"),
        h("button", { class: "btn btn-ghost", type: "button", onClick: () => { chosen.length = 0; paint(); } }, "Limpiar"),
        speech.canSpeak && h("label", { style: { display: "inline-flex", gap: "0.4rem", alignItems: "center" } },
          h("input", { type: "checkbox", onChange: (e) => { autoSpeak = e.target.checked; } }), "Decir cada seña al tocarla"))),
    h("section", { class: "picker card" },
      h("label", { class: "field" }, "Busca y toca una seña para añadirla",
        h("input", { class: "input", type: "search", placeholder: "Ej.: yo, querer, agua", autocomplete: "off", onInput: (e) => search(e.target.value) })),
      results),
    h("div", { class: "note" }, h("p", {}, h("strong", {}, "Reconocimiento por cámara: "),
      "todavía no está disponible. Reconocer señas en video necesita un modelo entrenado con grabaciones de personas sordas señantes de Colombia; cuando exista, se conectará aquí sin cambiar el resto de la app.")));
  search("");
  paint();
  return root;
}

export function translatorView() {
  const panel = h("div", {});
  const modes = [["Español → Señas", spanishToSigns], ["Señas → Español", signsToSpanish]];
  let current = null;
  const tabs = h("div", { class: "tabs", role: "tablist", "aria-label": "Sentido de la traducción" }, modes.map(([label, build], i) =>
    h("button", { type: "button", role: "tab", "aria-selected": String(i === 0), onClick: (event) => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b === event.currentTarget)));
      current?.onDispose?.();
      current = build();
      clear(panel).append(current);
    } }, label)));
  current = spanishToSigns();
  panel.append(current);
  const view = h("div", { dataset: { title: "Traductor" } },
    h("header", { class: "page-head" },
      h("p", { class: "eyebrow" }, "Oyente ⇄ persona sorda"),
      h("h1", {}, "Traductor"),
      h("p", { class: "muted" }, "Traduce palabra por palabra como apoyo para comunicarte. La LSC tiene su propio orden y gramática: para situaciones importantes (salud, justicia, educación) acude a una persona intérprete.")),
    tabs, panel);
  view.onDispose = () => current?.onDispose?.();
  return view;
}
