import { config } from "./config.js";

/** Progreso del aprendiz. Vive solo en este navegador (localStorage). */
let learned = new Set();

try {
  const saved = JSON.parse(window.localStorage.getItem(config.storageKey) ?? "{}");
  if (Array.isArray(saved.learned)) learned = new Set(saved.learned.filter((id) => typeof id === "string"));
} catch {
  /* almacenamiento bloqueado o dañado: se empieza de cero */
}

function persist() {
  try {
    window.localStorage.setItem(config.storageKey, JSON.stringify({ learned: [...learned] }));
  } catch {
    /* el progreso sigue activo durante la visita */
  }
}

export const progress = {
  isLearned: (id) => learned.has(id),
  toggle(id) {
    if (!learned.delete(id)) learned.add(id);
    persist();
    return learned.has(id);
  },
  countIn: (signs) => signs.filter((sign) => learned.has(sign.id)).length,
  total: () => learned.size,
  reset() { learned.clear(); persist(); },
};
