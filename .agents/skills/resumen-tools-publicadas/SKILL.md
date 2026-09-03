---
name: resumen-tools-publicadas
description: Genera recuentos y resúmenes cronológicos de las tools locales de jjlmoya-utils por fecha.
metadata:
  short-description: Resumir tools publicadas por fecha
---

# Resumen Tools Publicadas

Usa esta skill cuando el usuario pida saber cuántas tools había en una fecha, comparar snapshots o preparar un resumen de publicación de las tools.

Ejecuta el script desde la raíz de `ai-knows`:

```bash
npm run tools:count-by-date -- YYYY-MM-DD
```

Si no se indica fecha, el script usa el día actual. Lee los repositorios locales `../jjlmoya-utils-*`, toma en cada uno el último commit hasta las 23:59:59 de esa fecha y cuenta los directorios bajo `src/tool/`. Ignora repositorios auxiliares cuyo nombre contenga `-incomplete-` o termine en `-clean`.

Presenta el resultado agrupado por categoría y conserva la fecha de corte. Para un resumen de varias semanas, compara los directorios `src/tool/` del snapshot inmediatamente anterior al periodo con el estado final. Para cada directorio nuevo, consulta su primer commit con `git log --reverse` y usa la fecha del committer como hora de incorporación al repositorio; ignora commits posteriores de SEO, traducciones o refactors.

Aclara siempre que esa hora es la del commit en el repositorio, en la zona horaria que muestre Git, y no una hora confirmada de despliegue en Cloudflare. Si el usuario pide “todas”, incluye también las tools de categorías con una sola incorporación y ordena el resultado cronológicamente.
