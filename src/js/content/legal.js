import { config } from "../core/config.js";

const contact = config.contactEmail
  ? `Escribe a ${config.contactEmail}.`
  : "El canal de contacto se publicará en esta página antes del lanzamiento público.";
const owner = config.owner || "el equipo responsable de Señas Colombia";

/** Documentos legales. Cada sección: [título, párrafos o lista]. */
export const LEGAL = {
  terminos: {
    title: "Términos de uso",
    sections: [
      ["Qué es este sitio", [`Señas Colombia es un proyecto educativo independiente, gratuito y sin ánimo de lucro, administrado por ${owner}. No es un sitio oficial del INSOR, del Instituto Caro y Cuervo, de Fenascol ni de ninguna entidad del Estado.`]],
      ["Uso permitido", ["Puedes usar el sitio para aprender, enseñar y practicar vocabulario de la Lengua de Señas Colombiana (LSC), a título personal o en actividades educativas sin fines comerciales."]],
      ["Límites del contenido", [
        "El vocabulario proviene de un diccionario publicado en 2006. La LSC es una lengua viva, con variantes regionales y cambios en el tiempo: una seña puede hacerse distinto en tu ciudad.",
        "El traductor trabaja palabra por palabra y no reproduce la gramática de la LSC. No lo uses como único medio en situaciones de salud, justicia, trámites o emergencias: en esos casos corresponde un servicio de interpretación profesional.",
        "El sitio no reemplaza la enseñanza con personas sordas señantes ni otorga certificación alguna.",
      ]],
      ["Responsabilidad", ["El contenido se ofrece «tal cual», con fines educativos. Hacemos lo posible por que sea correcto, pero no garantizamos que esté libre de errores, y no respondemos por decisiones tomadas con base en él."]],
      ["Correcciones", [`Si eres una persona sorda señante, intérprete o docente y encuentras un error, queremos corregirlo. ${contact}`]],
      ["Cambios", [`Estos términos pueden actualizarse. Última actualización: ${config.lastLegalUpdate}. Se rigen por las leyes de la República de Colombia.`]],
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      ["Resumen", ["Este sitio no pide registro, no recoge datos personales, no usa cookies de seguimiento ni analítica, y no comparte información con terceros."]],
      ["Qué se guarda en tu dispositivo", ["Solo tu avance (la lista de señas que marcas como aprendidas) se guarda en el almacenamiento local de tu navegador. Nunca sale de tu dispositivo y puedes borrarlo limpiando los datos del sitio."]],
      ["Micrófono y voz", [
        "El dictado y la lectura en voz alta usan las funciones de voz de tu navegador y solo se activan cuando tú pulsas el botón. El micrófono requiere tu permiso.",
        "Según el navegador, el reconocimiento de voz puede enviar el audio a los servidores del fabricante del navegador para transcribirlo. Este sitio no recibe ni guarda ese audio.",
      ]],
      ["Cámara", ["El sitio no usa la cámara. Si en el futuro se añade reconocimiento de señas, se pedirá permiso expreso y se informará aquí cómo se trata la imagen."]],
      ["Menores de edad", ["El sitio es apto para todas las edades y no recoge datos de niñas, niños ni adolescentes."]],
      ["Tus derechos", [`De acuerdo con la Ley 1581 de 2012 de protección de datos personales, puedes consultar cualquier duda sobre el tratamiento de datos. ${contact}`]],
    ],
  },
  derechos: {
    title: "Derechos de autor y fuentes",
    sections: [
      ["Fuente del vocabulario", ["Las palabras, definiciones, ejemplos y descripciones de las señas se basan en el «Diccionario Básico de la Lengua de Señas Colombiana», Instituto Nacional para Sordos (INSOR) e Instituto Caro y Cuervo, Bogotá, 2006. Los derechos de esa obra pertenecen a sus titulares. Aquí se cita con fines educativos y con indicación de la página de origen en cada ficha."]],
      ["Ilustraciones", ["Las ilustraciones de las señas se generan a partir de las fotografías de referencia del diccionario: se conservan la postura, la configuración de las manos y las flechas de movimiento, y se redibuja todo lo demás en colores planos con un rostro genérico de caricatura. No pretenden retratar a las personas que posaron para la obra original."]],
      ["Alfabeto manual", ["Las láminas del alfabeto manual provienen del anexo del mismo diccionario, redibujadas en la tinta del proyecto."]],
      ["Reconocimiento", ["Agradecemos a las personas sordas informantes, modelos, intérpretes y lingüistas que hicieron posible el diccionario original, y a Fenascol por su fotografía. La LSC pertenece a la comunidad Sorda colombiana."]],
      ["Titulares de derechos", [`Si eres titular de derechos sobre algún contenido y consideras que su uso aquí no es adecuado, lo revisaremos y retiraremos de inmediato si corresponde. ${contact}`]],
      ["Marco legal", ["Ley 23 de 1982 y Decisión Andina 351 de 1993 sobre derecho de autor; Ley 324 de 1996 y Ley 982 de 2005 sobre la LSC y los derechos de las personas sordas y sordociegas."]],
    ],
  },
  accesibilidad: {
    title: "Declaración de accesibilidad",
    sections: [
      ["Compromiso", ["Queremos que cualquier persona pueda usar este sitio: sorda, oyente, ciega, con baja visión, sordociega o con movilidad reducida. Tomamos como guía las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2, nivel AA."]],
      ["Qué hemos cuidado", [
        "Navegación completa con teclado y foco visible.",
        "Cada ilustración tiene texto alternativo con la descripción de cómo se hace la seña, útil con lector de pantalla y línea braille.",
        "Contraste alto, modo claro y oscuro según tu sistema, y texto que se puede ampliar.",
        "Las animaciones se detienen si tu sistema pide reducir el movimiento; las señas se pueden ver paso a paso.",
        "Nada depende solo del sonido ni solo del color.",
      ]],
      ["Limitaciones conocidas", ["Las ilustraciones son estáticas con flechas y fotogramas, no video: el movimiento exacto se complementa con la descripción escrita. El dictado por voz depende del navegador."]],
      ["Cuéntanos", [`Si algo te impide usar el sitio, queremos saberlo para arreglarlo. ${contact}`]],
    ],
  },
};
