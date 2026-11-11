import { clear, h } from "../core/dom.js";
import { library } from "../data/repository.js";
import { figureForSign } from "../components/signFigure.js";

const QUESTIONS = 8;
const shuffle = (list) => list.map((item) => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);

export function practiceView({ id }) {
  const module = library.module(id);
  const pool = library.inModule(id).filter((sign) => sign.images.length);
  const view = h("div", { dataset: { title: `Práctica: ${module?.name ?? ""}` } },
    h("a", { class: "back-link", href: `#/modulo/${id}` }, `← ${module?.name ?? "Módulo"}`));
  if (pool.length < 4) return view.appendChild(h("p", {}, "Este módulo aún no tiene suficientes señas para practicar.")), view;

  const card = h("section", { class: "quiz card", "aria-live": "polite" });
  view.append(card);
  let questions = [];
  let index = 0;
  let score = 0;
  const start = () => { questions = shuffle(pool).slice(0, QUESTIONS); index = 0; score = 0; ask(); };

  const finish = () => clear(card).append(
    h("h1", {}, `${score} de ${questions.length}`),
    h("p", {}, score === questions.length ? "¡Perfecto! Dominas este módulo." : "Buen trabajo. Repasa las que fallaste y vuelve a intentarlo."),
    h("div", { class: "sign-actions" },
      h("button", { class: "btn btn-primary", type: "button", onClick: () => start() }, "Repetir práctica"),
      h("a", { class: "btn btn-ghost", href: `#/modulo/${id}` }, "Volver al módulo")));

  const ask = () => {
    const sign = questions[index];
    const options = shuffle([sign, ...shuffle(pool.filter((s) => s !== sign)).slice(0, 3)]);
    const nextButton = h("button", { class: "btn btn-primary", type: "button", hidden: true, onClick: () => { index += 1; index < questions.length ? ask() : finish(); } },
      index + 1 < questions.length ? "Siguiente" : "Ver resultado");
    const buttons = options.map((option) => h("button", { type: "button", onClick: (event) => {
      if (!nextButton.hidden) return;
      const right = option === sign;
      if (right) score += 1;
      event.currentTarget.classList.add(right ? "is-right" : "is-wrong");
      buttons[options.indexOf(sign)].classList.add("is-right");
      feedback.textContent = right ? "¡Correcto!" : `Era ${sign.word}.`;
      nextButton.hidden = false;
      nextButton.focus();
    } }, option.word));
    const feedback = h("p", { role: "status", style: { margin: 0, fontWeight: 700 } });
    clear(card).append(
      h("p", { class: "eyebrow" }, `Pregunta ${index + 1} de ${questions.length}`),
      h("h1", { style: { fontSize: "1.5rem" } }, "¿Qué seña es esta?"),
      figureForSign(sign, { eager: true }),
      h("div", { class: "quiz-options" }, buttons), feedback, nextButton);
  };
  start();
  return view;
}
