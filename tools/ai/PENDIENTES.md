# Ilustraciones pendientes

Se generan con ElevenLabs (flujo «Muestras de señas LSC», modelo gpt-image-2.5-sunburst, 433 créditos
por imagen) y se recortan con `python3 tools/ai/cutout.py origen.png data/img/signs/<nombre>.webp`.
Después hay que subir el número de `data/version.json`.

## Posturas que faltan en señas ya empezadas

- `buenas-noches-3`: brazos cruzados por las muñecas frente a la cara, manos cerradas (final de NOCHE).
  Al tenerla, añadirla a `data/image-overrides.json`.
- `buenos-dias-2`: brazos cruzados con las manos cerradas. La versión anterior salió con tres manos y se retiró.
- `buenos-dias-3`: brazos separados, manos abiertas con las palmas hacia adelante.
  Al tener ambas, poner `["buenos-dias-1.webp", "buenos-dias-2.webp", "buenos-dias-3.webp"]` en los ajustes.

## Señas sin ilustrar

Todas las que no aparecen en `ilustradas-con-ia.txt` siguen con la caricatura automática.
Del módulo de personas falta `homosexual-1`.

## Criterio de revisión

No se publica una imagen si tiene manos de más, manos sueltas, flechas dibujadas sobre el cuerpo,
dedos que no se distinguen o una postura que no coincide con la descripción del diccionario.
