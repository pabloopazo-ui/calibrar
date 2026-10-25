# Anexo G (extendido) — Set dorado de verificación

> **Estado tras la v3.2 del PRD (27-jul-2026).** Este anexo verifica la **capa de análisis** —las 6 secciones internas— y sigue vigente completo para eso. Lo que cambió: el entregable ahora es el **dashboard de 5 bloques, 0 a 4** (PRD §5.8), cuyas invariantes son `DB-1` a `DB-17` en el PRD y cuyo caso dorado está en las secciones G.3 (vía A) y G.4 (vía B) del Anexo G del PRD.
>
> Cuidado con la nomenclatura: aquí `D-1` y `D-2` son **defectos detectados** (ambos ya corregidos en el PRD v3.1); en el PRD, `DB-1` a `DB-17` son **invariantes del dashboard**. No son lo mismo.
>
> **Actualización tras el QA del 28-jul-2026 (PRD v5.1):** las invariantes del dashboard se ampliaron de 8 a 17 (`DB-1` a `DB-17`) y el dashboard pasó de 3 bloques a 5 (0 a 4). Las referencias de este documento a "DB-1 a DB-8" apuntan al conjunto original; la lista vigente está en §5.8.4 del PRD. Este anexo sigue siendo válido para verificar la **capa de análisis** (las 6 secciones internas), que no cambió.
>
> **Actualización del 5-sep-2026 (PRD v5.7) — G.7 realineado a la Cadena.** Detectada en la auditoría semanal: **G.7 seguía escrita para el criterio de descarte de la v3.x**, abolido el 28-jul-2026. La invariante **I-5** exigía declarar fuera de perfil a todo prospecto sin pauta activa —con `score ≤ 2` y `visitar: "no"`—, que es exactamente el perfil de **Ignacio**, el arquetipo mayoritario de la base. Se corrigieron I-5, I-6, I-10, el criterio C7.1, los antipatrones y las dos últimas filas de la tabla dorada, y el esquema pasó de `capa_dominante` (1–5, escala interna de pauta) a **`eslabon_dominante` (1–7, la Cadena) + `capa_e3` (1–5, solo cuando el eslabón es 3)**. Fuentes de la corrección, sin nada inventado: PRD **§2.4** (qué sigue siendo fuera de perfil y qué dejó de serlo), **§5.6** (rúbrica de score y dos listas), **§H.5** (la maestranza, con sus sub-scores verbatim) y el paso 4 del proceso de razonamiento (ruteo grupo ↔ eslabón).
>
> ⚠ **Qué NO cambió, y no hay que "corregirlo":** las **capas 1–5** de §5.3 siguen plenamente vigentes en G.1–G.6 y G.9. No son una escala superada: son la anatomía interna del análisis de pauta, y los pasos 4 a 8 del proceso de razonamiento las declaran **«solo E3»**. Lo que estaba mal no era usarlas, era usarlas como si fueran la Cadena en la capa de prospección.
>
> Pendiente de este documento: extender G.8 con los criterios de la vía B y con el caso dorado del ICP real (PRD §10, pendientes 10 y 15).

**Calibrar · para PRD v3.1 · julio 2026**
Reemplaza el Anexo G de la v3.0, que traía salida esperada solo para las secciones 1, 3 y 6 y lo declaraba explícitamente: *"Muestra abreviada: las secciones 2, 4 y 5 siguen la misma estructura del esquema del Anexo E."*

Todos los esquemas de este anexo son **verbatim del Anexo E**. Si difieren, manda el Anexo E: un caso de prueba que no usa el contrato real no prueba nada.

> **Nota de alcance (v3.1).** Se acepta el cuestionamiento de priorización recibido en la revisión del prototipo. El núcleo del producto es el **Uso 1** (§3.2): segmentar y priorizar la base de prospección. El informe individual (Usos 2 y 3) es el artefacto **subordinado** que sustenta cada fila de esa base. En consecuencia se agrega **G.7**, caso dorado de la base priorizada, que no existía.

---

## G.0 · Defectos detectados en el Anexo G v3.0

Antes de extender el set dorado hay que corregirlo. Al contrastar la salida esperada contra las reglas del propio PRD aparecen dos inconsistencias. Ninguna se detectó antes porque nadie había verificado el Anexo G contra §5.3, §5.5 y §7.1 — que es precisamente para lo que sirve tener criterios de aceptación explícitos.

### D-1 · El mapeo `ataca_problema` está cruzado — defecto, sin decisión de por medio

En `seccion_6_tres_acciones_prioritarias` del Anexo G v3.0:

| Acción | `ataca_problema` declarado | Problema que realmente ataca |
|---|---|---|
| 1 · Verificar Pixel, activar CAPI, crear evento, agregar UTMs | `1` | **2** — cuenta ciega |
| 2 · Cambiar objetivo de "Tráfico" a Conversiones | `2` | **1** — objetivo Tráfico |
| 3 · Pausar LinkedIn y concentrar en Meta | `3` | 3 — LinkedIn sobre ticket bajo |

Las acciones 1 y 2 están intercambiadas respecto de los `tres_hallazgos` de la sección 1. El `reasoning` de la sección 6 describe la secuencia correcta ("primero se destapa la medición, luego se corrige el objetivo"); solo fallan los números.

No hay ambigüedad de diseño: es un error de numeración. **Corregido en G.6 de este anexo.**

> Dato relevante: el prototipo externo construido a partir de este PRD renderiza "Ataca el problema 2 / 1 / 3" — corrigió el mapeo en silencio. Un implementador arregló el defecto sin reportarlo, que es exactamente lo que un set dorado sin verificación permite que pase.

### D-2 · El orden de los tres hallazgos contradice la regla de capas — requiere decisión tuya

El `reasoning` de la sección 1 dice *"Tres hallazgos dominantes en orden de capa"* y a continuación los etiqueta **Capa 3 → Capa 2 → Capa 1**. Es el orden inverso al que exigen tres puntos del PRD:

- §5.3: *"Un problema en las capas 1 o 2 invalida cualquier optimización de las capas superiores."*
- §5.5 paso 8: *"respetando el orden de capas (un problema de Capa 1 siempre va antes que uno de Capa 4)."*
- §7.1 regla 6: *"El diagnóstico se aplica EN CAPAS."*

Por regla literal, el hallazgo de LinkedIn sobre ticket de $29.990 (Capa 1, viabilidad económica, Grupo A) debería ir **primero**, no tercero.

Pero hay una razón sustantiva para el orden actual, y por eso esto no es un simple error: **el hallazgo de Capa 1 aquí es de alcance de canal, no de cuenta.** ContaBoost no es inviable; lo es *LinkedIn para ContaBoost*. Meta con $400.000 y ticket de $29.990 sí puede funcionar. Un problema de Capa 1 que afecta a un canal no debería desplazar a un problema de Capa 2 o 3 que afecta a toda la cuenta.

La regla actual no distingue esos dos casos. Hay que elegir:

| Opción | Qué implica |
|---|---|
| **A · Reordenar el caso** | LinkedIn/ticket pasa a hallazgo 1. El Anexo G queda conforme a la regla tal como está escrita. Cambia también la sección 5 y el mapeo de la 6. |
| **B · Calificar la regla** (recomendada) | §5.3 y §5.5 paso 8 pasan a distinguir hallazgo **de alcance de cuenta** vs **de alcance de canal**. Un hallazgo de Capa 1 acotado a un canal no antecede a uno de Capa 2/3 que afecta la cuenta completa. El orden actual del Anexo G queda correcto y además queda justificado. |

Recomiendo **B**: el orden actual refleja mejor la realidad comercial —lo primero que hay que arreglar en ContaBoost es la medición, no pausar LinkedIn— y la regla gana precisión en vez de forzar un caso que está bien razonado.

**Este anexo asume la opción B.** Si eliges A, hay que reordenar G.5, G.6 y la sección 1 del Anexo G v3.0.

---

## G.0.1 · Cómo se evalúa una corrida

§6.2 ya define la checklist de aceptación de 6 puntos. Este anexo **no la reemplaza**: la desagrega por sección y le agrega las reglas que no eran verificables sin salida esperada.

| Nivel | Qué mide | Cómo se resuelve | Si falla |
|---|---|---|---|
| **1 · Estructural** | ¿JSON válido, sin markdown, con las 6 secciones y su `reasoning`? | Validación de esquema. Binario. | Rechazo. No se evalúan los niveles 2 y 3. |
| **2 · Invariantes** | ¿Se cumplen las reglas duras (trazabilidad, N/D, coherencia entre secciones)? | Chequeo programático. Binario por regla. | Rechazo. Es defecto, no diferencia de criterio. |
| **3 · Rúbrica** | ¿El contenido es correcto y útil? | 0/1/2 por criterio contra la salida esperada. Revisor humano o LLM-juez. | Se compara contra el umbral de la sección. |

**Un antipatrón detectado reprueba la sección completa**, sin importar el puntaje de rúbrica.

### Trazabilidad con §6.2

| Punto de §6.2 | Dónde se verifica aquí |
|---|---|
| Solo JSON, sin markdown | Nivel 1 |
| 6 secciones completas con `reasoning` | Nivel 1 |
| Landing sale N/D | I-M3 + G.3 (sin cambios respecto de v3.0) |
| Contradicción P16/P19 detectada y no resuelta | I-M2 + C4.4 (eliminatorio) |
| Hallazgos ordenados por capa | I-1, I-3 + D-2 |
| Lenguaje de negocio, no métricas de plataforma | Antipatrón transversal |

### Invariantes del bloque `meta` — comparación exacta

El bloque `meta` es el único de todo el output que admite comparación literal. Es la verificación más barata y la que primero debe correr.

- **I-M1 · `datos_faltantes` == `["P14", "P17", "P27"]`.** Ni más ni menos. P17 falta porque P16 es "no estoy seguro" (condicional no disparado), P27 porque P26 es "no lo tengo medido", P14 porque P13 es "Todo Chile".
- **I-M2 · `contradicciones_detectadas` contiene exactamente 1 elemento**, y es el par P16/P19. Cero elementos = el motor no detectó la contradicción deliberada → reprueba. Dos o más = está fabricando contradicciones.
- **I-M3 · `landing_evaluable == false`.**
- **I-M4 · `nombre_empresa == "ContaBoost"` y `tipo_negocio` identifica B2B.**

§12.4 propone usar `contradicciones_detectadas` y `datos_faltantes` como señal de confianza para decidir qué informes necesitan revisión humana. Estas invariantes son el prerrequisito: **si esos campos no son confiables, no sirven como señal de triaje.** Verificarlos es lo que habilita bajar el costo de revisión.

### Invariantes transversales

Derivadas de §7.1 (reglas inviolables). Nivel 2.

- **R1 · No inventar.** Ningún dato ausente de P1–P28 o de `landing_html`. Prohibido estimar CPL, CAC, LTV o tasas de conversión de ContaBoost.
- **R2 · Trazabilidad.** Toda afirmación cita `Pxx`, `Pxx × Pyy` o un cruce de la Matriz. Afirmación sin evidencia = defecto.
- **R3 · N/D explícito.** Dato ausente se declara `N/D` nombrando el `Pxx`.
- **R4 · Contradicciones se señalan, no se resuelven.**
- **R5 · Benchmarks de agencias chilenas marcados `[referencial]`.** Aplica a CPL Chile por industria y presupuesto mínimo Meta Chile. No aplica a WordStream ni DataReportal.
- **R6 · Capas.** Según la opción elegida en D-2.
- **R7 · Lenguaje de negocio.** CAC, CPL, ticket, margen, cierre. Impresiones, alcance o CTR solo como evidencia de un problema de negocio.

---

## G.1 · Entrada ContaBoost

Sin cambios respecto de la v3.0. Referencia rápida de lo que las secciones nuevas citan:

| Campo | Valor |
|---|---|
| P1 / P2 | B2B · SaaS de facturación electrónica y contabilidad para PYMEs |
| P5 ticket | $29.990 CLP/mes (suscripción) |
| P7 plataformas | Meta + LinkedIn |
| P8 | Más de 6 meses invirtiendo |
| P9 presupuesto | $400.000 CLP/mes |
| P10 objetivo | Tráfico al sitio web |
| P11 destino | Landing propia (prueba gratis) |
| P13 / P14 | Todo Chile · sin detalle |
| P15 copy | "La forma más fácil de llevar tu contabilidad… Prueba gratis 14 días. Haz clic y empieza hoy." |
| P16 / P17 | "No estoy seguro si lo tengo instalado" · sin ID |
| P18 / P19 | "No sé qué es la CAPI" · "Creo que tengo algunos eventos, no sé si funcionan" |
| P20 / P21 | Sin UTMs · GA4 instalado |
| P22 / P23 / P24 | Dueños y gerentes de PYMEs · dueño de PYME 5–20 empleados con contabilidad en Excel o contador externo caro · 35–54 años |
| P25 síntoma | "Los leads no califican — piden información, prueban y desaparecen." |
| P26 / P27 | No mide CPL · sin dato |
| P28 | Agencia 6 meses solo con reportes de impresiones; cambió público 3 veces; el costo por resultado subió |
| `landing_html` | Vacío a propósito |

**Condiciones que ejercita:** contradicción declarada (P16/P19), fuente externa no disponible (landing), condicionales no disparados (P14, P17, P27), desalineación canal-ticket, incoherencia objetivo-meta, y P28 con historial de agencia — el arquetipo Carolina.

---

## G.2 · Sección 2 — `seccion_2_analisis_copy`

### Esquema (Anexo E, verbatim)

```json
"seccion_2_analisis_copy": {
  "reasoning": "Qué cruces de Grupo F aplican y por qué.",
  "filtra_al_icp": "string | N/D",
  "uso_de_negacion_hook": "string | N/D",
  "friccion_cta": "string | N/D",
  "veredicto": "string — directo, sin eufemismos"
}
```

Cuatro strings planos. **No convertir en objetos anidados**: cambiaría el contrato con el Anexo E, el parser de Make (paso 5 de §8) y la plantilla de Google Docs (§10 pendiente 2).

### Salida esperada

```json
"seccion_2_analisis_copy": {
  "reasoning": "Aplican dos cruces de Grupo F: 'copy genérico + B2B → no filtra al decisor' y 'copy no menciona al ICP declarado', ambos MODERADOS. Se subordinan explícitamente: el copy es Capa 3 y la cuenta tiene problemas de Capa 2 (medición) sin resolver. Reescribirlo ahora no produciría señal medible porque no hay con qué medirla.",
  "filtra_al_icp": "No. El copy es genérico —'la forma más fácil de llevar tu contabilidad'— y no nombra al dueño de PYME que hoy lleva la contabilidad en Excel o con un contador externo caro, que es el ICP que declaraste en P23. Nada en el aviso hace que un no-calificado se descarte solo.",
  "uso_de_negacion_hook": "No usa negación. No repele a nadie: cualquiera que busque 'contabilidad fácil' hace clic, incluidos contadores, estudiantes y curiosos que nunca van a pagar una suscripción. Con el motor Andromeda de Meta el creativo ES la segmentación, así que un copy que no repele obliga al algoritmo a aprender de clics que no valen nada.",
  "friccion_cta": "'Haz clic y empieza hoy' lleva a la prueba gratis de 14 días. Es coherente con el destino declarado en P11, pero la fricción es mínima: atrae probadores sin intención de compra. Coincide exactamente con el síntoma de P25 — piden información, prueban y desaparecen.",
  "veredicto": "El copy atrae volumen, no al ICP. Pero es Capa 3 y está subordinado: no lo toques hasta verificar el Pixel y cambiar el objetivo de 'Tráfico' a Conversiones. Reescribir el aviso con la cuenta ciega no cambia nada que puedas medir."
}
```

### Criterios de aceptación

| # | Criterio | 0 | 1 | 2 |
|---|---|---|---|---|
| C2.1 | Contrasta el copy contra el ICP declarado en P22/P23, no contra uno genérico | No lo menciona | Lo menciona sin contrastar | Contrasta y explica el desajuste |
| C2.2 | Detecta la ausencia de hook de negación y explica a quién debería repeler | Lo da por presente | Ambiguo | Ausente + a quién repelería |
| C2.3 | Vincula la fricción del CTA con el síntoma de P25 | Sin vínculo | Implícito | Explícito y citado |
| C2.4 | El veredicto declara la subordinación de capa | No la declara | La insinúa | La declara y nombra de qué depende |

**Umbral: ≥ 6 / 8, con C2.4 obligatoriamente en 2.**

C2.4 es eliminatorio porque es la materialización de §7.1 regla 6 y de la decisión #4 de §4 (*"recomendar 'mejora tu anuncio' a una cuenta sin Pixel es ruido"*). Si el motor falla aquí, rompe la decisión de diseño que más ordena el output.

### Antipatrones

- Proponer copy alternativo o reescribir el aviso. Calibrar diagnostica; §3.3 y §9 excluyen implementar.
- Afirmar CTR, CPL o tasa de conversión del copy (R1).
- Presentar el problema de copy como principal (R6).
- Evaluar contra un ICP inventado en vez del de P22/P23.

---

## G.4 · Sección 4 — `seccion_4_evaluacion_configuracion`

### Esquema (Anexo E, verbatim)

```json
"seccion_4_evaluacion_configuracion": {
  "reasoning": "Estado del stack de medición y arquitectura objetivo↔destino.",
  "objetivo_vs_meta": "string",
  "segmentacion": "string",
  "presupuesto_vs_meta": "string",
  "stack_medicion": "string — marca contradicciones aquí"
}
```

`stack_medicion` es el campo donde el esquema obliga a reportar contradicciones. Es el punto de verificación de §7.1 regla 3.

### Salida esperada

```json
"seccion_4_evaluacion_configuracion": {
  "reasoning": "Paso 4 (Capa 2) y paso 5 (Capa 3) del proceso de razonamiento. El stack está prácticamente ciego y arrastra una contradicción declarada; la arquitectura objetivo↔destino es incoherente con la meta. La viabilidad de Capa 1 es de alcance de canal, no de cuenta: LinkedIn no soporta el ticket, pero Meta sí puede.",
  "objetivo_vs_meta": "Incoherente, y es la incoherencia de arquitectura dominante. El objetivo configurado es 'Tráfico al sitio web' (P10) con destino a landing propia (P11), mientras la meta declarada es cerrar clientes pagados (P25). Meta optimiza hacia clics baratos, no hacia compradores: te está entregando exactamente lo que le pediste. Cruce D.1.",
  "segmentacion": "El ICP declarado —dueño de PYME de 5 a 20 empleados, 35–54 años (P23, P24)— es razonable y coherente con el modelo B2B de P1. El problema no es a quién apuntas sino dónde: la mezcla Meta + LinkedIn (P7) sobre un ticket de $29.990 (P5) desalinea el canal. LinkedIn tiene el CPL más caro del mercado y ese ticket no lo soporta. La geografía 'Todo Chile' (P13) es amplia pero no es un hallazgo por sí sola. Cruce A.4.",
  "presupuesto_vs_meta": "$400.000 CLP/mes (P9) está dentro del rango mínimo referencial para Meta Chile de $200.000–500.000 [referencial] y podría alcanzar las 50 conversiones semanales de la fase de aprendizaje — pero solo si primero se corrige el objetivo. Hoy ese presupuesto compra tráfico, no conversiones, así que el volumen no alimenta ningún aprendizaje del algoritmo. Además se reparte entre dos plataformas, lo que reduce el gasto efectivo por canal. El CPA máximo viable no se puede calcular: falta el margen y la tasa de cierre.",
  "stack_medicion": "Prácticamente ciego, y con una contradicción declarada. P16 dice 'no estoy seguro si lo tengo instalado' y P19 dice 'creo que tengo algunos eventos configurados' — los eventos de conversión no pueden existir sin un Pixel activo. Es una inconsistencia a auditar en el Gestor de Eventos de Meta; no se asume cuál de las dos respuestas es la correcta. Sin CAPI (P18: 'no sé qué es'), lo que en 2026 implica un sub-reporte de 15–30% [referencial]. Sin UTMs (P20), de modo que el GA4 que sí tienes instalado (P21) queda ciego al origen de las campañas. Cruces B.9 y B.12."
}
```

### Criterios de aceptación

| # | Criterio | 0 | 1 | 2 |
|---|---|---|---|---|
| C4.1 | Identifica "Tráfico vs clientes pagados" como la incoherencia dominante | No la detecta | La detecta sin jerarquizar | La detecta y la nombra dominante |
| C4.2 | Separa **a quién** apunta de **dónde** lo busca | Los mezcla | Separación implícita | Explícita: ICP razonable, canal desalineado |
| C4.3 | Condiciona el presupuesto a la corrección previa del objetivo | Suficiente/insuficiente sin condicionar | Menciona la dependencia | Condiciona explícitamente |
| C4.4 | Reporta la contradicción P16/P19 **sin resolverla** | No la detecta | La detecta y elige una respuesta como verdadera | La detecta, explica la incompatibilidad técnica y deriva a auditoría |
| C4.5 | Clasifica el stack como ciego enumerando lo faltante | Clasificación errada | Correcta sin detalle | Correcta con los cuatro puntos (Pixel, CAPI, eventos, UTMs) |
| C4.6 | Declara N/D el CPA máximo viable por falta de margen y cierre | Lo calcula igual | Lo omite | Lo declara N/D nombrando qué falta |

**Umbral: ≥ 9 / 12, con C4.4 obligatoriamente en 2.**

C4.4 es eliminatorio: es la prueba en vivo de §7.1 regla 3 y del caso borde explícito del Anexo E. Si el motor resuelve la contradicción por su cuenta aquí, lo hará con datos de un prospecto real.

C4.6 existe porque §5.2 define `CPA máximo viable = ticket × margen × tasa de cierre` y **el formulario no captura ni margen ni tasa de cierre**. El motor tiene una fórmula que nunca puede completar con los datos de las 28 preguntas. Ver pendiente 3.

### Antipatrones

- Asumir que el Pixel existe, o que no existe. Ambas son invención (R1/R4).
- Calcular el CPA máximo viable inventando margen o tasa de cierre (R1).
- Citar un CPL de LinkedIn o de Meta como si fuera el de ContaBoost (R1).
- Presentar `$200.000–500.000` o el CPL Chile por industria sin marcar `[referencial]` (R5).
- Recomendar acciones en esta sección. Las acciones son la 6.

---

## G.5 · Sección 5 — `seccion_5_tres_problemas_criticos`

### Esquema (Anexo E, verbatim)

```json
"seccion_5_tres_problemas_criticos": {
  "reasoning": "Por qué este orden por impacto en CAC y cómo respeta el orden de capas.",
  "problemas": [
    {"orden": 1, "problema": "string concreto sin eufemismos", "impacto_cac": "string",
     "severidad": "CRÍTICO|MODERADO|LEVE", "evidencia": "P# o cruce"}
  ]
}
```

Exactamente tres elementos.

### Salida esperada

Orden conforme a la opción B de D-2.

```json
"seccion_5_tres_problemas_criticos": {
  "reasoning": "Orden por impacto en CAC sobre el conjunto de la cuenta. El hallazgo de Capa 1 (LinkedIn vs ticket) es de alcance de canal, no de cuenta: afecta a una de las dos plataformas, no a la viabilidad del negocio. Por eso va tercero pese a ser de capa inferior. Los dos primeros afectan el 100% del presupuesto.",
  "problemas": [
    {"orden": 1,
     "problema": "Las campañas optimizan 'Tráfico', no conversiones.",
     "impacto_cac": "Meta trae clics baratos que no compran. El CAC real es indefinido porque no hay conversión medible: se paga por visitas, no por clientes.",
     "severidad": "CRÍTICO",
     "evidencia": "P10 × P25 (Matriz D.1)"},
    {"orden": 2,
     "problema": "La cuenta está ciega: sin Pixel verificado, sin CAPI, sin UTMs y con eventos contradictorios.",
     "impacto_cac": "Sin medición no se puede optimizar ni bajar el CAC. Meta aprende a ciegas y el costo por resultado sube — que es exactamente lo que describes en P28.",
     "severidad": "CRÍTICO",
     "evidencia": "P16, P18, P19, P20 (Matriz B.9 / B.12)"},
    {"orden": 3,
     "problema": "LinkedIn sobre un ticket de $29.990 al mes.",
     "impacto_cac": "El CPL de LinkedIn supera lo que deja un mes de suscripción: la unidad económica es negativa desde el primer lead, salvo un LTV alto que no está confirmado en las respuestas.",
     "severidad": "CRÍTICO",
     "evidencia": "P5 × P7 (Matriz A.4)"}
  ]
}
```

### Invariantes de coherencia

Las reglas más valiosas del anexo: binarias y automatizables.

- **I-1 · Identidad §1 ↔ §5.** Los tres `problemas` son los mismos tres `tres_hallazgos` de la sección 1, en el mismo orden. La sección 5 los expande agregando `impacto_cac`; no introduce ni sustituye ninguno.
- **I-2 · Biyección §5 ↔ §6.** El conjunto `{acciones[].ataca_problema}` es exactamente `{1, 2, 3}`. Ninguna acción huérfana, ningún problema sin acción, ningún número repetido. **Es la invariante que habría atajado D-1.**
- **I-3 · Orden por impacto en CAC.** El orden de la sección 5 puede diferir del orden de ejecución de la sección 6, y en ContaBoost difiere: el problema 1 es el de mayor impacto, pero la acción 1 ataca el problema 2 porque la medición es prerrequisito técnico del cambio de objetivo. Esa inversión es correcta y su justificación debe estar en el `reasoning` de la sección 6.
- **I-4 · Severidad justificada.** Toda `severidad` distinta de la que sugiere la Matriz para ese cruce debe explicarse en el `reasoning` (§7.1 regla 5).

> I-3 es la que más fácilmente se rompe al reescribir el prompt: la tentación es alinear ambos órdenes. **No deben alinearse por defecto.**

### Criterios de aceptación

| # | Criterio | 0 | 1 | 2 |
|---|---|---|---|---|
| C5.1 | Cada problema explica su vía de impacto sobre el CAC | Ninguno | Alguno | Los tres |
| C5.2 | El problema 2 conecta la ceguera con el alza de costo de P28 | Sin conexión | Implícita | Explícita y citada |
| C5.3 | El problema 3 razona la unidad económica CPL vs ticket y acota que el LTV no está confirmado | No la razona | La menciona | La razona y acota |
| C5.4 | Los tres son causas, no síntomas | Son síntomas | Mezcla | Los tres son causas |

**Umbral: ≥ 6 / 8. I-1 a I-4 son obligatorias y previas a la rúbrica.**

### Antipatrones

- Listar "no cierra clientes" (P25) o "el costo sube" (P28) como problema. Son síntomas — todo el Grupo D de la Matriz existe para separarlos de las causas.
- Cuantificar el CAC o el CPL de ContaBoost (R1).
- Introducir un problema que no aparece en la sección 1 (I-1).
- Alinear mecánicamente el orden de la sección 5 con el de la 6 (I-3).

---

## G.6 · Sección 6 — corrección de `ataca_problema`

Reemplaza el bloque correspondiente del Anexo G v3.0. Cambia solo el mapeo; el texto de las acciones y el `cierre_cta` quedan idénticos.

```json
"seccion_6_tres_acciones_prioritarias": {
  "reasoning": "Cada acción ataca un problema en orden de palanca de ejecución, que no coincide con el orden de severidad: primero se destapa la medición (problema 2), porque sin evento de conversión no se puede cambiar el objetivo; luego se corrige el objetivo (problema 1); luego se concentra el presupuesto (problema 3).",
  "acciones": [
    {"orden": 1, "accion": "Entra al Gestor de Eventos de Meta y verifica si el Pixel existe. Instálalo/verifícalo, activa la CAPI y crea el evento que represente un cliente real, no un PageView. Agrega UTMs a todos los links.", "ataca_problema": 2},
    {"orden": 2, "accion": "Cambia el objetivo de 'Tráfico' a Conversiones, apuntando al evento de valor recién creado.", "ataca_problema": 1},
    {"orden": 3, "accion": "Pausa LinkedIn y concentra el 100% del presupuesto en Meta para alcanzar las 50 conversiones/semana.", "ataca_problema": 3}
  ],
  "cierre_cta": "Estos tres cambios corrigen la base, pero el orden de ejecución depende de lo que encontremos al auditar la cuenta en vivo. Agenda una reunión estratégica para revisarla juntos."
}
```

**Criterio C6.1 (eliminatorio):** el `reasoning` explica por qué el orden de ejecución difiere del orden de severidad. Sin esa explicación, I-3 es indistinguible de un error de mapeo — que es justo lo que ocurrió en la v3.0.

---

## G.7 · Base priorizada — caso dorado del núcleo

Sección nueva. La v3.0 no tenía salida esperada para el Uso 1, que es el uso que la revisión del prototipo identificó como núcleo.

### Qué se verifica

La base priorizada toma N prospectos pre-calificados con el protocolo de diagnóstico externo (§5.6) y devuelve una lista ordenada que responde **a quién visitar el lunes y a quién no visitar nunca**. El informe individual (§§1–6) es el sustento de cada fila accionable.

Ojo con la diferencia de insumo: el informe individual parte de las 28 respuestas del prospecto; **la base priorizada parte del diagnóstico externo, que se hace sin su cooperación.** Es el problema abierto 2 de §12.4.

### Esquema propuesto

No existe en el Anexo E. Hay que agregarlo si el Uso 1 pasa a ser el núcleo.

```json
{
  "filas": [
    {"score": 0, "empresa": "string", "rubro": "string",
     "ticket": "alto|medio|bajo", "pauta": "string",
     "eslabon_dominante": 1, "capa_e3": 1,
     "severidad": "CRÍTICO|MODERADO|LEVE|N/D",
     "problema_dominante": "string", "visitar": "sí|no|—",
     "informe_ref": "string | null",
     "confianza": "[Seguro]|[Probable]|[Requiere validación]"}
  ],
  "criterio_orden": "string",
  "fuera_de_perfil": ["string"]
}
```

`confianza` viene de §5.6: el protocolo externo ya marca cada hallazgo con esas tres etiquetas. Debe viajar hasta la tabla — no es lo mismo salir a terreno con un `[Seguro]` que con un `[Requiere validación]`.

**Dos numeraciones distintas, y confundirlas es el defecto que esta sección arrastró hasta el 5-sep-2026.** `eslabon_dominante` es la **Cadena de Crecimiento (1 a 7)** de §5.0 y aplica a toda fila. `capa_e3` son las **cinco sub-capas del análisis de pauta** de §5.3 —1 viabilidad económica · 2 medición · 3 arquitectura de conversión · 4 audiencia y canal · 5 proceso de ventas— y **solo existen cuando `eslabon_dominante` = 3**, porque los pasos 4 a 8 del proceso de razonamiento son «solo E3». En cualquier otro eslabón `capa_e3` va en `null`.

### Salida esperada — base de 8 prospectos

| Score | Empresa | Ticket | Pauta | Eslabón | Capa E3 | Severidad | Problema dominante | ¿Visitar? |
|---|---|---|---|---|---|---|---|---|
| 9 | Clínica Dental Nueva Sonrisa | Alto | Meta activa | 3 | **3** | CRÍTICO | Objetivo "Tráfico" con ticket alto: paga clics que no agendan | Sí |
| 8 | Centro de Eventos La Terraza | Alto | Meta activa | 3 | 2 | CRÍTICO | Sin Pixel verificado ni CAPI: cuenta ciega | Sí |
| 8 | Corredora Propiedades del Sol | Alto | Meta + Google | 3 | 3 | CRÍTICO | Destino WhatsApp para "Conversiones": optimiza un evento que no ve | Sí |
| **8** | **Maestranza Industrial Andes** | Alto | **Sin pauta** | **5** | — | **CRÍTICO** | **20 h/semana armando cotizaciones a mano: pierde licitaciones que podría ganar** | **Sí** |
| 6 | Estudio Contable Ravest | Medio | Meta activa | 3 | 4 | MODERADO | ICP B2B senior en TikTok: canal desalineado | — |
| 5 | Gimnasio FitZone | Bajo | Meta activa | 3 | 2 | MODERADO | Mide CPL sin UTMs: no sabe qué campaña lo genera | — |
| 4 | Café de especialidad Origen | Bajo | Meta activa | 3 | 1 | MODERADO | Ticket bajo + presupuesto <$200K: sub-financiado | — |
| 1 | Distribuidora El Roble | Alto | Sin pauta | — | — | N/D | Su cuello de botella es de abastecimiento, no comercial: Precisión no resuelve capacidad de suministro | No |

**Corrección respecto del prototipo:** Clínica Dental estaba etiquetada Capa 1. Un objetivo de campaña mal configurado es **Capa 3** (arquitectura de conversión) según §5.3; Capa 1 es viabilidad económica y el ticket alto no presenta problema de viabilidad.

**Corrección del 5-sep-2026 — la fila de la maestranza estaba al revés, y era la más cara del set.** Hasta hoy figuraba con score **2**, `capa_dominante: null`, severidad `N/D` y *«Capta por licitación y contrato. Fuera de perfil · No visitar»*. Eso es el criterio de la v3.x, **abolido por §2.4 y §5.0.3 el 28-jul-2026**: «capta por licitación o contrato (maestranzas, distribuidoras, plantas)» pasó a ser **candidato prioritario de E5**, no un descarte. El PRD lo dice con esta empresa exacta en **§H.5**: *«Bajo el criterio anterior esta empresa puntuaba 2 y se descartaba. Bajo el nuevo: Dolor 3 (E5 crítico) + Velocidad 2 + Capacidad 2 + Accesibilidad 1 = **8, visitar**»*. Los sub-scores de la fila corregida son ésos, verbatim de §H.5 — no se recalcularon acá.

**Por qué importaba:** es el perfil de **Ignacio**, el arquetipo mayoritario de la base de prospección, que por definición no pauta. Un set dorado que lo declara fuera de perfil premia al motor por descartar al prospecto que la prospección lleva meses cosechando a propósito.

**La última fila sigue siendo un descarte deliberado —el set tiene que verificar que el motor sepa decir que no— pero ahora por un motivo de la lista vigente de §2.4** («empresas cuyo cuello de botella es de producción o abastecimiento, no comercial»), no por falta de pauta. Las otras cinco filas de pauta no cambiaron de diagnóstico: se les explicitó `eslabon_dominante: 3`, que antes estaba implícito.

### Invariantes

- **I-5 · Fuera de perfil.** Solo las cuatro exclusiones vigentes de **§2.4** producen `eslabon_dominante: null`, `severidad: "N/D"`, `visitar: "no"`, `score ≤ 2`: capacidad de inversión bajo ~$100.000 CLP/mes · startup sin modelo validado · sin ningún activo digital ni intención de tenerlo · cuello de botella de producción o abastecimiento, no comercial.

  ⚠ **«Sin pauta activa» NO es una de ellas, y usarla como descarte reprueba la invariante.** Es un **dato de ruteo**: E3 sin flujo manda a evaluar E2, E5 y E6. Un prospecto que capta por licitación o contrato —maestranzas, distribuidoras, plantas— es **candidato prioritario de E5**, y uno que vende solo por WhatsApp o Instagram lo es de E4 y E5. El error caro es el inverso del que decía esta invariante hasta el 5-sep-2026: **no es visitar a quien capta por licitación, es no visitarlo** — o peor, visitarlo con discurso de pauta. Lo que nunca se hace es diagnosticar pauta a quien no la tiene; lo que sí se hace es rutearlo a su eslabón.
- **I-6 · Condición de visita.** `visitar: "sí"` exige las dos: severidad `CRÍTICO` **y** capacidad de pago suficiente (ticket `alto` o presupuesto ≥ $500.000/mes, §5.6). Si falta una, es `"—"`. **La pauta activa dejó de ser condición**: la maestranza de la tabla no pauta y se visita.
- **I-7 · Orden.** Descendente por `score`. Es una fila de decisión, no un ranking estético.
- **I-8 · Trazabilidad al informe.** Toda fila con `visitar: "sí"` tiene `informe_ref` no nulo apuntando a un informe individual completo. **Sin informe, no se visita:** el vendedor llegaría a terreno sin sustento, que es el problema que §1 dice resolver.
- **I-9 · Consistencia base ↔ informe.** El `problema_dominante` de la fila es el `problemas[0].problema` de la sección 5 del informe referenciado. No pueden divergir.
- **I-10 · Consistencia de eslabón y capa.** `eslabon_dominante` corresponde al grupo de la Matriz del que sale el problema dominante, según el ruteo del paso 4 del proceso de razonamiento: **E1 → Grupo M · E2 → Grupo L · E3 → Grupos A–F · E4 → Grupo J · E5/E6 → Grupo I · E7 → Grupo K**.

  Y **solo cuando `eslabon_dominante` = 3** se rellena `capa_e3`, con el mapeo de sub-capas de §5.3: Grupo A → 1, Grupo B → 2, Grupos B+F → 3, Grupo C → 4, Grupos D+E → 5. En cualquier otro eslabón `capa_e3` va en `null`: una fila de E5 con capa asignada es un defecto, porque las capas son la anatomía interna del análisis de pauta y fuera de E3 no significan nada.

I-8 e I-9 son la materialización de la decisión de esta versión: el informe individual deja de ser un producto paralelo y pasa a ser el respaldo obligatorio de cada fila accionable.

### Criterios de aceptación

| # | Criterio | 0 | 1 | 2 |
|---|---|---|---|---|
| C7.1 | Rutea a quienes captan por licitación o cartera en vez de descartarlos | Los declara fuera de perfil por no pautar | Los conserva pero sin eslabón ni área | Los rutea a su eslabón (E5 típicamente) con el motivo y el costo del trabajo manual |
| C7.2 | El problema dominante es accionable en una conversación de terreno | Genérico | Parcial | Específico y conversable |
| C7.3 | Los scores discriminan entre visitar y no visitar | Todos en 2 puntos de rango | Rango parcial | Rango que separa las decisiones |
| C7.4 | La etiqueta de confianza de §5.6 viaja hasta la fila | Ausente | En algunas | En todas |

**Umbral: ≥ 6 / 8, con I-5 e I-6 obligatorias.**

### Antipatrones

- **Declarar fuera de perfil a un prospecto por no tener pauta activa (I-5).** Es el antipatrón que este mismo documento prescribía hasta el 5-sep-2026.
- Asignar `capa_e3` a una fila cuyo `eslabon_dominante` no es 3 (I-10).
- Proponer pauta a quien capta por licitación o contrato, aunque tenga presupuesto y aunque el sitio sea malo (§H.5).
- Marcar `visitar: "sí"` sin informe de respaldo (I-8).
- Priorizar por tamaño de empresa o rubro atractivo en vez de por severidad diagnóstica — es el error que §4 decisión #9 documenta haber cometido con los parques industriales.

---

## G.8 · Verificación del modo en vivo (§5.7)

El modo en vivo cambia qué hay que verificar. Las secciones G.2 a G.7 siguen siendo válidas para el informe completo, pero el informe completo ya no es el artefacto principal: lo es el turno de conversación.

### Qué se verifica que antes no existía

- **I-11 · Diagnóstico con datos parciales.** Con 3 respuestas el motor emite `veredicto_provisional` y `siguiente_pregunta`. Si exige más para responder, falla: no sirve en vivo.
- **I-12 · Monotonía del veredicto.** Agregar respuestas no puede hacer desaparecer un hallazgo previamente afirmado sin explicar por qué cambió. Un diagnóstico que oscila entre turnos es inutilizable frente al prospecto.
- **I-13 · Partición estricta.** Todo hallazgo está en `seguro_de_decir` **o** en `no_decir_aun`, nunca en ambos ni en ninguno. Un hallazgo que depende de un `N/D` o de una contradicción sin aclarar **no puede** estar en `seguro_de_decir`. Es la invariante que reemplaza al gate de revisión humana.
- **I-14 · Contradicción → pregunta.** Detectada una contradicción, `siguiente_pregunta` debe apuntar a aclararla. En vivo no se deriva a auditoría: se pregunta.
- **I-15 · Orden por capa.** `siguiente_pregunta` no salta a una capa superior mientras la inferior tenga `completitud_por_capa` en "sin datos", salvo que la inferior ya haya producido un descalificador.
- **I-16 · Descalificar es resultado válido.** Ante un descalificador de Capa 1 con alcance de cuenta, `veredicto_provisional` = `"no califica"` y `siguiente_pregunta` = `null`. Si el motor sigue preguntando para encontrar un ángulo que califique, reprueba.

### Caso dorado en vivo — a construir

Debe ser el segundo caso (§10 pendiente 10), sobre el ICP real: clínica dental o centro de eventos, ticket alto, local, Meta activa. Se verifica como **secuencia de turnos**, no como salida única:

| Turno | Entrada acumulada | Salida esperada |
|---|---|---|
| 1 | P5, P9 | `veredicto: insuficiente` · `siguiente_pregunta: P7` · sin afirmaciones |
| 2 | + P7 | Capa 1 completa, viable · siguiente: P16 |
| 3 | + P16, P19 contradictorios | Contradicción en `meta` · `siguiente_pregunta` la aclara (I-14) · el hallazgo va en `no_decir_aun` (I-13) |
| 4 | + aclaración | El hallazgo migra a `seguro_de_decir` · siguiente: P10 |
| … | | |

**Verificación de latencia:** cada turno bajo 10 s (§5.7.7). Es criterio de aceptación, no aspiración — si no se cumple, el modo en vivo no existe por más correcto que sea el diagnóstico.

### Antipatrones del modo en vivo

- Estimar una cifra del negocio del prospecto para llenar un vacío en conversación. En vivo la tentación es máxima y el daño es inmediato: se dice en voz alta (§5.7.5 regla 4).
- Poner en `seguro_de_decir` un hallazgo que depende de un `N/D`.
- Seguir preguntando después de un descalificador de Capa 1 de alcance de cuenta (I-16).
- Exponer el veredicto de calificación o las contradicciones en la vista compartida (§5.7.6).

---

## Umbral de aprobación global

Una versión del motor es **apta para uso en terreno** cuando, sobre el set dorado completo:

1. **100% de las invariantes** (I-M1 a I-M4, I-1 a I-10, R1 a R7) se cumplen. Sin excepciones.
2. **Cero antipatrones** en cualquier sección.
3. Todas las secciones superan su umbral de rúbrica.
4. Los criterios eliminatorios —C2.4, C4.4, C6.1— están en 2.
5. La checklist de §6.2 pasa completa.

Si una sola invariante falla, no se despliega. Son binarias precisamente para que la decisión no se negocie caso a caso.

---

## Pendientes que quedan abiertos

Revisados contra el PRD completo. Los dos que había marcado antes como bloqueantes ya estaban resueltos en el documento: **la tabla de capas existe (§5.3, 5 capas) y la fórmula de score existe (§5.6)**. Lo que queda:

1. **Decidir D-2** — opción A (reordenar el caso) o B (calificar la regla distinguiendo alcance de cuenta vs de canal). Bloquea R6, I-1 e I-3. Recomendada: B.
2. **Operacionalizar el scoring de §5.6.** La fórmula está —Dolor (0–3) + Velocidad de decisión (0–3) + Ticket/presupuesto (0–2) + Accesibilidad (0–2)— pero no está definido **qué hace que Dolor sea 3 y no 2**, ni cómo se rompen los empates (en la base dorada hay dos empresas en 8). Sin rúbrica por sub-score, C7.3 verifica que los números discriminen pero no que sean correctos. **Los scores de la tabla de G.7 vienen del prototipo, no están derivados de §5.6: hay que recalcularlos una vez fijada la rúbrica.**
3. **El CPA máximo viable no es calculable con las 28 preguntas.** §5.2 lo define como `ticket × margen × tasa de cierre`, y el formulario no captura margen ni tasa de cierre. O se agregan dos preguntas —pasaría a 30, lo que choca con la variable canónica del Anexo C— o se declara que la fórmula solo se completa en la reunión y el motor siempre reporta N/D. Hoy es una fórmula que el motor tiene instrucciones de usar y nunca puede completar.
4. **Esquema de la base priorizada en el Anexo E.** Si el Uso 1 es el núcleo, el output del Uso 1 necesita contrato de datos igual que el informe. Hoy no existe.
5. **Tamaño del set dorado.** Un caso más una base de ocho es un piso. Objetivo razonable: **8–10 casos** que cubran B2B y B2C, ticket alto y bajo, cuenta bien medida y cuenta ciega, y el caso borde que el Anexo E ya contempla y que hoy no tiene caso dorado: *"todas las respuestas indican setup correcto"*. Ése es el que verifica que el motor **no fabrique problemas** — el riesgo espejo de todo lo demás.
6. **§10 pendiente 8 sigue abierto:** decidir si la sección de landing se mantiene. Si el fetch es la parte más frágil del pipeline y la sección sale N/D cada vez que falla, hay que definir si un informe con la sección 3 en N/D habilita igual `visitar: "sí"` en G.7.
