---
name: como-crear-una-vertical-de-utilidades
description: Crea una vertical nueva de jjlmoya-utils desde el template moderno basado en tabletop, implementa su primera tool y la deja lista para el gate okQA.
---

# Como crear una vertical de utilidades

Usa esta skill cuando una oportunidad requiera una categoría nueva y un repositorio nuevo de `jjlmoya-utils`. No la uses para añadir una tool a una vertical ya publicada ni para modificar únicamente consumidores.

## Fuente canónica

El punto de partida es `@jjlmoya/utils-template`, reconstruido desde `jjlmoya-utils-tabletop`. Para crear la vertical:

```bash
npx @jjlmoya/utils-template <category>
```

`<category>` debe ser kebab-case, por ejemplo `books`, `demography` o `performing-arts`. El comando prepara `../jjlmoya-utils-<category>`, renombra el paquete y la categoría, inicializa `main`, crea el repositorio público `Game-Bob/jjlmoya-utils-<category>` y hace el primer push. Si el paquete aún no está publicado, detén el flujo y resuelve la disponibilidad del paquete antes de inventar un bootstrap alternativo.

## Preparación de la vertical

1. Lee la issue completa y conserva su alcance: nombre de la tool, inputs, transformación, resultado, límites y evidence.
2. Trabaja en `../jjlmoya-utils-<category>` sobre `main`. No crees una rama salvo que el usuario lo pida.
3. Elimina todas las tools heredadas del template salvo, como máximo, una referencia temporal para contratos y estructura. La referencia debe desaparecer antes del cierre de la primera versión.
4. Mantén la arquitectura de `tabletop`: Astro estático, TypeScript estricto, Vitest, ESLint, Stylelint, i18n por archivos y registro central de entries/tools.
5. No registres todavía la nueva categoría en consumidores globales. Eso pertenece al ciclo de publicación posterior a `okQA`.

## Primera tool

Implementa una única tool de producción con, cuando aplique, estos módulos separados:

- `component.astro`: interfaz accesible, responsive y sin h1 propio.
- `logic.ts`: cálculo puro y tipos de dominio.
- `logic.test.ts`: casos normales, límites y escenarios inválidos.
- `controller.ts`, `dom-views.ts`, `storage.ts` y `evaluator.ts`: interacción, renderizado, persistencia local y diagnósticos cuando la tool los necesite.
- `ui.ts`: etiquetas y textos de interfaz tipados.
- `entry.ts`, `index.ts`, `seo.astro`, `bibliography.ts` y `bibliography.astro`: contrato, exports, SEO y fuentes.
- Una hoja CSS propia con tokens claros, tema oscuro si encaja, responsive, focus visible y sin gradientes decorativos.

La primera versión debe funcionar offline si la issue no exige una fuente externa. No envíes manuscritos, datos privados ni inputs del usuario a servidores. Explica los límites del cálculo en la UI y en las FAQ; no presentes estimaciones como resultados oficiales.

## SEO, fuentes e i18n

Empieza exclusivamente en inglés. La entrada English-first debe incluir title, description, canonical, Open Graph, FAQ, HowTo cuando proceda y los schemas que soporte realmente la interfaz. Añade al menos tres fuentes pertinentes, con una fuente primaria no inglesa cuando el dominio lo permita, y verifica que cada URL responde antes de incorporarla.

No copies la traducción inglesa a otros idiomas durante esta fase. La localización a los 15 idiomas, la revisión de densidad de escritura y la actualización de consumidores se hacen únicamente después de que el usuario responda exactamente `okQA`.

## Quality gate obligatorio

Antes de pedir `okQA`, ejecuta en la vertical:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

Además, revisa la ruta English-first en navegador con viewport de escritorio y móvil, prueba los inputs principales, los presets, los estados de error, la persistencia local y cualquier exportación. Corrige los errores de consola y evita comentarios en el código fuente cuando el lint del ecosistema los prohíba.

La entrega del gate debe resumir qué se ha construido, la URL del repositorio, las rutas probadas, los cuatro resultados de calidad y los límites conocidos. Después, detente y solicita `okQA`; no traduzcas, publiques la tool ni edites consumidores globales antes de esa confirmación.

## Después de okQA

Tras recibir `okQA`, traduce la interfaz, SEO, FAQ, HowTo, schemas y bibliografía a los 15 locales del ecosistema. Ejecuta de nuevo los gates y las comprobaciones de cobertura, fuentes, idioma, SEO y ausencia de placeholders. Solo entonces prepara el registro de la vertical en consumidores, el versionado y la publicación, confirmando antes cualquier push, publicación npm o cambio externo que el usuario no haya autorizado expresamente.
