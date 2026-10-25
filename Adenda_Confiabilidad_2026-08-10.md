# ADENDA AL INFORME DE CONFIABILIDAD DE CALIBRAR
### Segunda medición · 10-ago-2026

> **Por qué existe esta adenda.** El `Informe_Confiabilidad_Calibrar` es del 30-jul-2026 y sus dos cifras principales quedaron obsoletas: reportaba **40/40 invariantes** y un evaluador que **reprobaba el caso dorado con 5 fallos**. Ambas cambiaron. Este documento no corrige un error del informe — informa una **segunda medición** sobre el mismo objeto, once días después.
>
> Eso convierte al informe del 30-jul en lo que un evaluador pide y casi nunca recibe: **una línea base real, con un antes y un después medidos con el mismo instrumento.**

---

## 1 · Qué se volvió a correr

Tres comandos, en `Calibrar/01 Producto/`, el 10-ago-2026:

```bash
python3 qa_calibrar.py
python3 qa_mutacion.py
python3 evaluar_salida.py Fixture_Ecostar_Evaluador.json --caso ecostar
```

Reproducibles por un tercero. La regla de "que otro revise" del informe original sigue pendiente: el perfil natural en el equipo es Andrés Farías.

---

## 2 · Los tres resultados

### 2.1 · QA de invariantes: de 40/40 a 110/110

| | 30-jul-2026 | 10-ago-2026 |
|---|---|---|
| Invariantes verificadas | 40 | **110** |
| Grupos | 6 | **13** |
| Resultado | 40/40 pasan | **110/110 pasan** |
| Corpus | PRD 3.062 líneas | PRD **3.392** · Matriz 2.067 · Anexo G 479 · **20.477 caracteres emitidos por el front** |

Los 13 grupos: MOTOR (7) · CONTRATO (6) · COBERTURA (7) · BORDE (5) · SALIDA (7) · DOC (20) · PROMPT (8) · EVALUADOR (10) · RUNNER (5) · BLACKBOX (6) · REALES (12) · CANAL (6) · **PRESENTACIÓN (11)**.

El crecimiento no es cosmético. El grupo **PRESENTACIÓN**, incorporado el 6-ago, no lee el front: lo **ejecuta** en un micro-DOM y comprueba qué sale efectivamente a la pantalla. Verifica que lo proyectado no emita la taquigrafía interna `E1`–`E7`, no emita el nombre real del cliente, no emita vocabulario interno y **no prometa un diagnóstico automático, con IA ni instantáneo**.

Ese último es un guardrail de negocio convertido en verificación automática.

### 2.2 · El evaluador pasó de rojo a verde

El informe del 30-jul reportó su hallazgo más incómodo: `evaluar_salida.py`, la herramienta que juzgaría la primera corrida real, **reprobaba al propio caso dorado del PRD con 5 fallos**. Todos por arrastrar la escala vieja `E0`–`E6`, corrida en uno, y un vocabulario de áreas desactualizado. Si el motor hubiera producido una salida perfecta, el evaluador la habría marcado como defectuosa.

**Corregido el 2-ago-2026.** Resultado de hoy:

| Nivel | Resultado |
|---|---|
| Nivel 1 · estructural | ✅ |
| Nivel 2 · invariantes del dashboard | ✅ incluida MED-1 |
| **Comparación contra el caso dorado Eco Star** | **✅ 9/9** |
| Veredicto | **APTA en niveles 1 y 2** |

Las 9: eslabón dominante = 5 · área = Automatización y agentes · E2 sano · E3 roto · E4 roto · E5 roto · E6 roto · E1 sin_datos · E7 sin_datos.

Queda abierto el **nivel 3**, la rúbrica de contenido, que la juzga una persona y no un script. El evaluador lo declara explícitamente en vez de simular que pasó.

### 2.3 · La prueba de mutación: 104 de 110 son capaces de fallar

Herramienta nueva desde el informe original. `qa_mutacion.py` es **la auditoría del auditor**: rompe el corpus a propósito, un artefacto a la vez, y mide cuántas de las 110 verificaciones son capaces de ponerse en rojo.

| Resultado | Valor |
|---|---|
| Verificaciones falsificables | **104 de 110** |
| Verificaciones decorativas | **0** |
| De las 6 restantes | 3 comprueban una ausencia · 3 leen archivos fuera del alcance de la prueba |

Dependencias detectadas al borrar cada artefacto: PRD **64** verificaciones · `presentacion.js` **10** · `evaluar_salida.py` **9** · `blackbox_calibrar.py` **8** · `correr_motor.py` **7** · `data.js` **6** · `casos_reales.py` **5** · Matriz, Anexo G y `presentacion.html` **1** cada uno.

**Por qué importa más que el 110/110.** Un QA que pasa siempre no prueba nada: puede estar verificando cosas que no pueden fallar. La mutación es lo que le da valor al verde. Ninguna de las 110 es decorativa.

---

## 3 · Lo que NO cambió, y sigue siendo el hecho central

**El motor nunca ha corrido punta a punta.** Cero corridas. Sin corridas no hay denominador, y por lo tanto:

| Métrica | Valor | Por qué |
|---|---|---|
| Tasa de éxito / calidad del diagnóstico | `N/D` | Cero corridas |
| Latencia por turno (umbral < 10 s) | `N/D` | Requiere el pipeline en vivo funcionando |
| Afirmaciones erradas dichas en voz alta (umbral 0) | `N/D` | Métrica de daño; solo medible en reunión real |
| Consumo real de tokens | `N/D` | Falta `count_tokens` y el campo `usage` de una llamada real |

Se declara `N/D` en vez de fabricarlo — la misma regla que el motor le impone al modelo.

**Qué se midió entonces, dicho con precisión:** no se midió el acierto del motor. Se midió la **integridad de la especificación** y la **capacidad del propio verificador de detectar un defecto**. Son dos afirmaciones distintas y no hay que confundirlas.

---

## 4 · Qué queda pendiente para una línea base del motor

Del §7 del informe original, con su estado al 10-ago:

| # | Paso | Estado |
|---|---|---|
| 1 | Corregir `evaluar_salida.py` (escala 1–7, casos de referencia, vocabulario de áreas) | ✅ **Hecho el 2-ago** |
| 2 | Corregir el residuo "= 4" de la tabla G.5 del PRD | ✅ **Hecho** — el QA pasa 110/110 |
| 3 | `count_tokens` del Anexo E y resolver la discrepancia 51k vs 181k caracteres | ⬜ Pendiente · requiere credencial |
| 4 | Primera corrida punta a punta del caso Eco Star, guardando JSON y `usage` | ⬜ **Bloqueante de todo lo demás** |
| 5 | Batería de repetibilidad: 3 casos × 5 repeticiones | ⬜ Pendiente |
| 6 | Verificar que la caché se lee (`cache_read_input_tokens` > 0) | ⬜ Pendiente |
| 7 | Métricas de §6.1 en reuniones reales | ⬜ Pendiente |

Los pasos 1 y 2 estaban en la lista y se cumplieron. Del 3 en adelante todos requieren credencial de API, y el proyecto sigue en pausa de desarrollo desde el 19-jul-2026 por prioridad de caja.

---

*Precisión Agencia · Proyecto Calibrar · Segunda medición ejecutada el 10-ago-2026 sobre PRD v5.5, Matriz v1.6, Anexo G Ext. v3.1 y `03 Front/`. Adenda al `Informe_Confiabilidad_Calibrar` del 30-jul-2026.*
