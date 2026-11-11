import { clear } from "./dom.js";

const routes = [];
let outlet = null;
let cleanup = null;

/** Registra una ruta, p. ej. "/modulo/:id". `render(params)` devuelve un nodo. */
export function route(pattern, render, navKey = "") {
  const keys = [];
  const regex = new RegExp("^" + pattern.replace(/:([a-z]+)/g, (_, key) => { keys.push(key); return "([^/]+)"; }) + "$");
  routes.push({ regex, keys, render, navKey });
}

export const navigate = (path) => { window.location.hash = path; };

function resolve() {
  const path = decodeURI(window.location.hash.slice(1)) || "/";
  for (const { regex, keys, render, navKey } of routes) {
    const match = path.match(regex);
    if (!match) continue;
    const params = Object.fromEntries(keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
    cleanup?.();
    cleanup = null;
    const view = render(params);
    view.classList.add("view");
    clear(outlet).append(view);
    cleanup = view.onDispose ?? null;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === navKey) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    document.title = [view.dataset.title, "Señas Colombia"].filter(Boolean).join(" · ");
    return;
  }
  navigate("/");
}

export function startRouter(target) {
  outlet = target;
  window.addEventListener("hashchange", resolve);
  resolve();
}
