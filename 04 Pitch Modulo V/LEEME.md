# PITCH MÓDULO V · CALIBRAR
### Presentación evaluada de 5 minutos · Diplomado IA para los Negocios, U. de los Andes

---

> ## ⚠️ 8-sep-2026 — qué se perdió el 6-sep y qué se recuperó
>
> El borrado del 6-sep-2026 se llevó **cuatro archivos de esta carpeta** y vació `assets/`. Esta tabla
> los daba por presentes hasta hoy, que es el mismo defecto que la auditoría venía persiguiendo en otras
> carpetas: **un documento que describe archivos que no existen.**
>
> | Archivo | Estado |
> |---|---|
> | `Calibrar_Demo.html` | ✅ **Rehecho el 8-sep**, y ahora **con generador** — `build_demo.py`. Ver abajo |
> | `Calibrar_Entregable.html` | ❌ **Perdido.** Su contenido vive hoy en `04 Cabina/resultados.html`, que es el archivo vigente para compartir un resultado |
> | `Pitch_Calibrar_ModuloV.pdf` | ❌ **Perdido.** Se regenera exportando el `.pptx`, que sí sobrevivió |
> | `build_pptx.py` | ❌ **Perdido.** El `.pptx` del 13-ago sobrevivió, pero **ya no se puede regenerar**: hay que rehacer el generador si el deck se toca |
>
> **La lección, y es la regla general de versiones de `CLAUDE.md`:** lo que solo existe como salida se
> pierde; lo que tiene generador se rehace con un comando. Por eso el demo volvió como `build_demo.py`
> y no como un `.html` escrito a mano.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| **`Pitch_Calibrar_ModuloV.pptx`** | **Lo que se sube y se presenta.** 12 láminas para 5 minutos: pantallas reales del prototipo, gráficos, fuentes citadas, stack y presupuesto. Nota del orador en todas |
| ~~`Pitch_Calibrar_ModuloV.pdf`~~ | ❌ **Perdido el 6-sep-2026.** Se regenera exportando el `.pptx` |
| `pitch_calibrar.html` | Deck minimalista anterior (6 láminas, tope 20 palabras). Queda como alternativa de proyección |
| `verifica_pptx.py` | Verifica el .pptx: marca, 4 preguntas de la pauta, límites de discurso. **31/31 pasan** — el conteo decía 34 y eran 31, y tres de sus rojos medían la *redacción del título* en vez de la cobertura: el deck rotula «PREGUNTA 2 · PRESUPUESTO» porque las láminas topan en 20 palabras. Corregido el 8-sep-2026 para pedir la marca de pauta **y** el tema |
| `verifica_estandar.py` | Verifica el HTML contra las 6 decisiones. 23/23 |
| ~~`build_pptx.py` + `assets/`~~ | ❌ **Perdidos el 6-sep-2026.** El `.pptx` sobrevivió pero ya no se regenera |
| **`build_demo.py`** | **Genera `Calibrar_Demo.html`** leyendo `03 Front/assets/data.js` — el mismo origen que `qa_comercial.py` verifica contra la cabecera real. No editar el `.html` a mano: `python3 build_demo.py` |
| **`Calibrar_Demo.html`** | **Demo histórico del pitch: el método y el entregable en una sola pantalla.** Autocontenido y pre-anonimizado. Cadena cliqueable, triage borroso con mantener-apretado, ficha formal con la columna real del maestro, cifras con su evidencia, semáforo, hipótesis, soluciones, plan, notas que se autoguardan y reloj con corte a los 30. ⚠️ **NO es ninguno de los cuatro archivos que se usan ante un prospecto** (ver `CLAUDE.md`): para eso van `03 Front/presentacion.html` y los de `04 Cabina/`. **Sin grabadora a propósito** — portarla exige la puerta de consentimiento que sigue pendiente (Ley 21.719) |
| ~~`Calibrar_Entregable.html`~~ | ❌ **Perdido el 6-sep-2026.** Lo reemplaza `04 Cabina/resultados.html`, que es el archivo vigente para compartir un resultado |

```bash
python3 build_demo.py      # regenera Calibrar_Demo.html
python3 verifica_pptx.py  # verifica el .pptx (34/34)
```

---

## El recorrido — 12 láminas, 5 minutos

| # | Lámina | Qué muestra |
|---|---|---|
| 01 | Portada | Hook + qué es, en una línea |
| 02 | Qué resuelve | 3 números grandes: 7 eslabones · 28 preguntas · 30' |
| 03 | Contra qué se estudió | 6 benchmarks con su fuente: MIT/InsideSales·HBR 2011, WordStream/LocaliQ, CCS 2024, Benchmarkit, Meta, DataReportal |
| 04 | El método | **Pantalla real**: la Cadena + tabla "cómo suena cada eslabón" |
| 05 | La conversación | **Pantalla real**: 30 minutos presupuestados al minuto |
| 06 | El veredicto | **Pantalla real**: caso real anonimizado, eslabón 05 dominante |
| 07 | La data | **Pantalla real**: tabla de cifras con N/D declarado |
| 08 | Dónde corre | Front (navegador, sin servidor) · Backend (API Anthropic: sonnet-5 en vivo, opus-5 cierre, caché) · QA Python · Repositorio |
| 09 | ¿Funciona de verdad? | **Gráfico**: 40→110 invariantes + dona 104/110 falsificables |
| 10 | Presupuesto | **Gráfico**: \$192–240 mil vs \$290–340 (escala log) + reservas + payback N/D |
| 11 | Si falla / si se cae | Dueño · aviso · freno · plan B — y el riesgo dicho en ámbar |
| 12 | Cierre | Próximo paso: primera corrida punta a punta |

Los pantallazos salen de **`../03 Front/presentacion.html`** servido localmente (nunca `index.html`). El caso mostrado es el caso real anonimizado que la propia app declara como «nombre reservado».

---

## Antes de entrar a la sala

- [ ] `.pptx` subido antes de la hora de corte
- [ ] PDF (el mismo deck) en el pendrive
- [ ] `presentacion.html` abierto en una pestaña, probado
- [ ] Los cuatro documentos de respaldo a mano: Confiabilidad + Adenda · Ficha Económica · Gobernanza · PRD v5.5
- [ ] Sesión iniciada **antes** de entrar

## Lo que se dice en voz alta (está en las notas de cada lámina)

- **Lámina 06/07** — es el método conducido a mano cargado en el prototipo. **No es el motor corriendo.**
- **Lámina 09** — lo medido es la especificación y el verificador, **no el acierto del motor** (nunca ha corrido; N/D).
- **Lámina 10** — la revisión va incluida (es estructural), y esas 32–40 h **no están hoy en el calendario**: el valor es hacer posible un diagnóstico que hoy no se hace.

---

*Precisión Agencia · Proyecto Calibrar · Deck de 5 minutos, 13-ago-2026 · Petróleo #0D4F6A + ámbar #F5A623 · Logos reales de `Diseños y Fotos/LOGOS PRECISION/`*
