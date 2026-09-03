---
name: nueva-tool-oportunidad
description: Crear, validar, traducir y preparar para publicar nuevas herramientas web del ecosistema jjlmoya-utils a partir de una oportunidad detectada.
---

# 🚀 SKILL: Creación de Nueva Utilidad desde Oportunidad (Ecosistema jjlmoya)

## 📋 PROPÓSITO
Guía automatizada para identificar, crear, validar, traducir y publicar una nueva herramienta web dentro del ecosistema `@jjlmoya/utils-*`.

---

## 🪟 EJECUCIÓN EN WINDOWS DESDE GIT BASH

El entorno de trabajo usa Git Bash, pero no se debe invocar `gh` ni `npm` a través de los wrappers que intentan resolver WSL 1. Usar siempre los ejecutables nativos con rutas estables:

```bash
test -f '/mnt/c/Program Files/GitHub CLI/gh.exe'
test -f 'C:/Users/34677/AppData/Local/nvm/v22.18.0/node.exe'
test -f 'C:/Users/34677/AppData/Local/nvm/v22.18.0/node_modules/npm/bin/npm-cli.js'

'/mnt/c/Program Files/GitHub CLI/gh.exe' issue list --repo Game-Bob/ai-knows --state open --limit 100 --json number,title,body,labels,comments,createdAt,url
node.exe 'C:/Users/34677/AppData/Local/nvm/v22.18.0/node_modules/npm/bin/npm-cli.js' run sync
node.exe 'C:/Users/34677/AppData/Local/nvm/v22.18.0/node_modules/npm/bin/npm-cli.js' run discover
```

Antes de ejecutar el flujo, comprobar que las rutas existen con `test -f` y que `node.exe --version` responde. Si la versión de Node cambia, localizar la carpeta activa en `C:/Users/34677/AppData/Local/nvm/` y actualizar las dos rutas del bloque juntas. Ejecutar los comandos de npm en una terminal con TTY. No usar `npm run ...` directamente cuando muestre `WSL 1 is not supported` o `Could not determine Node.js install directory`.

Para publicar o crear una issue, reutilizar `'/mnt/c/Program Files/GitHub CLI/gh.exe'`, por ejemplo `'/mnt/c/Program Files/GitHub CLI/gh.exe' issue create ...`; no sustituirlo por un `gh` genérico.

---

## 🔄 REGLA PRINCIPAL: BACKLOG DE `ai-knows` ANTES QUE DISCOVERY

**Excepción por alcance explícito del usuario:** si el usuario identifica de forma directa una herramienta concreta, aporta su referencia funcional o visual y pide implementarla en un repositorio específico, ese alcance prevalece sobre la selección FIFO del backlog. La issue del backlog se conserva intacta y no se presenta como la oportunidad implementada.

`ai-knows` es el orquestador y su backlog de issues aceptadas es la cola de trabajo canónica. Cada ejecución de esta skill debe seguir este loop:

1. Consultar primero las issues abiertas de `Game-Bob/ai-knows` con `gh issue list --repo Game-Bob/ai-knows --state open`.
2. Si existe al menos una issue abierta con una etiqueta `repo:jjlmoya-utils-*`, seleccionarla y trabajar sobre ella. No ejecutar discovery ni crear otra issue en este ciclo.
3. Si hay varias issues, coger siempre la más antigua (`createdAt` ascendente). El backlog se vacía en FIFO: se van a hacer todas, no se rankea, no se compara tráfico ni riesgo entre candidatas, no se escribe un ensayo de priorización. La más nueva queda para más adelante.
4. Antes de implementar una issue seleccionada, leer su título, cuerpo, etiquetas, comentarios y el repositorio propietario indicado por la etiqueta `repo:`. Confirmar que el alcance sigue siendo coherente y detectar duplicados.
5. Si no hay ninguna issue abierta de utilidad, pasar al discovery descrito abajo.
6. Cuando el usuario acepte una oportunidad nueva descubierta, crear una issue en `Game-Bob/ai-knows` con `gh issue create`, incluyendo la etiqueta `repo:jjlmoya-utils-<categoría>`, el alcance y la relación con los datos observados. No saltar directamente a implementar esa oportunidad en el mismo ciclo: la siguiente ejecución debe recogerla desde el backlog abierto.
7. Después de crear la issue, detener la fase de discovery y entregar el enlace. La implementación comienza en una ejecución posterior, cuando esa issue sea la más antigua abierta.

Una issue solo deja de ser parte de la cola cuando se implementa y se cierra con evidencia, o cuando se descarta explícitamente como no planificada. No crear issues duplicadas si ya existe una oportunidad equivalente abierta.

### ⛔ GATE OBLIGATORIO DE DUPLICADOS ANTES DE IMPLEMENTAR

Esta skill crea herramientas nuevas. No se usa para ampliar, rediseñar, corregir ni traducir una herramienta que ya existe.

1. Antes de tocar código, comprobar en el repositorio propietario si ya existe la herramienta solicitada o una equivalente: directorio en `src/tool`, registro en `src/tools.ts` y `src/entries.ts`, slug en los sitemaps y issue relacionada.
2. Si existe, detener la ejecución inmediatamente. No modificar archivos, no añadir tests, no cambiar SEO, no traducir, no crear otra issue y no intentar "mejorarla en su sitio" desde esta skill.
3. Informar al jefe del error con la issue, el repositorio, la herramienta existente y la evidencia del duplicado. Clasificarla como descartada para este flujo y dejar la modificación para una tarea explícita de mantenimiento o extensión.
4. Solo continuar cuando se haya verificado que la utilidad no existe y el alcance describe una herramienta nueva, no una ampliación de otra.

## 🔎 REGLA DE SINCRONIZACIÓN Y SUGERENCIA

La skill debe sugerir oportunidades a partir de datos sincronizados del workspace, no de conclusiones ya empaquetadas por otro informe.

### Lista negra permanente de oportunidades no viables

- Queda bloqueada para siempre la familia de calculadoras, testers, checkers o simuladores de cuello de botella CPU/GPU/RAM, incluyendo variantes como `CPU GPU Bottleneck Calculator`, `CPU vs GPU Bottleneck Calculator`, `PC Bottleneck Calculator`, `CPU/GPU Balance` y cualquier slug equivalente.
- Ignorar esas filas del suggest engine aunque tengan volumen, no presentarlas en ninguno de los dos carriles, no crear issues para ellas y no implementarlas dentro de esta skill. Un navegador no puede inferir de forma fiable el cuello de botella de un equipo real sin ejecutar benchmarks representativos del workload, y una fórmula genérica produciría ruido y falsas certezas.
- La familia solo podría volver a considerarse si el usuario solicita explícitamente una herramienta distinta, medible en navegador y con un alcance técnico nuevo; esa petición explícita prevalecería sobre esta lista negra.

### Ubicación local de los repositorios

Los repositorios `jjlmoya-utils-*` ya están descargados como directorios hermanos de `ai-knows`, en `../`. Antes de implementar, resolver siempre el directorio local existente a partir de la etiqueta `repo:` y comprobar su estado con `git -C`; no clonar repositorios ni crear copias alternativas. El nombre local puede diferir del nombre inferido de la etiqueta, por lo que se debe localizar primero entre los directorios hermanos y usar la copia ya descargada. Si el repositorio propietario no existe localmente, detenerse e informar del bloqueo.

### Fuente y orden de lectura obligatorio

1. Antes de analizar una oportunidad, ejecutar `npm run sync` en `ai-knows` para actualizar los Markdown de sitemap y los datos disponibles. Este flujo no inspecciona repositorios de utilidades.
2. Ejecutar después `npm run discover` para actualizar la demanda de búsquedas y cruzarla con los sitemaps publicados.
3. Usar como fuentes principales las tablas de detalle recién generadas en `data/notebooklm/global-suggest-engine.md` y los sitemaps ligeros `data/notebooklm/gamebob.dev-sitemap.md` y `data/notebooklm/jjlmoya.es-sitemap.md`.
4. Ignorar los resúmenes ejecutivos, rankings y recomendaciones que aparezcan dentro de esos Markdown. Leer las filas y URLs de detalle para construir una conclusión propia.
5. Leer los sitemaps para comprobar cobertura por URL, slug, título y categoría. La ausencia de una URL o de una intención equivalente es una señal de hueco, no una prueba suficiente por sí sola.
6. Contrastar cada posible oportunidad con las filas de intención de búsqueda, su tipo, su categoría y sus señales de repetición o volumen presentes en los datos sincronizados.
7. Inventariar antes de proponer: contar los directorios inmediatos de `src/tool` de cada repositorio hermano `jjlmoya-utils-*`, registrar las categorías presentes en ambos sitemaps y revisar etiquetas abiertas e histórico de oportunidades. Este inventario sirve para corregir el sesgo de volumen y no autoriza a leer implementaciones de otros tools durante la fase de discovery.
8. Investigar señales externas actuales para las categorías nuevas o emergentes: informes sectoriales, tendencias de producto, cambios regulatorios, comunidades técnicas y fuentes de mercado. Clasificarlas como evidencia externa y no mezclarlas con volumen de búsqueda.
9. Si se usan otros `.md` de `data/notebooklm`, clasificarlos explícitamente como dato primario, contexto o conclusión derivada. Nunca usar un informe de conclusiones como sustituto de las filas de datos.

### Fuentes prohibidas como autoridad

- `data/notebooklm/curated-opportunities.md` no se debe usar para elegir, priorizar ni describir una oportunidad. Puede leerse únicamente como registro histórico para marcar una categoría como ya tratada y evitar repetirla en el cupo `NUEVA VERTICAL`.
- `data/notebooklm/curated-social-leads.md`, `data/notebooklm/social-opportunities.md` y `data/notebooklm/social-traffic-outreach.md` no se deben usar como fuente principal de demanda de búsqueda.
- No asumir que una oportunidad sigue abierta porque aparezca en un informe anterior. La sincronización actual y el sitemap tienen prioridad.
- No inspeccionar la implementación interna de repositorios `jjlmoya-utils-*`, `jjlmoya` ni `website` para decidir si existe un hueco. La única excepción durante discovery es el inventario superficial obligatorio de nombres de repositorios y cantidad de directorios inmediatos de `src/tool`, necesario para formar el carril de baja cobertura. La validación funcional del repositorio ocurre después, fuera de esta fase.

### Bibliografía internacional obligatoria y validación de referencias

- La web es internacional y Estados Unidos no es el valor por defecto del ecosistema. Cada TOOL debe tener una bibliografía variada, pertinente y trazable; queda prohibida una bibliografía formada únicamente por fuentes estadounidenses o únicamente por fuentes en inglés.
- Cada TOOL debe incluir obligatoriamente al menos una fuente primaria cuyo contenido original esté publicado en un idioma distinto del inglés. Una página traducida al español, un título traducido por nosotros o un resumen secundario no cuentan: hay que verificar el idioma original de la página, el PDF o la publicación.
- Para una TOOL de alcance general, usar al menos dos países o regiones y evitar que una sola institución o país supere la mitad de las referencias, salvo que no exista una autoridad equivalente y se documente la excepción. Para una TOOL limitada a una jurisdicción concreta, conservar la autoridad local para la norma o dato vinculante y añadir la fuente no inglesa para el método, contexto o evidencia general sin usarla para afirmar una regla de otra jurisdicción.
- Priorizar organismos oficiales, universidades, asociaciones profesionales y documentación técnica del país o región relevante. Mezclar idiomas, países y perspectivas cuando mejore la cobertura; no traducir ni sustituir una referencia local sólida solo para homogeneizar el idioma.
- En las bibliografías de los locales, conservar el título original de cada fuente cuando sea lo más fiel y añadir una traducción breve solo si ayuda a comprenderla. El inglés es una opción útil cuando la fuente es la mejor disponible, no una obligación editorial ni el idioma de relleno.
- En `bibliography.ts`, registrar internamente durante la implementación el país o región, el idioma original y la afirmación concreta que respalda cada entrada. Si no se puede justificar esa trazabilidad, la fuente no está lista para entrar en la TOOL.
- Verificar cada URL antes de incorporarla al código. Si devuelve 404, está obsoleta o redirige a una página genérica, localizar la página oficial equivalente y reemplazarla. No presentar una bibliografía con enlaces rotos.

### Resultado mínimo de la sugerencia

Cuando hay issues abiertas, no presentar tres oportunidades nuevas ni justificar por qué esta gana a las demás. Presentar:

- la issue más antigua, su enlace y que se eligió por FIFO;
- el repositorio propietario y la etiqueta usada;
- el alcance que se va a implementar;
- dependencias, riesgos y criterio de cierre.

Solo cuando no haya issues abiertas de utilidad se aplica el formato de veinte opciones comparables:

Antes de implementar, entregar exactamente veinte opciones comparables, divididas en dos carriles obligatorios:

- **Carril de exploración de baja cobertura: 10 ideas.** Nueve ideas, una por cada una de las nueve verticales públicas existentes con menos directorios `src/tool`, más una décima idea obligatoria para una vertical nueva ausente del inventario actual. No se permite repetir categoría en este carril ni ordenar por volumen de búsquedas. Los repositorios de infraestructura, plantillas o limpieza interna no cuentan como verticales públicas. Cada ficha debe mostrar el número de tools encontrado y explicar por qué la utilidad tiene sentido aunque la categoría tenga poca cobertura.
- **Carril de demanda y tendencias: 10 ideas.** Ideas elegidas con los criterios actuales: familias de consultas, repetición, cobertura del sitemap, tendencia externa, utilidad recurrente, diferenciación y complejidad.
- **Vertical nueva obligatoria:** la décima idea del carril de exploración debe pertenecer a una categoría que no aparezca en ningún repositorio `jjlmoya-utils-*`, ningún sitemap, ninguna issue abierta y ningún bloque histórico de `data/notebooklm/curated-opportunities.md`. Debe proponerse como nuevo `jjlmoya-utils-<categoría>` y llevar la marca `NUEVA VERTICAL`. No se puede sustituir por una categoría existente con otro nombre.
- **Definición estricta de vertical nueva:** una vertical nueva es un dominio de problemas, usuarios y tareas que queda fuera de la órbita temática actual del ecosistema y exige crear un repositorio funcional nuevo. No es una rama, subcategoría, renombrado, cambio de audiencia, nueva interfaz ni ampliación de una vertical existente. Si la utilidad se puede describir de forma natural como una herramienta de `nature`, `health`, `hardware`, `pets`, `finance`, `games`, `cooking` o cualquier otra categoría ya presente, debe entrar en ese repositorio existente y no puede ocupar el cupo `NUEVA VERTICAL`. Por ejemplo, jardinería, huertos, riego y lluvia para plantas pertenecen a `nature`, aunque no exista todavía una herramienta concreta.
- **Prueba de frontera para la vertical nueva:** antes de redactarla, responder por escrito: (1) cuál es el dominio independiente; (2) qué usuario y trabajo recurrente nuevo introduce; (3) por qué no sería razonable clasificarla en ningún repositorio actual; (4) qué repositorio nuevo `jjlmoya-utils-<categoría>` necesitaría; y (5) qué evidencia externa actual demuestra que el dominio merece existir. Si alguna respuesta es "se puede añadir a una categoría existente", rechazar la propuesta como vertical nueva y buscar otra de verdad disruptiva. La ausencia de una herramienta concreta no demuestra que exista una vertical nueva.
- **Coste de diseño de museos y patrimonio:** no presentar `museums`, `heritage` ni una vertical equivalente como opción ligera o de bajo mantenimiento. Suelen exigir diseño espacial y editorial específico, recorridos, catalogación, conservación, accesibilidad y muchos estados visuales por institución. Solo se podrán proponer con un alcance mínimo explícitamente aprobado por el usuario y una estimación separada de diseño, contenido y mantenimiento.
- Si la vertical nueva no puede demostrarse con evidencia externa y una ficha de utilidad concreta, detener la sugerencia y declarar el bloqueo; nunca rellenar ese cupo con otra categoría conocida.
- Esta obligación se aplica a cada ejecución que entre en discovery. No rompe la regla FIFO: si existe una issue abierta de utilidad, se trabaja esa issue y no se presenta una tanda de ideas nueva.

Cada una de las veinte fichas debe incluir:

- oportunidad y slug propuesto para cada opción;
- categoría inferida desde los datos, número actual de tools y marca `NUEVA VERTICAL` cuando aplique;
- consultas o familias de consultas observadas, citadas literalmente desde el informe sincronizado;
- cobertura encontrada en los sitemaps y por qué no satisface la intención;
- señal externa actual cuando exista, con fuente y fecha;
- propuesta de valor, entradas, cálculo o transformación y resultado esperado;
- fricción de uso, complejidad técnica, límites y riesgo de canibalización;
- recomendación final separada para cada carril y una recomendación global explicando qué evidencia la sostiene.

No copiar rankings ni narrativas de otros informes. Las veinte propuestas deben poder reconstruirse desde las filas de búsqueda, las URLs del sitemap, el inventario de tools y, para la vertical nueva, las señales externas documentadas.

---

## 🔄 FLUJO DE TRABAJO OBLIGATORIO POR FASES

### Regla de publicación sin ramas
- Trabajar y publicar directamente sobre `main`. No crear ramas de feature, release, hotfix ni ramas temporales.
- No crear PRs para estas herramientas salvo que el usuario lo pida expresamente.
- Antes de publicar, comprobar que el checkout está en `main`, limpio y sincronizado con `origin/main`.
- Ejecutar `npm run minor` únicamente sobre `main`, después de completar los quality gates. No ejecutarlo una segunda vez para trasladar un release ya creado: si el release se generó accidentalmente en otra rama, integrar ese commit en `main` mediante fast-forward y conservar su tag.

### Fase 1: Identificación e Inspiración cuando el backlog está vacío
1. Ejecutar primero la consulta de issues abiertas descrita en la regla principal. Solo si no hay ninguna issue abierta de utilidad, sincronizar los datos con `npm run sync` y después con `npm run discover`. Si cualquiera de las sincronizaciones falla, informar del fallo y no presentar una oportunidad como actual.
2. Analizar las tablas de detalle de `global-suggest-engine.md` junto con `gamebob.dev-sitemap.md` y `jjlmoya.es-sitemap.md`. Usar otros Markdown solo para contexto trazable y nunca para repetir conclusiones.
3. Si el backlog está vacío, construir y presentar los dos carriles de diez ideas definidos arriba. El primer carril debe calcularse por número real de directorios `src/tool` para sus nueve verticales existentes, no por impresiones ni por volumen de búsquedas, y reservar el décimo cupo a una categoría nueva. El segundo puede usar volumen, repetición y tendencias.
4. Dentro del primer carril, seleccionar y marcar obligatoriamente una vertical nueva no tratada. Para demostrar que está sin tratar, comprobar repositorios hermanos, sitemaps, issues abiertas e histórico curado antes de redactarla.
5. Cada idea debe especificar nombre, categoría objetivo (`jjlmoya-utils-<categoría>`), por qué crearla, intención o señal externa, inputs, transformación, resultado, cobertura, límites, complejidad y presets o concepto visual.
6. Si el usuario acepta una de las candidatas, crear primero su issue en `Game-Bob/ai-knows` con la etiqueta `repo:jjlmoya-utils-<categoría>` y esperar a una ejecución posterior del loop. No iniciar la Fase 2 en esta misma ejecución.

7. Cuando se haya seleccionado una issue existente, resolver antes de implementar las preguntas reales de la ficha de oportunidad:
   - **¿Por qué crear esta herramienta?** Explicar la demanda real, el problema recurrente que resuelve y por qué no está cubierto por las herramientas actuales de la categoría.
   - **¿Cómo gestionarla e implementarla?** Definir explícitamente las entradas requeridas, la lógica de cálculo y fórmulas, y la experiencia de usuario y visualización.
   - Dentro de la experiencia de usuario y visualización, definir además la identidad artística, la metáfora visual y el detalle distintivo que convierten la TOOL en una pieza de museo usable.

6. Después de implementar y renderizar la TOOL, responder obligatoriamente y de forma autocrítica las preguntas originales:
   - **Manifiesto ARTE:**
     1. ¿Puede hacerse con menos inputs?
     2. ¿Pueden ser los inputs más cómodos, táctiles y naturales (sliders, chips visuales, presets rápidos)?
     3. ¿Podría ser esta interfaz significativamente más bonita, visual y viva?
     4. ¿Puedo facilitarle la vida al usuario?
   - **Auto-reflexión UX y diseño:**
     1. ¿Esto puede ser más bonito?
     2. ¿Esto puede ser más útil para el usuario?
     3. ¿Esto podría simplificarse?
     4. ¿Podría hacer algo para que el usuario lo disfrute más?
     5. ¿Son los resultados suficientemente visuales?
     6. ¿Puedo aportar algo más al usuario?
   - **Auto-reflexión SEO y contenido:**
     1. ¿Esto es útil para el usuario?
     2. ¿Esto responde a la intención de búsqueda?
     3. ¿Puedo aportar mayor utilidad al usuario final?
   - **Mínimo editorial SEO antes de solicitar `okQA`:** el contenido no se considera terminado por cumplir tipos, schemas o longitud técnica. Debe incluir al menos cuatro bloques temáticos con títulos, tres párrafos explicativos, una lista accionable y un tip de límites o evidencia. En conjunto debe explicar el problema que resuelve, cuándo usar la TOOL, cómo interpretar la salida, qué hacer después y qué no puede afirmar. FAQ y HowTo deben añadir respuestas o pasos útiles, no repetir el texto principal con otras palabras.
   - Revisar cada bloque preguntando qué decisión nueva permite tomar al lector. Eliminar frases de relleno, promesas genéricas y descripciones del widget que no aporten conocimiento de investigación.
   - No responder con afirmaciones complacientes. Señalar carencias concretas, corregirlas y repetir la revisión antes de solicitar `okQA`.

### Fase 2: Desarrollo e Implementación (English-First)
1. **Crear Estructura SOLID** en `src/tool/<tool-id>/`:
   - `ui.ts`: Interfaz del contenido tipado de la UI.
   - `logic.ts`: Funciones matemáticas y lógicas puras.
   - `logic.test.ts`: Pruebas de unidad Vitest (100% cobertura).
   - `storage.ts`: Gestión de `localStorage` con aislamiento `try/catch`.
   - `evaluator.ts`: Diagnósticos de estado y badges.
   - `dom-views.ts`: Formateadores de datos y arte visual dinámico, usando la técnica adecuada (SVG, CSS, canvas o DOM) con soporte `--n-*` para temas claro y oscuro.
   - `controller.ts`: Gestión de eventos, sliders síncronos, custom selects y chips de presets.
   - `<english-slug>.css`: Estilos Vanilla CSS estructurados con tokens `--n-*`; el nombre debe coincidir exactamente con el `slug` de `en.ts` para que el preview lo cargue.
   - `component.astro`: Vista de la herramienta pre-renderizada en SSR con hidratación limpia vía `<script is:inline type="application/json">`.
   - `bibliography.ts` & `bibliography.astro`: Citas bibliográficas autoritativas, internacionales y variadas, cumpliendo obligatoriamente la fuente primaria no inglesa definida en esta skill.
   - `seo.astro`: Renderizado SEO resiliente con fallbacks.
   - `entry.ts` & `index.ts`: Registro formal exportando únicamente el loader de `en` durante la Fase 2.
2. **Registrar la Herramienta**:
   - `src/tools.ts`, `src/entries.ts`, `src/category/index.ts`.
   - Actualizar el test de conteo `expect(ALL_TOOLS.length).toBe(N)` en `src/tests/tool_validation.test.ts` y `src/tests/locale_completeness.test.ts`.
3. **Pausa Obligatoria (Gate de okQA del Usuario)**:
   - Presentar la herramienta al usuario exclusivamente en inglés (`en.ts`).
   - Esta presentación solo puede hacerse después de completar la autocrítica obligatoria de la Fase 1, corregir sus hallazgos y revisar el render final.
   - ESPERAR la confirmación explícita `okQA` del usuario antes de proceder a la localización.

### Fase 3: Localización y Traducibilidad (15 Idiomas)
Una vez recibido el `okQA` explícito:
1. Crear los 15 archivos de idioma en `src/tool/<tool-id>/i18n/`:
   - `de.ts`, `en.ts`, `es.ts`, `fr.ts`, `id.ts`, `it.ts`, `ja.ts`, `ko.ts`, `nl.ts`, `pl.ts`, `pt.ts`, `ru.ts`, `sv.ts`, `tr.ts`, `zh.ts`.
2. Registrar los 15 loaders en `entry.ts`.

### Fase 4: Quality Gates Automatizados
Ejecutar secuencialmente y verificar código de salida 0:
1. `npm run type-check`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

### Gate obligatorio de contrato con consumidores
Antes de hacer commit, `npm run minor` o publicar una TOOL, validar la integración contra los dos consumidores reales (`../jjlmoya` y `../website`):

1. Leer sus layouts/rutas de librería y comprobar la firma efectiva de `Component`, `SEOComponent` y `BibliographyComponent`; no inferir el contrato solo desde los tipos de la librería.
2. Ejecutar una prueba de prerender de al menos una ruta de la TOOL en cada consumidor y en un locale no español. Para `SEOComponent`, el contrato estándar del ecosistema es recibir `{ locale }`, cargar `entry.i18n[locale]` y pasar `{ locale, sections: content.seo }` a `SEORenderer`; no declarar `{ content }` salvo que ambos consumidores lo pasen explícitamente.
3. Añadir o actualizar una regresión en la librería que cubra este contrato de loader/render, y volver a ejecutar tests y build después del cambio.
4. Tras el `minor` y la publicación, instalar la versión exacta en ambos consumidores mediante sus scripts oficiales, confirmar que `package.json`, lockfile y `node_modules` resuelven esa misma versión y validar la integración mínima del runtime/adaptador. En `jjlmoya` y `website` no ejecutar builds ni tests de consumidor: no son necesarios para completar la TOOL. No cerrar la tarea con la librería corregida pero los consumidores todavía apuntando a la versión rota.

Si la instalación o el prerender no puede ejecutarse, dejar la tarea como incompleta y documentar el bloqueo; nunca presentar solo el build aislado de la librería como integración validada.

### Fase 5: Publicación, Sincronización e Imágenes OpenGraph
1. Commit y push inicial de la librería en `/d/code/jjlmoya-utils-<categoria>`.
   Estas acciones requieren confirmación explícita del usuario antes de ejecutarse:
   ```bash
   cd /d/code/jjlmoya-utils-<categoria>
   git add .
   git commit -m "feat: add <tool-id> utility" --no-verify
   git push --no-verify
   ```
2. Ejecutar la publicación minor en `/d/code/jjlmoya-utils-<categoria>`:
   ```bash
   cd /d/code/jjlmoya-utils-<categoria>
   npm run minor
   ```
3. Actualizar la versión de la dependencia en los proyectos consumidores usando sus scripts oficiales:
   - En `/d/code/jjlmoya`: `npm run update <categoria>`
   - En `/d/code/website`: `npm run update <categoria>`
4. Generar la Imagen OpenGraph (OBLIGATORIAMENTE CUADRADA 1:1):
   - Usar la capacidad de generación de imágenes disponible, formato `1:1` (PROHIBIDO 16:9 u otros formatos) y referencias visuales reales de varias imágenes existentes en `public/images/utilities/`. No imponer *Artist Ink and Watercolor* ni otro preset: el prompt debe derivar el estilo común observado en esas referencias.
   - En `/d/code/jjlmoya` generar únicamente `public/images/utilities/<slug-es>.webp`; no crear ni conservar allí `public/images/utilities/<slug-en>.webp`. En `/d/code/website` generar únicamente `public/images/utilities/<slug-en>.webp`.
   - Convertir a WebP en `/d/code/jjlmoya` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```bash
     cd /d/code/jjlmoya
     node scripts/convert-image-to-webp.mjs <ruta-imagen-generada> public/images/utilities/<slug-es>.webp
     ```
   - Convertir a WebP en `/d/code/website` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```bash
     cd /d/code/website
     node scripts/image-to-webp.mjs <ruta-imagen-generada> public/images/utilities/<slug-en>.webp
     ```
5. Commit y push con `--no-verify` en `jjlmoya` y `website`:
   Estas acciones también requieren confirmación explícita del usuario:
   ```bash
   cd /d/code/jjlmoya
   git add .
   git commit -m "feat: update @jjlmoya/utils-<categoria> to <version> and add og image" --no-verify
   git push --no-verify

   cd /d/code/website
   git add .
   git commit -m "feat: update @jjlmoya/utils-<categoria> to <version> and add og image" --no-verify
   git push --no-verify
   ```

---

## 🛠️ SECCIÓN DE TROUBLESHOOTING Y REGLAS ANTIFALLOS

1. **Límites de ESLint (max-params <= 4, max-lines-per-function <= 30, complexity <= 8)**:
   - En funciones con más de 4 parámetros, agruparlos siempre en una interfaz de objeto.
   - Evitar expresiones ternarias anidadas (`no-nested-ternary`).
   - Usar funciones auxiliares cortas para no superar las 30 líneas por función ni complejidad 8.

2. **Custom Selects en Lugar de Selects Nativos**:
   - Construir siempre con control de apertura, selección de valor y cierre al hacer clic fuera.
   - En `controller.ts`, sincronizar el valor interno con el texto del botón trigger y las clases activas.
   - Un selector sin opciones útiles no puede parecer interactivo ni desplegar un panel vacío. Antes de que existan opciones debe estar oculto o visiblemente deshabilitado, explicar qué acción las habilita y no mostrar chevron ni estado abierto.

2.1. **Sistema de unidades global en la TOOL**:
   - Cualquier TOOL que use unidades del sistema internacional debe ofrecer un botón global visible para cambiar entre `Metric` e `Imperial`.
   - El cambio debe actualizar todos los inputs, etiquetas, presets, resultados y densidades compatibles, conservar el valor físico subyacente y persistir de forma segura en `localStorage`.
   - No mezclar unidades en una misma vista ni esconder la elección dentro de un selector secundario.

3. **Cero Comentarios en Código (`no-comments/disallowComments`)**:
   - CERO comentarios en `.ts`, `.astro`, `.css`, `.json`. En bloques catch vacíos, usar `catch {}`.

4. **Variables CSS en Stylelint (`scale-unlimited/declaration-strict-value` y Hex Cortos)**:
   - Declarar todas las variables de color en `:root` y `.theme-dark` (`--n-*`).
   - Usar notación hex corta (ej. `#fff` en lugar de `#ffffff`).
   - `:root` debe ser una paleta clara real, con superficies luminosas, texto oscuro y contraste verificable. `.theme-dark` debe redefinirla como paleta oscura real. No se acepta que ambos modos sean oscuros ni que solo cambien matices.
   - Si el usuario rechaza los degradados, no debe quedar ningún `gradient()` decorativo en la herramienta: usar superficies sólidas y comprobar explícitamente el contraste de texto, botones, estados y notas en ambos temas.
   - Revisar el estado inicial por separado del estado activo: no convertir una herramienta aún cerrada en un visor vacío gigante ni en un segundo hero de marketing dentro de la propia herramienta.

5. **Trío Obligatorio de Schemas JSON-LD en los 15 Idiomas**:
   - `SoftwareApplication`, `FAQPage` y `HowTo` tipados con `schema-dts` en todos los archivos i18n.

6. **Reglas Estrictas de Diacríticos y Escritura Nativa en i18n**:
   - **Ruso (`ru.ts`)**: SIEMPRE en alfabeto cirílico auténtico, NUNCA transliteración latina.
   - **Español (`es.ts`)**: Signos de apertura obligatorios `¿...?` e `¡...!`.
   - **Alemán (`de.ts`)**: Diacríticos auténticos (`ä`, `ö`, `ü`, `ß`).
   - **Italiano (`it.ts`)**: Vocales acentuadas auténticas (`à`, `è`, `é`, `ì`, `ò`, `ù`).
   - **Polaco (`pl.ts`)**: Caracteres polacos auténticos (`ą`, `ć`, `ę`, `ł`, `ń`, `ó`, `ś`, `ź`, `ż`).
   - **Turco (`tr.ts`)**: Caracteres turcos auténticos (`ç`, `ğ`, `ı`, `ö`, `ş`, `ü`).
   - **Portugués (`pt.ts`)**: Diacríticos y acentos auténticos (`á`, `â`, `ã`, `à`, `ç`, `é`, `ê`, `í`, `ó`, `ô`, `õ`, `ú`).

   La prueba `diacritics_density.test.ts` solo detecta una densidad mínima de caracteres propios del idioma y no es un corrector ortográfico. Antes de publicar, revisar manualmente cada locale y mantener una regresión específica para los errores ortográficos o de transcripción detectados durante esa revisión.

7. **Basura Tipográfica Prohibida (`no_en_dash.test.ts`)**:
   - Usar EXCLUSIVAMENTE apóstrofe recto ASCII `'`, comillas rectas `"`, guion estándar `-`, tres puntos `...`.
   - NUNCA apóstrofes curvos `’`, comillas latinas `«` `»` ni guiones em `—`/en `–`.
   - NUNCA poner espacio antes de dos puntos (` : `) en francés/turco.

8. **Separadores Prohibidos en Títulos SEO (`title_quality.test.ts`)**:
   - NUNCA usar guiones `-` ni barras `|` en `title`, `subtitle` o títulos de secciones SEO.

9. **Estructura Estricta de SEOSection para SEORenderer**:
   - Los objetos de `content.seo` DEBEN ser elementos tipados de `SEORenderer`: `{ type: 'title', text: '...', level: 2 }`, `{ type: 'paragraph', html: '...' }`, `{ type: 'list', items: [...] }`, `{ type: 'tip', title: '...', html: '...' }`, `{ type: 'table', headers: [...], rows: [...] }`.
   - PROHIBIDO usar objetos genéricos como `{ title: '...', content: '...' }`.

10. **Formato Obligatorio Cuadrado (Aspect Ratio 1:1) para Imágenes OpenGraph**:
    - Al generar la imagen conceptual con la capacidad de generación de imágenes disponible, especificar OBLIGATORIAMENTE formato `1:1` (imagen CUADRADA).
    - PROHIBIDO usar `16:9` o cualquier otro formato.

11. **Uso Exclusivo de Scripts Oficiales de Conversión WebP**:
    - Usar SIEMPRE `node scripts/convert-image-to-webp.mjs` (en `jjlmoya`) y `node scripts/image-to-webp.mjs` (en `website`).
    - Queda ESTRICTAMENTE PROHIBIDO crear scripts `.cjs`/`.mjs` temporales o ejecutar convertidores ad-hoc en línea de comandos.

12. **Ruta de assets de utilidades**:
    - Las imágenes de cada herramienta deben guardarse en `public/images/utilities/` tanto en `jjlmoya` como en `website`, usando el slug que devuelve el registro de cada locale.
    - `tests/registry.test.ts` y el patrón existente de `public/images/utilities/` son la autoridad para la ruta. No crear ni usar `public/images/og/` para assets de herramientas.

13. **Auto-Refinamiento**:
    - Si el usuario detecta cualquier discrepancia o aspecto a mejorar, actualizar inmediatamente este documento antes de proseguir.
    - Si el usuario detecta que una TOOL de análisis tabular parece una hoja de cálculo encogida, con tipografía microscópica, columnas de diagnóstico que vacían la escena o controles nativos sin integración visual, detener el gate: convertir el resultado en una composición de señales legible a primer vistazo, dar prioridad a una muestra interpretable de la estructura y usar la tabla completa solo como detalle desplazable.
    - Si el resultado vuelve a presentarse como cuatro o más tarjetas separadas, detener el gate aunque las tarjetas sean grandes: sustituirlas por una composición continua con divisores internos, porque una cuadrícula de cards no puede ser la metáfora principal de una TOOL de análisis.
    - Si el usuario detecta que el título o el slug de una TOOL son vagos y no expresan la tarea concreta, detener el gate editorial: definir una frase longtail basada en la entrada, los problemas detectados y la decisión que ayuda a tomar, y mantener esa frase alineada en el registro, la ruta, los metadatos, el CSS y las referencias internas.
    - Una frase longtail no puede resolver la vaguedad introduciendo un encabezado imposible de leer: comprobar el ancho real del `h1` del consumidor y compactar la frase manteniendo formato, problema y acción cuando el título se desborde.
    - En la herramienta de planificación de filtros de acuario, el usuario rechaza el naturalismo realista y también la estética serigráfica/cut-paper: la imagen OpenGraph debe seguir el lenguaje Artist Ink de las demás herramientas, con dibujo editorial de tinta visible, formas gestuales y una metáfora simplificada del tanque y su corriente.
    - Una TOOL que solo recoge notas y las devuelve como una reformulación genérica no supera el gate de utilidad: debe comprobar, calcular, comparar o producir una decisión/acción verificable. Si no lo hace, hay que pivotar antes de localizarla o publicarla.
    - En el discovery del 30 de agosto de 2026, el usuario rechazo explicitamente las propuestas 10, 12, 15, 16 y 19. No volver a proponerlas ni crear issues para ellas en este ciclo.
    - Cuando el usuario pida oportunidades para "las tools más vacías", limitar el discovery a repositorios/verticales públicas existentes ordenados por su número real de directorios inmediatos `src/tool`; no introducir una vertical nueva ni sustituir este criterio por volumen de demanda.
    - La categoría `games` queda reservada a utilidades para juegos comerciales y sus decisiones de uso, compra, configuración o planificación dentro del juego; no proponer herramientas genéricas de hardware, mandos o periféricos bajo esta categoría.
    - Los selectores de render de resultados deben ser exclusivos de la salida que actualizan y no coincidir con controles homónimos; toda cifra dinámica debe verificarse en el navegador contra la misma entrada que alimenta el resumen. Los decimales visibles deben respetar el locale objetivo sin delegar su forma final a la localización nativa de un input numérico.
    - Cuando una TOOL use tokens `--n-*`, aislar sus variables dentro de la card raíz de la propia TOOL además de declarar la paleta base, para evitar colisiones con tokens globales del proyecto consumidor. En modo oscuro, revisar también el contraste de etiquetas colocadas sobre ilustraciones o formas de color.
    - Para validar consumidores, resolver siempre `../jjlmoya` y `../website` desde la ruta absoluta del repositorio propietario que se está publicando, y comprobar también el nivel padre del workspace activo antes de declarar que faltan. No confundir el `../` de `ai-knows` con el `../` de `jjlmoya-utils-*`.
    - Si el usuario detecta una interfaz clonada, un contenedor sobredimensionado o sombras exteriores exageradas, detener el gate visual y hacer tres pasadas explícitas: adelgazar el cromo, redefinir la metáfora visual desde el problema y revisar la jerarquía de contenido y SEO. No solicitar `okQA` hasta comprobar el render tras las tres pasadas.
    - Si los presets parecen botones flotantes o la herramienta se percibe como paneles desconectados, agruparlos dentro de una única card estructural con separadores internos y revisar el render antes de continuar.
    - Si el usuario detecta que onboarding, configuración y resultado aparecen como tres cards independientes, unirlos en una única superficie estructural con separadores internos claros y volver a revisar el render.
    - Nunca usar `window.alert`, `window.confirm` ni diálogos nativos equivalentes en una TOOL: sustituirlos por mensajes inline o una confirmación propia, animada, accesible y coherente con la identidad visual.
    - Cuando una vista Astro genere filas, opciones u otro HTML dinámico como cadena, insertar la cadena explícitamente con `set:html` o construir nodos tipados; nunca interpolarla como texto, porque el render puede mostrar las etiquetas HTML al usuario.
    - En cualquier TOOL de temperatura, mostrar el símbolo `°` junto a cada unidad y ofrecer un conmutador global visible entre `Metric °C` e `Imperial °F`; inputs, rangos, resultados, tablas, estado persistido y etiquetas deben cambiar sin alterar la temperatura física subyacente.
    - Si el usuario detecta una temperatura expresada solo en Celsius o solo en Fahrenheit, detener la presentación y añadir el conmutador global `Metric °C` e `Imperial °F`; ningún rango, preset, resultado o etiqueta puede quedar en una sola unidad.
    - Si el usuario identifica un negro verdoso o lavado en el tema oscuro, redefinir la paleta hacia negros carbón reales y reservar los tonos verdes para reflejos o estados funcionales; volver a revisar contraste y render antes del gate visual.
    - En escenas SVG de hidratación de mascotas, no usar siluetas decorativas de perro o gato como protagonista: la metáfora debe centrarse en el recipiente y su nivel. El texto colocado sobre el agua debe usar un token de tinta específico del recipiente y verificarse en tema claro y oscuro.
    - En la herramienta de tensión de cuerdas de guitarra, no usar una ilustración de mástil como obligación decorativa. La visualización debe explicar una decisión del usuario, por ejemplo comparando la tensión de las seis cuerdas con barras o bandas ancladas a sus datos; las cuerdas y líneas deben quedar contenidas si se usa una geometría de instrumento. Si la imagen no aporta interpretación, eliminarla.
    - En la herramienta de tensión de cuerdas de guitarra, el primer viewport debe limitarse al preset de juego, la escala y la afinación. Los calibres individuales y la escala personalizada deben quedar plegados hasta que el usuario los solicite; el material base puede ser un supuesto visible del modelo en vez de otro selector inicial.
    - En el asignador de presupuesto participativo, la escena de capacidad debe reconstruirse exclusivamente desde la selección actual y representar el sobrante con un ancho proporcional explícito; una sola propuesta financiada no puede conservar divisores de un estado anterior. Las exclusiones deben distinguir el exceso sobre el presupuesto restante de una derrota por desempate, y los costes superiores al tope deben recibir feedback inline antes del cálculo.
    - El tono de fondo no es un valor fijo del ecosistema: cada TOOL puede elegir fondos distintos para su identidad, y el tema claro y oscuro pueden usar superficies de base diferentes entre sí. Revisar siempre la relación entre fondo, card, escena y resultado; no repetir automáticamente el mismo fondo de otra TOOL.
    - Si una captura muestra una calculadora como dashboard oscuro genérico, una metáfora que solo adorna el formulario, una cifra principal que rompe sus unidades, o un badge que no coincide con el preset activo, detener la presentación y rehacer composición, tipografía, formato de cifras y estados antes de continuar.
    - Si el usuario detecta que una TOOL no tiene una card estructural visible y que controles, resultado o leyenda parecen elementos flotantes, detener la presentación aunque existan bordes o sombras en el código: corregir los tokens de tema, crear una superficie contenedora legible, agrupar la escena y sus métricas dentro de una jerarquía única, y volver a capturar el render en tema claro y oscuro antes de continuar.
    - En el perfil de habilidades CEFR, el formulario no puede ser la única escena: las cinco rutas de habilidad deben ser visibles desde el estado inicial o aparecer como una composición de atlas al calcular; los controles deben usar un indicador de selección dibujado y el estado vacío debe explicar visualmente qué aparecerá sin convertirse en una tarjeta vacía.
    - En herramientas financieras, evitar paletas de verde oliva, marrón terroso o terracota apagada como lenguaje dominante: la dirección debe partir de una lectura financiera clara, como azul noche, marfil, oro o esmeralda funcional, con contraste verificable y sin convertir el resultado en una superficie embarrada.
    - En calculadoras de volumen de acuarios, mostrar únicamente los campos de la geometría activa, separar volumen bruto, desplazamiento y volumen útil, y hacer que la escena visual comunique el nivel calculado en vez de funcionar como decoración.
    - Si una escena de resultados queda mucho más corta que la columna de interpretación y deja un hueco vacío, reordenar las métricas relacionadas junto a la escena o convertir la composición en una superficie equilibrada; no resolverlo con espacio en blanco artificial ni con una tarjeta estirada sin contenido.
    - Verificar que la etiqueta `repo:jjlmoya-utils-*` coincide con la categoría funcional de la oportunidad; si no coincide, corregir la etiqueta y la referencia de repositorio de la issue antes de seleccionar la implementación.
    - Si el usuario rechaza el tono verde de una TOOL de mapas, no insistir en verdes como fondo dominante ni resolver el problema con cambios cosméticos: redefinir la paleta desde papel, tinta, terracota, agua y tierras legibles, y eliminar los puntos decorativos sin significado.
    - Si el usuario detecta que el gráfico principal comunica poco, hacer que la escena visual pague su espacio: aumentar la densidad de señales interpretables, marcar eventos que expliquen la divergencia y dar al resultado una jerarquía mayor. Eliminar bloques introductorios o leyendas explicativas que no aporten una decisión nueva, y retirar textos auxiliares pegados a controles cuando vuelvan la interacción agobiante; la explicación debe quedar en el resultado o en el contenido SEO.
    - En herramientas estadísticas, una barra de proporciones o una tabla por sí sola no basta como escena principal: mostrar los valores individuales, las medias de grupo y la media global en una composición gráfica que permita ver la separación y el ruido antes de leer los cuadrados de suma.
    - En la herramienta de presupuesto de páginas de índice de libros, una composición con formulario comprimido, resultado fuera del primer vistazo, controles cortados o una metáfora de hojas que no explica la decisión editorial se considera bloqueada. Rehacer la composición desde el problema: mostrar primero el presupuesto y la tensión entre páginas estimadas y páginas reservadas, agrupar los controles en un flujo respirable y hacer que cada marca visual corresponda a una decisión del editor.
    - En generadores de pueblos o asentamientos, los edificios deben leerse como un tejido urbano reconocible con casas, tejados, plazas, caminos y servicios; una nube de rectángulos conectados por puntos no supera el gate visual.
    - Las semillas de generadores de asentamientos deben ofrecer nombres de pueblo compuestos, variados y memorables, con suficientes combinaciones para evitar una lista corta repetitiva.
    - La edición de mapas de asentamientos debe ofrecer click derecho contextual sobre el mapa con herramientas y acciones visibles; el usuario no debe depender únicamente de seleccionar un modo global y después adivinar dónde clicar.
    - Compartir por enlace en una herramienta de mapas debe reconstruir el pueblo completo, incluyendo semilla, configuración, edificios, servicios, caminos, agua y ediciones manuales; compartir solo la configuración no es suficiente.
    - En una tool de mapas, la barra de herramientas debe cubrir el trabajo real de preparación: selección, construcción y eliminación de edificios, caminos, agua y servicios, además de exportación y recuperación del estado compartido.
    - Las listas de servicios de una tool de asentamientos deben poder crecer reactivamente con nombres personalizados, conservarse en el estado compartido y alimentar los controles, leyenda y marcadores sin una lista fija cerrada.
    - Los marcadores de servicios nunca deben depender solo de la primera letra: calcular el prefijo mínimo único a partir del nombre visible del idioma activo, actualizarlo al añadir servicios y resolver duplicados de forma legible y rápida.
    - En mapas de pueblos, el asentamiento es una lectura secundaria dentro del paisaje: el bosque o terreno debe dominar la escena y la trama urbana debe mantener aire alrededor.
    - Los presets hamlet, village y town deben cambiar de forma reactiva el número de casas, los servicios básicos y el patrón urbano; no son solo tres tamaños de lienzo.
    - La generación urbana debe partir de parcelas y calles conectadas con una cuadrícula legible, relajándola progresivamente para village y hamlet sin convertirla en una nube apiñada.
    - Las carreteras deben representarse como una red topológica de celdas y cruces, con uniones limpias cuando coincidan tres o cuatro tramos.
    - El agua pintada celda a celda debe recomponerse por componentes adyacentes: un tramo estrecho se lee como río, tres celdas como laguna y cuatro o más como lago o masa continua.

14. **Separación estricta entre TOOL y widget**:
    - `title`, `description`, `slug`, FAQ, HowTo y SEO pertenecen a `ToolLocaleContent` y a los componentes de página. Nunca duplicar `title` o `description` dentro de `ui.ts`, `component.astro` o el widget interactivo.
    - El widget debe comenzar por el control funcional y sus resultados; el título y la descripción de la TOOL los renderiza la página consumidora.
    - No añadir cabeceras introductorias, kickers, subtítulos ni bloques de onboarding antes de los controles del widget. La primera superficie visible de una TOOL debe empezar por la interacción o el resultado; la explicación necesaria debe vivir en las etiquetas de los controles, junto al resultado o en el contenido SEO. Esta regla no elimina los encabezados semánticos del contenido SEO fuera del widget.

15. **Identidad artística y experiencia de museo usable**:
    - Cada TOOL debe sentirse como una pieza de museo interactiva: una identidad visual propia, una composición memorable, una respuesta clara a los inputs y un resultado que apetezca explorar.
    - La técnica es una decisión de diseño, no una obligación: puede usar SVG, CSS, canvas, DOM, animación o una combinación de ellas. `dom-views.ts` debe concentrar la representación visual dinámica cuando exista.
    - Una cuadrícula de tarjetas, barras, tablas o un panel que parezca una hoja de cálculo no cuenta como dirección artística principal. Los gráficos auxiliares pueden existir, pero no sustituir la escena, metáfora visual o composición central.
    - No basta con añadir un gráfico a un formulario. La dirección artística debe gobernar la composición completa: controles, jerarquía, resultado, movimiento, estados, feedback y microinteracciones deben pertenecer al mismo lenguaje visual.
    - Un listado de valores debajo de un gráfico no es una visualización artística por sí mismo. Los datos deben estar integrados en una composición legible, alineada y con una función interpretativa clara.
     - Antes de programar, definir la metáfora visual, la paleta, la jerarquía, el gesto de interacción y el detalle distintivo que hará que el usuario quiera usarla.
    - En herramientas históricas de dinero, representar visualmente las denominaciones documentadas que componen la cantidad introducida y no usar una pieza monetaria genérica como escena principal.
    - Los selectores de periodos deben organizarse por décadas o eras, mostrar el estado activo con claridad y mantener navegación de teclado, foco visible y cierre accesible.

16. **Gate visual antes de QA**:
    - Revisar la captura o render de la herramienta antes de presentarla como lista para QA.
    - Si aparecen cabeceras introductorias dentro del widget, títulos duplicados, descripciones dentro del widget, aspecto de Excel, arte genérico o el cromo de otra TOOL (rail de presets, ticket/sello, workshop, misma rejilla de chips y sliders), corregirlo antes de solicitar `okQA`.

19. **Prohibido clonar tools anteriores**:
    - Cada TOOL se inventa desde su problema, no desde la memoria de la última TOOL ni desde un hermano del repo.
    - Prohibido abrir `component.astro`, CSS, `controller.ts` o `dom-views.ts` de otra utilidad para copiar layout, metáfora, paleta, jerarquía, gestos o nombres de clases. Esas copias producen el mismo taller con otro dibujo.
    - De otros tools solo se pueden leer contratos: `entry.ts`, `index.ts`, `tools.ts`, `entries.ts`, `types.ts`, tests de conteo, schemas, i18n shape, eslint y stylelint.
    - La escena, los controles y el resultado deben ser la respuesta a ESTA ficha: qué cuenta el usuario, qué ve, qué toca. Si la interfaz funcionaría igual cambiando las etiquetas, está mal.
    - Antes de programar, escribir en una frase la metáfora que solo tiene sentido para esta TOOL. Si la frase sirve para una cadena de bici, un LED o un resistor, tirarla y empezar otra.
    - Prohibido reconstruir de memoria el cromo habitual aunque no se abra otra TOOL: conmutador Metric/Imperial en mast, escena SVG decorativa, tablero de labels+inputs, fila de chips/swatches y una tarjeta de resultado flotante. Ese esqueleto produce la misma herramienta con otro dibujo y no supera la auditoria.

17. **Estándar de producción sin placeholders**:
    - Todo lo que se cree bajo esta skill está destinado a producción. No usar placeholders, texto de relleno, preguntas numeradas sin significado, lorem ipsum, valores ficticios ni estructuras sintéticas para satisfacer tests.
    - FAQ, HowTo, SEO, schemas, títulos, descripciones, labels, estados y mensajes deben ser contenido final, específico de la herramienta, útil para el usuario y revisado en su idioma. Prohibido generar contenido como `Question 1`, `Tool title: 2`, repetir una descripción para rellenar bloques o sustituir una traducción real por el texto inglés.
    - La paridad de cantidad y tipos de bloques debe resolverse traduciendo contenido real bloque a bloque. Nunca se puede conseguir mediante arrays fabricados, copias masivas, repetición de una misma frase o un helper que sintetice contenido.
    - Si falta información para escribir contenido final, detener la implementación de esa parte y pedirla o investigarla; no dejar una versión provisional en el repositorio ni presentarla como terminada.
    - Antes de `okQA`, buscar explícitamente placeholders y contenido sintético en todo el árbol de la TOOL, incluyendo SEO, FAQ, HowTo, schemas, i18n y estados vacíos. Una sola coincidencia bloquea el gate.

18. **Bibliografía breve, primaria y específica**:
    - Incluir pocas fuentes: por defecto 2 fuentes y solo ampliar a 3 si una decisión importante de la herramienta queda sin respaldo.
    - Cada fuente debe respaldar directamente una fórmula, rango, unidad, definición, procedimiento o afirmación concreta de esa TOOL. Preferir documentación primaria, organismos profesionales, universidades, fabricantes o publicaciones técnicas originales.
    - Incluir obligatoriamente al menos una fuente primaria cuyo contenido original no esté en inglés. El título traducido, una versión localizada de una página inglesa o una cita secundaria no satisfacen este requisito.
    - Para herramientas generales, cubrir al menos dos países o regiones y no concentrar toda la bibliografía en Estados Unidos ni en una sola institución. Si el alcance es jurisdiccional, la autoridad local manda para la norma y la fuente internacional/no inglesa debe respaldar solo el método o contexto que realmente cubra.
    - Priorizar la fuente oficial aunque esté publicada en un idioma distinto al locale de la TOOL. No sustituir una norma, organismo o documento oficial por una fuente secundaria solo para igualar el idioma de la interfaz.
    - Enlazar la página exacta que contiene la evidencia. Prohibidos como fuente bibliográfica las homepages, páginas de categoría, centros de recursos genéricos, resultados de búsqueda, listas de enlaces y artículos que solo traten el tema de forma tangencial.
    - No añadir fuentes para aparentar rigor ni repetir varias fuentes que sostengan la misma afirmación. La bibliografía debe ser corta, trazable y visible en la sección de referencias con nombre de la fuente, título específico y URL directa.
    - Antes de `okQA`, revisar cada enlace y anotar internamente qué parte concreta de la calculadora justifica. Si una fuente no permite justificar una decisión concreta, eliminarla o sustituirla.
    - Antes de `okQA`, comprobar explícitamente una matriz mínima de idioma y procedencia: idioma original de cada fuente, país o región, institución, afirmación respaldada y URL verificada. Si falta la fuente primaria no inglesa o toda la bibliografía es anglófona/estadounidense sin excepción documentada, el gate queda bloqueado.
    - La bibliografía debe respaldar la ciencia, disciplina o procedimiento que el usuario estudia con la TOOL, no la tecnología usada para implementarla. En una herramienta científica, médica, acústica o técnica, citar investigaciones, normas y métodos del dominio; no citar Web APIs, frameworks, Canvas, Web Audio, lenguajes ni documentación de plataforma salvo que la propia TOOL enseñe específicamente ese estándar web.
    - En testers de cámara, audio o comunicación, citar guías y estudios sobre iluminación, encuadre, legibilidad visual, calidad perceptual o preparación de videollamadas. Las especificaciones de `getUserMedia`, WebRTC, Canvas o callbacks de frames son documentación interna de implementación y no pertenecen a la bibliografía visible.
    - En previews de logos, iconos o interfaces de sistemas operativos, una escena abstracta o un mockup ornamental no supera el gate: la TOOL debe reproducir una superficie de uso reconocible del sistema objetivo y acompañarla de una auditoría accionable. Como mínimo, debe medir el archivo cargado, la proporción, la resolución y el margen de seguridad frente a recortes o máscaras, distinguir heurísticas propias de garantías de plataforma y mostrar claramente qué requiere revisión.
    - En previews de sistemas operativos, cada apariencia o máscara ofrecida debe producir una diferencia visual observable en la escena, no solo cambiar `aria-pressed` o un atributo sin reglas de render. Los wallpapers, barras del sistema, iconos auxiliares y capas temáticas deben ser reconocibles como el sistema objetivo; un gradiente abstracto o un `filter: grayscale()` no demuestra fidelidad a iOS o a una capa monocroma Android.
    - Cuando el usuario aporte un catálogo propio de aplicaciones o assets, el preview debe usar ese catálogo en lugar de iconos genéricos o marcas de terceros. Una máscara o tratamiento elegido debe aplicarse de forma consistente a todos los iconos afectados de la escena, incluidos apps auxiliares, dock, icono auditado y estados temáticos; cambiar solo una pieza invalida la auditoría visual.

20. **Alcance geográfico y slugs long tail cuando la oportunidad es local**:
    - Si la normativa, los datos o la intención pertenecen a un país concreto, limitar la TOOL explícitamente a ese país y no añadir selectores de país ni aproximaciones de otros regímenes que compliquen o debiliten el resultado.
    - El slug de cada idioma debe ser una long tail localizada que exprese la utilidad, la intención principal y el país. No traducir mecánicamente el slug inglés ni usar un slug corto genérico.
    - Para calculadoras salariales de España, cada slug debe conservar en su idioma las ideas de salario bruto/neto, coste empresarial, calculadora y España.

21. **Espacio tipográfico seguro para cifras**:
    - Los inputs y resultados numéricos deben reservar altura, anchura y padding suficientes para que ningún dígito, signo, símbolo monetario o separador decimal quede recortado.
    - Verificar con valores mínimos, habituales y máximos, formatos largos de cada locale y los breakpoints reales de escritorio y móvil antes de solicitar `okQA`.

22. **Onboarding visible y valores coherentes con el contexto**:
    - Una TOOL con conversión entre origen y destino debe explicar dentro del widget, antes de los controles, el recorrido mínimo: qué dato actual introduce el usuario, qué destino elige y dónde usa el resultado.
    - Los conceptos técnicos auxiliares no pueden competir con el resultado principal. Deben aparecer después del flujo básico y explicarse en lenguaje natural.
    - Al cambiar un perfil cuyo sistema de escala sea distinto, no conservar silenciosamente un valor numérico que pertenecía al perfil anterior. Restablecer un ejemplo sensato o preservar explícitamente la magnitud física, e informar del comportamiento.
    - Los sliders que concentran los valores útiles en unos pocos píxeles o no representan bien escalas muy distintas deben eliminarse o sustituirse por controles adaptados al perfil.
    - Las acciones centrales entre origen y destino, como invertir o transferir, deben conservar icono y etiqueta legibles sin saltos torpes, recortes ni formas que contradigan la longitud del texto en los breakpoints reales.

23. **Controles cerrados y campos cohesionados**:
    - Todo custom select debe nacer cerrado. El atributo `hidden` debe tener una regla de autor explícita cuando el estilo del panel use `display`, para que el menú no aparezca desplegado en el estado inicial.
    - Todos los inputs de una TOOL deben compartir una superficie, borde, altura, padding, tipografía y estado de foco coherentes; no se acepta que los campos dinámicos vuelvan al estilo nativo del navegador mientras los demás están tematizados.
    - No usar caracteres tipográficos improvisados como chevrons, flechas de select o iconos funcionales cuando su forma, peso o alineación desentonen con la interfaz. Dibujarlos con CSS/SVG o usar el sistema de iconos del repositorio, con estado abierto y cerrado coherente.
    - Antes de `okQA`, una persona debe poder describir cómo usar la TOOL mirando solo el primer viewport, sin recurrir al contenido SEO inferior.

23. **Cada acción debe pagar su espacio**:
    - Antes de añadir botones secundarios como copiar, exportar, compartir, descargar o resetear, responder qué decisión concreta facilita y quién necesita el resultado fuera de la TOOL.
    - Si la respuesta es genérica, hipotética o no mejora la intención principal, eliminar la acción. No conservar una función solo porque sea fácil de implementar.

24. **SEO centrado en el problema y el dominio**:
    - El contenido SEO debe enseñar a conseguir un mejor resultado con la TOOL, interpretar sus señales, diagnosticar problemas frecuentes y actuar sobre ellos.
    - La implementación técnica, APIs, eventos, almacenamiento, frameworks y decisiones internas no son contenido útil para el usuario salvo que la intención de búsqueda sea aprender esa tecnología.
    - Antes de `okQA`, cada bloque SEO debe superar esta pregunta: ¿ayuda a preparar, decidir, corregir o entender algo del problema real? Si solo describe cómo está programada la TOOL, se elimina.

25. **Autocrítica escrita y visible antes de `okQA`**:
    - No basta con revisar mentalmente el Manifiesto ARTE y las preguntas UX/SEO. Antes de solicitar `okQA`, escribir las respuestas concretas, enumerar los fallos detectados y describir las correcciones aplicadas.
    - Si una pregunta se responde con "sí" o "no" sin evidencia del render, del flujo o del contenido, la autocrítica no está completa.

26. **Herramientas deportivas de consulta recurrente**:
    - Cuando la utilidad gestiona una liga, competición o temporada, no reducirla a una visualización del sorteo. Debe cubrir el bucle cotidiano completo que el usuario vuelve a consultar: calendario, jornada activa, introducción y corrección de resultados, clasificación recalculada, estado persistente y transferencia íntegra de la competición.
    - Compartir por enlace o archivo debe transportar todo el estado necesario para reconstruir la competición, incluidos configuración, emparejamientos y resultados, no solo la lista inicial de participantes.
    - La dirección visual debe partir de productos deportivos actuales: densidad informativa controlada, jerarquía clara, tablas legibles, marcadores editables, navegación rápida por jornadas y estados inequívocos. No convertir una metáfora artística en el contenido principal si resta espacio o velocidad a datos que se consultan repetidamente.
    - Evitar paneles vacíos sobredimensionados, ilustraciones ornamentales dominantes, columnas que estrangulan el texto, paletas lúgubres de bajo contraste y acciones deshabilitadas que parecen activas. El primer viewport debe mostrar qué se configura y una anticipación realista de calendario, resultados y clasificación.
    - Antes de diseñar una TOOL deportiva, revisar referencias actuales del dominio y escribir qué patrones se adoptan para navegación, tabla, marcador, responsive y compartición. La identidad propia se aplica al acabado, no debe reemplazar las convenciones que permiten leer una competición de un vistazo.

27. **QA visual delegado por el usuario**:
    - Si el usuario indica que realizará personalmente el QA visual, no abrir ni controlar navegadores ni ejecutar automatización visual. Limitar la verificación propia a lógica, tipado, lint, tests y build, entregar la ruta de preview y esperar su revisión explícita.

28. **Gestores de liguillas para grupos reales**:
    - Una TOOL para llevar ligas round robin debe plantearse como un producto de uso compartido por un grupo, no como un generador abstracto. El nombre, slug, id, textos y navegación deben expresar gestión de liga, no solamente generación de calendario.
    - Debe admitir varias ligas independientes en `localStorage`, con biblioteca para crear, abrir, renombrar y eliminar cada competición sin sobrescribir las demás.
    - Cada liga debe conservar participantes, formato, calendario, jornada seleccionada, resultados y reglas de puntuación. La clasificación se recalcula con cada marcador y el enlace compartido debe reconstruir una copia íntegra de esa liga.
    - La pantalla principal de una liga debe priorizar el trabajo recurrente: cambiar de jornada, introducir resultados, consultar clasificación y compartir. La configuración inicial y la teoría del emparejamiento quedan en segundo plano.

29. **Carga de estilos verificada por slug inglés**:
    - El CSS de la TOOL debe llamarse exactamente como el `slug` declarado en `en.ts`: `src/tool/<tool-id>/<english-slug>.css`. El preview resuelve los estilos por ese slug, que puede ser una long tail distinta del `entry.id`.
    - Si el archivo CSS añade un prefijo, sufijo o variante al slug inglés, la TOOL queda bloqueada aunque el texto sea visualmente parecido: renombrar el archivo para que ambos valores coincidan carácter por carácter y verificar la inyección de la regla principal en la ruta compilada.
    - Antes del gate visual, comprobar en la ruta compilada que las reglas de clase específicas de la TOOL están cargadas. Una página con controles nativos sin estilizar, SVG negro o layout lineal bloquea inmediatamente `okQA`, aunque type-check, lint, tests y build pasen.

30. **Leyendas, badges y geometría deben pagar su significado**:
    - Cada símbolo de una leyenda debe aparecer realmente en el render y reproducir la misma forma, color y orientación que el elemento dibujado. Si el usuario no puede emparejar ambos de un vistazo, eliminar la leyenda o corregir la representación.
    - Prohibido mostrar como badge una garantía básica del algoritmo, como "todo conectado", cuando no informa una excepción ni habilita una decisión. Las garantías se prueban; los avisos visibles se reservan para estados que exigen atención o interpretación.
    - Puertas, uniones, flechas, marcadores y nodos deben anclarse a la geometría real. No se aceptan símbolos flotantes, orientación fija cuando la estructura cambia ni puntos sin etiqueta o función comprensible.

31. **Corrección directa en generadores visuales exportables**:
    - Cuando una TOOL genera un mapa, plano, diagrama o composición que el usuario exportará para una sesión real, evaluar explícitamente si necesita corrección manual. Si una generación imperfecta obliga a regenerarlo todo, incorporar edición local de los elementos esenciales o justificar por escrito por qué dañaría la intención.
    - Las ediciones deben verse en PNG/SVG y conservarse en cualquier formato de estado compartido que prometa reconstruir el resultado.

32. **Ningún control nuevo sin layout final**:
    - Después de añadir presets, botones, details, toolbars o acciones, volver a capturar el primer viewport antes de enseñarlo. Controles nativos amontonados, textos pegados, wrapping accidental o acciones fuera de jerarquía bloquean la presentación al usuario.

33. **SEO y contenido con criterio editorial**:
    - El texto SEO no puede ser una extensión genérica de la interfaz ni repetir etiquetas, advertencias o fórmulas sin enseñar una decisión del dominio. Cada bloque debe aportar contexto, interpretación, límites o una acción concreta que el usuario pueda aplicar.
    - Si el usuario considera pobre el SEO de una TOOL, ampliar el contenido con conocimiento del dominio que prepare una decisión: explicar el mecanismo, mostrar un ejemplo numérico, interpretar las señales, aclarar límites y proponer una forma de actuar. No rellenar con resúmenes de controles ni repetir la interfaz.
    - En utilidades simples de uso inmediato, como relojes, contadores o conversores directos, no añadir sellos de privacidad, avisos de funcionamiento local ni mensajes de marketing dentro del widget si no cambian una decisión del usuario. Reservar esas explicaciones para SEO, FAQ o notas de límites cuando aporten contexto funcional, legal o de seguridad.

34. **SEO editorial de herramientas de preview y auditoría**:
    - El título y la descripción deben nombrar el trabajo que resuelve la TOOL, no limitarse a describir una demo o una preview genérica.
    - El contenido SEO debe responder qué introduce el usuario, qué inspecciona, qué resultado obtiene y qué límites tiene la validación.
    - Cuando la TOOL muestra varios contextos simultáneamente, describirlos como una vista conjunta para obtener información; no usar lenguaje de versus, competición o comparativa salvo que esa sea la intención real.

35. **QA del referendum threshold calculator**:
    - El selector de denominador del approval quorum debe poder usar también el electorado cuando el usuario evalúa una regla de aprobación expresada como porcentaje de personas registradas; no limitarlo a all ballots o valid votes.
    - Ofrecer presets visibles para mayoría simple, mayoría absoluta del electorado y mayorías cualificadas frecuentes, manteniendo siempre editable el valor y mostrando qué denominador modifica cada preset.
    - El resultado debe poder compartirse mediante una URL que reconstruya los recuentos y las dos reglas sin enviar datos a un servidor. La vista responsive debe apilar la escena, las métricas y los controles sin desbordamiento horizontal en anchos móviles.

36. **Actualización reactiva del referendum threshold calculator**:
    - La decisión debe recalcularse mientras el usuario cambia cualquier recuento, umbral, modo, comparación o denominador; no exigir un botón separado de evaluación.
    - Las selecciones programáticas de presets y custom selects deben disparar la misma actualización, persistir el estado local y mantener el resultado sincronizado con los controles visibles.
