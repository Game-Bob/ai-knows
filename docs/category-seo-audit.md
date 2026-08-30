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

- **44 categorías verdes**: alcohol, aquarium, astronomy, audiovisual, babies, bike, books, chrono, coffee, converters, cooking, creative, developer, diy, drones, education, files, finance, forensic-science, games, games-development, genealogy, hardware, health, home, language, motor, music, nature, nautical, performing-arts, pets, printing3d, science, social, sports, statistics, streaming, tabletop, textiles, template, tools, travel y work.
- **0 categorías rojas**.

Se verificó además el estado Git de los 44 repos activos: árbol limpio, upstream sincronizado y tag exacto en HEAD.

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
- Corrección SEO de bike y publicación como `v1.34.0`.
- Corrección completa de la deuda técnica de streaming: contrato SEO, tipos Astro, SSR, rendimiento DOM y tests; publicado como `v1.23.0`.
- Publicación de books (`v1.3.0`), health (`v1.43.0`), forensic-science (`v1.15.0`) y motor (`v1.6.0`) con sus tests de categoría.
- Auditoría y corrección completa de los textos SEO de science, ampliación de tests verbosos y publicación como `v1.52.0`.
- Calibración del detector para no confundir `validator`/`validation` con una promesa de validación.
- Corrección y publicación de cooking, diy, home, nature, performing-arts, pets, tabletop, travel y work, eliminando también scripts temporales que bloqueaban ESLint cuando eran obsoletos.
- Cierre de chrono, coffee, converters, creative, education, files, genealogy, games, games-development, hardware, music, nautical, printing3d, social, sports, statistics, textiles y tools con commit, push, versión minor y tag.
- Conversión del test de completitud de traducciones SEO al modo verbose, acumulando y mostrando todos los errores por herramienta y locale.
- Ajuste del mínimo de completitud traducida a 240 caracteres en alfabetos latinos, 120 en CJK y al menos el 35% del tamaño inglés cuando ese porcentaje sea mayor, evitando penalizar diferencias naturales de longitud entre idiomas.

## Deuda prioritaria

No queda deuda pendiente dentro del alcance de esta auditoría automática de SEO de categorías.

## Gates técnicos observados

Los 44 repos publicados pasan lint, tests y build. `astro check` no forma parte del gate de cierre de esta auditoría; algunos repos mantienen deuda TypeScript preexistente documentada fuera del contrato SEO.

## Fuera del alcance automático

La naturalidad de las traducciones, la utilidad editorial, la paridad FAQ/schema y la revisión visual responsive requieren QA manual. Tampoco se ha validado todavía el SEO generado en producción.
