---
name: nueva-tool-oportunidad
description: Busca oportunidades de herramientas no creadas usando los datos de ai-knows, propone la tool al usuario, la implementa con create-tool en jjlmoya-utils-<categoría>, espera okQA, traduce a 15 idiomas, publica con npm run minor, actualiza dependencias en jjlmoya y website, genera y convierte las imágenes open-graph en WebP, y commiteas con --no-verify.
---

# Flujo de Nueva Herramienta por Oportunidad

Este workflow automatiza la detección de herramientas con alta oportunidad en `ai-knows`, su implementación modular en la librería de utilidades correspondiente (`jjlmoya-utils-<categoría>`), la verificación QA estricta, la traducción a los 15 idiomas soportados, la publicación de la versión menor y la sincronización con los consumidores finales (`jjlmoya` y `website`).

---

## 📋 REGLAS GENERALES Y OBLIGATORIAS

- **SOLID Principles**: Todo en componentes y módulos separados de responsabilidad única.
- **Cero Comentarios**: Prohibidos comentarios en TypeScript, Astro, CSS, JSON (incluso dentro de catch vacíos).
- **Cero Emojis**: Prohibidos en código, textos de la web, mensajes de commit o descripciones.
- **Sin Títulos Redundantes**: No renderizar `<h1>`, `<h2>` ni barras superiores (`.sc-topbar`) dentro de `component.astro` (la plantilla `UtilityHeader` ya los provee).
- **UNA Sola Card Compacta Integrada**: Toda la herramienta debe construirse dentro de un ÚNICO contenedor principal (`.sc-main-card`), dividida internamente en sidebar lateral de controles/inputs y panel derecho de resultados/visualizador interactivo. PROHIBIDO crear múltiples tarjetas o islas sueltas flotantes.
- **Selects Nativos Totalmente PROHIBIDOS**: Queda terminantemente prohibido el uso de `<select>` y `<option>` nativos del navegador por su diseño tosco e inconsistente. Construir SIEMPRE Custom Selects (`.sc-custom-select`) con trigger estilizado, chevron SVG personalizado, accesibilidad ARIA y opciones interactivas con estados active/focus claros.
- **Modo Claro y Oscuro 100% Optimizados**: Máxima legibilidad y contraste en ambos temas. Definir tokens CSS con prefijo `--n-*` tanto en el selector raíz como en `.theme-dark`.
- **Proporciones Reales en SVGs (Cero Achatamiento)**: Mantener un `viewBox` espacioso (ej. 600x260) y altura generosa (220px-280px). Prohibido achatar con `preserveAspectRatio="none"` o alturas inferiores a 200px.
- **Formateo Limpio de Unidades**: Mostrar unidades breves (`m`, `ft`, `kn`, `kg`), jamás concatenar cadenas largas de botones como `Metric (m)`.
- **ART Manifesto & Ergonomic Questions ("No construimos Excels, construimos ARTE")**:
  1. *¿Puede hacerse con menos inputs?*
  2. *¿Pueden ser los inputs más cómodos, táctiles y naturales (sliders, chips visuales, presets rápidos)?*
  3. *¿Podría ser esta interfaz significativamente más bonita, visual y viva?* ¡Si la respuesta es sí, mejórala de inmediato!
  4. *¿Puedo facilitarle la vida al usuario?* Si es SÍ -> ¡hazlo ya!

- **Preguntas Obligatorias de Auto-Reflexión UX y Diseño (Siempre responderlas explícitamente al usuario)**:
  1. **¿Esto puede ser más bonito?** (UI de alto impacto, temática marítima/específica, glassmorphism, contrastes impecables en claro y oscuro).
  2. **¿Esto puede ser más útil para el usuario?** (Presets inteligentes de barco/fondo, sliders interactivos, conversiones instantáneas).
  3. **¿Esto podría simplificarse?** (Reducir fatiga de entrada sin perder precisión matemática).
  4. **¿Podría hacer algo para que el usuario lo disfrute más?** (Microinteracciones, animaciones dinámicas en SVG, retroalimentación táctil).
  5. **¿Son los resultados suficientemente visuales?** (Medidores, cotas náuticas, diagramas en tiempo real, badges de estado).
  6. **¿Puedo aportar algo más al usuario?** (Consejos dinámicos de tenedero, cálculo de catenaria, radio de borneo).

- **Preguntas Obligatorias de Auto-Reflexión SEO y Contenido (Siempre responderlas explícitamente al usuario)**:
  1. **¿Esto es útil para el usuario?** (Aporta valor práctico real, cálculos fiables y resuelve una necesidad concreta sin paja ni relleno).
  2. **¿Esto responde a la intención de búsqueda?** (Cubre la query objetivo con exactitud, respondiendo al "qué", "cómo" y "por qué" de la búsqueda).
  3. **¿Puedo aportar mayor utilidad al usuario final?** (Proporciona tablas comparativas, alertas diagnósticas, tips accionables, preguntas frecuentes y fuentes autoritativas que superan a cualquier competidor).
- **PowerShell Syntax**: En Windows PowerShell usar `;` para encadenar comandos en vez de `&&`.
- **Git Commits y Push**: Usar siempre `--no-verify`.

---

## 🔄 FASES DEL PROCESO

### Fase 1: Identificación y Propuesta
1. Analizar informes de oportunidades en `d:\code\ai-knows` para localizar utilidades no implementadas con alta demanda y bajo esfuerzo.
2. Identificar el repositorio destino: `d:\code\jjlmoya-utils-<categoria>`.
3. Proponer al usuario el concepto de la herramienta, explicando su valor, UX interactivo y enfoque visual.

### Fase 2: Implementación Modular en Inglés (English-First)
1. Crear la estructura en `src/tool/<tool-id>/`:
   - `logic.ts`: Lógica matemática/algorítmica pura (funciones < 25 líneas, parameter objects para evitar `max-params`).
   - `logic.test.ts`: 100% test coverage de lógica y casos límite.
   - `storage.ts`: Persistencia con `localStorage` en bloques `try/catch` limpios (< 20 líneas).
   - `evaluator.ts`: Reglas de estado y evaluación.
   - `dom-views.ts`: Generación de marcado HTML dinámico y actualización visual (< 25 líneas por función).
   - `controller.ts`: Clase controladora de eventos, custom selects y ciclo de vida (< 25 líneas por método).
   - `component.astro`: Vista Astro compacta (< 150 líneas) en una única card conectada a `controller.ts`.
   - `ui.ts`: Interfaz `ToolUI` con TODOS los textos parametrizados.
   - `bibliography.ts`: Fuentes oficiales y referencias bibliográficas.
   - `<tool-id>.css`: Estilos visuales adaptados a modo oscuro/claro con tokens del sistema.
2. Registrar en `src/tools.ts`, `src/entries.ts` y en `src/category/index.ts`.
3. Crear `i18n/en.ts` con >300 palabras de contenido SEO, FAQs y HowTo.
4. Pausar y esperar el **`okQA` explícito del usuario** antes de traducir.

### Fase 3: Localización a 15 Idiomas
1. Crear los 15 archivos de localización en `src/tool/<tool-id>/i18n/`:
   - `de.ts`, `en.ts`, `es.ts`, `fr.ts`, `id.ts`, `it.ts`, `ja.ts`, `ko.ts`, `nl.ts`, `pl.ts`, `pt.ts`, `ru.ts`, `sv.ts`, `tr.ts`, `zh.ts`.
2. Para idiomas logográficos (`ja`, `ko`, `zh`), el slug debe ser idéntico al inglés (`<tool-id>`). Para los demás, traducir y localizar el slug.
3. Exportar en cada archivo `schemas: [faqSchema, howToSchema, appSchema]` tipados con `schema-dts`.
4. Registrar los 15 loaders en `entry.ts`.

### Fase 4: Quality Gates Automatizados
Ejecutar en `d:\code\jjlmoya-utils-<categoria>`:
1. `npm run type-check` (0 errores).
2. `npm run lint` (0 errores ESLint y Stylelint).
3. `npm run test` (100% test suites superados).
4. `npm run build` (0 errores).

### Fase 5: Publicación y Sincronización
1. En `d:\code\jjlmoya-utils-<categoria>`:
   ```powershell
   git add -A; git commit -m "feat: add <tool-id> utility" --no-verify; git push --no-verify; npm run minor
   ```
2. Esperar publicación en npm (1-2 minutos) y actualizar en los consumidores:
   - En `d:\code\jjlmoya`: `npm run update <categoria>`
   - En `d:\code\website`: `npm run update <categoria>`
3. Generar imagen OpenGraph (estilo Artist Ink & Watercolor, SIEMPRE CUADRADA 1:1):
   - Usar `generate_image` con `AspectRatio: '1:1'` (PROHIBIDO 16:9 u otros formatos).
   - Convertir en `d:\code\jjlmoya` usando el script oficial:
     ```powershell
     node scripts/convert-image-to-webp.mjs <ruta-imagen-generada> public/images/utilities/<slug-es>.webp
     ```
   - Convertir en `d:\code\website` usando el script oficial:
     ```powershell
     node scripts/image-to-webp.mjs <ruta-imagen-generada> public/images/utilities/<slug-en>.webp
     ```
   - PROHIBIDO reimplementar scripts de conversión en línea de comandos. Usar SIEMPRE los scripts del repositorio.
4. Commit y push con `--no-verify` en `jjlmoya` y `website`.

---

## 🛠️ SECCIÓN DE TROUBLESHOOTING Y REGLAS ANTIFALLOS

1. **Límites de ESLint (max-params <= 4, max-lines-per-function <= 30)**:
   - En funciones con más de 4 parámetros, agruparlos siempre en una interfaz de objeto (`ParamsObject`, `ElementsObject`).
   - Evitar expresiones ternarias anidadas (`no-nested-ternary`). Usar funciones auxiliares cortas.

2. **Custom Selects en Lugar de Selects Nativos**:
   - Construir siempre con control de apertura, selección de valor y cierre al hacer clic fuera.
   - En `controller.ts`, sincronizar el valor interno con el texto del botón trigger y las clases activas

3. **Cero Comentarios en Código (`no-comments/disallowComments`)**:
   - CERO comentarios en `.ts`, `.astro`, `.css`, `.json`. En bloques catch vacíos, usar `catch { return; }` o `catch {}`.

4. **Variables CSS en Stylelint (`scale-unlimited/declaration-strict-value`)**:
   - Declarar todas las variables de color en `:root` o en `.${componente}` (`--n-*`) y usarlas en todas las propiedades `color`, `background-color`, `border-color`.

5. **Trío Obligatorio de Schemas JSON-LD en los 15 Idiomas**:
   - `SoftwareApplication`, `FAQPage` y `HowTo` en todos los archivos de idioma.

6. **Reglas Estrictas de Diacríticos y Escritura Nativa en i18n**:
   - **Ruso (`ru.ts`)**: Escribir SIEMPRE en alfabeto cirílico auténtico (ej. `Калькулятор длины якорной цепи`), NUNCA transliteración latina.
   - **Español (`es.ts`)**: Preguntas y exclamaciones con signos de apertura obligatorios `¿...?` e `¡...!`.
   - **Alemán (`de.ts`)**: Usar diacríticos auténticos (`ä`, `ö`, `ü`, `ß`).
   - **Italiano (`it.ts`)**: Usar vocales acentuadas auténticas (`à`, `è`, `é`, `ì`, `ò`, `ù`).
   - **Polaco (`pl.ts`)**: Usar caracteres polacos auténticos (`ą`, `ć`, `ę`, `ł`, `ń`, `ó`, `ś`, `ź`, `ż`).
   - **Turco (`tr.ts`)**: Usar caracteres turcos auténticos (`ç`, `ğ`, `ı`, `ö`, `ş`, `ü`).
   - Cada archivo `i18n/<locale>.ts` DEBE exportar `schemas: [faqSchema, howToSchema, appSchema]` con `schema-dts`.

6. **Basura Tipográfica Prohibida (`no_en_dash.test.ts`)**:
   - Usar EXCLUSIVAMENTE apóstrofe recto ASCII `'`, comillas rectas `"`, guion estándar `-`, tres puntos `...`. NUNCA poner espacio antes de dos puntos (` : `) en francés/turco.

7. **Separadores Prohibidos en Títulos SEO (`title_quality.test.ts`)**:
   - NUNCA usar guiones `-` ni barras `|` en títulos de secciones SEO.

8. **Actualización del Conteo de Herramientas en Tests**:
   - Al añadir una nueva herramienta a una categoría, actualizar `expect(ALL_TOOLS.length).toBe(N)`.

9. **Auto-Refinamiento**:
   - Si el usuario detecta cualquier discrepancia o aspecto a mejorar, actualizar inmediatamente este documento antes de proseguir.
