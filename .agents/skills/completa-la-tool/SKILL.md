---
name: completa-la-tool
description: "Completar una TOOL de jjlmoya-utils desde el gate explícito `okQA`: localizarla, traducirla a 15 idiomas, pasar los quality gates y preparar su publicación y sincronización."
---

# Completa la tool

Skill continuadora de `nueva-tool-oportunidad`. Se aplica cuando el usuario dice explícitamente `okQA` para la TOOL actual, o pide continuarla desde ese gate. No debe iniciar discovery, elegir otra oportunidad ni volver a construir la fase inglesa.

## Fuente de verdad

Antes de actuar, leer `D:/code/ai-knows/.agents/skills/nueva-tool-oportunidad/SKILL.md`, especialmente las fases 3, 4 y 5 y las reglas antifallos que afectan a i18n, assets, commits y publicación. Esta skill hereda esas reglas; si hay conflicto, prevalece la instrucción del usuario.

`okQA` autoriza a pasar de la revisión inglesa a la localización. No autoriza por sí solo los `git commit`, `git push` ni otras mutaciones externas que la skill de origen exige confirmar. Mantener el trabajo directamente sobre `main`, como define la skill de origen.

## Preparación

1. Identificar la TOOL aprobada usando la conversación, el árbol de trabajo y el issue de `Game-Bob/ai-knows` asociado. Obtener su `tool-id`, categoría, repositorio propietario y slug inglés. Si hay más de una TOOL plausible, detenerse y pedir cuál es; no elegir arbitrariamente.
2. Comprobar que la fase inglesa existe y que el usuario ha dado `okQA` para esa TOOL. Si no hay una aprobación explícita, no crear traducciones ni publicar.
3. Revisar `git status`, la rama y los cambios existentes en el repositorio de la librería. Preservar cambios del usuario y no sobrescribir trabajo ajeno. Usar Bash mediante `C:\Program Files\Git\bin\bash.exe` en Windows.
4. Antes de crear contenido, inspeccionar los contratos de i18n, `entry.ts`, registros y tests del repositorio objetivo. Reutilizar tipos y patrones de contrato, pero no copiar la interfaz visual de otra TOOL.

## Fase 3: localización completa

Completar la TOOL en los 15 idiomas definidos por la skill de origen:

`de`, `en`, `es`, `fr`, `id`, `it`, `ja`, `ko`, `nl`, `pl`, `pt`, `ru`, `sv`, `tr`, `zh`.

- Mantener el contenido inglés aprobado y traducir contenido real, específico y natural en cada locale.
- No usar placeholders, arrays sintéticos, texto inglés repetido ni preguntas numeradas sin significado.
- Mantener paridad de estructura: UI, SEO, FAQ, HowTo, schemas, bibliografía, slugs y mensajes de estado.
- Aplicar las reglas de diacríticos y basura tipográfica de la skill de origen.
- Mantener `SoftwareApplication`, `FAQPage` y `HowTo` tipados con `schema-dts` en cada locale.
- Registrar los 15 loaders en `entry.ts` y actualizar los registros, índices y tests de conteo/completitud necesarios.
- Comprobar que el CSS conserva exactamente el slug inglés declarado en `en.ts`.

Antes de pasar a QA, buscar placeholders y contenido sintético en todo el árbol de la TOOL. Una sola coincidencia bloquea la continuación.

## Fase 4: quality gates

Ejecutar en este orden desde el repositorio de la librería y corregir cualquier fallo antes de continuar:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

Tras cualquier corrección, repetir la secuencia completa. No presentar la TOOL como terminada si alguno devuelve un código distinto de cero. Además, revisar los invariantes de la skill de origen: cero comentarios prohibidos, schemas completos, SEO tipado, slugs correctos, traducciones nativas, contraste y assets sin placeholders.

## Fase 5: publicación y sincronización

Ejecutar las acciones en este orden, usando únicamente los scripts oficiales indicados por la skill de origen:

1. Comprobar que la librería está en `main`, limpia y sincronizada con `origin/main`.
2. Pedir confirmación explícita justo antes de hacer `git add`, `git commit` y `git push` de la librería `jjlmoya-utils-<categoría>`. Usar el mensaje y `--no-verify` definidos por la skill de origen.
3. Ejecutar `npm run minor` en la librería después de que el commit inicial se haya publicado.
4. Actualizar los consumidores con `npm run update <categoría>` en `/d/code/jjlmoya` y `/d/code/website`.
   En los consumidores no ejecutar `npm run build`, `npm run test` ni otros builds o tests: no son necesarios para completar la TOOL. La validación del consumidor se limita a comprobar que la dependencia queda actualizada, que el runtime/adaptador de la TOOL se genera correctamente y que los assets y registros apuntan a las rutas esperadas.
5. Generar la imagen OpenGraph conceptual con la capacidad de generación disponible, formato cuadrado `1:1` y el mismo lenguaje visual del ecosistema. Antes de crearla, revisar varias imágenes existentes en `public/images/utilities/`, seleccionar referencias cercanas por categoría y describir sus rasgos comunes en el prompt. No imponer un estilo nominal como `Artist Ink and Watercolor`: el estilo debe derivarse de las referencias reales y mantenerse coherente con ellas. La convención de assets es estricta: `jjlmoya` usa únicamente el slug español (`<slug-es>.webp`) y nunca debe recibir la imagen del slug inglés; `website` usa únicamente el slug inglés (`<slug-en>.webp`). Convertirla únicamente con los scripts oficiales:

```bash
cd /d/code/jjlmoya
node scripts/convert-image-to-webp.mjs <imagen-generada> public/images/utilities/<slug-es>.webp

cd /d/code/website
node scripts/image-to-webp.mjs <imagen-generada> public/images/utilities/<slug-en>.webp
```

### Dirección gráfica obligatoria para imágenes OpenGraph

La imagen debe mantener la identidad visual del ecosistema a partir de referencias reales de `public/images/utilities/` de los consumidores. La referencia compartida es una ilustración conceptual, no una captura de la interfaz. El agente debe adaptar estas reglas a los rasgos observados y no sustituir esa revisión por un preset de estilo:

- Usar siempre lienzo cuadrado `1:1` y conservar el tipo de fondo, textura y tratamiento de superficie que predomine en las referencias elegidas.
- Construir una única escena central reconocible que explique la utilidad mediante una metáfora visual propia del dominio.
- Reproducir el medio, los contornos, la textura, el nivel de detalle y el tipo de acabado que compartan las referencias, sin convertirlo automáticamente en acuarela, tinta o cualquier otro estilo con nombre.
- Elegir una paleta cromática contenida y relacionada con el tema, respetando la paleta dominante de las referencias y reservando los colores intensos para la señal principal.
- Mantener el mismo equilibrio de aire, jerarquía y densidad visual que las referencias; evitar composiciones apiñadas.
- No representar dashboards, formularios, tarjetas, tablas, marcos de aplicación ni interfaces genéricas como imagen principal.
- No introducir texto dentro de la imagen salvo que sea imprescindible y pueda validarse literalmente; nunca aceptar letras inventadas, marcas de agua ni logotipos.
- La imagen debe funcionar como concepto incluso sin leer el nombre de la TOOL y debe conservar la legibilidad al convertirse a WebP.

6. Verificar las rutas `public/images/utilities/`, los slugs devueltos por los registros y el resultado de la integración mínima de los consumidores. Revisar también los CSS que genere el `postinstall` para la TOOL y asegurarse de que se incluyen en el commit final de cada consumidor; si el CSS generado falta, la TOOL no está lista porque puede publicarse rota. No ejecutar builds ni tests de `/d/code/jjlmoya` o `/d/code/website`; no crear `public/images/og/` ni convertidores temporales.
7. Pedir confirmación explícita antes de hacer los commits y pushes finales de `jjlmoya` y `website`. Antes de cada commit, comprobar el diff y hacer `git add` también de los CSS generados por `postinstall`, junto con la dependencia, los registros/adaptadores y el asset OpenGraph. Mantener los mensajes, `--no-verify` y la rama `main` de la skill de origen.
8. Si existe un issue abierto que originó la TOOL, cerrarlo solo después de disponer de evidencia de implementación, quality gates, publicación y sincronización. Añadir esa evidencia al resumen final.

Si una acción de publicación falla, conservar el estado y diagnosticarlo; no repetir `npm run minor` ni crear otro release a ciegas. Si la generación de imagen no está disponible, detenerse antes de afirmar que la TOOL está completa y explicar el bloqueo.

## Entrega

Informar de:

- TOOL completada, categoría, repositorio y issue relacionado.
- Los 15 locales y registros actualizados.
- Resultado de `type-check`, `lint`, `test` y `build`.
- Commit, versión publicada, actualizaciones de consumidores y assets OpenGraph, con sus rutas.
- Confirmaciones que hayan quedado pendientes y el siguiente paso exacto.
