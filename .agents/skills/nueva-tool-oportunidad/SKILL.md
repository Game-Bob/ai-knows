---
name: nueva-tool-oportunidad
description: Crear, validar, traducir y preparar para publicar nuevas herramientas web del ecosistema jjlmoya-utils a partir de una oportunidad detectada.
---

# 🚀 SKILL: Creación de Nueva Utilidad desde Oportunidad (Ecosistema jjlmoya)

## 📋 PROPÓSITO
Guía automatizada para identificar, crear, validar, traducir y publicar una nueva herramienta web dentro del ecosistema `@jjlmoya/utils-*`.

---

## 🔄 REGLA PRINCIPAL: BACKLOG DE `ai-knows` ANTES QUE DISCOVERY

`ai-knows` es el orquestador y su backlog de issues aceptadas es la cola de trabajo canónica. Cada ejecución de esta skill debe seguir este loop:

1. Consultar primero las issues abiertas de `Game-Bob/ai-knows` con `gh issue list --repo Game-Bob/ai-knows --state open`.
2. Si existe al menos una issue abierta con una etiqueta `repo:jjlmoya-utils-*`, seleccionar la siguiente oportunidad priorizada y trabajar sobre ella. No ejecutar discovery ni crear otra issue en este ciclo.
3. Si hay varias issues, priorizarlas en este orden:
   - urgencia o prioridad explícita en etiquetas o en el cuerpo de la issue;
   - evidencia de tráfico o intención de búsqueda fuerte y concreta;
   - utilidad transversal, alcance client-side y bajo riesgo de validación;
   - menor dependencia de datos externos o de otro repositorio;
   - antigüedad de la issue como desempate.
4. Antes de implementar una issue seleccionada, leer su título, cuerpo, etiquetas, comentarios y el repositorio propietario indicado por la etiqueta `repo:`. Confirmar que el alcance sigue siendo coherente y detectar duplicados.
5. Si no hay ninguna issue abierta de utilidad, pasar al discovery descrito abajo.
6. Cuando el usuario acepte una oportunidad nueva descubierta, crear una issue en `Game-Bob/ai-knows` con `gh issue create`, incluyendo la etiqueta `repo:jjlmoya-utils-<categoría>`, el alcance, la razón de priorización y la relación con los datos observados. No saltar directamente a implementar esa oportunidad en el mismo ciclo: la siguiente ejecución debe recogerla desde el backlog abierto.
7. Después de crear la issue, detener la fase de discovery y entregar el enlace y la prioridad propuesta. La implementación comienza en una ejecución posterior, cuando la issue sea la siguiente seleccionada.

Una issue solo deja de ser parte de la cola cuando se implementa y se cierra con evidencia, o cuando se descarta explícitamente como no planificada. No crear issues duplicadas si ya existe una oportunidad equivalente abierta.

## 🔎 REGLA DE SINCRONIZACIÓN Y SUGERENCIA

La skill debe sugerir oportunidades a partir de datos sincronizados del workspace, no de conclusiones ya empaquetadas por otro informe.

### Fuente y orden de lectura obligatorio

1. Antes de analizar una oportunidad, ejecutar `npm run sync` en `ai-knows` para actualizar los Markdown de sitemap y los datos disponibles. Este flujo no inspecciona repositorios de utilidades.
2. Ejecutar después `npm run discover` para actualizar la demanda de búsquedas y cruzarla con los sitemaps publicados.
3. Usar como fuentes principales las tablas de detalle recién generadas en `data/notebooklm/global-suggest-engine.md` y los sitemaps ligeros `data/notebooklm/gamebob.dev-sitemap.md` y `data/notebooklm/jjlmoya.es-sitemap.md`.
4. Ignorar los resúmenes ejecutivos, rankings y recomendaciones que aparezcan dentro de esos Markdown. Leer las filas y URLs de detalle para construir una conclusión propia.
5. Leer los sitemaps para comprobar cobertura por URL, slug, título y categoría. La ausencia de una URL o de una intención equivalente es una señal de hueco, no una prueba suficiente por sí sola.
6. Contrastar cada posible oportunidad con las filas de intención de búsqueda, su tipo, su categoría y sus señales de repetición o volumen presentes en los datos sincronizados.
7. Si se usan otros `.md` de `data/notebooklm`, clasificarlos explícitamente como dato primario, contexto o conclusión derivada. Nunca usar un informe de conclusiones como sustituto de las filas de datos.

### Fuentes prohibidas como autoridad

- `data/notebooklm/curated-opportunities.md` no se debe usar para elegir, priorizar ni describir una oportunidad.
- `data/notebooklm/curated-social-leads.md`, `data/notebooklm/social-opportunities.md` y `data/notebooklm/social-traffic-outreach.md` no se deben usar como fuente principal de demanda de búsqueda.
- No asumir que una oportunidad sigue abierta porque aparezca en un informe anterior. La sincronización actual y el sitemap tienen prioridad.
- No inspeccionar repositorios `jjlmoya-utils-*`, `jjlmoya` ni `website` para decidir si existe un hueco. La skill de nueva herramienta solo debe sugerir; la validación del repositorio ocurre después, fuera de esta fase.

### Resultado mínimo de la sugerencia

Cuando hay issues abiertas, no presentar tres oportunidades nuevas. Presentar:

- la issue seleccionada y su enlace;
- la evidencia que justifica su prioridad frente a las demás abiertas;
- el repositorio propietario y la etiqueta usada;
- el alcance que se va a implementar;
- dependencias, riesgos y criterio de cierre.

Solo cuando no haya issues abiertas de utilidad se aplica el formato de tres opciones comparables:

Antes de implementar, entregar tres opciones comparables basadas en evidencia y señalar cuál se recomienda:

- oportunidad y slug propuesto para cada opción;
- categoría inferida desde los datos;
- consultas o familias de consultas observadas, citadas literalmente desde el informe sincronizado;
- cobertura encontrada en los sitemaps y por qué no satisface la intención;
- propuesta de valor, entradas, cálculo o transformación y resultado esperado;
- fricción de uso, complejidad técnica y límites de cada opción;
- recomendación final explicando por qué gana una opción y por qué se descartan las otras dos.

No copiar el ranking ni la narrativa de otro informe. Las tres propuestas deben poder reconstruirse desde las filas de búsqueda y las URLs del sitemap.

---

## 🔄 FLUJO DE TRABAJO OBLIGATORIO POR FASES

### Fase 1: Identificación e Inspiración cuando el backlog está vacío
1. Ejecutar primero la consulta de issues abiertas descrita en la regla principal. Solo si no hay ninguna issue abierta de utilidad, sincronizar los datos con `npm run sync` y después con `npm run discover`. Si cualquiera de las sincronizaciones falla, informar del fallo y no presentar una oportunidad como actual.
2. Analizar las tablas de detalle de `global-suggest-engine.md` junto con `gamebob.dev-sitemap.md` y `jjlmoya.es-sitemap.md`. Usar otros Markdown solo para contexto trazable y nunca para repetir conclusiones.
3. Si el backlog está vacío, proponer tres herramientas candidatas al usuario especificando:
   - Nombre de la utilidad y categoría objetivo (`jjlmoya-utils-<categoría>`).
   - Intención de búsqueda SEO y propuesta de valor única.
   - Presets predefinidos y conceptos visuales.
4. Si el usuario acepta una de las candidatas, crear primero su issue en `Game-Bob/ai-knows` con la etiqueta `repo:jjlmoya-utils-<categoría>` y esperar a una ejecución posterior del loop. No iniciar la Fase 2 en esta misma ejecución.

5. Cuando se haya seleccionado una issue existente, resolver antes de implementar las preguntas reales de la ficha de oportunidad:
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
   - `<tool-id>.css`: Estilos Vanilla CSS estructurados con tokens `--n-*`.
   - `component.astro`: Vista de la herramienta pre-renderizada en SSR con hidratación limpia vía `<script is:inline type="application/json">`.
   - `bibliography.ts` & `bibliography.astro`: Citas bibliográficas autoritativas.
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
   - Usar la capacidad de generación de imágenes disponible, con estilo *Artist Ink and Watercolor* y formato `1:1` (PROHIBIDO 16:9 u otros formatos).
   - Convertir a WebP en `/d/code/jjlmoya` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```bash
     cd /d/code/jjlmoya
     node scripts/convert-image-to-webp.mjs <ruta-imagen-generada> public/images/og/<slug-es>.webp
     ```
   - Convertir a WebP en `/d/code/website` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```bash
     cd /d/code/website
     node scripts/image-to-webp.mjs <ruta-imagen-generada> public/images/og/<slug-en>.webp
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

3. **Cero Comentarios en Código (`no-comments/disallowComments`)**:
   - CERO comentarios en `.ts`, `.astro`, `.css`, `.json`. En bloques catch vacíos, usar `catch {}`.

4. **Variables CSS en Stylelint (`scale-unlimited/declaration-strict-value` y Hex Cortos)**:
   - Declarar todas las variables de color en `:root` y `.theme-dark` (`--n-*`).
   - Usar notación hex corta (ej. `#fff` en lugar de `#ffffff`).

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

12. **Auto-Refinamiento**:
    - Si el usuario detecta cualquier discrepancia o aspecto a mejorar, actualizar inmediatamente este documento antes de proseguir.

13. **Separación estricta entre TOOL y widget**:
    - `title`, `description`, `slug`, FAQ, HowTo y SEO pertenecen a `ToolLocaleContent` y a los componentes de página. Nunca duplicar `title` o `description` dentro de `ui.ts`, `component.astro` o el widget interactivo.
    - El widget debe comenzar por el control funcional y sus resultados; el título y la descripción de la TOOL los renderiza la página consumidora.

14. **Identidad artística y experiencia de museo usable**:
    - Cada TOOL debe sentirse como una pieza de museo interactiva: una identidad visual propia, una composición memorable, una respuesta clara a los inputs y un resultado que apetezca explorar.
    - La técnica es una decisión de diseño, no una obligación: puede usar SVG, CSS, canvas, DOM, animación o una combinación de ellas. `dom-views.ts` debe concentrar la representación visual dinámica cuando exista.
    - Una cuadrícula de tarjetas, barras, tablas o un panel que parezca una hoja de cálculo no cuenta como dirección artística principal. Los gráficos auxiliares pueden existir, pero no sustituir la escena, metáfora visual o composición central.
    - No basta con añadir un gráfico a un formulario. La dirección artística debe gobernar la composición completa: controles, jerarquía, resultado, movimiento, estados, feedback y microinteracciones deben pertenecer al mismo lenguaje visual.
    - Un listado de valores debajo de un gráfico no es una visualización artística por sí mismo. Los datos deben estar integrados en una composición legible, alineada y con una función interpretativa clara.
    - Antes de programar, definir la metáfora visual, la paleta, la jerarquía, el gesto de interacción y el detalle distintivo que hará que el usuario quiera usarla.

15. **Gate visual antes de QA**:
    - Revisar la captura o render de la herramienta antes de presentarla como lista para QA.
    - Si aparecen títulos duplicados, descripciones dentro del widget, aspecto de Excel o arte genérico, corregirlo antes de solicitar `okQA`.

16. **Estándar de producción sin placeholders**:
    - Todo lo que se cree bajo esta skill está destinado a producción. No usar placeholders, texto de relleno, preguntas numeradas sin significado, lorem ipsum, valores ficticios ni estructuras sintéticas para satisfacer tests.
    - FAQ, HowTo, SEO, schemas, títulos, descripciones, labels, estados y mensajes deben ser contenido final, específico de la herramienta, útil para el usuario y revisado en su idioma. Prohibido generar contenido como `Question 1`, `Tool title: 2`, repetir una descripción para rellenar bloques o sustituir una traducción real por el texto inglés.
    - La paridad de cantidad y tipos de bloques debe resolverse traduciendo contenido real bloque a bloque. Nunca se puede conseguir mediante arrays fabricados, copias masivas, repetición de una misma frase o un helper que sintetice contenido.
    - Si falta información para escribir contenido final, detener la implementación de esa parte y pedirla o investigarla; no dejar una versión provisional en el repositorio ni presentarla como terminada.
    - Antes de `okQA`, buscar explícitamente placeholders y contenido sintético en todo el árbol de la TOOL, incluyendo SEO, FAQ, HowTo, schemas, i18n y estados vacíos. Una sola coincidencia bloquea el gate.

17. **Bibliografía breve, primaria y específica**:
    - Incluir pocas fuentes: por defecto 2 fuentes y solo ampliar a 3 si una decisión importante de la herramienta queda sin respaldo.
    - Cada fuente debe respaldar directamente una fórmula, rango, unidad, definición, procedimiento o afirmación concreta de esa TOOL. Preferir documentación primaria, organismos profesionales, universidades, fabricantes o publicaciones técnicas originales.
    - Enlazar la página exacta que contiene la evidencia. Prohibidos como fuente bibliográfica las homepages, páginas de categoría, centros de recursos genéricos, resultados de búsqueda, listas de enlaces y artículos que solo traten el tema de forma tangencial.
    - No añadir fuentes para aparentar rigor ni repetir varias fuentes que sostengan la misma afirmación. La bibliografía debe ser corta, trazable y visible en la sección de referencias con nombre de la fuente, título específico y URL directa.
    - Antes de `okQA`, revisar cada enlace y anotar internamente qué parte concreta de la calculadora justifica. Si una fuente no permite justificar una decisión concreta, eliminarla o sustituirla.
