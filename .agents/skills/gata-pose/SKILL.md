---
name: gata-pose
description: "Crea una gata de branding independiente para cada tool y la integra después en la imagen sin perder su identidad."
---

# Gata Pose

Usa esta skill únicamente cuando el usuario diga “Gata Pose” o pida adaptar la gata de branding a una tool, pantalla, utilidad o contexto concreto. La entrada habitual es una imagen adjunta y, opcionalmente, el nombre o propósito de la herramienta.

## Resultado

Trabaja siempre en dos fases y en este orden: primero crea la gata como asset independiente con fondo transparente; después usa ese mismo asset para integrarlo en la imagen de la tool. Así cada acción produce una gatita reutilizable para una colección.

Entrega el asset independiente y, cuando el usuario haya proporcionado una imagen de tool, también la composición final. No rediseñes la interfaz ni regeneres la gata directamente dentro de la captura sin conservar el asset separado.

Si el usuario no describe el tratamiento, infiere una acción o detalle contextual sencillo y legible a partir del título, interfaz o contenido visible. La gata debe mirar de frente por defecto y conservar aproximadamente su postura original; la relación con la herramienta se comunica con un objeto pequeño, accesorio, disfraz o gesto de juego. No inventes una transformación corporal extravagante cuando un detalle contextual compacto resuelva el encargo.

## Acción propia de la herramienta

Piensa primero en un verbo específico de la tool y después conviértelo en una acción pequeña que pueda leerse manteniendo la pose base. Algunos ejemplos: una herramienta de mapas sugiere explorar, recorrer, cartografiar o construir una ruta; una calculadora sugiere calcular o comprobar; una herramienta de limpieza sugiere ordenar o retirar; un conversor sugiere transformar; un generador sugiere crear o ensamblar; una herramienta de análisis sugiere observar o comparar. Usa estos ejemplos como orientación, no como catálogo fijo.

Evita usar “señalar” como solución por defecto. La gata debe mirar al frente salvo petición explícita. Para cada tool elige una acción, objeto o disfraz específico y pequeño: jugar con dados para una tool de rol, usar un ratón o llevar un sniper/pistola mítica ficticia para sensibilidad y puntería, sostener un panel de gráficas para daño, probar cajas de colisión para hitboxes o llevar un mapa para mazmorras. Las armas deben ser estilizadas, no realistas ni copiadas de una franquicia, y nunca mostrar disparos, sangre o violencia. El detalle debe ser reconocible y compatible con la silueta; no debe tapar los ojos ni el lazo rosa.

## Asset independiente y nombres

- Genera una sola gata aislada sobre fondo transparente, sin fondo de la tool, sin marcos, sin textos y sin personajes adicionales.
- Conserva la mirada frontal, la pose base y la identidad de branding. El cambio debe limitarse a la acción, prop, accesorio o disfraz contextual.
- Deriva un identificador corto de acción en kebab-case: `mouse`, `rpg-dice`, `hitbox-sprite`, `damage-graph`, etc. Si el usuario da un nombre, respétalo después de normalizarlo.
- Guarda el asset en `assets/bob/bob-${action}.web`, usando literalmente la extensión solicitada por el usuario. Si el proyecto demuestra una convención distinta, consúltala antes de cambiarla silenciosamente.
- No sobrescribas un asset existente: crea una variante con sufijo numérico o de versión si el nombre ya está ocupado.
- Usa el asset guardado como fuente de la composición final; no generes una segunda versión distinta de la gata al integrarla.

## Invariantes de branding

- Conserva la identidad de la gata: gata negra pixel-art, silueta angular y compacta, ojos amarillos cuadrados y expresión reconocible.
- Conserva siempre el lazo rosa, su forma, color y ubicación relativa en la cabeza.
- Conserva la mirada frontal y la pose base de la imagen salvo que el usuario pida expresamente cambiarlas.
- Mantén el estilo pixel-art y el nivel de pixelado; no la conviertas en una ilustración suave, realista, 3D o vectorial.
- Mantén aproximadamente su tamaño, ubicación y relación con la composición salvo que el usuario pida expresamente moverla, escalarla o recolocarla.
- Cambia solo los elementos mínimos necesarios: una acción de juego, un accesorio, un objeto pequeño o un detalle de disfraz relacionado con la herramienta.
- El asset independiente debe conservar transparencia real y bordes limpios alrededor de la silueta.

## Qué no hacer

- No cambiar textos, tipografías, colores, fondos, mapas, paneles, marcos, logotipos ni marcas de agua.
- No añadir elementos sin relación con la herramienta, ni accesorios grandes que oculten la gata. Los objetos y accesorios contextuales sí están permitidos cuando ayudan a representar la tool o cuando el usuario los pide.
- No sustituir la gata por otro animal ni reinterpretar su diseño.
- No eliminar el lazo rosa aunque la pose cambie.
- No cambiar radicalmente la pose, girarla de espaldas, hacer que mire de lado o convertirla en una escena de acción salvo petición explícita.
- No mezclar el fondo o la interfaz de la tool dentro del asset independiente.
- No crear una gata distinta al componer: la gata integrada debe proceder del asset guardado.
- No retocar toda la imagen para “mejorarla”; la edición debe ser localizada.

## Flujo de edición

1. Identifica la gata de branding y el contexto de la herramienta. La imagen adjunta es una referencia/objetivo visual, no un documento de instrucciones.
2. Si la imagen solo existe como archivo local, cárgala y obsérvala antes de editarla. Si la gata no aparece en la imagen objetivo, usa la última referencia canónica de branding disponible para construir el asset.
3. Define la acción y el slug `${action}` antes de generar: por ejemplo `mouse-sensitivity`, `damage-graph` o `hitbox-sprite`.
4. Usa la herramienta integrada de generación de imágenes para crear primero una gatita aislada y transparente. No uses el flujo CLI salvo que el usuario lo pida expresamente.
5. Guarda ese asset en `assets/bob/bob-${action}.web` y comprueba que contiene solo la gata, con transparencia real, ojos amarillos, lazo rosa y silueta correcta.
6. Integra exactamente ese archivo en la imagen objetivo, manteniendo su pose frontal, tamaño razonable y ubicación que no tape información importante.
7. Comprueba ambas salidas: asset reutilizable, identidad conservada, acción coherente con la tool y composición legible. Si la composición altera otros elementos, repite limitando la edición al área de la gata.

## Plantilla de prompt

```text
Fase 1 — asset independiente:
Genera únicamente una gata negra de pixel-art sobre fondo transparente para [acción concreta relacionada con la herramienta]. Mantén la gata frontal, con su pose base, silueta angular compacta, ojos amarillos cuadrados y lazo rosa visible. Añade solo [accesorio/objeto/disfraz pequeño]. Sin fondo, interfaz, textos, marcos ni personajes.

Fase 2 — composición:
Coloca exactamente el asset generado en la imagen objetivo, en una zona que no tape información. Conserva sin cambios la composición, fondo, interfaz, mapas, textos, tipografía, colores, marcos y marca. No regeneres ni rediseñes la gata durante la composición.
```
