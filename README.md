# Señas Colombia

Web para aprender Lengua de Señas Colombiana (LSC) por módulos: biblioteca ilustrada de 1.179 señas,
traductor español ↔ señas con voz, alfabeto manual, braille, contexto y páginas legales.
Sin dependencias ni compilación: HTML, CSS y módulos ES.

## Ejecutar

```sh
python3 -m http.server 8000
```

Abre <http://localhost:8000>. Debe servirse por HTTP (los módulos ES y `fetch` no funcionan con doble clic).

## Estructura

```
index.html              Carcasa: cabecera, <main id="app">, pie con enlaces legales
src/
  assets/logo.svg       Logo (mano con los colores de Colombia)
  styles/               tokens.css (colores, tema) · base.css · components.css · views.css
  js/
    main.js             Registro de rutas y arranque
    core/               config.js · dom.js (h) · router.js · store.js (progreso local)
    data/repository.js  Carga e índices de la biblioteca
    text/normalize.js   Normalización de texto
    translator/         lexicon.js (sinónimos, omitidas) · lemmatizer.js · toSigns.js · toSpanish.js
    services/speech.js  Voz del navegador (dictado y lectura)
    braille/braille.js  Conversión a braille español grado 1
    components/         signFigure.js (animación) · signCard.js · sequencePlayer.js
    content/            Textos de contexto y documentos legales
    views/              Una vista por archivo
data/
  signs.json            Señas extraídas del diccionario
  custom-signs.json     Señas propias que quieras añadir (mismo formato)
  modules.json          Módulos temáticos
  img/signs, img/alphabet
recursos/               Diccionario Básico de la LSC (INSOR / Instituto Caro y Cuervo, 2006): solo referencia
tools/                  Scripts que regeneran data/ a partir del PDF
```

## Ampliar

- **Nueva seña:** añade un objeto a `data/custom-signs.json` y sus imágenes a `data/img/signs/`:
  `{ "id", "word", "module", "page", "images": [], "senses": [{ "def", "type", "gloss", "tr" }], "how": [] }`.
  Varias imágenes se reproducen como fotogramas de una animación.
- **Nuevo módulo:** añade `{ "id", "name", "group", "page", "count" }` a `data/modules.json`.
- **Mejor traducción:** amplía las tablas de `src/js/translator/lexicon.js`.
- **Nueva pantalla:** crea `src/js/views/mi-vista.js` y regístrala con `route()` en `main.js`.
- **Cambiar ilustraciones:** reemplaza los archivos de `data/img/signs/` conservando los nombres y sube el número de `data/version.json`.

## Antes de publicar

- Completa `owner` y `contactEmail` en `src/js/core/config.js` (aparecen en las páginas legales).
- El vocabulario y las imágenes derivan de una obra con derechos de INSOR y el Instituto Caro y Cuervo.
  Para uso público solicita su autorización y haz revisar los textos legales por una persona abogada.
- Haz validar el contenido con personas sordas señantes.
