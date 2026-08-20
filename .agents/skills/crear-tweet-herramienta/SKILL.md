---
name: crear-tweet-herramienta
description: Crear tweets en español sobre herramientas web a partir del nombre, la URL y las indicaciones del usuario, manteniendo su tono directo, visceral, coloquial y poco corporativo.
---

# Crear tweet de una herramienta

## Propósito

Convertir una herramienta web, su URL y las indicaciones del usuario en **un único tweet listo para publicar**.

El resultado debe parecer escrito justo después de cerrar el editor y probar la herramienta. No debe parecer un anuncio, una ficha de producto, un texto de marketing ni una IA intentando sonar humana.

El tweet debe contar **algo concreto que ha ocurrido**, no simplemente explicar qué hace la herramienta.

## Imagen asociada al tweet

Cada vez que se cree un tweet de una herramienta, crear también una imagen preparada para X.

1. Capturar un pantallazo real del **contenedor de la herramienta**, no de la página completa. Excluir navegación, breadcrumbs, cabeceras, bloques SEO, tablas, footer y contenido editorial. Si ya existe una captura válida en la conversación, utilizarla. No inventar pantallas ni estados.
2. La herramienta debe ser la protagonista: mantener su interfaz visible, grande, nítida y reconocible. No aplicar blur, desenfoque, glow, profundidad de campo ni filtros que dificulten leer controles, textos o valores. Si la captura del navegador sale blanda, obtener otra captura o aislar el elemento real antes de editarla.
3. Mejorar la captura con la capacidad de edición de imágenes para convertirla en una pieza visual limpia y atractiva para Twitter/X. La decoración debe rodear o enmarcar la herramienta y ser coherente con su tema —por ejemplo, estrellas y un observatorio para astronomía—, sin sustituirla ni cubrirla.
4. Mantener la interfaz, los textos, los valores, los colores y los estados reales de la captura. No añadir titulares, slogans, funcionalidades ni copy inventado. Si la composición necesita contexto, se permite añadir únicamente el título real de la herramienta y una descripción breve tomada literalmente de la propia herramienta o de su contexto, sin reinterpretarla. La edición puede añadir también fondo, marco, iluminación o elementos decorativos externos que no alteren la herramienta.
5. Utilizar siempre la overlay reutilizable `D:/code/ai-knows/tweetImages/jjlmoya-overlay.png`, que contiene únicamente `jjlmoya.es`.
6. Colocar la overlay en una zona con espacio libre, normalmente abajo a la derecha, sin tapar controles, resultados ni textos de la herramienta. Debe quedar integrada, pequeña y legible.
7. Guardar la imagen final en `D:/code/ai-knows/tweetImages/` con un nombre descriptivo basado en el slug, sin sobrescribir la captura original. Esa carpeta está ignorada por Git y no se debe publicar.
8. Si no se puede obtener un pantallazo real del contenedor de la herramienta, pedir únicamente la captura que falte. No sustituirla por una maqueta inventada ni por una captura de la página completa.

## Enfoque para tweets de herramientas

Estos tweets NO son devlogs.

No contar el proceso de desarrollo, arquitectura, iteraciones, refactors, decisiones de implementación ni "lo que he aprendido haciendo la herramienta", salvo que el usuario lo pida expresamente.

El objetivo es hablar de la herramienta como algo que acabo de descubrir, probar o terminar y que merece la pena enseñar.

Quiero que el tweet provoque una de estas reacciones:

- "Hostia, esto es útil."
- "¿Cómo coño funciona esto?"
- "Necesito probarlo."
- "Qué cosa más absurda."
- "Joder, esto está muy bien hecho."

La herramienta debe aparecer integrada dentro de la idea, no presentada como un producto.

No escribir:

- "Hoy he creado una nueva herramienta para..."
- "Os presento mi nueva herramienta..."
- "He desarrollado una herramienta que permite..."
- "Una herramienta sencilla y potente para..."

Eso suena a marketing.

Preferir, cuando encaje con lo que realmente ha ocurrido:

- "Acabo de hacer una cosa bastante absurda..."
- "Necesitaba hacer X y terminé haciendo esto..."
- "No sabía que necesitaba esto hasta que..."
- "Esto probablemente no debería existir, pero..."
- "Me he encontrado con un problema ridículo y..."
- "Puedes hacer X. No sé por qué querrías hacerlo, pero ahora puedes."

El tweet puede hablar directamente de lo que hace la herramienta, pero debe hacerlo desde la experiencia y no desde una lista de funcionalidades.

La herramienta debe ser el protagonista. Yo soy el que la ha hecho, no el producto que estoy intentando vender.

Si la herramienta tiene un resultado visual, curioso, absurdo o inesperado, priorizarlo. Una demostración concreta suele ser mucho más potente que explicar cinco funcionalidades.

El humor debe salir de la propia herramienta o de la situación. No añadir chistes porque sí.

No terminar siempre con una llamada a la acción. Si la URL está incluida, basta.

### Qué no hacer

- No convertir una herramienta en un devlog.
- No explicar cómo está programada.
- No hablar de arquitectura, rendimiento, componentes, iteraciones o decisiones internas salvo que sean precisamente el motivo del tweet.
- No utilizar lenguaje de lanzamiento.
- No inventar una historia alrededor de la herramienta.
- No fingir sorpresa ante algo que el usuario no ha dicho que le sorprenda.
- No explicar demasiado el chiste.
- No añadir una moraleja.
- No intentar demostrar que la herramienta es "innovadora", "revolucionaria", "potente" o "imprescindible".

### Qué buscar

- Una observación.
- Una utilidad inesperada.
- Un resultado curioso.
- Una situación absurda.
- Una pequeña historia real.
- Una reacción personal.
- Un "mira lo que hace esto".

Si existe un remate natural, dejarlo caer y largarse.

## Entrada esperada

El usuario puede nombrar una herramienta, proporcionar una URL o dar indicaciones sobre el enfoque del tweet. La herramienta, su contexto y cualquier URL relevante pueden estar ya en la conversación.

Usar siempre el contexto disponible y no pedir al usuario que repita información que ya ha proporcionado.

No inventar funcionalidades, resultados, decisiones, anécdotas, emociones, problemas resueltos ni URLs.

Si para cumplir una indicación concreta falta un dato que no aparece en la conversación, pedir únicamente ese dato.

Para herramientas de `jjlmoya.es`, cuando haya que construir la URL a partir del slug, usar exactamente este formato:

`https://www.jjlmoya.es/utilidades/${slug}/`

No añadir prefijos de idioma como `/es/`, no eliminar `www`, no eliminar `/utilidades/` y no quitar el `trailing slash` final.

## Voz y personalidad

Escribo de forma **directa, visceral, coloquial y poco corporativa**. No intento sonar más profesional de lo que soy.

Quiero que el tweet parezca escrito por una persona que acaba de hacer algo y está contando lo que acaba de descubrir, no por un departamento de marketing.

Mi tono puede mezclar **orgullo, autocrítica, humor seco, absurdo, curiosidad y mala hostia controlada**.

Si algo está de puta madre, puedo decirlo. Si algo ha salido mal, también. No finjo modestia ni exagero los logros para hacerlos parecer más importantes.

Uso lenguaje coloquial y palabrotas cuando aparecen de forma natural. Una palabrota no debe introducirse simplemente para parecer más informal.

Mi humor suele ser **seco, absurdo y autoconsciente**. No explico los chistes. Si existe una escalada o un remate natural, preparo la idea y dejo que el lector llegue solo.

## Cómo hablo de mis herramientas

No quiero convertir una herramienta en una lista de funcionalidades.

Si tiene diez cosas interesantes, **el tweet no debe intentar meter las diez**. Hay que elegir una sola: la más curiosa, útil, absurda, inesperada o personal.

La herramienta debe aparecer dentro de una historia o una observación.

Priorizar:

**qué estaba haciendo → qué descubrí → qué hice → qué coño pasó**

antes que:

**característica → característica → característica → llamada a la acción**

Cuando exista una decisión técnica interesante, relacionarla con la experiencia real de quien utiliza la herramienta.

No decir simplemente que algo es “rápido”, “potente”, “increíble”, “sencillo” o “útil”. Si una característica merece destacarse, demostrarlo mediante el hecho concreto que la hace interesante.

## Reglas de redacción

1. Escribir en español por defecto, salvo que el usuario pida otro idioma.

2. Entregar un único tweet listo para publicar, sin prefacio, análisis ni explicaciones, salvo que el usuario pida alternativas.

3. Mantener el tweet dentro de **280 caracteres**, contando la URL.

4. Incluir la URL exacta cuando el usuario la haya proporcionado o esté disponible en el contexto. Normalmente colocarla al final. No acortarla, traducirla ni sustituirla por un marcador. Conservar todos sus segmentos de ruta, incluida la categoría como `/utilidades/`, y el `trailing slash` final cuando exista. Para URLs de `jjlmoya.es` construidas desde un slug, usar el formato canónico `https://www.jjlmoya.es/utilidades/${slug}/`, sin `/es/`.

5. Elegir **un solo ángulo principal**. No intentar resumir toda la herramienta.

6. Priorizar una observación personal y concreta frente a una descripción de producto.

7. Utilizar frases completas y naturales. Evitar listas, escalas de frases cortas, fragmentos consecutivos y formatos que parezcan copy publicitario.

8. No usar por defecto hashtags, emojis ni llamadas a la acción. Añadirlos únicamente si encajan de forma natural o el usuario los pide.

9. No utilizar lenguaje corporativo o prefabricado como “estoy emocionado”, “me complace anunciar”, “una nueva aventura”, “what a journey”, “lessons learned”, “revolucionario”, “solución definitiva” o equivalentes.

10. No introducir épica artificial. Una herramienta no tiene que ser “increíble” para resultar interesante.

11. No utilizar palabrotas para simular personalidad. Solo usarlas cuando formen parte natural de la emoción o del remate.

12. No convertir el tweet en una moraleja, una lección de vida o un resumen del proceso de desarrollo.

13. No inventar contexto para hacer el tweet más interesante.

14. Si el hecho real ya es suficientemente curioso, **no añadir adornos**.

15. Si existe un remate, no explicarlo después.

16. La naturalidad tiene prioridad sobre la perfección gramatical cuando ambas entren en conflicto.

## Procedimiento

1. Identificar **qué ha ocurrido realmente**.

2. Detectar el detalle con más personalidad o capacidad de generar curiosidad.

3. Elegir un único ángulo entre descubrimiento, utilidad, problema resuelto, fallo, decisión, resultado o absurdo.

4. Escribirlo desde mi perspectiva, como una observación personal y no como un anuncio.

5. Buscar una pequeña tensión, sorpresa o remate cuando exista de forma natural.

6. Integrar la herramienta sin convertirla en protagonista publicitaria.

7. Añadir la URL exacta, respetando la categoría, todos los segmentos de ruta y el `trailing slash` original.

8. Recortar todo lo que no sea imprescindible.

9. Leer el resultado en voz alta y comprobar que **yo podría decirlo realmente**.

10. Comprobar que no supera los 280 caracteres.

11. Si el tweet necesita explicar demasiado la herramienta para resultar interesante, buscar otro ángulo en lugar de añadir más información.

## Prioridad

Cuando varias reglas entren en conflicto, seguir este orden:

**Información real > naturalidad > personalidad > claridad > brevedad > marketing.**

El objetivo no es conseguir que el tweet parezca escrito por un desarrollador.

El objetivo es que parezca escrito **por mí**.
