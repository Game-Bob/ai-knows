---
name: curar-redes
description: Skill para curar y analizar con IA las publicaciones captadas en X/Twitter y Reddit por npm run social, descartando hilos de spam, plantillas de prompts de IA y marketing, y generando un plan de respuestas de captación de tráfico e ideas de herramientas validadas.
---

# 🎯 SKILL: Curación Inteligente de Redes y Tráfico (Social Outreach AI)

## 📋 PROPÓSITO
Filtrar con razonamiento y juicio crítico de LLM los datos recolectados por `npm run social` en Twitter/X y Reddit. Separa el ruido (prompts de ChatGPT compartidos en hilos, spam de cursos, marketing de afiliados, noticias) de las **oportunidades reales de negocio**:
1. **Captación de Tráfico Directo:** Usuarios reales con una duda o dolor técnico exacto que se resuelve con una herramienta interactiva existente de `gamebob.dev` o `jjlmoya.es`.
2. **Nuevas Utilidades Validadas:** Usuarios que expresan frustración por tener que calcular algo manualmente o piden una herramienta interactiva inexistente.

---

## 🔄 FLUJO DE TRABAJO POR PASOS

### Paso 1: Ejecutar la Recolección Social
1. Comprueba si existen los archivos:
   - `data/notebooklm/social-traffic-outreach.md`
   - `data/notebooklm/social-tool-requests.md`
2. Si no existen o están desactualizados, ejecuta:
   ```bash
   npm run social
   ```

---

### Paso 2: Filtrado Semántico y Descarte de Ruido (Criterio LLM)

Aplica juicio estricto para **DESCARTAR**:
- **Prompts de IA compartidos:** Tweets tipo *"2. Calculate TAM/SAM/SOM: Use this ChatGPT prompt..."* o listas de plantillas.
- **Hilos de marketing y finanzas genéricas:** *"How to calculate compound interest for your first million..."*
- **Noticias, política o deportes:** Tweets de Fórmula 1, fichajes o estadísticas de noticias.
- **Spam de bots o respuestas automáticas.**

Conserva **ÚNICAMENTE**:
- Hilos de comunidades técnicas (`r/fpv`, `r/espresso`, `r/AudioEngineering`, `r/gamedev`, etc.) o tweets de usuarios con preguntas técnicas concretas.
- Peticiones explícitas de fórmulas, conversores o calculadoras.

---

### Paso 3: Cruce con el Catálogo de Herramientas

Para las consultas válidas:
1. Comprueba si alguna herramienta en `jjlmoya-utils-*` o `sitemaps` resuelve el cálculo exacto.
2. Si **COINCIDE**:
   - Diseña una respuesta personalizada y empática (en inglés o español según el idioma del post), destacando que es una herramienta web gratuita, interactiva, sin registros ni publicidad.
3. Si **NO EXISTE (Nueva Tool)**:
   - Define el concepto de la nueva herramienta, las entradas necesarias (inputs) y a qué categoría `jjlmoya-utils-<categoría>` pertenece.

---

### Paso 4: Generación del Informe de Leads Curados

Escribe o actualiza `data/notebooklm/curated-social-leads.md` con la siguiente estructura:

```markdown
# 🚀 Leads Sociales Curados con IA (Tráfico y Nuevas Herramientas)

Generado: [Fecha y Hora]

## 1. Captación de Tráfico Inmediato (Respuestas Listas para Enviar)

### [PLATAFORMA] [Título o Resumen del Post]
- **Autor:** @usuario o u/usuario
- **Enlace:** [Link a la conversación](url)
- **Herramienta Recomendada:** `[slug-herramienta]` ([URL](https://www.gamebob.dev/en/...))
- **Por qué encaja:** [Explicación de por qué resuelve la duda técnica del usuario]
- **Mensaje Sugerido para Responder:**
> [Texto personalizado listo para copiar y responder]

---

## 2. Nuevas Herramientas Solicitadas por la Comunidad

### [Nombre de la Herramienta] (`slug-propuesto`)
- **Origen:** [Plataforma / Enlace al hilo]
- **Categoría Sugerida:** `jjlmoya-utils-<categoría>`
- **Problema Planteado:** [Qué cálculo o necesidad técnica manual expresó el usuario]
- **Inputs Propuestos:** [Parámetros a introducir]
- **Fórmula o Lógica:** [Cómo se calcula]
```
