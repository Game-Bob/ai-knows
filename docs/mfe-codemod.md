# Migración masiva de verticales de utilidades a MFE

El script `scripts/migrate-utils-to-mfe.mjs` convierte una librería `@jjlmoya/utils-*`
antigua al modelo MFE usando `jjlmoya-utils-tabletop` como referencia estructural.

## Flujo seguro

Desde `ai-knows`, primero ejecutar siempre una simulación:

```bash
node scripts/migrate-utils-to-mfe.mjs \
  --repo ../jjlmoya-utils-civic \
  --reference ../jjlmoya-utils-tabletop
```

El script no escribe nada sin `--apply`. La simulación debe confirmar:

- la clave de la vertical y el slug español de categoría;
- los slugs ingleses de todas las tools registradas;
- las rutas de `jjlmoya.es` y `gamebob.dev` para los 15 idiomas;
- los assets OG disponibles en `../website/public/images/utilities`;
- la ausencia de cambios locales, salvo que se use `--allow-dirty` conscientemente.

Después de revisar la salida, aplicar la migración:

```bash
node scripts/migrate-utils-to-mfe.mjs \
  --repo ../jjlmoya-utils-civic \
  --reference ../jjlmoya-utils-tabletop \
  --apply
```

`--allow-dirty` permite conservar cambios locales no relacionados. No debe usarse
para ocultar conflictos: los ficheros que el codemod modifica deben revisarse en
el diff antes de hacer commit.

## Qué migra

El codemod copia y adapta los componentes, layouts, rutas Astro, worker, identidad,
traducciones de navegación, generación de CSS, configuración de Wrangler y headers
de caché del MFE de referencia. También copia el workflow de CI/CD y adapta la rama
por defecto del repositorio (`main` o `master`). También:

1. usa `ALL_TOOLS` para que el listado incluya todas las tools registradas;
2. conserva los slugs de cada idioma para construir canonical, alternates y enlaces;
3. mantiene los assets en `public/_utilities/<vertical>/images`;
4. configura Astro para emitir sus bundles hashed bajo
   `public/_utilities/<vertical>/` y genera los CSS de cada tool en
   `public/_utilities/<vertical>/styles` mediante
   `scripts/postinstall.mjs`;
5. añade las dependencias y scripts de `utils-shared`, identity, tracking y Wrangler;
6. elimina las rutas antiguas de preview que generarían páginas duplicadas;
7. activa `resolveJsonModule` para versionar los assets con la versión del paquete.

Las rutas del worker también son específicas de cada vertical. Las páginas españolas
planas se registran con su patrón exacto y con `/*` para cubrir el trailing slash;
los assets se sirven con `/_utilities/<vertical>/*`. No se debe reutilizar el
comodín global `/_utilities/*`, porque pertenece a una sola vertical y provoca
conflictos entre workers.

## Publicación a producción

El despliegue no debe ocurrir directamente dentro del comando local `npm run minor`.
Ese comando ejecuta `npm version minor`, que pasa el QA de `preversion`, crea el
commit y el tag `vX.Y.Z`, y el `postversion` sube rama y tag. El workflow de CI se
activa al recibir el tag y entonces ejecuta:

1. `npm ci` y `npm run qa`;
2. el build de integración de `website`;
3. el build MFE con `PUBLIC_APP_VERSION` igual al tag;
4. `wrangler deploy` en producción;
5. la notificación IndexNow de las páginas modificadas.

Así `npm run minor` inicia una publicación reproducible, pero el deploy solo sucede
después de que GitHub Actions haya pasado los gates. Para un despliegue manual se
usa `npm run cf:deploy`; para staging, `npm run cf:preview`.

La categoría usa la clave inglesa para el asset (`civic.webp`) y el slug traducido
solo para la URL (`civico`). Para cada imagen el orden de búsqueda es:

1. slug inglés en `../website/public/images/utilities`;
2. slug español en `../jjlmoya/public/images/utilities`.

El fichero se copia siempre al MFE con el nombre inglés, aunque se haya encontrado
usando el fallback español. Las imágenes de tools se sirven desde la ruta común del
MFE.

## Assets faltantes

Por defecto, un asset OG faltante detiene el codemod. Solo usar
`--allow-missing-assets` para una prueba explícitamente incompleta:

```bash
node scripts/migrate-utils-to-mfe.mjs \
  --repo ../jjlmoya-utils-civic \
  --reference ../jjlmoya-utils-tabletop \
  --apply --allow-dirty --allow-missing-assets
```

La salida lista cada asset aplazado. No se debe desplegar esa vertical hasta que
cada página tenga un asset existente o una asignación de fallback aprobada.

## Validación después de aplicar

En el repositorio migrado:

```bash
npm install
npm run postinstall
npm run lint
npm run test
npm run check
npm run build
```

Hay que comprobar además que `dist` contiene:

- la categoría española y las 14 categorías de `gamebob.dev`;
- una página por tool y por idioma disponible, con fallback inglés solo para una
  tool declarada explícitamente como `english-first`;
- los CSS en `dist/_utilities/<vertical>/styles`;
- los bundles Astro en `dist/_utilities/<vertical>/` y sus `href` con ese prefijo;
- los OG en `dist/_utilities/<vertical>/images`;
- query de versión en las URLs de CSS e imágenes;
- ningún enlace interno a las rutas antiguas de la librería o de `website`.

El commit de la migración debe separar los ficheros generados por el codemod de
cambios de contenido que ya estuvieran pendientes en la vertical.
