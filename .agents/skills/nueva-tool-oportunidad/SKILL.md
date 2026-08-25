---
name: nueva-tool-oportunidad
description: Crear, validar, traducir y preparar para publicar nuevas herramientas web del ecosistema jjlmoya-utils a partir de una oportunidad detectada.
---

# 🚀 SKILL: Creación de Nueva Utilidad desde Oportunidad (Ecosistema jjlmoya)

## 📋 PROPÓSITO
Guía automatizada para identificar, crear, validar, traducir y publicar una nueva herramienta web dentro del ecosistema `@jjlmoya/utils-*`.

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

## 🔎 REGLA DE SINCRONIZACIÓN Y SUGERENCIA

La skill debe sugerir oportunidades a partir de datos sincronizados del workspace, no de conclusiones ya empaquetadas por otro informe.

### Ubicación local de los repositorios

Los repositorios `jjlmoya-utils-*` ya están descargados como directorios hermanos de `ai-knows`, en `../`. Antes de implementar, resolver siempre el directorio local existente a partir de la etiqueta `repo:` y comprobar su estado con `git -C`; no clonar repositorios ni crear copias alternativas. El nombre local puede diferir del nombre inferido de la etiqueta, por lo que se debe localizar primero entre los directorios hermanos y usar la copia ya descargada. Si el repositorio propietario no existe localmente, detenerse e informar del bloqueo.

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

Cuando hay issues abiertas, no presentar tres oportunidades nuevas ni justificar por qué esta gana a las demás. Presentar:

- la issue más antigua, su enlace y que se eligió por FIFO;
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

### Regla de publicación sin ramas
- Trabajar y publicar directamente sobre `main`. No crear ramas de feature, release, hotfix ni ramas temporales.
- No crear PRs para estas herramientas salvo que el usuario lo pida expresamente.
- Antes de publicar, comprobar que el checkout está en `main`, limpio y sincronizado con `origin/main`.
- Ejecutar `npm run minor` únicamente sobre `main`, después de completar los quality gates. No ejecutarlo una segunda vez para trasladar un release ya creado: si el release se generó accidentalmente en otra rama, integrar ese commit en `main` mediante fast-forward y conservar su tag.

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
   - `<english-slug>.css`: Estilos Vanilla CSS estructurados con tokens `--n-*`; el nombre debe coincidir exactamente con el `slug` de `en.ts` para que el preview lo cargue.
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
    - Cuando una TOOL use tokens `--n-*`, aislar sus variables dentro de la card raíz de la propia TOOL además de declarar la paleta base, para evitar colisiones con tokens globales del proyecto consumidor. En modo oscuro, revisar también el contraste de etiquetas colocadas sobre ilustraciones o formas de color.
    - Si el usuario detecta una interfaz clonada, un contenedor sobredimensionado o sombras exteriores exageradas, detener el gate visual y hacer tres pasadas explícitas: adelgazar el cromo, redefinir la metáfora visual desde el problema y revisar la jerarquía de contenido y SEO. No solicitar `okQA` hasta comprobar el render tras las tres pasadas.
    - Si los presets parecen botones flotantes o la herramienta se percibe como paneles desconectados, agruparlos dentro de una única card estructural con separadores internos y revisar el render antes de continuar.
    - Cuando una vista Astro genere filas, opciones u otro HTML dinámico como cadena, insertar la cadena explícitamente con `set:html` o construir nodos tipados; nunca interpolarla como texto, porque el render puede mostrar las etiquetas HTML al usuario.
    - En cualquier TOOL de temperatura, mostrar el símbolo `°` junto a cada unidad y ofrecer un conmutador global visible entre `Metric °C` e `Imperial °F`; inputs, rangos, resultados, tablas, estado persistido y etiquetas deben cambiar sin alterar la temperatura física subyacente.
    - Si el usuario identifica un negro verdoso o lavado en el tema oscuro, redefinir la paleta hacia negros carbón reales y reservar los tonos verdes para reflejos o estados funcionales; volver a revisar contraste y render antes del gate visual.
    - Si una captura muestra una calculadora como dashboard oscuro genérico, una metáfora que solo adorna el formulario, una cifra principal que rompe sus unidades, o un badge que no coincide con el preset activo, detener la presentación y rehacer composición, tipografía, formato de cifras y estados antes de continuar.
    - Verificar que la etiqueta `repo:jjlmoya-utils-*` coincide con la categoría funcional de la oportunidad; si no coincide, corregir la etiqueta y la referencia de repositorio de la issue antes de seleccionar la implementación.

14. **Separación estricta entre TOOL y widget**:
    - `title`, `description`, `slug`, FAQ, HowTo y SEO pertenecen a `ToolLocaleContent` y a los componentes de página. Nunca duplicar `title` o `description` dentro de `ui.ts`, `component.astro` o el widget interactivo.
    - El widget debe comenzar por el control funcional y sus resultados; el título y la descripción de la TOOL los renderiza la página consumidora.

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
    - Si aparecen títulos duplicados, descripciones dentro del widget, aspecto de Excel, arte genérico o el cromo de otra TOOL (rail de presets, ticket/sello, workshop, misma rejilla de chips y sliders), corregirlo antes de solicitar `okQA`.

19. **Prohibido clonar tools anteriores**:
    - Cada TOOL se inventa desde su problema, no desde la memoria de la última TOOL ni desde un hermano del repo.
    - Prohibido abrir `component.astro`, CSS, `controller.ts` o `dom-views.ts` de otra utilidad para copiar layout, metáfora, paleta, jerarquía, gestos o nombres de clases. Esas copias producen el mismo taller con otro dibujo.
    - De otros tools solo se pueden leer contratos: `entry.ts`, `index.ts`, `tools.ts`, `entries.ts`, `types.ts`, tests de conteo, schemas, i18n shape, eslint y stylelint.
    - La escena, los controles y el resultado deben ser la respuesta a ESTA ficha: qué cuenta el usuario, qué ve, qué toca. Si la interfaz funcionaría igual cambiando las etiquetas, está mal.
    - Antes de programar, escribir en una frase la metáfora que solo tiene sentido para esta TOOL. Si la frase sirve para una cadena de bici, un LED o un resistor, tirarla y empezar otra.

17. **Estándar de producción sin placeholders**:
    - Todo lo que se cree bajo esta skill está destinado a producción. No usar placeholders, texto de relleno, preguntas numeradas sin significado, lorem ipsum, valores ficticios ni estructuras sintéticas para satisfacer tests.
    - FAQ, HowTo, SEO, schemas, títulos, descripciones, labels, estados y mensajes deben ser contenido final, específico de la herramienta, útil para el usuario y revisado en su idioma. Prohibido generar contenido como `Question 1`, `Tool title: 2`, repetir una descripción para rellenar bloques o sustituir una traducción real por el texto inglés.
    - La paridad de cantidad y tipos de bloques debe resolverse traduciendo contenido real bloque a bloque. Nunca se puede conseguir mediante arrays fabricados, copias masivas, repetición de una misma frase o un helper que sintetice contenido.
    - Si falta información para escribir contenido final, detener la implementación de esa parte y pedirla o investigarla; no dejar una versión provisional en el repositorio ni presentarla como terminada.
    - Antes de `okQA`, buscar explícitamente placeholders y contenido sintético en todo el árbol de la TOOL, incluyendo SEO, FAQ, HowTo, schemas, i18n y estados vacíos. Una sola coincidencia bloquea el gate.

18. **Bibliografía breve, primaria y específica**:
    - Incluir pocas fuentes: por defecto 2 fuentes y solo ampliar a 3 si una decisión importante de la herramienta queda sin respaldo.
    - Cada fuente debe respaldar directamente una fórmula, rango, unidad, definición, procedimiento o afirmación concreta de esa TOOL. Preferir documentación primaria, organismos profesionales, universidades, fabricantes o publicaciones técnicas originales.
    - Priorizar la fuente oficial aunque esté publicada en un idioma distinto al locale de la TOOL. No sustituir una norma, organismo o documento oficial por una fuente secundaria solo para igualar el idioma de la interfaz.
    - Enlazar la página exacta que contiene la evidencia. Prohibidos como fuente bibliográfica las homepages, páginas de categoría, centros de recursos genéricos, resultados de búsqueda, listas de enlaces y artículos que solo traten el tema de forma tangencial.
    - No añadir fuentes para aparentar rigor ni repetir varias fuentes que sostengan la misma afirmación. La bibliografía debe ser corta, trazable y visible en la sección de referencias con nombre de la fuente, título específico y URL directa.
    - Antes de `okQA`, revisar cada enlace y anotar internamente qué parte concreta de la calculadora justifica. Si una fuente no permite justificar una decisión concreta, eliminarla o sustituirla.
    - La bibliografía debe respaldar la ciencia, disciplina o procedimiento que el usuario estudia con la TOOL, no la tecnología usada para implementarla. En una herramienta científica, médica, acústica o técnica, citar investigaciones, normas y métodos del dominio; no citar Web APIs, frameworks, Canvas, Web Audio, lenguajes ni documentación de plataforma salvo que la propia TOOL enseñe específicamente ese estándar web.
    - En testers de cámara, audio o comunicación, citar guías y estudios sobre iluminación, encuadre, legibilidad visual, calidad perceptual o preparación de videollamadas. Las especificaciones de `getUserMedia`, WebRTC, Canvas o callbacks de frames son documentación interna de implementación y no pertenecen a la bibliografía visible.

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
