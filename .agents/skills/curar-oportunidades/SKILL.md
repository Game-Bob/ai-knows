---
name: curar-oportunidades
description: Skill para curar y analizar con IA las intenciones de búsqueda de global-suggest-engine.md, filtrando ruido orgánicamente contra el código de jjlmoya-utils-* y generando un plan ejecutivo accionable (Esta herramienta, por qué y cómo gestionarla).
---

# 🧠 SKILL: Curación Inteligente de Oportunidades (Suggest Engine a Plan Ejecutivo)

## 📋 PROPÓSITO
Analizar con criterio e inteligencia de LLM los datos de búsqueda recolectados en `global-suggest-engine.md`, descartando ruido orgánicamente, verificando contra las herramientas reales de cada repositorio `jjlmoya-utils-*` y sintetizando un informe de oportunidades listo para implementar.

---

## 🔄 FLUJO DE TRABAJO POR PASOS

### Paso 1: Leer el Informe de Suggest Engine
1. Comprueba si existe `data/notebooklm/global-suggest-engine.md`.
2. Si no existe o está desactualizado, ejecuta:
   ```bash
   npm run discover
   ```
3. Lee las oportunidades detectadas para la categoría deseada (o todas las categorías).

---

### Paso 2: Inspeccionar el Repositorio de la Categoría
Para cada categoría analizada, lista las herramientas ya existentes en su código fuente local:
```powershell
Get-ChildItem -Path d:\code\jjlmoya-utils-<categoría>\src\tool -Directory
```
Revisa brevemente los nombres de carpetas y ficheros `entry.ts` para entender qué cálculos y utilidades ya están cubiertos al 100%.

---

### Paso 3: Criba y Razonamiento Orgánico (LLM)
Aplica juicio experto para filtrar:
1. **Descartar Ruido:**
   - Consultas meramente informativas o tutoriales ("how to fly", "meaning", "laws in uk", "second hand").
   - Búsquedas de productos comerciales, marcas concretas o descargas de apps/juegos.
2. **Priorizar Utilidades Interactivas:**
   - Fórmulas matemáticas, tablas de proporciones, simuladores, conversores de unidades y evaluadores técnicos.
3. **Verificación de Cobertura Real:**
   - Si la herramienta ya existe o su cálculo es un subconjunto trivial de una herramienta existente en el repo, descártala.
   - Si resuelve un caso de uso independiente con alta demanda, acéptala como oportunidad prioritaria.

---

### Paso 4: Redacción del Plan Ejecutivo (Estructura Obligatoria)

Para cada herramienta aprobada, genera una ficha con la siguiente estructura exacta:

```markdown
### [Nombre de la Herramienta en Inglés] (`[slug-en-kebab-case]`)
- **Categoría / Repositorio:** `jjlmoya-utils-<categoría>`
- **Tipo:** Calculator | Converter | Simulator | Chart | Generator | Timer | Tester

#### ¿Por qué crear esta herramienta?
[Explicación de la demanda real encontrada en buscadores, qué problema técnico o matemático recurrente resuelve para el usuario y por qué no está cubierto por las herramientas actuales de la categoría].

#### ¿Cómo gestionarla e implementarla?
- **Entradas Requeridas (Inputs):** [Lista de parámetros y datos que introduce el usuario con sus unidades].
- **Lógica de Cálculo y Fórmulas:** [Explicación de la fórmula matemática, constantes o algoritmo a implementar en logic.ts].
- **Experiencia de Usuario (UX) y Visualización:** [Componentes clave: sliders, presets rápidos, tarjetas de diagnóstico, gráficos o badges dinámicos].
```

---

### Paso 5: Exportar y Presentar al Usuario
1. Guarda el informe curado en:
   📁 `data/notebooklm/curated-opportunities.md`
2. Presenta al usuario el resumen ejecutivo con el Top de oportunidades ordenadas por impacto para que pueda seleccionar cuál crear inmediatamente con `nueva-tool-oportunidad`.
