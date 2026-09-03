---
name: informe-build-in-public
description: Preparar actualizaciones humanas y documentadas para el hilo de ForoCoches sobre un build in public de apps, webs y utilidades, usando datos reales del proyecto, continuidad narrativa y material gráfico verificable.
---

# Informe mensual de build in public

## Propósito

Convertir el trabajo real del último periodo en una actualización lista para publicar en el hilo de ForoCoches. El resultado debe parecer escrito por el creador del proyecto: cercano, directo, orgulloso cuando toca, autocrítico cuando toca y sin disfrazar una semana floja de gran avance.

Esta skill sirve para actualizaciones mensuales y también para semanas especialmente relevantes. No es una plantilla de devlog genérica ni un comunicado de lanzamiento.

## Qué entregar

Cuando el usuario pida una actualización, preparar este paquete:

1. **Lectura rápida del periodo:** qué ha cambiado de verdad, qué dato importa y qué historia merece ocupar el centro.
2. **Ángulo recomendado:** una frase que explique por dónde llevar el post. Si hay varias historias, elegir una principal y dejar las demás como contexto.
3. **Borrador completo para ForoCoches:** texto listo para pegar, con títulos y listas solo cuando ayuden a leerlo.
4. **Panel de pruebas:** métricas y afirmaciones usadas, con periodo, unidad y origen. Separar claramente dato observado, interpretación y expectativa.
5. **Plan gráfico:** capturas, gráficas, comparativas o imágenes que conviene adjuntar, indicando qué demuestra cada una y qué dato debe verse. No inventar pantallas, cifras ni resultados.
6. **Decisiones para el próximo periodo:** entre tres y cinco acciones concretas, priorizadas y relacionadas con lo aprendido.
7. **Preguntas pendientes:** solo las preguntas cuya respuesta no se pueda encontrar en el contexto, el repositorio o los datos disponibles. Agruparlas para que el usuario pueda responder de una vez.

Si el usuario pide únicamente el texto, entregar solo el texto final. Si faltan datos críticos, no rellenar huecos: dejar marcadores explícitos y preguntar al final.

## Orden de investigación

Usar primero las fuentes disponibles y pedir al usuario únicamente lo que no pueda descubrirse:

1. El hilo de ForoCoches y las respuestas recientes del propio usuario, para continuidad, contexto y voz.
2. El repositorio compartido, especialmente `data/`, informes generados, scripts, documentación, imágenes y estado actual del proyecto.
3. Capturas, exportaciones o cifras aportadas por el usuario en la conversación.
4. Una pregunta concreta al usuario cuando una cifra, fecha, decisión o experiencia sea imprescindible.

Al usar una fuente, conservar su fecha y periodo. No mezclar el mes natural con los últimos 30 días sin decirlo. Si dos fuentes no coinciden, mostrar la discrepancia y explicar cuál se usa.

En este repositorio suelen ser relevantes:

- `data/notebooklm/` para Search Console, sitemap, oportunidades, cannibalización y contenido.
- `data/cloudflare-reports/` para informes de tráfico y páginas vistas.
- `scripts/` para entender cómo se generan los datos o volver a producir un informe local.
- `assets/` y `tweetImages/` para buscar material visual real ya existente.
- `package.json` para localizar comandos de informes, conteos y verificación.

No presentar el contenido de un archivo generado como dato actual si su fecha no cubre el periodo del informe.

## Heurística y sincronización

No intentar reconstruir día a día un mes cuando no existan registros completos. Usar el último post como corte narrativo y triangular tres señales: lo que recuerda el usuario, los cambios visibles en los repos y las métricas agregadas disponibles. Presentar el resultado como una lectura del periodo, no como una auditoría exhaustiva. Marcar siempre si una métrica cubre solo parte del mes.

Si el usuario autoriza explícitamente actualizar los repos antes de preparar el informe, sincronizar primero las apps puras del portátil y después leerlas. Separar esa operación de los juegos: no actualizar ni sobrescribir un juego que el usuario haya indicado que ya está al día o que se programa en el entorno actual. Para repos con cambios locales, conservarlos mediante `--autostash` o un stash verificable; no hacer reset ni descartar trabajo sin autorización expresa. Tras sincronizar, comprobar el commit remoto y el estado local antes de extraer conclusiones.

## Qué buscar cada periodo

Comprobar, cuando exista, la evolución frente al informe anterior:

- ingresos de apps: día, mes, acumulado y si son brutos o netos;
- descargas, usuarios activos, retención, reseñas o uso real de las apps;
- visitas, clics, impresiones, CTR y posición de la web, distinguiendo dominios e idiomas;
- herramientas, apps, idiomas, páginas indexadas y cambios publicados;
- costes de infraestructura, anuncios, stores y otras inversiones;
- lanzamientos, actualizaciones, bugs, bloqueos y trabajo descartado;
- feedback de usuarios, países o casos de uso que hayan sorprendido;
- qué hipótesis se ha validado, cuál no y qué se va a cambiar.

No convertir la lista en un inventario. Elegir las cifras que permitan entender una historia. Un número pequeño puede ser importante si representa un cambio, una señal temprana o una decisión.

## Cómo elegir el ángulo

Priorizar en este orden:

1. Un resultado real, incluso si es modesto.
2. Un problema o error que haya obligado a cambiar el plan.
3. Una señal de uso humano: alguien vuelve, recomienda, paga, escribe o usa una función de una forma inesperada.
4. Una decisión difícil con un coste visible.
5. Una mejora técnica solo si cambia el producto, la velocidad de iteración, la privacidad o los resultados.

No intentar contar todo. La actualización puede mencionar varios frentes, pero necesita una columna vertebral: “esto es lo que ha pasado y esto es lo que ahora creo”. Las piezas visuales deben añadir una lectura nueva; no convertir en imagen una frase que ya está explicada en el texto.

## Voz y tono

Tomar como referencia el hilo real y `references/voice-profile.md`.

- Escribir en primera persona, en español y con lenguaje conversacional.
- Sonar a alguien que acaba de vivir lo que cuenta, no a una marca ni a un consultor.
- Mezclar resultados con sensaciones reales: ilusión, cansancio, cabreo, dudas, orgullo o una risa cuando proceda.
- Usar expresiones coloquiales solo cuando salgan del hecho contado: “me ha tenido frito”, “me he peleado”, “de puta madre”, “no me como un colín”, “ya veremos”.
- Mantener la cercanía del hilo: “Buenas de nuevo”, “toca actualizar”, “para los que os guste el barro”, “os dejo los datos”. No repetirlas mecánicamente.
- Explicar la parte técnica con una consecuencia humana o de negocio. El lector no necesita la arquitectura completa; necesita saber qué problema resolvía y qué ha permitido.
- Mantener los fallos y las dudas. Si algo no se sabe todavía, decirlo.
- Corregir errores que dificulten entender el texto, pero no plancharlo hasta que deje de parecer suyo. No introducir faltas a propósito.

Regla de ortotipografía natural: en el texto final no usar punto y coma ni guiones o rayas como recurso estilístico. Evitar también las comillas tipográficas. Si hacen falta comillas, usar siempre comillas ASCII rectas, como `"esto"` o `'esto'`. Los guiones inevitables de URLs, nombres de repositorios, comandos o términos propios sí se conservan.

Evitar:

- frases de LinkedIn, épica artificial y lenguaje de lanzamiento;
- “éxito de arquitectura”, “infraestructura de primera división”, “escalable” o “mantenible” como afirmaciones sin una prueba concreta;
- defenderse de cada crítica antes de que exista;
- presentar PageSpeed, indexación o volumen de páginas como sinónimo de tracción;
- exagerar una primera visita, descarga o click;
- esconder un dato malo entre cinco párrafos técnicos;
- decir que algo es “útil”, “potente” o “increíble” sin mostrar qué ocurrió;
- hacer que la IA parezca la autora del post. Puede ayudar a ordenar, pero la experiencia, la opinión y la responsabilidad son del usuario.

## Estructura recomendada del post

Adaptarla al periodo; no rellenar secciones por obligación.

1. Apertura breve: fecha, semana/mes y estado emocional o contexto.
2. Qué se ha hecho: dos o tres bloques, empezando por el cambio que más importa.
3. Evidencia: tabla, lista corta o cifras comparadas con el periodo anterior.
4. Lo que ha salido mal o sigue sin resolverse.
5. Lectura honesta: qué significa y qué todavía no significa.
6. Próximo paso: pocas prioridades verificables.
7. Cierre cercano, invitando a preguntas concretas si encaja.

La introducción no debe gastar medio post en repetir el origen del proyecto. Solo recordarlo si ayuda a entender una decisión actual.

## Datos y honestidad

Para cada cifra importante, comprobar:

- valor exacto y unidad;
- fecha de corte y rango temporal;
- si es bruto, neto, estimado o acumulado;
- fuente concreta;
- comparación válida;
- qué conclusión permite y cuál no.

Usar etiquetas internas durante la preparación: `[DATO]`, `[INTERPRETACIÓN]`, `[EXPECTATIVA]` y `[PENDIENTE]`. Quitarlas del texto final salvo que ayuden a aclarar una previsión.

No llamar “ingresos mensuales recurrentes” a una suma de ingresos puntuales si no es recurrente. No llamar “usuarios” a visitas, ni “tracción” a indexación, impresiones o una descarga aislada. Si el usuario usa una métrica con otro significado, conservar su dato pero aclararlo con naturalidad.

## Material gráfico

El gráfico debe demostrar algo que el texto afirma. Priorizar:

- captura real de Search Console con periodo visible;
- evolución de ingresos o descargas con comparación;
- ranking de las herramientas/apps más usadas;
- mapa o distribución geográfica cuando el dato sea significativo;
- captura de una app o función recién publicada;
- antes/después de una migración o rediseño;
- error, bloqueo o decisión documentada si ayuda a contar el proceso.

Para cada pieza especificar: fuente, recorte, dato que debe quedar legible, título o anotación mínima y orden dentro del post. No retocar una captura de forma que altere cifras o contexto. Priorizar gráficas de evolución, comparativas de consultas, embudos de store, ingresos, descargas, CTR, posición, uso y cambios de versión frente a simples resúmenes de tareas.

No generar imágenes realistas, portadas, escenas de escritorio ni ilustraciones de relleno con IA. En este informe no se usa `imagegen`: el material visual tiene que aportar evidencia. Las piezas válidas son capturas reales de producto o de las stores, assets promocionales existentes, comparativas antes/después e infografías deterministas construidas con los datos del periodo.

Una infografía nueva debe mostrar el periodo, la unidad, la fuente y cualquier limitación relevante (por ejemplo, “visitas no son usuarios únicos” o “12 días, no mes completo”). No inventar cifras, logos, pantallas, tendencias, iconos que parezcan datos ni estados de producto. Guardar las piezas en una ubicación descriptiva sin sobrescribir originales y enlazar, cuando proceda, la URL de producción o de la store.

Para ForoCoches, diseñar primero para el scroll: usar banners horizontales y compactos, preferiblemente una sola idea por imagen. No convertir cada banner en una diapositiva corporativa ni en una pieza de marketing: la pantalla, la gráfica o el dato deben ocupar todo el protagonismo. En capturas de producto, no añadir titulares, claims, frases ingeniosas, flechas, iconos ni adornos; basta una composición limpia y elegante con la interfaz real. En gráficas, usar solo las etiquetas y cifras imprescindibles para leer el dato. Las fuentes y limitaciones se conservan en el panel de pruebas y en el texto del post, no se amontonan dentro de la imagen. Si una captura vertical es la única prueba disponible, componerla en un lienzo horizontal con un recorte legible y aire visual, sin rellenar los huecos con decoración que parezca información.

Cuando el usuario aporte referencias visuales, clasificarlas antes de usarlas: estado actual real, material publicado en una store, comparativa real o dirección visual futura. Una maqueta o imagen objetivo —por ejemplo, un rediseño Cozy todavía no implementado— puede explicar el próximo paso, pero debe etiquetarse como referencia o plan y nunca presentarse como una funcionalidad ya publicada.

Antes de incluir una pieza, responder en una línea: “¿qué afirmación demuestra?”. Si la respuesta es “ninguna”, apartarla aunque sea bonita o tenga branding. Las feature graphics sin interfaz, los fondos, las ilustraciones de producto y las pantallas genéricas no entran por defecto. Una landing sí se comparte cuando permite comprobar el producto o el lanzamiento; acompañarla con su URL y no sustituirla por una imagen decorativa.

## Preguntas de seguimiento

Preguntar solo después de investigar. Hacer preguntas cerradas y fáciles de contestar, agrupadas por bloques:

- Periodo exacto: “¿Cerramos del 1 al 31 o últimos 30 días?”
- Números: “¿Estos ingresos son brutos o lo que realmente ha entrado?”
- Hechos: “¿Qué lanzamiento, error o conversación te ha cambiado más el plan?”
- Decisiones: “¿Qué vas a dejar de hacer el próximo mes?”
- Gráficos: “¿Puedes pasar captura de descargas, ingresos y Search Console del mismo periodo?”

No pedir al usuario que repita datos ya presentes en el hilo o en un archivo. Si solo falta una cifra secundaria, redactar el informe y señalarla como pendiente en vez de bloquearlo.

## Control final

Antes de entregar:

- el texto tiene un ángulo claro y no parece una lista de tareas;
- cada afirmación fuerte tiene un dato, ejemplo o se presenta como opinión;
- hay al menos un resultado y un problema o incertidumbre;
- el periodo y las unidades son inequívocos;
- las imágenes propuestas son posibles con material real disponible;
- el tono conserva cercanía, humor seco y vulnerabilidad sin actuar;
- el siguiente mes puede comparar las mismas métricas;
- no se ha inventado ningún número, usuario, emoción, comentario ni funcionalidad.

Para el perfil de voz y las métricas mínimas, leer solo cuando sean necesarios:

- [Perfil de voz](references/voice-profile.md)
- [Checklist de datos y gráficos](references/monthly-data-checklist.md)
