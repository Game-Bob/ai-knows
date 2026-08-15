# 🚀 SKILL: Creación de Nueva Utilidad desde Oportunidad (Ecosistema jjlmoya)

## 📋 PROPÓSITO
Guía automatizada para identificar, crear, validar, traducir y publicar una nueva herramienta web dentro del ecosistema `@jjlmoya/utils-*`.

---

## 🔄 FLUJO DE TRABAJO OBLIGATORIO POR FASES

### Fase 1: Identificación e Inspiración
1. Consultar oportunidades y conceptos dentro del workspace `ai-knows`.
2. Proponer la herramienta al usuario especificando:
   - Nombre de la utilidad y categoría objetivo (`jjlmoya-utils-<categoría>`).
   - Intención de búsqueda SEO y propuesta de valor única.
   - Presets predefinidos y conceptos visuales.

### Fase 2: Desarrollo e Implementación (English-First)
1. **Crear Estructura SOLID** en `src/tool/<tool-id>/`:
   - `ui.ts`: Interfaz del contenido tipado de la UI.
   - `logic.ts`: Funciones matemáticas y lógicas puras.
   - `logic.test.ts`: Pruebas de unidad Vitest (100% cobertura).
   - `storage.ts`: Gestión de `localStorage` con aislamiento `try/catch`.
   - `evaluator.ts`: Diagnósticos de estado y badges.
   - `dom-views.ts`: Formateadores de datos y arte SVG dinámico (soporte `--n-*` temas claro y oscuro).
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
1. Commit y push inicial de la librería en `d:\code\jjlmoya-utils-<categoria>`:
   ```powershell
   git add .; git commit -m "feat: add <tool-id> utility" --no-verify; git push --no-verify
   ```
2. Ejecutar la publicación minor en `d:\code\jjlmoya-utils-<categoria>`:
   ```powershell
   npm run minor
   ```
3. Actualizar la versión de la dependencia en los proyectos consumidores usando sus scripts oficiales:
   - En `d:\code\jjlmoya`: `npm run update <categoria>`
   - En `d:\code\website`: `npm run update <categoria>`
4. Generar la Imagen OpenGraph (OBLIGATORIAMENTE CUADRADA 1:1):
   - Usar `generate_image` con estilo *Artist Ink and Watercolor* y `AspectRatio: '1:1'` (PROHIBIDO 16:9 u otros formatos).
   - Convertir a WebP en `d:\code\jjlmoya` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```powershell
     node scripts/convert-image-to-webp.mjs <ruta-imagen-generada> public/images/og/<slug-es>.webp
     ```
   - Convertir a WebP en `d:\code\website` usando el script oficial del repositorio (PROHIBIDO crear scripts personalizados):
     ```powershell
     node scripts/image-to-webp.mjs <ruta-imagen-generada> public/images/og/<slug-en>.webp
     ```
5. Commit y push con `--no-verify` en `jjlmoya` y `website`:
   ```powershell
   git add .; git commit -m "feat: update @jjlmoya/utils-<categoria> to <version> and add og image" --no-verify; git push --no-verify
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
    - Al generar la imagen conceptual con `generate_image`, especificar OBLIGATORIAMENTE `AspectRatio: '1:1'` (imagen CUADRADA).
    - PROHIBIDO usar `16:9` o cualquier otro formato.

11. **Uso Exclusivo de Scripts Oficiales de Conversión WebP**:
    - Usar SIEMPRE `node scripts/convert-image-to-webp.mjs` (en `jjlmoya`) y `node scripts/image-to-webp.mjs` (en `website`).
    - Queda ESTRICTAMENTE PROHIBIDO crear scripts `.cjs`/`.mjs` temporales o ejecutar convertidores ad-hoc en línea de comandos.

12. **Auto-Refinamiento**:
    - Si el usuario detecta cualquier discrepancia o aspecto a mejorar, actualizar inmediatamente este documento antes de proseguir.
