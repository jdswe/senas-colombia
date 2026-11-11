/** Configuración central: cambia aquí nombres, rutas y datos de contacto. */
export const config = {
  appName: "Señas Colombia",
  /** Responsable del sitio y correo de contacto: complétalos antes de publicar. */
  owner: "",
  contactEmail: "",
  lastLegalUpdate: "11 de noviembre de 2026",
  paths: {
    signs: "data/signs.json",
    customSigns: "data/custom-signs.json",
    modules: "data/modules.json",
    version: "data/version.json",
    signImages: "data/img/signs/",
    letterImages: "data/img/alphabet/",
    dictionaryPdf: "recursos/Diccionario-lengua-de-senas.pdf",
  },
  /** Página del PDF = página impresa + este desfase. */
  pdfPageOffset: 52,
  /** Milisegundos que dura cada fotograma de una seña. */
  frameMs: 1100,
  storageKey: "senas-colombia:v1",
};
