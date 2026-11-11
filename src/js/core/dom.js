/**
 * Crea un elemento. `props` admite atributos, `class`, `dataset`, `style`
 * y manejadores `onClick`…; los hijos pueden ser nodos, textos o listas.
 * Todo el texto entra como nodo de texto: nunca se interpreta como HTML.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") el.className = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key === "style") Object.assign(el.style, value);
    else if (key.startsWith("on")) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in el && typeof value !== "string") el[key] = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  el.append(...children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false));
  return el;
}

export const clear = (el) => { el.replaceChildren(); return el; };

/** Asigna --i a cada hijo para la animación escalonada. */
export function stagger(list, limit = 24) {
  [...list.children].forEach((child, index) => child.style.setProperty("--i", Math.min(index, limit)));
  list.classList.add("stagger");
  return list;
}
