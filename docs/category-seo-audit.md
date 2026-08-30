# Auditoría de SEO de categorías

Fecha de la primera auditoría: 2026-08-30.

## Alcance

Se revisaron las 44 categorías activas `jjlmoya-utils-*`. La batería comprueba los 15 locales configurados (`de`, `en`, `es`, `fr`, `id`, `it`, `ja`, `ko`, `nl`, `pl`, `pt`, `ru`, `sv`, `tr`, `zh`) y carga directamente sus contenidos SEO de categoría.

## Contrato automatizado

- Existe exactamente un archivo de contenido por locale.
- El título mide entre 12 y 70 caracteres; para japonés, coreano y chino se acepta un mínimo de 4.
- La descripción mide entre 60 y 180 caracteres; para japonés, coreano y chino se acepta un mínimo de 20.
- Hay al menos dos bloques SEO, un encabezado y el mínimo de texto visible.
- No hay caracteres de reemplazo ni espacios duplicados.
- La secuencia de tipos SEO coincide con inglés para evitar traducciones estructuralmente incompletas.
- Se bloquean promesas promocionales no justificadas como “garantizado”, “validado” o “actualizado”; las referencias a fuentes oficiales quedan para QA manual.

El contrato está instalado como `src/tests/category_seo_quality.test.ts` en las 44 categorías.

## Resultado tras la ronda actual de correcciones

- **33 categorías verdes**: alcohol, aquarium, astronomy, audiovisual, babies, bike, books, chrono, coffee, converters, creative, developer, drones, education, files, finance, forensic-science, games, games-development, genealogy, hardware, health, language, motor, music, nautical, printing3d, social, sports, statistics, textiles, template y tools.
- **11 categorías rojas**: cooking, diy, home, nature, performing-arts, pets, science, streaming, tabletop, travel y work.

Las categorías rojas no se han ocultado ni exceptuado: el test conserva el defecto como deuda explícita para la siguiente pasada.

## Correcciones aplicadas

- Eliminación de afirmaciones absolutas o comerciales en astronomía, bicicleta, cocina, desarrollo, bricolaje, música, deportes, estadística y streaming.
- Reestructuración completa de `alcohol` en los 15 idiomas, con resumen, encabezado, explicación y límites de uso responsable.
- Corrección de la estructura SEO traducida en education, sports, aquarium y coffee.
- Corrección de descripciones o contenido de categoría en babies.
- Corrección de afirmaciones sobre validación en forensic-science y genealogy.
- Mejora completa de categoría y textos SEO relacionados en drones; publicado como `v1.33.0`.
- Mejora de copia financiera y publicación como `v1.32.0`.
- Mejora de categoría tabletop y publicación de la plantilla como `v1.1.0`.
- Corrección del reexport público y del QA TypeScript de language; publicado como `v1.6.0`.
- Corrección de conflicto de nombres en aquarium y publicación como `v1.54.0`.
- Publicación de books (`v1.3.0`), health (`v1.43.0`), forensic-science (`v1.15.0`) y motor (`v1.6.0`) con sus tests de categoría.
- Calibración del detector para no confundir `validator`/`validation` con una promesa de validación.

## Deuda prioritaria

1. `cooking`, `diy`, `home`, `nature`, `pets`, `science`, `streaming`, `tabletop`, `travel` y `work`: descripciones, estructura o afirmaciones pendientes según el caso.
2. `cooking`, `diy`, `nature`, `pets` y `travel`: secuencias SEO distintas entre locales.
3. `performing-arts`: faltan 14 archivos de locale; el estado estaba ya presente antes de esta auditoría y no se han restaurado cambios del usuario.
4. `finance`, `statistics`, `streaming` y `work`: afirmaciones que requieren evidencia o redacción más prudente; finance y statistics ya pasan el contrato de categoría.

## Gates técnicos observados

Los repos publicados pasan lint, tests y build. `aquarium`, `language` y `motor` también pasan `astro check` sin errores. `finance`, `drones` y `template` mantienen errores TypeScript preexistentes en `astro check` (aproximadamente 100, 47 y 370 respectivamente); no se han ocultado ni convertido en excepciones del test SEO.

## Fuera del alcance automático

La naturalidad de las traducciones, la utilidad editorial, la paridad FAQ/schema y la revisión visual responsive requieren QA manual. Tampoco se ha validado todavía el SEO generado en producción. Además, se observaron problemas de integración preexistentes en `home`/`travel` (`tools: []`) y un import roto en `developer`; deben resolverse en una pasada separada.
