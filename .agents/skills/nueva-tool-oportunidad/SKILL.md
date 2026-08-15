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
   - `logic.ts`: Lógica matemática/algorítmica pura (funciones < 25 líneas).
   - `storage.ts`: Persistencia con `localStorage` en bloques `try/catch` limpios.
   - `evaluator.ts`: Reglas de estado y evaluación.
   - `dom-views.ts`: Generación de marcado HTML dinámico y actualización visual.
   - `controller.ts`: Clase controladora de eventos y ciclo de vida.
   - `component.astro`: Vista Astro compacta (< 150 líneas) conectada a `controller.ts`.
   - `ui.ts`: Interfaz `ToolUI` con TODOS los textos parametrizados.
   - `bibliography.ts`: Fuentes oficiales y referencias bibliográficas.
   - `<tool-id>.css`: Estilos visuales adaptados a modo oscuro/claro con tokens del sistema.
2. Registrar en `src/tools.ts` y en `src/category/index.ts`.
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
3. Generar imágenes OpenGraph (estilo Artist Ink & Watercolor):
   - En `d:\code\jjlmoya`: `public/images/utilities/<slug-es>.webp`
   - En `d:\code\website`: `public/images/utilities/<slug-en>.webp`
4. Commit y push con `--no-verify` en `jjlmoya` y `website`.

---

## 🛠️ SECCIÓN DE TROUBLESHOOTING Y REGLAS ANTIFALLOS (HACER ESPECIAL HINCAPIÉ)

Revisar esta lista antes de programar y antes de correr los tests para evitar errores recurrentes:

### 1. Arquitectura SOLID y Límites Estrictos de ESLint
- **Error**: Meter scripts largos en `component.astro` disparando `max-lines (>250)`, `max-lines-per-function (>30)`, `complexity (>8)` o `max-params (>4)`.
- **Regla preventiva**: Separar SIEMPRE desde el inicio:
  - `logic.ts`: Funciones puras cortas (< 25 líneas).
  - `storage.ts`: Lectura y escritura en `localStorage` (< 20 líneas).
  - `evaluator.ts`: Lógica de evaluación/escaneo (< 25 líneas).
  - `dom-views.ts`: Renderizado DOM y generadores de HTML (< 25 líneas).
  - `controller.ts`: Clase que instancia y orquestar listeners (< 25 líneas por método).
  - `component.astro`: Solo HTML base + import del controller (< 150 líneas total).

### 2. Prohibición Absoluta de Comentarios (`no-comments/disallowComments`)
- **Error**: Añadir comentarios `//` o `/* */` en cualquier parte, incluidos bloques catch vacíos (`catch { // ignored }`).
- **Regla preventiva**: CERO comentarios en `.ts`, `.astro`, `.css`, `.json`. En bloques catch vacíos, usar `catch { return; }` o simplemente `catch {}` sin texto ni comentarios.

### 3. Cero Textos Hardcodeados en Inglés (I18n Dinámica al 100%)
- **Error**: Dejar strings en inglés dentro de funciones JS (ej. `'Safe to Travel'`, `'Overstay'`, `'days'`, `'Clear All'`, nombres de ejemplos).
- **Regla preventiva**: Definir todas las cadenas en `ui.ts`. Pasar `ui` serializado como JSON en `data-i18n={JSON.stringify(ui)}` en el elemento raíz. En `controller.ts`, recuperar `JSON.parse(appEl.dataset.i18n)` y construir dinámicamente todos los textos usando `.replace('{key}', ...)`.

### 4. Trío Obligatorio de Schemas JSON-LD en los 15 Idiomas
- **Error**: `schemas_fulfillment.test.ts` falla con `missing FAQPage schema` o `missing HowTo schema`.
- **Regla preventiva**: Cada archivo `i18n/<locale>.ts` DEBE exportar:
  ```typescript
  import type { WithContext, FAQPage, HowTo, SoftwareApplication } from 'schema-dts';
  // ...
  const faqSchema: WithContext<FAQPage> = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: ... };
  const howToSchema: WithContext<HowTo> = { '@context': 'https://schema.org', '@type': 'HowTo', name: title, description, step: ... };
  const appSchema: WithContext<SoftwareApplication> = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: title, description, applicationCategory: 'TravelApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, inLanguage: '<locale>' };
  // ...
  export const content = { ..., schemas: [faqSchema, howToSchema, appSchema] };
  ```

### 5. Basura Tipográfica Prohibida (`no_en_dash.test.ts`)
- **Error**: El generador de texto inserta apóstrofes curvados (`’`, `‘`), comillas curvadas (`“`, `”`), rayas (`–`, `—`), puntos suspensivos (`…`), comillas francesas (`«`, `»`) o espacios antes de dos puntos (` : `) en `fr.ts`, `it.ts`, `tr.ts`.
- **Regla preventiva**: Usar EXCLUSIVAMENTE apóstrofe recto ASCII `'`, comillas rectas `"`, guion estándar `-`, tres puntos `...`. NUNCA poner espacio antes de dos puntos (` : `).

### 6. Separadores Prohibidos en Títulos SEO (`title_quality.test.ts`)
- **Error**: Títulos dentro del array `seo` con guiones `-` o barras `|` (ej. `"Grundprinzipien des Rollierenden Schengen-Fensters"`).
- **Regla preventiva**: NUNCA usar guiones `-` ni barras `|` en títulos de secciones SEO. Usar palabras o espacios (ej. `"Grundprinzipien des Rollierenden Schengen Zeitfensters"`).

### 7. Actualización del Conteo de Herramientas en Tests
- **Error**: `tool_validation.test.ts` y `locale_completeness.test.ts` fallan con `expected 5 to be 4`.
- **Regla preventiva**: Al añadir una nueva herramienta a una categoría, actualizar inmediatamente `expect(ALL_TOOLS.length).toBe(N)` con el nuevo total de herramientas de la categoría.

### 8. Date Pickers e Iconos Nativos en Modo Oscuro
- **Error**: El icono nativo del calendario (`input[type="date"]`) se muestra negro sobre fondo negro en modo oscuro.
- **Regla preventiva**: Envolver el input en un `.sc-date-wrap`, superponer un icono SVG con color de marca (`color: var(--sc-brand)`), y transparentar el icono nativo con `::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; }`.

### 9. Manipulación de Clases en Elementos SVG
- **Error**: `svgElement.className = "..."` lanza `TypeError: Cannot set property className of #<SVGElement> which has only a getter`.
- **Regla preventiva**: Usar siempre `svgElement.setAttribute('class', '...')` o `svgElement.classList.add(...) / svgElement.classList.remove(...)`.

### 10. Reglas de Stylelint en CSS
- **Error**: `#ffffff` en lugar de `#fff`, `font-family: inherit` prohibido, o saltos de línea incorrectos antes de declaraciones.
- **Regla preventiva**: Usar siempre `#fff`, no declarar `font-family` en estilos de herramientas, y mantener espaciado limpio.

### 11. Cero Títulos Duplicados en `component.astro`
- **Error**: Colocar barras superiores `.sc-topbar` o nombres de herramientas duplicando `UtilityHeader`.
- **Regla preventiva**: El componente debe arrancar directamente con el visor de resultados hero o los inputs de cálculo.
