# PRD — CALIBRAR
### Herramienta interna de diagnóstico de crecimiento comercial y segmentación de prospectos B2B
**Precisión Agencia · ppagencia.cl · Chicureo, Región Metropolitana, Chile**
**Versión 5.5 · 3 de agosto de 2026 · Autor: Pablo Opazo (CEO)**

> **Cambios de la v5.5 — el diagnóstico deja de mirar solo el canal**
>
> Origen: al construir el prototipo de interfaz (`Calibrar/03 Front/`) y probarlo contra el caso de uso real —**reunión B2B de 30 minutos, con un prospecto que puede no invertir un peso en pauta**— aparecieron tres huecos. Ninguno estaba en el triage, que ya es de negocio: de las 14 preguntas solo T4 pregunta por publicidad. Los tres estaban en lo que rodea al triage.
>
> 1. **Núcleo de negocio — N1 a N7 (§5.1.2, nuevo).** El bloque de negocio ya existía —`Q1–Q17`— pero **solo se abría si el eslabón dominante era E1**. Si el ruteo daba E5, jamás se preguntaba quién es su mejor cliente. Seis preguntas de `Q` pasan a ser transversales y se suma **N7, concentración de cartera**, que es el riesgo que ningún diagnóstico de marketing mira y que en B2B decide si el negocio es sano o frágil. Cuesta cinco minutos y cambia el género del informe.
> 2. **Competencia y mercado — M1 a M5 y SC1 a SC5 (§5.1.3, nuevo).** El documento reclamaba PESTA, Porter y FODA cruzado como el diferenciador de Precisión en E1, y **no tenía ningún instrumento que recogiera los insumos**: existían `Q8`, `Q9` y `R6`, tres preguntas declarativas, y las señales externas `s1–s10` miraban solo la huella del propio prospecto, nunca la de un competidor. El bloque va **partido en dos**: cinco preguntas en la reunión —las que no se pueden observar desde fuera— y cinco señales que se levantan **antes**, en el pre-llenado. Es transversal como los eventos corporativos: califica a los siete eslabones y **nunca aparece como `area_recomendada`**.
> 3. **Anclas de negocio B2B (§5.2, ampliada).** Las anclas cuantitativas eran **8 de 11 de pauta**, y las tres fórmulas nucleares también. Consecuencia: un prospecto que no pauta pasa el triage, rutea bien, y llega a un diagnóstico **sin nada contra qué compararse** — se le describe el problema y no se le dimensiona. Se agregan siete anclas de negocio, de las cuales **tres tienen fuente y cuatro se declaran vacías**. Las vacías se muestran vacías: la regla del propio documento es no inventar datos de mercado, y una estimación no sirve como ancla.
> 4. **Presupuesto de 30 minutos (§5.7.10, nuevo).** La visita en terreno de Lista A dura media hora. Se fija el reparto —3' preguntas 0 + 9' triage + 5' núcleo + ~8' bloque de área + 4' competencia + 3' cierre = **32 minutos** (corregido el 6-ago-2026: la versión original sumaba 29 y dejaba fuera las preguntas 0)— y se comprueba que cierra en seis de los siete eslabones. **El único que no cierra es pauta:** `14 + 28` da 43 minutos. Por eso se define un **núcleo de 10 preguntas** dentro de las 28 (Anexo A), que cubre las capas 1, 2, 3 y 5; la capa 4 —cliente ideal— ya la cubre el núcleo de negocio.
> 5. **Contrato de entrada ampliado (Anexo F.2).** Tres bloques nuevos: `<nucleo_negocio>`, `<competencia>` y `<senales_competencia>`, con su regla de precedencia. Sin ellos la propuesta sería inejecutable, que es exactamente el defecto que la v5.1.2 tuvo que corregir con el triage.
>
> **Lo que esta versión NO cambia, y conviene dejar dicho:** el triage sigue siendo de 14 y sigue rutando igual; los siete bloques del Anexo A2 siguen intactos; y las 28 preguntas de pauta **no se recortan** — se les marca un núcleo para la reunión de 30 minutos y el bloque completo sigue disponible cuando hay tiempo.

> **Corrección post-QA (28-jul-2026) — dos pasadas.** Se corrió el QA formal contra las propias reglas del documento. **Pasada 1: 15 defectos, 5 bloqueantes.** **Pasada 2, buscando clases de defecto no chequeadas: 11 más, 2 bloqueantes.** Total **26 defectos corregidos**; 20/20 verificaciones pasan.
>
> **Pasada 3, auditando la estructura del prompt: 4 defectos más, todos graves.** Total **30 defectos corregidos**; 38/38 verificaciones pasan con `qa_calibrar.py`.
>
> Los cuatro de la pasada 3, todos del mismo tipo — el prompt tenía las reglas en prosa y no los datos:
> - `<rol>` seguía definiendo el trabajo como explicar "por qué la inversión en pauta no genera leads".
> - `<contexto_preguntas>` describía solo P1–P28: el motor recibía triage, señales y bloques de área que nunca se le explicaron.
> - `<proceso_de_razonamiento>` tenía 8 pasos, todos de capas de pauta, sin paso de ruteo — contradiciendo directamente a `<ruteo_de_area>`.
> - **`<matriz_exhaustiva_de_cruces>` solo llevaba los Grupos A–G.** Faltaban H (ruteo) e I, J, K, L, M: el motor tenía reglas de ruteo en prosa y **ningún cruce diagnóstico para seis de los siete eslabones**.
>
> Los dos más graves de las pasadas 1 y 2, del mismo tipo — especificación completa sin canal de ejecución:
> 1. El prompt declaraba `eslabon_dominante` como "entero de 1 a 7" y su bloque de ruteo listaba E2–E7: **E1 era inalcanzable** pese a tener grupo de matriz, 17 preguntas y caso dorado completo.
> 2. El Anexo F —el contrato de datos entre formulario y motor— solo transportaba `p1…p28`. **No existía ningún campo para las 14 preguntas de triage ni para las señales externas**, de modo que la Cadena entera era inejecutable y la vía B no tenía por dónde alimentarse.
>
> Lección de proceso, anotada como pendiente 27: dos de los bloqueantes de la pasada 1 eran **reincidencias exactas** de los defectos que este mismo proyecto ya había documentado en el Anexo G v3.0. La revisión manual no los detecta de forma fiable.

> **Cambios de la v5.1 — el diagnóstico se entrega en la reunión**
>
> 1. **Bloque 4 — Plan por etapas (§5.8.5, nuevo).** Convierte el dashboard en un **diagnóstico de etapa 0 entregable en la misma reunión**. Cada etapa declara por qué va primero, quién la hace, qué pilar de Precisión le corresponde y cómo se sabrá que resultó.
> 2. **Reglas de redacción del veredicto (§5.8.6, nuevas).** El diagnóstico **nunca termina en un "no", termina en un orden**. Prohibido cerrar con "no necesitas marketing" a secas. **La etapa 1 nunca es un servicio facturable de Precisión** — es lo que hace creíble todo lo demás. Invariantes DB-14 a DB-17.
> 3. **Bloque E1 completo (Anexo A2.1):** 17 preguntas en 7 secuencias de conversación. Cierra el pendiente 25.
> 4. **Los dos modelos de terreno (§5.7.9, nuevo):** en PYME la visita busca la reunión; en corporativo busca **la vía de entrada** — nombre, cargo, correo. Los 370 "Por verificar" de la base son exactamente ese trabajo.
> 5. **Buyer Persona v2** (documento aparte, alcance agencia): 4 arquetipos en 2 listas. Cierra el pendiente 24.
> 6. **Base segmentada** en Lista A / Lista B / Por verificar, con ruta por comuna. Cierra el pendiente 23.
>
> **Cambios de la v5.0 — el eslabón que faltaba**
>
> Se contrastó el modelo contra la cuenta real **Vicsa Safety / Bunzl LATAM** y apareció un fallo que ninguno de los siete eslabones podía diagnosticar: **90 leads → 2 citas → 0 negocios**. Hubo demanda y hubo quien la contactara; el resultado fue cero.
>
> 1. **E1 — Criterio y foco comercial (§5.0.0, nuevo).** Antecede a los siete eslabones anteriores cuando hay flujo llegando y no convirtiendo. Su síntoma —"llegan y no cierran"— se siente igual que falta de demanda desde adentro, y por eso el dueño pide más leads. Área: **consultoría y diagnóstico estratégico**, que es el diferenciador declarado de Precisión y el eslabón que el modelo anterior ignoraba por completo.
> 2. **T13 y T14, nuevas.** "¿Tienen escrito qué empresa es un buen cliente?" y "si te llegaran cien contactos, ¿cómo eliges?". La segunda no pregunta si hay criterio: pide demostrarlo.
> 3. **Grupo M de la Matriz (v1.5):** cruces de criterio y foco comercial, incluida la regla de honestidad más costosa del documento — un diagnóstico E1 concluye muchas veces que el cliente no necesita más marketing.
> 4. **Anexo I — caso dorado primario sobre Bunzl/Vicsa**, con datos reales. Desplaza a la clínica dental, que pasa a ser el caso de la ruta PYME.
> 5. **Tres desajustes documentados (Anexo I.6):** falta el arquetipo del campeón corporativo; el scoring castiga a la cuenta de mayor valor; y Calibrar **no reemplaza** el diagnóstico estratégico — se agregó como límite duro en §3.3.
>
> **Cambios de la v4.1 — correcciones críticas y cierre de pendientes**
>
> 1. **Los parámetros de API de la v3.x rompen el pipeline (§5.5).** `temperature: 0.4` devuelve **error 400**: el parámetro fue eliminado en los modelos actuales. Modelos fijados: `claude-sonnet-5` para el turno en vivo, `claude-opus-5` para el dashboard de cierre. La profundidad se controla con `output_config.effort`, no con muestreo.
> 2. **El costo por informe estaba subestimado 3–6× (§5.5.1).** No son ~$30 CLP: van de $21 a $190 según modelo y caché. **La caché de prompt es la decisión de mayor impacto económico del proyecto** — el system prompt con la Matriz son ~18.000 tokens idénticos en cada llamada, y en caché cuestan una décima parte.
> 3. **Arquitectura del modo en vivo resuelta (§5.5.2):** dos llamadas con propósitos distintos en vez de un solo modelo más rápido. El turno vivo devuelve ruteo + siguiente pregunta (cientos de tokens, <10 s); el dashboard completo se genera una sola vez al cerrar.
> 4. **Ley 21.719 (§7.4, nueva):** entra en vigencia el **1-dic-2026**, cuatro meses después de esta versión, y la base ya opera con datos de terceros. Reglas del link vivo definidas; seis acciones pendientes antes de diciembre. PYMEs solo amonestadas el primer año.
> 5. **Anexo A2, nuevo:** los cinco bloques profundos que faltaban (E2, E4, E5, E6, E7). 84 preguntas de inventario, máximo 40 en una reunión real.
>
> **Cambios de la v4.0 — Calibrar deja de ser un diagnóstico de pauta**
>
> 1. **La Cadena de Crecimiento Comercial (§5.0, nueva).** Seis eslabones —reputación, demanda, activo, captura, escala, capacidad— cada uno con el área del catálogo que lo resuelve. El diagnóstico ahora responde **dónde se rompe el crecimiento y qué disciplina lo arregla**, no solo por qué la pauta no funciona. Regla de precedencia: el eslabón dominante es el primero que rompe contando desde donde hay flujo. Se tapa el balde antes de abrir la llave.
> 2. **Triage de 12 preguntas (§5.1.1, nueva).** Dos por eslabón, se preguntan siempre y primero. Las 28 originales pasan a ser el bloque profundo del eslabón E3. En vivo se preguntan 12 + el bloque del área dominante, nunca 40.
> 3. **Matriz v1.4:** Grupo H (ruteo de área) y Grupos I, J, K, L (procesos, web, capacidad, reputación). Nueva ancla: costo hora administrativa RM ≈ $6.000 [referencial], que permite monetizar las horas de trabajo repetitivo.
> 4. **§2.4 reescrito — el criterio de descarte se invierte.** "Sin pauta activa" deja de excluir y pasa a rutear. Las 7 industriales que la decisión #9 dio por perdidas eran candidatas de automatización que nunca se evaluaron como tales.
> 5. **Bloque 0 del dashboard:** ruteo de área, con `por_que_este_y_no_otro` y `que_NO_es_tu_problema` obligatorios. Invariantes DB-10 a DB-17.
> 6. **Entrega in situ (§5.7.8):** PDF + link vivo antes de cerrar la reunión. Se elimina el "te lo mando en la semana".
> 7. **Scoring de §5.6 operacionalizado:** rúbrica por sub-score, desempate y ajuste al eslabón dominante.
> 8. **Anexo H, nuevo:** caso dorado del ICP real (clínica dental que parece de pauta y es de automatización) y caso complementario de la maestranza.
>
> **Cambios de la v3.2 respecto de la v3.1**
>
> 1. **El entregable es un dashboard de 3 bloques (§5.8, nueva):** data leída + 3 hipótesis + 3 soluciones. Las 6 secciones del informe pasan a ser la capa de análisis interna que lo sustenta. El cambio de "problemas" a **hipótesis** es conceptual: sin acceso a la cuenta lo que se produce es una explicación probable, y una hipótesis falsable es más creíble para un comprador ya decepcionado que un veredicto que hay que creer.
> 2. **Dos vías de producción (§5.9, nueva):** el mismo dashboard se produce con el cliente (28 respuestas) o **sin él** (solo señal externa). La vía B es la que permite calificar los 370+ prospectos de la base sin que nadie conteste, y sus hipótesis son las preguntas de la reunión. Techo de confianza inviolable para la vía B.
> 3. **El buyer persona pasa a ser requisito verificable (§2.5, nueva).** Cuatro campos del esquema existen solo por el estudio de persona: `lectura` de cada cifra, `por_que_no_era_visible`, `como_hacerlo_solo` y el eje de atribución. Sin ellos el output es técnicamente correcto e inútil para quien va dirigido.
> 4. **Eje de atribución (gestión / estructura / compartida)** en §2.5.3, en la Matriz y en el prompt. Responde el job funcional #1 de Carolina —¿fue la agencia o fui yo?— que la matriz no podía responder.
> 5. **Matriz v1.3:** Grupo G de cruces de señal externa (S1–S10), eje de atribución transversal y calificación por alcance en el flujo de capas.
> 6. **Anexo E reescrito** en formato de salida, con bloques nuevos `<a_quien_le_escribes>`, `<eje_de_atribucion>` y `<vias_de_produccion>`.
>
> **Cambios de la v3.1 respecto de la v3.0**
>
> 1. **Modo en vivo (§5.7, nueva).** Calibrar pasa de pipeline asíncrono que produce un PDF a copiloto de la reunión: diagnostica en videollamada o terreno mientras se conversa. El Uso 2 se reescribe y el Uso 3 pasa a decidirse en el momento (§3.2). Revisa el límite de §3.3 sobre lo que ve el prospecto y agrega requisitos no funcionales de latencia (§5.7.7) y métricas propias (§6.1).
> 2. **Regla de capas calificada por alcance (§5.3, §5.5 paso 8, §7.1 regla 6 y Anexo E).** Un hallazgo de capa inferior que solo afecta a un canal ya no antecede a uno de capa superior que afecta a toda la cuenta. Sin esta calificación el motor recomendaba pausar un canal antes que destapar la medición.
> 3. **Corrección de defecto en el Anexo G.** El mapeo `ataca_problema` de la sección 6 tenía las acciones 1 y 2 cruzadas respecto de los hallazgos de la sección 1. Corregido, y el paso 8 del prompt ahora exige verificar que los tres números formen el conjunto {1,2,3}.
> 4. ~~Advertencia de representatividad de ContaBoost~~ **Resuelto en la v5.3:** ContaBoost fue eliminado y reemplazado por **Eco Star**, cliente real con seis meses de datos verificados y diagnóstico humano previo.
> 5. **Revisión de la pausa.** La razón #1 (costo de revisión humana) la disuelve el modo en vivo; corresponde reevaluar la fecha de enero-2027.

> **Qué es este documento.** Calibrar nació en el Diplomado de IA de la Universidad de los Andes, en la actividad *"Arma tu PRD"* de la sesión *"De la herramienta a la empresa"*. Este es ese PRD: el mismo ejercicio que hoy se le pide a los alumnos, hecho sobre un proyecto real de mi empresa, con sus datos reales y sus decisiones documentadas.
>
> **Está escrito para ser construible por un tercero.** Va completo a propósito: el formulario pregunta por pregunta, la matriz de diagnóstico, el prompt íntegro del motor de IA, el esquema de salida, el caso de prueba y la checklist de aceptación. Quien quiera prototiparlo tiene aquí todo lo necesario, sin depender de mí (§12 y Anexos E–G).

---

## Estado del proyecto — y hasta dónde llegó

**☑ A · Especificación completa y construible. Implementación detenida antes de la primera corrida punta a punta.**

Calibrar es una **herramienta interna** de Precisión Agencia: no es un producto que se venda a terceros, es instrumental de trabajo del equipo comercial. El diseño está cerrado y versionado; lo que falta es producción.

### Qué está construido y qué no

| Componente | Estado | Detalle |
|---|---|---|
| Formulario de 28 preguntas | ✅ **Construido** | Google Form en 7 secciones, conectado a una planilla que opera como CRM de diagnósticos |
| Matriz Exhaustiva de Cruces | ✅ **Construida** | v1.2 · ~50 cruces sobre P1–P28, con severidades y benchmarks Chile 2026 |
| System Prompt Maestro del motor de IA | ✅ **Construido** | v1.2 · 8 pasos de razonamiento, reglas inviolables, casos borde, bloques de buyer persona y vías de producción, y esquema JSON de 6 secciones + dashboard |
| Casos dorados con output esperado | ✅ **Construidos** | **Eco Star** (E5, real) · **Vicsa/Bunzl** (E1, real) · Clínica dental + Maestranza (E5) · 5 mínimos (Anexo J, incluye E3) |
| Escenario de automatización (Make) | 🟡 **Parcial** | Escenario creado y webhook activo; módulo de Claude API y parser JSON configurados |
| ID del modelo de producción | ✅ **Fijado** | `claude-sonnet-5` en vivo · `claude-opus-5` al cerrar (§5.5). Falta escribirlo en el escenario de Make |
| Plantilla del dashboard | 🔴 **Pendiente** | Renderiza los 3 bloques visibles del JSON (§5.8); ignora las 6 secciones de análisis y los `reasoning` |
| Script del formulario con nombres `p1…p28` | 🔴 **Pendiente** | Para que el webhook reciba campos con nombre estable |
| Corrida punta a punta con un caso real | 🔴 **Pendiente** | **Aquí exactamente se detuvo el proyecto** |
| Prototipo React de demostración | ⚠️ **Obsoleto** | 4 pantallas con datos de ContaBoost y el esquema de 6 secciones. No refleja el dashboard de 5 bloques ni el ruteo |

### Por qué se detuvo ahí

Dos razones, ambas de operación y no de diseño:

1. **Costo de tiempo humano por informe.** El diseño incluye un paso de revisión manual: alguien lee el diagnóstico y su rastro de razonamiento antes de que se use en terreno. Ese paso es lo que hace caro producir volumen. *(Nota v4.0: la cifra de ~$30 CLP de API que acompañaba este argumento estaba subestimada — ver §5.5.1. La conclusión se mantiene, el orden de magnitud no.)*
2. **Prioridad de caja.** En julio-2026 la agencia priorizó la venta en terreno del catálogo completo de servicios. Los pendientes técnicos de Calibrar quedaron en cola detrás de eso.

**Estado formal:** implementación en pausa desde el 19-jul-2026, con revisión de prioridad agendada para enero-2027. Mientras tanto el pre-análisis de prospectos se hace **a mano**, aplicando la misma matriz de diagnóstico (§5.6) — el marco de razonamiento sí está en uso; lo que falta es automatizarlo.

> **Revisión de la pausa (v3.1, 27-jul-2026).** La razón #1 —el costo de revisión humana por informe— **la disuelve el modo en vivo de §5.7**: si el diagnóstico ocurre durante la reunión, el revisor es el operador leyendo en pantalla y no existe un paso de aprobación posterior que pagar. La razón #2 (prioridad de caja) sigue vigente, pero el modo en vivo juega *a favor* de ella en vez de competir: no produce informes para vender, ayuda a calificar prospectos en las reuniones que ya se están haciendo. **Corresponde reevaluar la fecha de enero-2027 a la luz de este cambio de alcance**, con un piloto acotado antes de comprometer desarrollo.

**Qué haría falta para desbloquearlo:** los cuatro pendientes en rojo de la tabla anterior. Ninguno es un problema de investigación; son tareas de implementación acotadas, detalladas en §10.

---

## 1. Problema (1 frase)

Precisión prospecta y visita empresas en terreno sin un criterio objetivo previo de **dónde se está rompiendo el crecimiento comercial de cada prospecto** — y por lo tanto no sabe **a quién priorizar**, **con qué argumento entrar** ni **cuál de sus siete áreas de servicio corresponde**, gastando tiempo comercial en cuentas que no califican y descartando otras que sí calificaban para un área distinta de la que se les preguntó.

**Desglose del dolor:**

| Ángulo | Detalle |
|---|---|
| Dolor central (interno) | "Invertimos tiempo de venta sin saber dónde está el dolor real ni quién puede contratar." |
| Situación antes | Prospección + visita en frío, sin diagnóstico previo del prospecto |
| Costo de no tenerlo | Esfuerzo comercial disperso; conversaciones sin gancho técnico específico; visitas quemadas en empresas que no pautan |
| Evidencia del costo | El estudio de prospección de junio-2026 auditó 9 empresas industriales preseleccionadas: **solo 2 calificaban** para un diagnóstico de pauta. Las otras 7 captan por licitación, contrato o reputación sectorial — visitarlas con este discurso habría sido tiempo perdido |

**El dolor espejo (del prospecto), que es lo que el diagnóstico responde:** un dueño de PYME lleva meses gastando en Meta o Google Ads sin saber si el problema es el anuncio, la landing, la segmentación o el presupuesto. Nadie se lo ha dicho sin intentar venderle un retainer a continuación.

---

## 2. Usuario

Hay que separar dos figuras que se confunden fácil: **quién usa la herramienta** y **quién es analizado por ella**.

### 2.1 Usuario de la herramienta (interno)
- **Pablo Opazo** — CEO, estrategia y venta en terreno. Es quien consume el output y decide a quién visitar.
- Secundariamente, el equipo comercial de Precisión.
- **No es un producto de autoservicio.** El prospecto analizado nunca ve la herramienta ni el informe.

### 2.2 Sujeto analizado (el prospecto)
Perfil de calificación:
- Dueño o gerente de PYME B2B o B2C consolidada, Región Metropolitana
- Con capacidad de inversión de al menos ~$100.000 CLP/mes en alguna de las áreas del catálogo. **La pauta activa ya no es requisito** (§5.0.3): es un dato que rutea el eslabón, no un filtro de entrada
- Semanas o meses invirtiendo o intentando sin retorno claro
- Ya intentó algo: tuvo agencia, lo hizo solo, probó varias cosas
- **Momento de máximo dolor:** 30 días de campaña activa, presupuesto gastado, sin resultados que justifiquen continuar

### 2.3 Arquetipos oficiales

**Son cuatro desde la v2.0 del estudio de buyer persona** (`Buyer_Persona_Precision_v2.md`, alcance agencia), organizados en dos listas:

| Lista | Arquetipo | Eslabón que suele necesitar |
|---|---|---|
| A · PYME | **Rodrigo** — El Gestionador Solitario | E3 · E4 |
| A · PYME | **Carolina** — La Decepcionada de Agencia | E1 · E3 |
| A · PYME | **Ignacio** — El Operador Desbordado | **E5 · E6** |
| B · Corporativo | **Marcelo** — El Campeón Corporativo | **E1** |

**Ignacio es el arquetipo mayoritario de la base de prospección real** y el que el modelo anterior descartaba: se le preguntaba por su pauta cuando su problema estaba en la operación. **Marcelo** no decide solo — propone hacia arriba, y su comité (decisor económico, gatekeeper y operador local) puede matar el trato sin haber estado en una reunión.

Los dos originales se detallan abajo; los cuatro completos, con sus creencias limitantes y su abordaje en terreno, están en el estudio v2.

| | **Rodrigo Figueroa — "El Gestionador Solitario"** | **Carolina Müller — "La Decepcionada de Agencia"** |
|---|---|---|
| Perfil | Dueño de PYME B2C consolidada, 38–48 años | Dueña/gerenta de PYME B2B o servicio de alto ticket, 35–50 años |
| Cómo gestiona | Sus propias campañas, o las delegó a alguien interno sin formación en pauta | Pasó por 2+ agencias; frustrada con promesas incumplidas |
| Inversión | $150.000–$400.000 CLP/mes en Meta | $200.000–$800.000 CLP/mes en Meta o Google |
| Dolor | Meses invirtiendo sin entender si falla el copy, la segmentación o el presupuesto | Pagó retainers sin resultados; sospecha que el problema es estructural y que nadie le dijo la verdad |
| Urgencia | Media — quiere mejorar, no siente crisis | Alta — el costo de oportunidad ya es visible |
| Síntoma típico | "No sé qué está fallando" / "muy pocos leads" | "Los leads califican pero no cierran" / "CPL alto" |
| Trigger | Mes con ROAS bajo el break-even sin explicación | Fin de contrato con la última agencia |

### 2.4 Para quién NO es — reescrito en la v4.0

El criterio anterior descartaba a todo el que no pautara. Con el ruteo por cadena (§5.0) ese filtro botaba prospectos válidos de otras áreas, así que la exclusión se acota a lo que de verdad no tiene solución en el catálogo de Precisión:

**Fuera de perfil, sin excepción:**
- Sin volumen comercial que justifique intervención: menos de ~$100.000 CLP/mes de capacidad de inversión en cualquier área
- Startups sin modelo validado — no hay proceso que automatizar ni demanda que escalar todavía
- Negocios sin ningún activo digital ni intención de tenerlo
- Empresas cuyo cuello de botella es de producción o abastecimiento, no comercial. Precisión no resuelve capacidad productiva

**Ya NO son criterio de descarte** (eran exclusiones en la v3.x):

| Antes se descartaba | Ahora | Por qué |
|---|---|---|
| Sin pauta activa | **Es un dato de ruteo, no un descarte.** E3 sin flujo → se evalúan E2, E5 y E6 | Puede tener el proceso roto y no saberlo |
| Capta por licitación o contrato (maestranzas, distribuidoras, plantas) | **Candidato prioritario de E5.** Cotización manual, seguimiento por correo y plazos apretados es el perfil de automatización | Las 7 industriales descartadas en la decisión #9 nunca fueron evaluadas para esto |
| Vende solo por WhatsApp o Instagram | **Candidato de E4 y E5.** Vender por WhatsApp no es el problema; hacerlo sin registro ni tiempo de respuesta, sí | El canal no descalifica; la ausencia de proceso es el hallazgo |

**Advertencia operativa:** ampliar el perfil amplía el universo, no la capacidad de visitarlo. Si todos califican, no se calificó nada. Por eso el scoring de §5.6 pasa a puntuar **por área**, y la base priorizada ordena por severidad del eslabón dominante — no por "tiene o no tiene pauta".

### 2.5 Qué le exige el buyer persona al output

Esta sección traduce el estudio de buyer persona en **requisitos verificables de la salida**. No es contexto de marketing: cada línea es una regla que el motor debe cumplir y que el Anexo G verifica.

#### 2.5.1 Los trabajos declarados, convertidos en requisitos

| Job to be done (del estudio) | Persona | Requisito de salida |
|---|---|---|
| "Identificar si el problema está en el copy, la landing, la segmentación o la configuración técnica" | Rodrigo | El dashboard muestra **las 5 capas con semáforo**, no un texto corrido. Rodrigo tiene que poder señalar con el dedo dónde está el problema |
| "Obtener una respuesta específica a su caso, no consejos genéricos de YouTube" | Rodrigo | Toda hipótesis cita **su** dato (`Pxx` o señal observada). Cero afirmaciones que apliquen a cualquier cuenta |
| "Poder decirle a su socio, cónyuge o contador por qué invirtió ese dinero y qué va a cambiar" | Rodrigo | Cada hipótesis debe ser **repetible en una frase por alguien que no es técnico**. Si no se puede repetir de memoria, está mal redactada |
| **"Determinar si el problema era atribuible a las agencias o a su propio setup"** | **Carolina** | **Cada hallazgo lleva eje de atribución** (§2.5.3). Es su pregunta central y hoy la matriz no la responde |
| "Identificar los 3 cambios de mayor impacto antes de volver a invertir" | Carolina | Exactamente 3 soluciones, ordenadas, cada una atada a una hipótesis |
| "Tener un documento de respaldo para exigir cuentas a una agencia futura" | Carolina | La evidencia va **visible junto a cada afirmación**, no en un anexo |
| "Decidir si vale la pena seguir invirtiendo en el canal actual" | Ambos | El veredicto de viabilidad (Capa 1) es explícito, incluso cuando la respuesta es "no sigas" |

#### 2.5.2 Las creencias limitantes, convertidas en reglas de redacción

El estudio (§7.1 del buyer persona) identifica cinco creencias instaladas y advierte: *"Calibrar debe desactivar estas creencias sin refutarlas directamente. El copy que más funciona no dice 'somos diferentes'. Muestra evidencia concreta."*

| Creencia | Regla de salida (obligatoria) |
|---|---|
| "El marketing digital es una farsa" | Toda hipótesis expone su **mecanismo**, no su promesa. Se explica *por qué* produce el efecto, no que lo produce |
| "Si pago, igual me van a vender algo" | **Ninguna solución puede tener como única vía contratar a alguien.** Toda solución trae un camino ejecutable por el propio cliente, aunque sea más lento |
| "El problema somos nosotros, no la pauta" | El eje de atribución separa explícitamente lo estructural del negocio de lo que es configuración corregible. Se nombra lo que **no** es culpa suya |
| **"Si fuera tan sencillo, ya lo habría encontrado yo"** | **Cada hipótesis declara por qué no era visible desde el Administrador de Anuncios.** Es la regla que convierte el diagnóstico en alivio en vez de vergüenza |
| "Reportes con muchas gráficas y poco análisis" (dolor documentado de Carolina) | **No hay dato sin lectura.** Ninguna cifra del dashboard aparece sin la frase que dice qué significa para el negocio. Un número solo es ruido |

La última es la más importante para este producto: un dashboard es, por defecto, exactamente lo que a Carolina le entregaron dos agencias y la hizo cancelar. **La diferencia no está en el gráfico, está en que cada dato venga leído.**

#### 2.5.4 Validación del eje de atribución (pendiente 16)

**Contraste retrospectivo sobre las dos cuentas con documentación completa.** La prueba es una sola: lo clasificado como `gestión` ¿es efectivamente corregible sin tocar el negocio?

| Cuenta | Hallazgo | Clasificado | ¿Se sostiene? |
|---|---|---|---|
| Eco Star | Tres de cada cuatro mensajes sin responder | `estructura` | **Sí.** Es capacidad instalada, no configuración. El informe humano llega a la misma conclusión: *"es de capacidad instalada para responder"* |
| Eco Star | Objetivo de campaña "Interacción" | `gestión` | **Sí.** Se corrige cambiando la campaña, sin tocar el negocio |
| Eco Star | Sin forma de atribuir venta | `compartida` | **Sí.** Requiere decisión del dueño (construir tienda) + ejecución técnica |
| Vicsa | Se pagó por volumen con restricción de calificación | `gestión` | **Sí.** Se corrige con una sesión de trabajo |
| Vicsa | El cuello de botella son las dos personas asignadas | `compartida` | **Sí.** Decisión de asignación + diseño del sistema |
| Vicsa | El criterio está en la cartera y nadie la leyó | `gestión` | **Sí.** Leer la propia base no cambia el negocio |

**6 de 6 se sostienen. Y eso prueba menos de lo que parece.**

Soy yo revisando mis propias clasificaciones sobre casos que ya conocía. Es un chequeo de coherencia interna, no una validación. **La validación real es prospectiva:** clasificar antes, y comprobar después si lo marcado como `gestión` se corrigió efectivamente sin tocar el negocio.

**Instrumento para que la validación se acumule sola.** En vez de dejar #16 como un ejercicio que nadie va a hacer, se registra en la ficha de cada diagnóstico:

| Campo | Cuándo se llena |
|---|---|
| `atribucion_declarada` | En el diagnóstico. Ya sale del motor |
| `se_corrigió` | A los 90 días: sí · no · parcial |
| `hubo_que_tocar_el_negocio` | A los 90 días: sí · no |
| `clasificación_correcta` | Se deriva: `gestión` es correcta si `se_corrigió = sí` **y** `hubo_que_tocar_el_negocio = no` |

**Umbral de confianza:** con **5 cuentas** y menos de 2 clasificaciones erradas, el eje se considera validado. Con 2 o más errores en el mismo sentido —por ejemplo, `gestión` que resultó estructural—, el eje está sesgado hacia el optimismo y hay que recalibrarlo antes de seguir usándolo con Carolina.

**Por qué importa que se valide y no se asuma:** el eje existe para responderle a "La Decepcionada de Agencia" si el problema era la agencia o su propio setup. Si clasifica mal, le estamos dando una respuesta equivocada a la pregunta que la trae. **Un eje que no predice es peor que no tenerlo**, porque suena a diagnóstico y es una opinión.

#### 2.5.3 Eje de atribución — la pregunta de Carolina

Todo hallazgo se clasifica en uno de tres:

| Atribución | Qué significa | Ejemplo |
|---|---|---|
| **Gestión** | Decisión de quien operaba la cuenta —agencia, freelancer o el propio dueño—. Es corregible sin tocar el negocio | Objetivo "Tráfico" en vez de Conversiones · sin CAPI · sin UTMs · segmentación desalineada |
| **Estructura** | Condición del negocio, no de la pauta. No se arregla optimizando campañas | Ticket que no soporta el CPA · ciclo de venta largo · nadie responde los leads en menos de 5 min |
| **Compartida** | Requiere decisión del dueño y ejecución técnica | Presupuesto bajo el mínimo de aprendizaje · falta de landing dedicada |

**Por qué importa comercialmente:** si el diagnóstico de Carolina sale mayoritariamente `Gestión`, la respuesta a su pregunta es "no eras tú, era cómo estaba operada la cuenta" — y eso la reabre al canal, que es su trabajo emocional declarado ("recuperar la confianza en el canal, no abandonarlo"). Si sale mayoritariamente `Estructura`, la conclusión honesta es que la pauta pagada no es su problema ni su solución, y Precisión **no** le vende gestión mensual (§3.2, Uso 3).

Ese reparto es, además, la información más difícil de conseguir para ella y la que ninguna agencia le va a dar: ninguna va a decirle que el problema era la gestión anterior sin sugerir de inmediato que la contrate a ella.

---

## 3. Solución y para qué se usa

### 3.1 Qué es, en una frase
**Una herramienta interna que toma lo que se sabe de un prospecto —sus respuestas, o solo lo observable desde afuera— lo procesa con la API de Claude contra la Matriz Exhaustiva de Cruces, y devuelve un dashboard que identifica en qué eslabón se está rompiendo su crecimiento comercial, qué área del catálogo lo resuelve, y las 3 hipótesis con sus 3 soluciones que lo demuestran.**

No es un diagnóstico de pauta. La pauta es uno de los siete eslabones que evalúa (§5.0).

### 3.2 Los tres usos

> **Nota v5.1:** siguen siendo tres, pero el Uso 2 cambió de naturaleza con el modo en vivo (§5.7) y ahora incluye la entrega del diagnóstico de etapa 0 en la propia reunión (§5.8.5). El Uso 1 opera además por vía B, sin cliente (§5.9).

**Uso 1 · Segmentar y priorizar la base de prospección.**
Precisión mantiene una base maestra de prospectos de la Región Metropolitana que crece ~50 registros por semana mediante una tarea programada; superó los 370 registros en julio-2026. Sin diagnóstico, esa base es una lista de nombres. Con diagnóstico, se convierte en una lista **ordenada por severidad del problema y ajuste al perfil de cliente ideal**: a quién visitar el lunes y a quién no visitar nunca.

**Uso 2 · Diagnosticar en vivo durante la reunión.** *(Modo principal desde la v3.1 — ver §5.7.)*
No se llega a la visita con un informe hecho: se diagnostica **mientras se conversa**, en videollamada o en terreno. Pablo pregunta, la herramienta procesa en tiempo real y devuelve el hallazgo dominante, la evidencia que lo sostiene y la siguiente mejor pregunta. La apertura deja de ser "hola, somos una agencia" y pasa a ser una afirmación verificable sobre el negocio del otro, construida delante de él.

**Uso 3 · Filtrar antes de proponer — en el momento, no después.**
Si el diagnóstico muestra que la cuenta es económicamente inviable para pauta pagada (ticket que no soporta el CPA, presupuesto bajo el mínimo de aprendizaje), Precisión **no propone gestión mensual**: propone otra cosa o se retira. En modo en vivo esta decisión se toma **durante la reunión**, no después de analizarla — y por eso el orden de interrogación empieza por la Capa 1 (§5.7.3): para llegar al "no" lo antes posible y no gastar una hora en una propuesta que va a fracasar.

### 3.3 Límites duros
- **No se vende ni se cobra.** Es instrumental interno, no un producto del catálogo. Se reafirma en la v3.1: el diagnóstico en vivo tampoco se cobra — es parte de la conversación de venta, no un servicio.
- **No se entrega al prospecto.** No hay documento que se le mande. En modo en vivo el prospecto **sí puede ver hallazgos en pantalla** durante la reunión (vista compartida, §5.7.6), pero eso es conversación, no entregable: el panel del operador, el veredicto de calificación y las contradicciones detectadas nunca se comparten.
- **No promete resultados ni leads.**
- **No gestiona ni implementa campañas** — ese es el servicio mensual de la agencia, que se cotiza aparte.
- **No reemplaza la reunión.** La prepara.
- **No reemplaza el diagnóstico estratégico.** Calibrar produce data leída, tres hipótesis y tres soluciones — suficiente para calificar y para una PYME. Una cuenta corporativa requiere el diagnóstico con marcos formales (PESTA, cinco fuerzas, involucrados, FODA cruzado, árbol del problema) que es un **entregable pagado posterior**, no lo que Calibrar genera. Ver Anexo I.6.

### 3.4 Cómo se opera mientras no está automatizado
El pre-análisis se hace **manualmente** con el protocolo de diagnóstico externo (§5.6) y la matriz de cruces aplicada a mano. Funciona, pero no escala: es exactamente el cuello de botella que Calibrar automatiza.

---

## 4. Decisiones con evidencia

Cada decisión con el dato que la forzó y su estado actual.

| # | Decisión | Evidencia que la forzó | Estado |
|---|---|---|---|
| 1 | **28 preguntas, no 7** | Con 7 preguntas no había señal suficiente para los cruces diagnósticos: la mayoría de los hallazgos nacen de *combinaciones* (ticket × presupuesto × plataforma), no de respuestas sueltas. La Matriz documenta ~50 cruces sobre P1–P28 | Vigente |
| 2 | **Fuente de verdad única: la Matriz Exhaustiva de Cruces** | Versiones anteriores del proyecto tenían formularios que se contradecían entre documentos | Vigente — ningún entregable puede definir preguntas distintas |
| 3 | **Claude API como motor** | La calidad no depende del modelo sino del system prompt: benchmarks verificados + prohibición explícita de fabricar datos | Vigente — **corregido en v4.0**: modelos fijados (`claude-sonnet-5` en vivo, `claude-opus-5` al cerrar) y costo real recalculado en §5.5.1. La estimación de ~$30 CLP era 3–6× menor que la real |
| 4 | **Diagnóstico en capas, no lista de hallazgos** | Un problema de viabilidad económica o de medición invalida cualquier optimización de copy. Recomendar "mejora tu anuncio" a una cuenta sin Pixel es ruido | Vigente — es la regla que más ordena el output |
| 5 | **Herramienta interna, no producto de venta** | No había casos de éxito documentados ni referencias reales para sostener la venta externa de un diagnóstico pagado a un mercado escéptico. Al ser interna desaparece todo el flujo de pago, facturación, términos y condiciones y secuencias anti-abandono: ~60% menos de complejidad | Vigente |
| 6 | **Mercado Pago, no Stripe** (si alguna vez se cobrara) | Verificado jun-2026: **Stripe no permite el registro de empresas chilenas**. Usarlo exigiría constituir una sociedad en EE.UU. | Fuera de alcance por la decisión #5 |
| 7 | **Presupuesto diario ≈ 7× CPA objetivo** (no 10×) | 50 conversiones/semana ÷ 7 días ≈ 7,1 conv/día × CPA. Una versión anterior de la matriz decía 10× en un punto y 7× en otro; se unificó en la derivación aritmética | Corregido en Matriz v1.2 (17-jul-2026) |
| 8 | **Referencia de precio: $59.990 CLP** si alguna vez se comercializara | Investigación de mercado: equivale a ~1,7 horas de consultor chileno ($25.000–150.000/h); Fiverr USD 50–550; auditoría e-commerce chilena USD 250–500. El precio no sería el problema — el problema es que el competidor-ancla en Chile **es gratis** (auditorías de agencia como gancho de venta) | Investigación cerrada; no se aplica mientras sea interna |
| 9 | ~~El perfil de cliente ideal no estaba donde estaba la lista~~ **REVISADA en la v5.0** | La auditoría de 9 industriales concluyó que solo 2 calificaban. **Calificaban para pauta** — que era la única pregunta que el modelo sabía hacer. Con el ruteo por Cadena, una empresa que capta por licitación y cotiza a mano es prospecto prioritario de E5. El hallazgo original sobre clínicas y centros de eventos sigue siendo válido **para E3**; no define el ICP de la agencia | **Corregida.** La base real (377 registros de industria pesada al momento del hallazgo, jul-2026; hoy 577 en el maestro / 573 visitables) siempre estuvo apuntando al ICP correcto |
| 10 | **Implementación en cola detrás de la venta en terreno** | El costo dominante por informe es el tiempo humano de revisión, no la API. Con la caja apretada, ese tiempo vale más vendiendo | Vigente en la conclusión; la cifra de API se corrigió en §5.5.1 — revisión de prioridad en enero-2027 |

---

## 5. Cómo funciona por dentro

### 5.0 La Cadena de Crecimiento Comercial — el modelo que rutea el área

**Cambio estructural (v4.0).** Calibrar deja de ser un diagnóstico de pauta y pasa a ser un **diagnóstico de crecimiento comercial que rutea al área correcta**. La pregunta que responde ya no es "por qué tu pauta no genera leads" sino **"dónde se está rompiendo tu crecimiento, y qué disciplina lo arregla"**.

El crecimiento comercial de una PYME es una cadena de siete eslabones. Cada eslabón, cuando se rompe, produce un síntoma distinto y exige una disciplina distinta — y cada disciplina es una de las líneas de servicio de Precisión.

| # | Eslabón | Cómo lo dice el dueño | Área que lo resuelve |
|---|---|---|---|
| **E1** | **Criterio y foco comercial** | "Nos llegan contactos pero no cierran" · "no sabemos a quién apuntar" | **Estrategia y diagnóstico** |
| **E2** | **Reputación y posicionamiento** | "No me conocen" · "me conocen mal" · "no me creen todavía" | Contenido y RRPP |
| **E3** | **Generación de demanda** | "No llega suficiente gente interesada" | Paid Media y SEO |
| **E4** | **Activo de conversión** | "Llegan, pero mi sitio no sostiene lo que prometo" | Desarrollo web |
| **E5** | **Captura y respuesta** | "Llegan y se pierden antes de que alguien conteste" | Automatización y agentes |
| **E6** | **Escala de la conversación** | "Atiendo bien pero no doy abasto" · "no alcanzo a personalizar" | RPA y procesos |
| **E7** | **Capacidad del equipo** | "Depende todo de mí o de un externo" | Capacitación y adopción |

> **Equivalencia con la numeración pública — `E1`…`E7` ≡ `01`…`07`.** La notación `E<n>` es **taquigrafía interna de este PRD, de la Matriz, del Anexo G y del QA**; no existe fuera de ellos. Lo publicado en ppagencia.cl y lo que se usa en el catálogo, las propuestas y cualquier material que vea el cliente es **`01` a `07`**. El mapeo es 1:1 y en el mismo orden:
>
> | Interno | Público (sitio y cliente) | | Interno | Público (sitio y cliente) |
> |---|---|---|---|---|
> | `E1` | **01 · Criterio** | | `E5` | **05 · Captura** |
> | `E2` | **02 · Reputación** | | `E6` | **06 · Escala** |
> | `E3` | **03 · Demanda** | | `E7` | **07 · Capacidad** |
> | `E4` | **04 · Activo** | | | |
>
> El contrato de salida del motor **no usa la letra**: emite `"eslabon"` como entero de 1 a 7 (Anexo F), que es el mismo número de la escala pública. **Nunca escribir `E<n>` en un entregable al cliente.** La escala `E0`–`E6` es de la versión anterior a que existiera E1 Criterio: está corrida en uno y es **siempre un error**.

#### 5.0.0 E1 Criterio — el eslabón que faltaba, y el que Precisión mejor vende

**Añadido en la v5.0 tras contrastar el modelo contra la cuenta Bunzl/Vicsa.** El modelo de siete eslabones asumía que el problema siempre está en *ejecutar* mejor. La cuenta Bunzl demostró que hay un eslabón anterior:

> Vicsa recibió **90 leads en dos o tres meses, obtuvo 2 citas y cerró 0 negocios.** Hubo demanda (E3 funcionando), hubo quien la contactara (E5 funcionando), y el resultado fue cero. La causa raíz identificada en el diagnóstico: *"nadie definió qué es un lead calificado para Vicsa en Chile"*.

Ese fallo no cabe en E2–E7. **La demanda llegó; llegó equivocada.** Y ninguna cantidad de pauta, automatización o web arregla un criterio de cliente objetivo que no existe.

**E1 es el primer eslabón: sin criterio, todo lo que se construya río abajo amplifica el error.** Es el caso extremo de la regla del balde — no es que el balde tenga agujeros, es que se está llenando el balde equivocado.

| | E3 roto | **E1 roto** |
|---|---|---|
| Síntoma | "No llega nadie" | "Llegan y no cierran" |
| Dato típico | Pocas oportunidades al mes | Muchas oportunidades, conversión cercana a cero |
| Reacción intuitiva del dueño | Pedir más publicidad | **Pedir más leads** |
| Lo que realmente necesita | Generación de demanda | **Definir a quién le vende, por escrito** |
| Área | Paid Media y SEO | **Estrategia y diagnóstico** |

La tercera fila es la trampa: **un E1 roto se siente exactamente igual que un E3 roto desde adentro.** El dueño pide más leads porque los que tiene no funcionan. Darle más leads reproduce el fracaso con otro proveedor — que es literalmente lo que le pasó a Bunzl durante doce meses.

**Por qué este eslabón importa comercialmente más que los otros seis.** E1 es el área donde Precisión tiene su diferenciador declarado: formación en RRPP, marcos de estrategia formal —PESTA, Porter, matriz de involucrados, FODA cruzado, árbol del problema—, y capacidad de producir un diagnóstico que el cliente puede circular internamente. Los eslabones E2 a E7 se ejecutan; E1 se piensa, y ahí la competencia es mucho menor.

**Regla de precedencia de E1:** antecede a todos los demás **cuando hay flujo llegando y no convirtiendo**. Si no llega nadie, el problema no es de criterio sino de demanda: E1 solo se rompe cuando hay con qué comprobarlo.

#### 5.0.05 Eventos corporativos — canal, no eslabón

El sitio publica **Eventos corporativos y ferias** como bloque de servicio, y con razón: en industrias de ticket alto la feria sigue siendo donde se conoce al comprador cara a cara. Pero **no es un eslabón de la cadena** y no debe rutearse como tal.

La diferencia importa. Un eslabón es una forma en que el crecimiento se rompe; una feria es un **canal donde ocurren varios eslabones a la vez**: presencia (E2), captura de contactos durante los tres días (E5) y seguimiento la semana siguiente (E5/E6).

**Regla para el motor:** Eventos **nunca** aparece como `area_recomendada`. Aparece cuando el prospecto ya va a ferias o las está evaluando, y entonces se trata como el contexto donde se aplica el eslabón dominante — no como el diagnóstico.

En la práctica: si un prospecto va a una feria y su eslabón roto es E5 (captura), el hallazgo es *"vas a gastar en el stand y no vas a tener registro de con quién hablaste"*. El área sigue siendo Automatización y agentes; la feria es dónde se nota.

#### 5.0.1 La regla de precedencia: se tapa el balde antes de abrir la llave

El propio estudio de buyer persona lo documenta citando a MediaMavens: uno de los dos errores más costosos de la PYME chilena es *"invertir en publicidad sin una landing page optimizada para convertir, lo que equivale a llenar un balde con agujeros"*.

De ahí sale la regla:

> **Si hay una fuga río abajo, invertir río arriba la amplifica.**
> El eslabón dominante es **el primero que se rompe contando desde donde hoy sí hay flujo**.

Cómo se aplica:

- Si llegan interesados y nadie los contesta en menos de un día (E5 roto), **el eslabón dominante es E5, no E3** — aunque el dueño pida más publicidad. Más demanda sobre una captura rota solo aumenta la pérdida.
- Si no llega nadie porque nunca se generó demanda (E3 roto y no hay flujo río abajo que evaluar), **E3 es dominante**.
- Si llega gente pero el anuncio apunta al home y no hay dónde dejar datos (E4 roto), **E4 antecede a optimizar la campaña**.

Es la misma lógica de capas de §5.3, un nivel más arriba. **Hay dos niveles de diagnóstico y no hay que confundirlos:**

| Nivel | Qué determina | Modelo |
|---|---|---|
| **Nivel 1 — Cadena** | Qué **área** necesita el prospecto | 7 eslabones (E1–E7) |
| **Nivel 2 — Capas** | Dentro de pauta, cuál es el hallazgo dominante | 5 capas (§5.3) |

Las 5 capas de §5.3 son, en rigor, el análisis profundo del eslabón E3. Los demás eslabones tienen su propio análisis profundo (Grupos H–L de la Matriz).

#### 5.0.2 Los dos eslabones que casi nunca son dominantes

**E7 Capacitación y adopción es un modificador, no un destino.** Casi nadie tiene como problema principal "mi equipo no sabe". El problema principal es otro, y la falta de capacidad determina **cómo** se resuelve: si E5 está roto y además nadie en el equipo puede sostener una automatización, la respuesta no es capacitación en vez de automatización — es automatización **más** capacitación, o automatización con soporte.

Regla: E7 nunca se recomienda solo, salvo que el prospecto ya tenga todo lo demás resuelto y dependa críticamente de un externo.

**E2 Reputación es dominante solo en dos casos:** cuando hay un evento reputacional activo, o cuando se trata de B2B de ticket alto con ciclo largo donde el prospecto simplemente no existe para su mercado. Fuera de eso, la reputación se trabaja en paralelo, no antes.

#### 5.0.3 Lo que este modelo cambia en la calificación

Es el cambio de mayor consecuencia comercial del documento. **Bajo el modelo anterior, un prospecto sin pauta activa quedaba fuera de perfil.** La decisión #9 de §4 documenta que de 9 empresas industriales auditadas solo 2 calificaban, y las otras 7 se descartaron por captar vía licitación, contrato o reputación sectorial.

Esas 7 fallaron **para E3**. No fueron evaluadas para E5.

Una maestranza que capta por licitación, cotiza a mano en Excel, responde correos uno por uno y pierde licitaciones por no alcanzar a preparar la propuesta a tiempo es un prospecto **mediocre para pauta y excelente para automatización de procesos**. El filtro que ahorraba visitas quemadas estaba botando al mejor cliente de otra línea de negocio.

**Consecuencia:** "no tiene pauta activa" deja de ser criterio de descarte y pasa a ser un dato de ruteo. Ver §2.4 reescrito y el nuevo scoring de §5.6.

### 5.1 El formulario — 28 preguntas en 6 grupos funcionales

| Grupo | Foco | Preguntas |
|---|---|---|
| **A** | Viabilidad económica (ticket, presupuesto, plataforma) | P1–P6, P9 |
| **B** | Configuración técnica (Pixel, CAPI, eventos, UTMs, analítica) | P16–P21 |
| **C** | Audiencia vs. plataforma | P7, P13–P14, P22–P24 |
| **D** | Síntoma vs. causa | P25–P27 |
| **E** | Madurez y proceso de ventas | P3–P4, P6, P8 |
| **F** | Copy del anuncio y arquitectura de conversión | P10–P12, P15 |

El detalle pregunta por pregunta está en el **Anexo A**.

**Alcance real de estas 28:** todas miran la cuenta publicitaria. Sirven para el análisis profundo del eslabón **E3** y para nada más. No pueden rutear el área — con ellas es imposible saber si alguien necesita automatización, porque ninguna pregunta por procesos.

### 5.1.1 Triage — 12 preguntas que rutean el área

Nuevo en la v4.0. Dos preguntas por eslabón. **Se preguntan siempre y primero**, en cualquier vía y en cualquier modo. Determinan el eslabón dominante y, con él, qué bloque profundo se aplica después.

| # | Pregunta | Eslabón | Qué captura |
|---|---|---|---|
| **T1** | Cuando te llega un cliente nuevo, ¿cómo supo de ti? | E2 | Recomendación · búsqueda · publicidad · licitación · no sé |
| **T2** | Si alguien te busca por el nombre de tu empresa, ¿qué encuentra? | E2 | Sitio + reseñas · solo redes · casi nada · no sé |
| **T3** | ¿Cuántas oportunidades nuevas de venta te llegan al mes? | E3 | Número aproximado · no sé |
| **T4** | ¿Inviertes hoy en publicidad pagada? | E3 | Meta · Google · ambas · otra · no |
| **T5** | ¿A dónde mandas a alguien que quiere comprarte? | E4 | Landing dedicada · home · WhatsApp · perfil de redes · no tengo |
| **T6** | ¿Puede alguien dejarte sus datos o comprar sin hablar contigo antes? | E4 | Sí, formulario o carro · solo WhatsApp · no |
| **T7** | Cuando llega un interesado, ¿en cuánto se le responde? | **E5** | Menos de 5 min · menos de 1 h · mismo día · más de un día · no sé |
| **T8** | ¿Dónde queda registrado ese contacto? | **E5** | CRM · planilla · correo o WhatsApp · no queda en ninguna parte |
| **T9** | ¿Cuántas conversaciones de venta al mes se quedan sin seguimiento? | E6 | Ninguna · algunas · muchas · no sé |
| **T10** | ¿Usan hoy alguna herramienta de IA en el negocio? | E6 | Sí, formalmente · alguien la usa por su cuenta · no · no sé qué sería |
| **T11** | ¿Cuántas horas a la semana se van en tareas repetitivas que no son vender ni producir? | **E5/E6** | Número · no sé |
| **T12** | Si mañana se va la persona que hoy maneja el marketing o los sistemas, ¿el resto puede seguir? | E7 | Sí · a medias · no |
| **T13** | ¿Tienen escrito, y de acuerdo con el equipo comercial, qué empresa es un buen cliente para ustedes? | **E1** | Sí, por escrito · lo sabemos pero no está escrito · no |
| **T14** | Si mañana te llegaran cien contactos, ¿cómo decidirías cuáles vale la pena trabajar? | **E1** | Criterio explicable · por intuición · no sabría |

**T13 y T14 se preguntan apenas T3 revele que sí llega flujo.** Si llegan oportunidades y el dueño no puede explicar con qué criterio las filtra, el eslabón dominante es E1 y todo lo demás es secundario — sin importar cuán rota esté la web o la medición.

**T14 es la pregunta más reveladora de las catorce.** No pregunta si tienen un criterio; pide que lo demuestren en el momento. La respuesta "los llamaría a todos y vería" es un E1 roto confesado sin que nadie tenga que admitir un error.

**Las tres que más rutean:**

- **T7 y T8 juntas** son el detector de automatización. "Más de un día" + "no queda en ninguna parte", con oportunidades llegando, es E5 dominante sin importar qué más aparezca. Es también la pregunta que descubre a la maestranza que hoy se descarta.
- **T11 es la pregunta del dinero.** Horas × costo hora × 4,3 semanas da el costo mensual del trabajo repetitivo — la única cifra del diagnóstico que el dueño puede comparar directamente contra el precio de una automatización.
- **T12 nunca rutea sola.** Determina si lo que se recomiende necesita capacitación o soporte encima.

**Costo en tiempo:** 12 preguntas cerradas se responden en 8–10 minutos de conversación. El bloque profundo del área dominante suma 8–15 más. En ningún escenario se preguntan las 40.

**Regla de orden en vivo:** el triage completo antes de cualquier pregunta profunda. Preguntar por el Pixel antes de saber si el eslabón roto es E5 es exactamente el error que este modelo existe para evitar.

### 5.1.2 Núcleo de negocio — 7 preguntas que se hacen siempre

**Nuevo en la v5.5.** El bloque E1 del Anexo A2 es un diagnóstico de negocio en regla: mejor cliente, criterio de descarte, quién decide y quién inicia, línea base de conversión, capacidad de atención, gatillo sectorial. El problema es **cuándo se abre**: solo si E1 resulta dominante. Si el triage rutea a E5, esas preguntas no se hacen nunca, y el diagnóstico habla del canal en vez del negocio.

Eso es un error de arquitectura, no de contenido. **El criterio comercial no es una especialidad: es el contexto que da sentido a los otros seis eslabones.** Saber que se pierden tres de cada cuatro conversaciones no dice lo mismo si esas conversaciones son del cliente que más margen deja o del que se preferiría no tener.

| # | Pregunta | De dónde viene | Qué revela |
|---|---|---|---|
| **N1** | Nómbrame tu mejor cliente hoy. Uno concreto. | `Q1` | Obliga a lo específico. La abstracción es donde se esconde la falta de criterio |
| **N2** | ¿Por qué ese y no otro? ¿Qué lo hace bueno? | `Q2` | El criterio implícito, en sus palabras: margen, volumen, recurrencia o comodidad |
| **N3** | ¿Hay clientes que preferirías no tener? ¿Por qué? | `Q5` | El criterio de descarte, que es la mitad de un criterio de calificación y casi nadie tiene escrito |
| **N4** | En tu cliente, ¿quién decide la compra? ¿Y quién la inicia? | `Q7` | En B2B rara vez son la misma persona. Entrar por quien firma en vez de por quien especifica es un error caro |
| **N5** | ¿Cuántos contactos entraron y cuántos cerraron el último trimestre? | `Q13` | **La línea base.** Sin este número no hay contra qué medir nada de lo que venga después |
| **N6** | ¿Cuántos clientes nuevos pueden atender por semana sin que caiga la calidad? | `Q15` | La restricción real. Si se entrega más de lo que puede atender, se reproduce el fracaso |
| **N7** | ¿Cuánto de tu venta del año pasado dependió de tu cliente más grande? | **nueva** | **Concentración de cartera.** El riesgo que ningún diagnóstico de marketing mira y que en B2B decide si el negocio es sano o frágil |

**Seis de las siete ya existen.** N1–N6 son `Q1`, `Q2`, `Q5`, `Q7`, `Q13` y `Q15` sin cambios de redacción: no son preguntas nuevas, dejan de depender del ruteo. **N7 es la única nueva** y responde a un vacío real: el modelo entero mide flujo y conversión, y ninguna pregunta mira si el negocio depende de un solo cliente. Un prospecto con el 60% de su venta en una cuenta no tiene un problema de demanda, tiene un problema de riesgo, y recomendarle pauta antes de decírselo sería complacencia.

**Reglas:**

- **Se preguntan siempre**, cualquiera sea el eslabón dominante, y **después del triage completo**. Nunca antes: el triage es el que decide si vale la pena seguir.
- **No rutean.** El ruteo lo sigue determinando el triage; el núcleo alimenta el bloque 1 del dashboard y califica las hipótesis, no las elige.
- **Si el eslabón dominante es E1, no se repiten.** El bloque `Q1–Q17` las contiene: en ese caso se abre el bloque completo y el núcleo queda absorbido.
- **Costo:** 5 minutos. Es el precio de que el informe hable del negocio.

### 5.1.3 Competencia y mercado — transversal, no un eslabón

**Nuevo en la v5.5, y cierra un hueco que el documento venía arrastrando.** §5.0.0 declara que E1 es el área donde Precisión tiene su diferenciador —«formación en RRPP, marcos de estrategia formal: PESTA, Porter, matriz de involucrados, FODA cruzado, árbol del problema»— pero **ningún instrumento del documento recoge los insumos para armar ninguno de esos marcos**. Lo que había: `Q8` ¿contra quién compites?, `Q9` ¿ganaste por precio? y `R6` ¿con quién te compara el cliente? Tres preguntas, las tres declarativas, y las tres encerradas dentro de bloques que rara vez se abren.

**La competencia no es un eslabón**, y tratarla como tal sería repetir el error que §5.0.05 evita con los eventos corporativos. Es **contexto que califica a los siete**: el mismo tiempo de respuesta es aceptable o suicida según cuánto demore el competidor, y el mismo precio es caro o barato según dónde esté el resto del rubro.

#### Mitad declarativa — en la reunión

| # | Pregunta | Qué revela |
|---|---|---|
| **M1** | Cuando te comparan, ¿contra quién te comparan? Nómbrame dos. | El marco competitivo **real**, que casi siempre difiere del que nombraría un consultor mirando el rubro desde fuera |
| **M2** | La última vez que perdiste un negocio contra otro, ¿qué te dijeron que pesó? | La causa de pérdida en palabras del cliente. Es la única fuente honesta de la desventaja competitiva |
| **M3** | ¿Qué haces tú que ellos no puedan copiar en seis meses? | Ventaja defendible. **Si no puede nombrarla, está compitiendo por precio aunque diga que no** |
| **M4** | Tu precio, ¿está sobre, igual o bajo el promedio del rubro? ¿Cómo lo sabes? | Posición de precio y —más importante— la procedencia de esa creencia. La respuesta suele ser "me lo dicen los clientes", que es la peor fuente posible |
| **M5** | ¿Qué está cambiando en tu rubro que va a obligar a todos a moverse? | **El gatillo sectorial.** Insumo directo de PESTA y el hallazgo de mayor valor cuando existe: define un universo objetivo por obligación, no por estimación |

M5 es la versión transversal de `Q16`, que hoy solo se pregunta si el dominante es E1. Cuando las dos aplican, se pregunta una vez.

#### Mitad observable — antes de la reunión

**Esta es la parte que hace que el análisis de competencia quepa en 30 minutos.** No se pregunta: se levanta en el pre-llenado del diagnóstico externo (§5.6), igual que las señales `s1–s10`, y llega al motor con procedencia `observado`.

| # | Señal | Qué revela |
|---|---|---|
| **SC1** | Competidores con anuncios activos en la Biblioteca de Anuncios | Quién invierte y desde cuándo. Si el prospecto no pauta y tres competidores sí, eso es un dato — no un juicio |
| **SC2** | Precio publicado del competidor | Asimetría de información. Cruza con `W8`: si el competidor publica y él no, la fricción es suya |
| **SC3** | Huella comparada: sitio, reseñas y volumen de cada uno | Posición relativa observable, no declarada |
| **SC4** | Autoridad sectorial: medios, gremios, rankings del rubro | Quién es la referencia del rubro hoy. Insumo de E2 |
| **SC5** | Presencia en licitaciones públicas o portales del sector | Canal de captación del competidor que el prospecto quizá no está usando |

**Reglas del bloque:**

- **Competencia nunca es `area_recomendada`.** Misma regla que eventos corporativos (§5.0.05): aparece como contexto del eslabón dominante, jamás como el diagnóstico.
- **Una contradicción entre M y SC se reporta, no se resuelve.** Si declara estar bajo el promedio del rubro (M4) y SC2 muestra que el competidor publica menos, eso es una pregunta para la reunión, no una conclusión.
- **SC1 no descalifica ni califica a nadie.** Que los competidores pauten y el prospecto no es información sobre el rubro, no un veredicto sobre él — la misma regla de T4.
- **Costo:** 4 minutos de reunión. La mitad observable cuesta cero minutos de reunión y sale del pre-llenado.

### 5.2 Las anclas cuantitativas (Chile 2026)
Todo diagnóstico se compara contra estas referencias. Las de agencias chilenas van marcadas `[referencial]`; solo las auditadas se presentan como dato duro.

| Ancla | Valor | Fuente |
|---|---|---|
| CPM Meta Chile | ≈ US$2,44 | Lebesgue 2026 [referencial] |
| CPL Meta global | US$27,66 (rango US$3,16–76,71) | WordStream/LocaliQ, sep-2025 |
| CPL Meta Chile por industria (CLP) | Retail $2.500–4.800 · Servicios B2B $8.500–18.000 · SaaS/Tech B2B $12.000–28.000 · Inmobiliaria $4.500–12.000 · Salud privada $6.500–15.000 | Agencias chilenas [referencial] |
| Presupuesto mínimo Meta Chile | $200.000–500.000 CLP/mes | Impulsados 2026 [referencial] |
| Ticket promedio ecommerce Chile | $47.295 CLP | CCS 2024 |
| Fase de aprendizaje Meta | 50 conversiones / ad set / 7 días | Meta |
| Presupuesto diario recomendado | ≈ 7× CPA objetivo | Derivación de la fase de aprendizaje |
| Speed-to-lead | Responder en 5 min = 21× más calificación que a los 30 min | MIT/InsideSales; HBR 2011 |
| LTV:CAC saludable | ≥ 3:1 | Benchmarkit |
| Pérdida de señal sin CAPI (2026) | Sub-reporte 15–30%; Pixel-only en iOS pierde 60–72% | Meta / Rockads |
| Penetración de redes en Chile | WhatsApp 89,7% · Instagram 86,4% · Facebook 83,3% · TikTok 67,5% · LinkedIn ~32% adultos | Fuentes locales 2025-26 / DataReportal |

**Fórmulas nucleares:**
```
CPA máximo viable        = ticket × margen × tasa de cierre
Presupuesto mensual mín. = 50 conv/semana × 4,3 semanas × CPA objetivo
Regla de corte           = si CPL > 30% del ticket sin recompra → insostenible
```

#### 5.2.1 Las anclas de negocio B2B — y el hueco que tienen

**Añadido en la v5.5 tras una constatación incómoda: de las once anclas de arriba, ocho son de pauta, y las tres fórmulas nucleares también.** El aparato de medición completo de este documento asume una cuenta publicitaria.

Eso contradice a §5.0.3. Desde la v4.0, "no tiene pauta activa" dejó de ser criterio de descarte, y el eslabón mayoritario de la base real es E5. Pero un prospecto que no pauta **pasa el triage, rutea correctamente y llega a un diagnóstico sin nada contra qué compararse**. Se le describe el problema y no se le dimensiona — y dimensionar es justamente lo que separa un diagnóstico de una opinión bien redactada.

Las que ya existen y sirven a un negocio que no pauta:

| Ancla | Valor | Fuente | Dónde se usa |
|---|---|---|---|
| Speed-to-lead | Responder en 5 min = 21× más calificación que a los 30 min | MIT/InsideSales; HBR 2011 | E5 · captura |
| LTV:CAC saludable | ≥ 3:1 | Benchmarkit | Transversal · salud del negocio |
| Hora administrativa RM | ≈ $6.000 CLP `[referencial]` | Referencial de la agencia — se declara estimación | E5 y E6 · costo del trabajo repetitivo |

Las que **faltan, y se declaran faltando**:

| Ancla que falta | Para qué se necesita | Estado |
|---|---|---|
| Ciclo de venta B2B en Chile | Dimensionar cuánto tarda en verse un resultado. Sin esto, cualquier compromiso de plazo es inventado | **Sin fuente** |
| Tasa de cierre B2B por etapa | Da sentido a la línea base de `N5`. Hoy el número se recoge y no se puede leer | **Sin fuente** |
| Concentración de cartera — umbral de riesgo | Es lo que mide `N7`. Se puede levantar el dato y no se puede decir si es sano | **Sin fuente** |
| Recurrencia / renovación B2B | Separa venta de relación, que es la diferencia entre un cliente y una transacción | **Sin fuente** |

**Se declaran vacías a propósito, y no se rellenan.** La regla de este documento es no inventar datos de mercado: sin fuente se declara estimación, y **una estimación no sirve como ancla** — el sentido de un ancla es ser el punto fijo contra el que se compara. Rellenarlas con un número plausible produciría exactamente el tipo de afirmación que §7.1 regla 1 prohíbe, con el agravante de que se vería más rigurosa que el `N/D`.

**Consecuencia operativa mientras estén vacías:** el motor puede reportar la cifra levantada —"el 60% de tu venta vino de un cliente"— y **no puede calificarla** de sana o riesgosa. Reportar sin calificar es correcto; calificar sin ancla, no. Conseguir estas cuatro fuentes es trabajo pendiente y está en §10.

### 5.3 El diagnóstico en capas
Se aplican en este orden. **Un problema en las capas 1 o 2 invalida cualquier optimización de las capas superiores.**

**Calificación por alcance (v3.1).** La regla anterior compara hallazgos de igual alcance. Antes de ordenar por capa hay que clasificar cada hallazgo:

- **Alcance de cuenta** — afecta al 100% del presupuesto y a toda la operación de pauta.
- **Alcance de canal** — afecta solo a una de las plataformas activas.

**Un hallazgo de capa inferior pero alcance de canal no antecede a uno de capa superior con alcance de cuenta.** Ejemplo real (Anexo G): "LinkedIn no soporta un ticket de $29.990" es Capa 1, pero solo invalida LinkedIn; Meta sigue siendo viable. No desplaza a "la cuenta está ciega" (Capa 2, alcance de cuenta), que afecta todo el gasto. Sin esta calificación, el motor recomendaría pausar un canal antes que destapar la medición de la cuenta completa.

1. **Viabilidad económica** — ¿el ticket soporta el CPA dado el presupuesto y la plataforma? Si no, ese es el hallazgo dominante y todo lo demás es secundario.
2. **Medición** — Pixel + CAPI + eventos + UTMs + analítica. Sin medición no hay optimización posible.
3. **Arquitectura de conversión** — coherencia objetivo ↔ destino ↔ copy.
4. **Audiencia y canal** — perfil de cliente y geografía mapeados a la plataforma correcta.
5. **Proceso de ventas** — speed-to-lead, cuellos de botella, quién cierra.

### 5.4 Banderas rojas — cualquiera detiene el escalamiento
Objetivo "Tráfico" o "No sé" · sin Pixel verificado · sin eventos de conversión · sin CAPI en 2026 · sin UTMs · destino "perfil de Instagram/Facebook" para generar leads · geografía no configurada · perfil de cliente no definido · CPL no medido con más de 3 meses invirtiendo · más de 6 meses + "no sé qué está fallando" · ticket > $2M con presupuesto < $200.000.

### 5.5 El motor de IA — System Prompt Maestro v1.1
Ejecuta 8 pasos de razonamiento interno antes de escribir una sola línea del informe:

| Paso | Qué hace |
|---|---|
| 1 | Inventario de datos — qué respuestas hay, cuáles faltan o son ambiguas; ¿se obtuvo la landing? |
| 2 | Detección de contradicciones — pares críticos: P16↔P19 (Pixel/eventos), P26↔P27 (mide CPL/declara CPL), P1↔P22 (modelo/cliente), P4↔P6 (equipo/quién cierra), P10↔P11 (objetivo/destino) |
| 3 | Capa 1 — viabilidad económica; calcula el CPA máximo viable |
| 4 | Capa 2 — medición; ¿la cuenta está ciega? |
| 5 | Capa 3 — arquitectura de conversión |
| 6 | Capa 4 — audiencia y canal |
| 7 | Capa 5 — proceso de ventas |
| 8 | Priorización — clasifica cada hallazgo por alcance (cuenta / canal), ordena por impacto en CAC respetando el orden de capas entre hallazgos de igual alcance; selecciona 3 problemas y 3 acciones |

**Parámetros (corregidos y verificados, v4.0):**

> ⚠️ **Los parámetros de la v3.x ya no son válidos.** `temperature: 0.4` **devuelve error 400** en los modelos actuales: el parámetro fue eliminado en la familia Opus 5 / Sonnet 5. Un pipeline construido con la documentación anterior falla en la primera llamada. La nota del Anexo F ("subir max_tokens antes de tocar la temperatura") describe una palanca que ya no existe.

| Parámetro | Valor | Nota |
|---|---|---|
| Modelo — turno en vivo | `claude-sonnet-5` | Rápido y barato para el ida y vuelta de la reunión |
| Modelo — dashboard de cierre | `claude-opus-5` | Calidad máxima para el entregable |
| `temperature` / `top_p` / `top_k` | **No enviar** | Eliminados; devuelven 400. La consistencia se controla con el prompt y con `effort`, no con muestreo |
| `output_config.effort` | `low` en vivo · `high` al cerrar | Reemplaza a lo que antes hacía `temperature` |
| `thinking` | `{"type": "adaptive"}` | En Opus 5 está activo por defecto |
| `max_tokens` | 8.000 en vivo · 16.000 al cerrar | El dashboard completo no cabe en 6.000 |
| Streaming | **Obligatorio** sobre 16.000 tokens | Sin streaming la petición expira |
| `cache_control` | `{"type": "ephemeral", "ttl": "1h"}` sobre el system prompt | Ver §5.5.1 — es la decisión de mayor impacto económico |

**Salida:** un único objeto JSON con dos capas. La **capa de análisis** (interna, no se muestra) son las 6 secciones — (1) diagnóstico rápido, (2) análisis del copy, (3) análisis de la landing, (4) evaluación de la configuración, (5) los 3 problemas críticos, (6) las 3 acciones prioritarias. La **capa visible** es el dashboard de 3 bloques de §5.8, que debe ser derivable de la anterior. Cada sección incluye un campo `reasoning` que no se muestra: existe para auditar *por qué* el modelo llegó a ese diagnóstico.

**El prompt completo, listo para pegar, está en el Anexo E.**

#### 5.5.1 Costo real por informe — la cifra de $30 CLP estaba mal

La v3.x estimaba **~$30 CLP por informe** y construía sobre eso todo el argumento de que "el costo no es la API, es el tiempo humano". Con precios verificados y el tamaño real del prompt, esa cifra es entre 3 y 6 veces menor que la real.

**Supuestos del cálculo, medidos en la v5.3** (el prompt se midió, no se estimó): el bloque del Anexo E tiene **49.867 caracteres y 7.727 palabras**, que a 3,2–4,2 caracteres por token en español técnico da **11.900–15.600 tokens** — por debajo de los 18.000 que suponía la v4.0. Entrada total ≈ 14.000–18.000 tokens · salida ≈ 4.000 · tipo de cambio ≈ $950 CLP/USD [estimación].

> Falta confirmarlo con `count_tokens` cuando haya credencial de API (pendiente 22). La estimación por caracteres es defendible pero no es la cifra oficial.

| Configuración | Sin caché | **Con caché de prompt** |
|---|---|---|
| Opus 5 ($5 / $25 por millón) | $161–179 CLP | ≈ **$112 CLP** |
| Sonnet 5 ($2 / $10 introductorio hasta 31-ago-2026) | $64–71 CLP | ≈ **$45 CLP** |
| Haiku 4.5 ($1 / $5) | $32–36 CLP | ≈ **$22 CLP** |

Recalculado con el prompt medido. Las cifras bajan respecto de la v4.0 —el prompt resultó más chico de lo supuesto— pero **la conclusión no cambia: siguen siendo entre 1 y 6 veces los ~$30 CLP que el documento afirmaba**, y la caché sigue siendo la palanca de mayor impacto.

**La caché de prompt es la decisión de mayor impacto económico del proyecto.** El system prompt con la Matriz es idéntico en cada diagnóstico: son ~18.000 tokens que hoy se pagarían completos en cada llamada. Marcados con `cache_control`, las lecturas cuestan **una décima parte**. Con TTL de una hora, una jornada de visitas comparte una sola escritura de caché.

**Consecuencias sobre las decisiones del PRD:**

1. La decisión #3 de §4 y la razón #1 de la pausa se apoyaban en "la API es despreciable, el problema es el tiempo humano". Sigue siendo cierto que el tiempo humano pesa más, pero **la API no es despreciable**: a 370 prospectos por vía B, la diferencia entre Opus sin caché y Sonnet con caché es de ~$70.000 contra ~$16.000. No cambia la conclusión; sí cambia el orden de magnitud.
2. El **modo en vivo multiplica el costo por turno**, no por informe: una reunión con 12 preguntas de triage puede ser 12 llamadas. Sin caché eso es prohibitivo; con caché es viable. Ver §5.5.2.
3. La caché exige que el system prompt sea **byte-idéntico** entre llamadas. Cualquier fecha, ID de sesión o nombre de prospecto interpolado al inicio del prompt invalida la caché completa y devuelve el costo a la columna izquierda. El prompt debe quedar congelado y las variables ir siempre después.

#### 5.5.2 Arquitectura de dos modelos — cómo caber en 10 segundos

Cierra el pendiente 9. Los 8 pasos de razonamiento sobre 16.000 tokens de salida no caben en los 10 segundos de §5.7.7. La solución no es un solo modelo más rápido: son **dos llamadas distintas con propósitos distintos**.

| | **Turno en vivo** | **Cierre de reunión** |
|---|---|---|
| Cuándo | Después de cada respuesta del prospecto | Una sola vez, al despedirse |
| Modelo | `claude-sonnet-5` | `claude-opus-5` |
| `effort` | `low` | `high` |
| `max_tokens` | 8.000 | 16.000 |
| Devuelve | Bloque 0 (ruteo) + `siguiente_pregunta` + `seguro_de_decir` | Dashboard completo de 5 bloques (0 a 4) |
| Streaming | Sí — lo que importa es el primer token | Sí |
| Presupuesto | < 10 s | 20–40 s, mientras te despides |

**Por qué funciona:** el turno en vivo no necesita producir el dashboard entero. Necesita decir en qué eslabón vamos, qué preguntar ahora y qué ya se puede afirmar en voz alta. Eso son unos cientos de tokens de salida, no cuatro mil. El informe pesado se genera una sola vez, al final, cuando ya nadie está esperando en silencio.

**Alternativa si aún no alcanza:** existe *fast mode* (`speed: "fast"` sobre Opus 5, hasta 2,5× más tokens por segundo), pero cuesta $10/$50 por millón — el doble de Opus estándar y cinco veces Sonnet. Es la última palanca, no la primera. Antes están: bajar `effort`, recortar el output del turno vivo, y asegurarse de que la caché esté funcionando.

**Cómo verificar que la caché funciona:** el campo `cache_read_input_tokens` de la respuesta. Si es cero en llamadas sucesivas, algo está invalidando el prefijo y estás pagando la columna izquierda de la tabla anterior sin saberlo.

### 5.6 El complemento manual: protocolo de diagnóstico externo
Permite pre-calificar un prospecto desde afuera, gratis y sin su cooperación, sobre cuatro ejes:

- **A · Landing y conversión** — ¿landing dedicada o todo al home? ¿CTA específico o "contáctenos"? ¿formulario o solo teléfono?
- **B · Medición** — ¿hay Pixel de Meta o Google Tag Manager en el código?
- **C · Pauta activa** — ¿aparece en la biblioteca de anuncios de Meta? ¿verificación de dominio de Facebook?
- **D · Hipótesis de fuga** — el cruce de los tres anteriores.

Cada hallazgo se marca `[Seguro]`, `[Probable]` o `[Requiere validación]`. La señal más limpia es la combinación **Pixel + verificación de dominio de Facebook**: prueba que la empresa está pautando en Meta hoy.

**Scoring de priorización — operacionalizado en la v4.0.** La fórmula era `Dolor (0–3) + Velocidad de decisión (0–3) + Ticket/presupuesto (0–2) + Accesibilidad (0–2) = /10`, pero nunca se definió qué hace que Dolor sea 3 y no 2, ni cómo se rompen los empates. Sin eso el score no era verificable. Rúbrica:

| Sub-score | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Dolor** (0–3) | Ningún eslabón roto | Eslabón dominante LEVE | MODERADO | CRÍTICO |

**Ajuste por eslabón (v5.1):** un **E1 crítico suma +1 al Dolor**, con techo en 3. Es el eslabón de mayor valor comercial y el que menos competencia tiene: cuando el criterio de cliente está roto, todo lo que se venda río abajo va a fallar, y decirlo primero es lo que hace la diferencia frente a cualquier otra agencia.
| **Velocidad de decisión** (0–3) | Compra por licitación pública | Comité o gerencia corporativa | Dueño + socio | Dueño decide solo |
| **Capacidad de pago** (0–2) | Bajo el mínimo (~$100.000/mes) | Media | Ticket alto o presupuesto ≥ $500.000/mes | — |
| **Accesibilidad** (0–2) | Sin vía de contacto | Contacto identificable | Contacto directo y en ruta de terreno | — |

**Desempate, en este orden:** (1) severidad del eslabón dominante, (2) capacidad de pago, (3) accesibilidad. Si persiste, gana el que esté en la ruta de terreno de la semana.

**Dos listas, no una (v5.0).** El eje de velocidad de decisión castiga estructuralmente a la cuenta corporativa: un campeón interno que debe llevar el caso a una jefatura puntúa 1 donde un dueño de PYME puntúa 3. Como la velocidad sí importa para la caja, el eje no se elimina — **se separan las listas**:

| | Lista PYME | Lista corporativa |
|---|---|---|
| Perfil | Dueño o gerente decide | Campeón interno + jefatura + compras/legal |
| Ciclo | Semanas | Meses, con hitos formales (NDA, aprobación) |
| Ticket | Gestión mensual o proyecto acotado | Programa con compuertas de decisión |
| Se compara contra | Otras PYMEs | Otras cuentas corporativas |
| Ritmo de trabajo | Volumen de visitas | Pocas cuentas, mucha preparación por cuenta |

Comparar ambas en un solo número hace que la cuenta de mayor valor pierda siempre. Ver pendiente 23.

**El score ya no es de pauta, es del eslabón dominante.** Un prospecto sin pauta activa pero con E5 crítico —capta por licitación, cotiza a mano, pierde plazos— puntúa alto. Bajo la fórmula anterior habría puntuado 2 y quedado fuera. Es el cambio que operacionaliza §5.0.3.

**Advertencia:** el score mide qué tan buen prospecto es, no qué tan fácil es atenderlo. Un E5 crítico con score 9 puede exigir una implementación que hoy Precisión no tiene capacidad de entregar. Esa verificación es humana y va antes de agendar.

### 5.7 Modo en vivo — el diagnóstico durante la reunión

**Cambio de modelo de uso (v3.1).** Calibrar deja de ser un pipeline asíncrono que produce un PDF antes de la visita y pasa a ser un **copiloto de la reunión**: Pablo conduce la conversación —videollamada o terreno— y la herramienta diagnostica en tiempo real a medida que el prospecto responde. El objetivo no es entregar un informe: es **calificar mejor al prospecto mientras se habla con él**.

#### 5.7.1 Por qué esto desbloquea el proyecto

La razón #1 de la pausa (§ "Por qué se detuvo ahí") era el costo de tiempo humano de revisar cada diagnóstico antes de usarlo. **En modo en vivo ese paso desaparece como etapa separada: el revisor es Pablo, leyendo en pantalla, en el momento.** No hay un informe que aprobar después; hay una afirmación que se dice o no se dice.

Eso elimina el cuello de botella que motivó la pausa, y con él el problema abierto 1 de §12.4.

**Pero traslada el riesgo, no lo elimina.** Antes, una alucinación se detectaba en la revisión previa. Ahora, si pasa el filtro visual de Pablo, se dice en voz alta frente al prospecto y no hay vuelta atrás. Las reglas inviolables de §7.1 dejan de ser una preferencia de calidad y pasan a ser lo único que separa a la herramienta de un error frente al cliente. Mitigaciones obligatorias en 5.7.5.

#### 5.7.2 De dónde sale cada respuesta

Las 28 preguntas no se preguntan en vivo. Se reparten en dos fuentes:

| Origen | Preguntas | Cuándo |
|---|---|---|
| **Pre-llenado por diagnóstico externo (§5.6)** | P2 rubro · P3 antigüedad · P7 plataformas · P11 destino · P12 landing · P15 copy · P16 Pixel · P20 UTMs · P21 analítica | Antes de la reunión, sin cooperación del prospecto |
| **Solo obtenible en conversación** | P1 · P4 · P5 ticket · P6 quién cierra · P8 · P9 presupuesto · P10 objetivo · P13–P14 geografía · P17–P19 · P22–P24 ICP · P25 síntoma · P26–P27 CPL · P28 intentos | Durante la reunión |

El pre-llenado es lo que hace viable el modo en vivo: se entra a la reunión con un tercio del formulario ya respondido y con hipótesis marcadas `[Seguro]` / `[Probable]` / `[Requiere validación]`. La conversación **confirma o corrige** el pre-llenado en vez de partir de cero.

#### 5.7.3 Orden de interrogación — preguntar por capa, para descalificar temprano

En modo en vivo el orden de las capas (§5.3) deja de ser solo un criterio de presentación y pasa a ser el **orden en que se pregunta**:

1. **Capa 1 primero** — ticket (P5), presupuesto (P9), plataformas (P7). Si aquí aparece un descalificador de alcance de cuenta —ticket que no soporta el CPA con el presupuesto declarado— **la reunión cambia de propósito ahí mismo**: no se propone gestión mensual, se propone otra cosa o se cierra cordialmente. No hace falta preguntar las 20 restantes.
2. **Capa 2** — Pixel, CAPI, eventos, UTMs (P16–P20). Confirma o corrige el pre-llenado.
3. **Capa 3** — objetivo y destino (P10, P11).
4. **Capa 4** — ICP y geografía (P13, P22–P24).
5. **Capa 5** — quién cierra y síntoma (P6, P25, P28).

**Ése es el valor de calificación:** el orden minimiza el tiempo hasta el "no". Una reunión que termina en 10 minutos con un "esto no te conviene y te explico por qué" vale más que una hora que termina en una propuesta que va a fracasar (§3.2, Uso 3).

El motor debe proponer la **siguiente mejor pregunta**: la que más reduce la incertidumbre del diagnóstico actual, respetando el orden de capas.

#### 5.7.4 Diagnóstico incremental

El motor emite diagnóstico **en cualquier momento, con lo que tenga**. No espera a las 28 respuestas.

Campos adicionales del output en modo vivo:

```json
"estado_vivo": {
  "preguntas_respondidas": ["P5", "P9", "P7"],
  "completitud_por_capa": {"1": "completa", "2": "parcial", "3": "sin datos", "4": "sin datos", "5": "sin datos"},
  "siguiente_pregunta": {"id": "P16", "por_que": "Determina si la Capa 2 está comprometida; hoy es la mayor fuente de incertidumbre."},
  "veredicto_provisional": "califica | no califica | insuficiente",
  "confianza": "alta | media | baja",
  "seguro_de_decir": ["lista de hallazgos con evidencia suficiente para afirmar en voz alta"],
  "no_decir_aun": ["hallazgos que dependen de datos N/D o de una contradicción sin resolver"]
}
```

`seguro_de_decir` / `no_decir_aun` es la sustitución directa del gate de revisión humana: el motor separa por sí mismo lo afirmable de lo que todavía no lo es, y Pablo lee esa división de un vistazo.

#### 5.7.5 Guardrails específicos del modo en vivo

Se suman a §7.1, no la reemplazan.

1. **Evidencia visible siempre.** Cada afirmación en pantalla muestra su `Pxx` al lado. Pablo debe poder verificar de un vistazo antes de decirlo. Una afirmación sin evidencia visible no se muestra.
2. **Las contradicciones se convierten en la siguiente pregunta.** El motor sigue sin resolverlas (§7.1 regla 3), pero en vivo no las deriva a auditoría: las devuelve como pregunta a formular en el momento. Es la ventaja estructural del modo en vivo sobre el asíncrono — una contradicción entre lo declarado y lo observado se aclara preguntando, no auditando después.
3. **Nada con confianza baja se muestra como afirmación.** Va en `no_decir_aun`, redactado como pregunta o como hipótesis a validar.
4. **Sin cifras del negocio del prospecto que él no haya dicho.** En vivo la tentación de "tu CPL debe estar en torno a X" es máxima y es exactamente lo que §7.1 regla 1 prohíbe. Los benchmarks se citan siempre como rango `[referencial]` de industria, nunca como estimación de su cuenta.
5. **Descalificar es un resultado exitoso.** Si la Capa 1 falla, el output correcto es "no califica" con la explicación. El motor no debe buscar un ángulo para que califique.

#### 5.7.6 Qué ve el prospecto

Dos vistas, y **no son la misma**:

| Vista | Quién la ve | Contiene |
|---|---|---|
| **Panel del operador** | Solo Pablo | Diagnóstico completo, evidencia `Pxx`, contradicciones detectadas, `no_decir_aun`, veredicto de calificación, siguiente pregunta |
| **Vista compartida** (opcional) | El prospecto, si se comparte pantalla | Los hallazgos ya confirmados, en lenguaje de negocio, sin el veredicto de calificación ni las contradicciones |

Mostrar "contradicción detectada en tus respuestas" a la cara del prospecto lo pone a la defensiva. El veredicto de calificación es una decisión comercial interna y nunca se comparte.

**Esto revisa el límite de §3.3 "no se entrega al prospecto":** en modo en vivo el prospecto sí puede ver hallazgos en pantalla durante la conversación. Lo que se mantiene es que **no se le entrega un documento** ni se le cobra. La vista compartida es parte de la conversación, no un entregable.

#### 5.7.7 Requisitos no funcionales nuevos

El modo asíncrono no tenía restricción de tiempo. El modo en vivo sí, y es la restricción dominante:

| Requisito | Umbral | Por qué |
|---|---|---|
| Latencia por turno | **< 10 segundos** | Sobre ese umbral la conversación se corta y la herramienta estorba |
| Diagnóstico con datos parciales | Desde 3 respuestas | Si exige las 28, no sirve en vivo |
| Operación con una mano | Sin teclear párrafos | Pablo está conversando, no transcribiendo: entrada por selección, no por redacción |
| Degradación sin conexión | El pre-llenado de §5.6 debe estar disponible offline | En terreno la conexión falla |
| **Entrega en el momento** | **Antes de terminar la reunión** | Ver §5.7.8 |

#### 5.7.8 Entrega in situ — se va con el documento en la mano

**Requisito de la v4.0.** El diagnóstico se entrega **durante la reunión**. No existe el "te lo mando en la semana": ese envío es donde se pierde el impulso, y para Carolina es exactamente el patrón de las dos agencias que la decepcionaron — la reunión buena seguida del documento que llega tarde y dice poco.

Dos formatos, ambos obligatorios:

| Formato | Cuándo | Para qué sirve |
|---|---|---|
| **PDF al correo o WhatsApp** | Antes de cerrar la reunión, delante de él | Es el documento de respaldo que Carolina declara necesitar para "exigir cuentas". Funciona sin conexión posterior y se reenvía a un socio |
| **Link vivo** | En el mismo envío | Puede volver a mirarlo, compartirlo con su socio o su contador, y **se actualiza si la reunión continúa**. Es el activo que sigue trabajando después |

**Por qué los dos y no uno:** el PDF resuelve la posesión —queda en su correo aunque nunca abra el link— y el link resuelve la vigencia. Si solo hubiera link, en terreno sin señal no carga; si solo hubiera PDF, cualquier corrección posterior obliga a reenviar y el prospecto se queda con la versión vieja.

**Consecuencias de diseño:**

- El render del dashboard debe existir **antes** de que la reunión termine. No hay paso de armado posterior, ni edición manual, ni revisión de un tercero.
- El PDF se genera del mismo HTML del link — una sola plantilla, no dos.
- El link no puede exponer el panel del operador (§5.7.6): lleva la **vista compartida**, sin veredicto de calificación ni contradicciones detectadas.
- Ley 21.719: el link es una URL con datos de un tercero. No indexable, no adivinable, y con criterio de expiración definido. Ver pendiente 17.

La latencia es la que puede obligar a cambios de arquitectura: los 8 pasos de razonamiento de §5.5 sobre 6.000 tokens de salida no caben en 10 segundos. Ver §10 pendiente 9.

### 5.7.9 Los dos modelos de terreno

**El canal es terreno en las dos listas. Lo que cambia es el objetivo de la visita.** Confundirlos es lo que hace que el puerta a puerta parezca no funcionar en empresas grandes.

| | **Lista A — PYME** | **Lista B — Corporativo** |
|---|---|---|
| Objetivo de la visita | **Conseguir la reunión, o hacerla ahí mismo** | **Conseguir la vía de entrada** — nombre, cargo, correo, teléfono directo |
| Con quién se habla | Dueño, gerente, encargado | Recepción, secretaría, quien esté disponible |
| Duración | 20–45 min si entra | 5–10 min |
| Entregable de la visita | Diagnóstico de etapa 0 en el momento | Una tarjeta, un nombre y un área |
| Qué se lleva Precisión | Un diagnóstico entregado | Un contacto calificado que no estaba en la base |
| Siguiente paso | Etapa 1 | Aproximación dirigida con gancho sectorial |
| Quién va | Pablo · Jesu | Pablo, con preparación previa de la cuenta |

**En una empresa grande la visita en terreno no consigue la reunión: consigue el dato.** Y ese dato —el nombre del jefe de prevención, del gerente de operaciones, del encargado de compras— es exactamente lo que la base de prospección tiene hoy como "Por verificar" en casi todas las filas. Una jornada de puerta a puerta en un parque industrial no produce reuniones inmediatas; produce **una lista de contactos nominados que ninguna herramienta de prospección entrega**.

Esa es la ventaja estructural del modelo: un competidor remoto puede comprar una base con razón social y teléfono de central. No puede conseguir que alguien pase por recepción y salga con el nombre del encargado de prevención.

### 5.7.10 El presupuesto de 30 minutos

**Nuevo en la v5.5.** §5.7.9 fija la duración de la visita de Lista A en «20–45 min si entra», y el guion de terreno promete literalmente *"toma media hora"*. Hasta esta versión ese número no estaba repartido entre los bloques, y por lo tanto no se podía comprobar si lo prometido cabía.

**Corregido el 6-ago-2026 — el reparto estaba incompleto.** La versión original sumaba 29 minutos contando desde el triage, y dejaba fuera los **tres minutos de las preguntas 0** que la Guía de Venta en Terreno v2.2 §4.1 declara obligatorios *antes* de cualquier otra cosa («van en los primeros tres minutos, siempre»). O sea: el presupuesto medía el instrumento, no la reunión. Con las preguntas 0 adentro son **32 minutos**, y ese es el número contra el que hay que comprobar la promesa. Lo destapó el cronómetro del panel del operador, que necesitaba un presupuesto completo para poder marcar atraso.

| Tramo | Minutos | Qué es |
|---|---|---|
| Preguntas 0 | **3** | `0.1`–`0.3` (Guía §4.1). Quién decide, cómo se decide y qué haría avanzar esto |
| Triage | **9** | Las 14, cerradas, entrada por selección |
| Núcleo de negocio | **5** | `N1–N7` (§5.1.2) |
| Bloque del área dominante | **~8** | Con la regla de corte: se pregunta hasta converger, alrededor de diez preguntas |
| Competencia | **4** | `M1–M5`. La mitad observable no ocupa tiempo de reunión |
| Cierre y entrega | **3** | `C1`–`C3` (Guía §4.4), el eslabón nombrado en voz alta y el próximo paso con fecha |
| **Total** | **32** | |

**Los 32 no rompen el guion, y no hay que recortarlos.** «Toma media hora» es la petición que abre la puerta, y 32 minutos es media hora en cualquier lectura razonable. Lo que sí había que arreglar es que el documento sumara lo que la reunión realmente hace: un presupuesto que deja fuera el tramo obligatorio de apertura no sirve para comprobar nada.

**Regla de corte cuando se va largo (nueva, 6-ago-2026).** Si a los 30 minutos todavía no se llegó al cierre, **se corta el bloque del área dominante** y se pasa directo a `C1`–`C3`. Nunca se sacrifica el cierre: es donde vive el próximo paso con fecha, que es lo único que convierte la visita en algo. Una reunión que se pasó de hora sin `C3` es una reunión perdida por completo, y una con el bloque del área a medias sigue siendo un diagnóstico entregable.

**Cierra en seis de los siete eslabones.** E1 es el más largo de los bloques profundos —17 preguntas— y aun así converge dentro del presupuesto, porque es una secuencia de conversación y no una lista que haya que agotar.

**El único que no cierra es E3.** Las 28 preguntas de pauta a razón de unos 48 segundos cada una son 22 minutos, y el total salta a **43**. Es coherente con lo que ya decía A2.9 —«máximo real en una reunión: 14 + 28 = 42»— solo que ahí se declaraba como un techo aceptable y aquí queda claro que **rompe la promesa del guion de terreno**.

**Solución: un núcleo de 10 dentro de las 28** (marcado en el Anexo A). Cubre las capas 1, 2, 3 y 5 del diagnóstico en capas; la capa 4 —cliente ideal— ya la cubre el núcleo de negocio, que es la sinergia que hace viable el recorte:

`P5` ticket · `P9` presupuesto · `P7` plataformas · `P16` Pixel · `P18` CAPI · `P19` eventos · `P10` objetivo · `P11` destino · `P25` síntoma · `P28` intentos previos.

Con el núcleo, E3 cierra en **32 minutos** como los demás. **Las 28 no se eliminan:** el bloque completo sigue disponible para la vía asíncrona, para una segunda reunión o cuando el prospecto tenga tiempo. Lo que cambia es qué se pregunta cuando hay media hora.

**Regla:** si el prospecto concede más tiempo, se extiende el bloque del área — nunca se recorta el núcleo de negocio ni el de competencia para ganar minutos. Esos dos son los que hacen que el diagnóstico sea del negocio y no del canal.

#### El gancho, por lista

**Lista A — PYME.** El diagnóstico gratuito es el gancho, y funciona porque el prospecto ve a una persona en vez de un anuncio:

> *"Buenos días. Somos una consultora de acá de la zona. No vengo a venderle nada hoy: hacemos un diagnóstico gratuito de cómo está funcionando su parte comercial —de dónde le llegan los clientes, qué pasa cuando llegan, dónde se le pierden— y se lo entregamos en la misma reunión, no después. Toma media hora. ¿Le sirve que volvamos el jueves, o tiene un rato ahora?"*

Tres cosas hacen que funcione: **declara que no viene a vender hoy**, **el entregable es inmediato** —no "le mando el diagnóstico"—, y **ofrece dos opciones de tiempo** en vez de preguntar si le interesa.

**Lista B — Corporativo.** El objetivo es distinto y el guion también:

> *"Buenos días. Trabajamos con empresas del rubro en temas de eficiencia comercial y de procesos. No vengo a reunión hoy — ¿me podría decir quién ve el área comercial / de operaciones / de prevención, para hacerle llegar algo puntual?"*

Pedir un dato es una petición mucho más pequeña que pedir una reunión, y por eso se concede. El seguimiento es dirigido y usa el gancho sectorial —una norma reciente, un ciclo de inversión— que informa en vez de vender.

#### Por qué Calibrar hace viable el modelo

Sin diagnóstico en el momento, el puerta a puerta ofrece una promesa y compite con todos los que ofrecen promesas. Con diagnóstico en el momento, ofrece **un entregable**. La diferencia operativa es que Calibrar convierte la conversación de venta en una sesión de trabajo, y una sesión de trabajo no se rechaza igual que una oferta.

**Prerrequisito bloqueante:** el catálogo de servicios con alcance definido. Ir puerta a puerta a ofrecer las siete áreas exige poder responder qué incluye cada una y en cuánto tiempo. Hoy Desarrollo y Automatización tiene cuatro ítems con precio y sin alcance. Ver pendiente 19 — en el modelo de terreno deja de ser deuda técnica y pasa a ser un bloqueo de venta.

### 5.8 El entregable — dashboard de 3 bloques

**Cambio de formato de salida (v3.2).** El informe de 6 secciones deja de ser el entregable y pasa a ser la **capa de análisis interna** que lo sustenta. Lo que se muestra son tres bloques:

```
BLOQUE 0 · RUTEO         Dónde se rompe tu crecimiento y qué disciplina lo arregla
BLOQUE 1 · DATA          Qué es verdad sobre tu negocio, leído
BLOQUE 2 · 3 HIPÓTESIS   Qué explicaría lo que te está pasando
BLOQUE 3 · 3 SOLUCIONES  Qué hacer, y cómo sabrás si la hipótesis era correcta
```

**El bloque 0 es nuevo en la v4.0 y es lo primero que se ve.** Sin él, los tres bloques siguientes contestan una pregunta que el prospecto no hizo: le explican su pauta cuando su problema puede estar en otra parte. El ruteo va antes que el diagnóstico.

No se pierde nada del trabajo anterior: las 6 secciones y los 8 pasos de razonamiento de §5.5 siguen ejecutándose y alimentan el bloque 1. Cambia qué se muestra y en qué orden.

#### 5.8.1 Por qué hipótesis y no problemas

Es el cambio conceptual de esta versión, y resuelve tres cosas a la vez.

1. **Honestidad epistemológica.** Sin acceso a la cuenta publicitaria (§9 excluye la auditoría en vivo dentro de la cuenta), lo que se produce es una explicación probable, no un hecho verificado. Llamarlo "problema" afirma más de lo que se sabe — precisamente lo que §7.1 regla 1 prohíbe.
2. **Es lo único que la vía sin cliente puede producir honestamente** (§5.9). Una hipótesis derivada de señal externa y una derivada de respuestas declaradas tienen la misma forma; solo cambian la evidencia y la confianza. Un único esquema sirve para las dos vías.
3. **Desarma la desconfianza del buyer persona.** Una hipótesis es falsable y se puede verificar juntos; un veredicto hay que creerlo. Para Carolina —decepcionada dos veces— *"esto es lo que creo que pasa y así lo comprobamos"* es estructuralmente más creíble que *"esto es lo que pasa"*.

**Regla dura:** una hipótesis sin método de verificación no es una hipótesis, es una opinión. El campo `como_se_verifica` es obligatorio y no admite `N/D`.

#### 5.8.2 Esquema de salida

```json
{
  "meta": { "...": "sin cambios (Anexo E)",
    "via": "con_cliente | sin_cliente",
    "confianza_global": "alta | media | baja" },

  "bloque_0_ruteo": {
    "reasoning": "Qué eslabón se evaluó roto y por qué es el dominante según la regla de precedencia.",
    "cadena": [
      {"eslabon": 1, "nombre": "Criterio y foco comercial", "estado": "sano|roto|sin_datos", "area": "Estrategia y diagnóstico"},
      {"eslabon": 2, "nombre": "Reputación y posicionamiento", "estado": "sano|roto|sin_datos", "area": "Contenido y RRPP"},
      {"eslabon": 3, "nombre": "Generación de demanda", "estado": "...", "area": "Paid Media y SEO"},
      {"eslabon": 4, "nombre": "Activo de conversión", "estado": "...", "area": "Desarrollo web"},
      {"eslabon": 5, "nombre": "Captura y respuesta", "estado": "...", "area": "Automatización y agentes"},
      {"eslabon": 6, "nombre": "Escala de la conversación", "estado": "...", "area": "RPA y procesos"},
      {"eslabon": 7, "nombre": "Capacidad del equipo", "estado": "...", "area": "Capacitación y adopción"}
    ],
    "eslabon_dominante": 5,
    "area_recomendada": "Automatización y agentes",
    "area_secundaria": "Capacitación y adopción | null",
    "por_que_este_y_no_otro": "OBLIGATORIO — por qué este eslabón antecede a los demás, en lenguaje del dueño.",
    "que_NO_es_tu_problema": "OBLIGATORIO — qué eslabón el dueño creía roto y no lo está. Puede ser null si no aplica."
  },

  "bloque_1_data": {
    "reasoning": "Qué se pudo establecer y con qué procedencia.",
    "semaforo_capas": [
      {"capa": 1, "nombre": "Viabilidad económica",
       "estado": "verde | ámbar | rojo | sin_datos",
       "lectura": "Qué significa esto para tu negocio, en una frase.",
       "procedencia": "declarado | observado | inferido"}
    ],
    "cifras_clave": [
      {"etiqueta": "string", "valor": "string | N/D",
       "lectura": "OBLIGATORIA — qué significa esta cifra. Nunca vacía.",
       "referencia": "benchmark de industria marcado [referencial], o N/D",
       "evidencia": "Pxx | señal externa"}
    ]
  },

  "bloque_2_hipotesis": {
    "reasoning": "Por qué estas tres y no otras; cómo se ordenaron.",
    "hipotesis": [
      {"orden": 1,
       "enunciado": "Frase repetible por un no-técnico. Formulada como hipótesis, no como sentencia.",
       "evidencia": "Pxx, cruce de Matriz, o señal externa observada",
       "como_se_verifica": "OBLIGATORIO — qué mirar exactamente para confirmarla o descartarla.",
       "si_es_cierta": "Qué implica en CAC / CPL / viabilidad.",
       "por_que_no_era_visible": "OBLIGATORIO — por qué no se veía desde el Administrador de Anuncios.",
       "atribucion": "gestion | estructura | compartida",
       "alcance": "cuenta | canal",
       "capa": 1,
       "confianza": "alta | media | baja",
       "procedencia": "declarado | observado | inferido"}
    ],
    "reparto_atribucion": {"gestion": 0, "estructura": 0, "compartida": 0}
  },

  "bloque_3_soluciones": {
    "reasoning": "Orden de ejecución y por qué difiere del orden de severidad si difiere.",
    "soluciones": [
      {"orden": 1,
       "verifica_hipotesis": 1,
       "accion": "Qué hacer esta semana, concreto.",
       "prediccion": "OBLIGATORIO — qué debería cambiar si la hipótesis era correcta. Es lo que la vuelve falsable.",
       "puede_hacerlo_solo": true,
       "como_hacerlo_solo": "OBLIGATORIO si puede_hacerlo_solo=true. Camino ejecutable sin contratar a nadie.",
       "esfuerzo": "minutos | horas | días",
       "requiere_decision_de": "dueño | quien opera la cuenta | ambos"}
    ],
    "cierre": "Invitación a revisar la cuenta en vivo. Sin vender servicios."
  }
}
```

#### 5.8.3 Los campos que existen solo por el buyer persona

Cuatro campos del esquema no salen del análisis técnico. Salen del estudio de buyer persona (§2.5) y son obligatorios:

| Campo | Creencia o job que desactiva |
|---|---|
| `cifras_clave[].lectura` | "Reportes con muchas gráficas y poco análisis" — dolor documentado de Carolina |
| `por_que_no_era_visible` | "Si fuera tan sencillo, ya lo habría encontrado yo" |
| `como_hacerlo_solo` | "Si pago, igual me van a vender algo" |
| `atribucion` + `reparto_atribucion` | "¿Fue la agencia o fui yo?" — job funcional #1 de Carolina |

Omitir cualquiera de los cuatro produce un output técnicamente correcto que **no le sirve a la persona a la que está dirigido**. Son criterio de aceptación, no adorno.

#### 5.8.5 Bloque 4 — Plan por etapas (nuevo en la v5.0)

**El bloque que convierte el dashboard en un diagnóstico de etapa 0 entregable en la reunión.** Sin él, Calibrar produce un buen análisis que termina en el aire: el prospecto entiende su problema y no sabe qué sigue.

```
BLOQUE 0 · RUTEO         Dónde se rompe tu crecimiento
BLOQUE 1 · DATA          Qué es verdad sobre tu negocio, leído
BLOQUE 2 · 3 HIPÓTESIS   Qué lo explicaría
BLOQUE 3 · 3 SOLUCIONES  Qué hacer y cómo sabrás si acertamos
BLOQUE 4 · PLAN POR ETAPAS   En qué orden, quién lo hace, y qué es nuestro   ← nuevo
```

```json
"bloque_4_etapas": {
  "reasoning": "Por qué este orden y no otro; qué habilita cada etapa a la siguiente.",
  "etapas": [
    {"orden": 1,
     "nombre": "string — corto, en lenguaje del dueño",
     "por_que_primero": "OBLIGATORIO — qué de lo siguiente queda bloqueado si esto no se hace",
     "quien_lo_hace": "el cliente | Precisión | un tercero | mixto",
     "pilar_precision": "Estrategia y diagnóstico | Contenido y RRPP | Paid Media y SEO | Desarrollo web | Automatización y agentes | RPA y procesos | Capacitación y adopción | ninguno",
     "esfuerzo": "una sesión | días | semanas",
     "como_se_sabe_que_resultó": "OBLIGATORIO — señal observable, no una sensación"}
  ],
  "fuera_de_nuestro_alcance": "OBLIGATORIO cuando aplique — qué parte del problema Precisión no resuelve y a quién corresponde. null si todo cae dentro",
  "cierre": "Invitación a la etapa 1. Sin comprometer resultados de las etapas siguientes."
}
```

**Entre 2 y 4 etapas.** Más de cuatro deja de ser un plan y pasa a ser un catálogo.

#### 5.8.6 Reglas de redacción del veredicto — la conversación de Bunzl

Estas reglas existen porque el diagnóstico E1 concluye con frecuencia que el prospecto **no necesita más marketing**. Cómo se dice eso determina si la reunión termina en una relación o en una puerta cerrada.

**Regla madre: el diagnóstico nunca termina en un "no". Termina en un orden.**

Está prohibido cerrar con *"no necesitas marketing"* a secas. La formulación correcta tiene siempre tres partes:

1. **Lo que hay que arreglar primero es lo que ya tienes** — no algo nuevo que comprar. Sea que lo opere gente interna o un proveedor externo.
2. **El orden**, con la razón de por qué ese orden y no otro.
3. **Qué de eso resuelve Precisión y qué no**, dicho sin rodeos.

| ❌ Nunca | ✅ Siempre |
|---|---|
| "No necesitas marketing" | "Lo que necesitas no es más marketing: es arreglar el que ya tienes" |
| "Tu problema es que no sabes a quién le vendes" | "Antes de invertir un peso más en conseguir contactos, hay que definir cuáles vale la pena. Es una sesión de trabajo, no un desarrollo" |
| "Eso no lo hacemos nosotros" | "Esa parte no es nuestra y te digo quién debería verla. Lo que sí resolvemos nosotros es esto, y va en la etapa dos" |
| "Te recomiendo el plan de gestión mensual" | "La etapa uno no la vendemos: la haces tú o la hacemos juntos en una sesión. La gestión mensual, si tiene sentido, viene después de verificar la etapa uno" |

**Los cuatro destinos posibles de un diagnóstico, y cómo se dice cada uno:**

| Destino | Formulación |
|---|---|
| **Arreglar lo que tiene** (interno o externo) | "Tu inversión está bien; está mal apuntada. Con el mismo presupuesto y estas tres correcciones deberías ver X" |
| **Automatizar una capa del negocio** | "Tu problema no está en vender más, está en lo que pasa después de que alguien dice que sí" |
| **Necesidad directa de IA** | "Tienes el volumen y el proceso; lo que no tienes es cómo atenderlo sin contratar más gente" |
| **Fuera de nuestro alcance** | "Esta parte no la resolvemos nosotros. Te digo qué buscarías y en qué orden — y cuando eso esté, lo nuestro tiene sentido" |

**Cuatro reglas duras de redacción:**

- **Nunca se recomienda una etapa 1 que Precisión venda.** La primera etapa es siempre lo más barato y lo más verificable, aunque no facture. Es lo que hace creíble todo lo que viene después.
- **Se declara siempre lo que está fuera de alcance.** Callarlo para no perder terreno es exactamente lo que hace la agencia que el prospecto ya despidió.
- **Nunca se compromete el resultado de una etapa que aún no empieza.** Se compromete el resultado de la etapa 1 y el criterio con que se decide seguir.
- **Se nombra el pilar de Precisión que corresponde**, o se dice que ninguno. No hay etapas huérfanas ni ambigüedad sobre quién hace qué.

**Por qué esto vende más, no menos.** El prospecto que escucha "la etapa uno la puedes hacer tú solo" recibe algo que ningún proveedor le ha dado: una recomendación que no beneficia a quien la da. Es la única forma conocida de desactivar la creencia *"si pago, igual me van a vender algo"* — no refutándola, sino comportándose de forma incompatible con ella.

#### 5.8.4 Invariantes del dashboard

- **DB-1 · Ninguna cifra sin lectura.** `cifras_clave[].lectura` nunca vacío ni `N/D`. Si una cifra no se puede leer, no se muestra.
- **DB-2 · Biyección hipótesis ↔ soluciones.** `{soluciones[].verifica_hipotesis}` == `{1,2,3}`. Exactamente tres y tres.
- **DB-3 · Toda hipótesis es falsable.** `como_se_verifica` obligatorio, sin `N/D`.
- **DB-4 · Toda solución es predictiva.** `prediccion` obligatorio.
- **DB-5 · Ninguna solución depende de contratar.** No puede haber tres soluciones con `puede_hacerlo_solo: false`.
- **DB-6 · Confianza acotada por la evidencia.** Nada `inferido` puede tener `confianza: alta`.
- **DB-7 · Reparto de atribución consistente.** `reparto_atribucion` suma 3 y coincide con el conteo de `hipotesis[].atribucion`.
- **DB-8 · Capa y alcance obligatorios** en cada hipótesis, para que la regla de §5.3 sea verificable.
- **DB-9 · Toda afirmación del dashboard debe estar sostenida** por alguna de las 6 secciones de análisis.
- **DB-10 · Un solo eslabón dominante.** `eslabon_dominante` es un entero de 1 a 7, nunca una lista. Si el motor no puede elegir, es que faltan respuestas de triage: se declara y se pregunta.
- **DB-11 · Coherencia ruteo ↔ hipótesis.** Las 3 hipótesis pertenecen al eslabón dominante o lo sustentan. No se diagnostica pauta cuando el eslabón dominante es E5.
- **DB-12 · E7 nunca solo.** `area_recomendada` = "Capacitación y adopción" solo si todos los demás eslabones están sanos. En cualquier otro caso Capacitación y adopción va en `area_secundaria`.
- **DB-13 · `que_NO_es_tu_problema` obligatorio cuando el dueño llegó pidiendo otra cosa.** Decirle explícitamente qué está bien es lo que hace creíble el resto.
- **DB-14 · Entre 2 y 4 etapas** en el bloque 4, cada una con `por_que_primero`, `quien_lo_hace`, `pilar_precision` y `como_se_sabe_que_resultó`. Sin etapas huérfanas.
- **DB-15 · La etapa 1 nunca es un servicio facturable de Precisión.** `quien_lo_hace` de la etapa 1 es "el cliente" o "mixto", nunca "Precisión" en solitario.
- **DB-16 · `fuera_de_nuestro_alcance` se declara siempre que aplique.** Solo puede ser `null` cuando todo el plan cae dentro de los pilares.
- **DB-17 · Ningún veredicto cierra con una negación seca.** Prohibido emitir "no necesitas marketing" sin las tres partes de §5.8.6.

### 5.9 Las dos vías de producción

El mismo dashboard se produce por dos caminos. **El esquema es idéntico; cambia la procedencia de la evidencia y el techo de confianza.**

| | **Vía A — con cliente** | **Vía B — sin cliente** |
|---|---|---|
| Insumo | P1–P28 declaradas (formulario o conversación en vivo) | Solo señal externa: §5.6 + Grupo G de la Matriz |
| Quién participa | El prospecto responde | Nadie del lado del prospecto |
| Uso | Diagnóstico en reunión (§5.7) · dashboard mostrable | **Calificar la base de prospección** (§3.2 Uso 1) |
| Procedencia | `declarado` + `inferido` | `observado` + `inferido` |
| Techo de confianza | `alta` en lo declarado | **`media`** — nunca `alta`, salvo señal de código verificada |
| Capas cubiertas | 1 a 5 | 2 y 3 completas · 1 parcial (ticket estimado) · 4 y 5 casi nulas |

#### 5.9.1 Por qué la vía B es el núcleo y no un modo degradado

La vía B permite diagnosticar **los 370+ prospectos de la base sin que ninguno conteste nada**. Es literalmente el Uso 1 y el problema abierto 2 de §12.4.

Y produce el mismo artefacto: dashboard con data, 3 hipótesis y 3 soluciones. Sus hipótesis son de menor confianza — **y eso no es un defecto, es exactamente lo que alimenta la reunión**: las hipótesis de la vía B son las preguntas de la vía A.

```
Vía B (antes de la reunión)   →  3 hipótesis de confianza media
                                        ↓
Reunión en vivo (§5.7)        →  cada hipótesis se confirma o se descarta preguntando
                                        ↓
Vía A (durante la reunión)    →  las mismas 3 hipótesis, ahora de confianza alta
```

Ése es el circuito completo del producto: **se entra a la reunión con hipótesis y se sale con diagnóstico.** El prospecto no percibe un formulario; percibe que alguien llegó habiendo estudiado su cuenta — que es justamente lo que ninguna agencia hizo con Carolina.

#### 5.9.2 Techo de confianza de la vía B — regla dura

Lo observable desde afuera tiene límites estrictos y el motor debe respetarlos:

| Se puede afirmar | No se puede afirmar nunca |
|---|---|
| Que **no hay Pixel detectable** en el código de la landing | Que no tiene Pixel — puede estar en otra página o cargarse vía GTM |
| Que **hay anuncios activos** en la Biblioteca de Anuncios | Cuál es el objetivo de campaña configurado |
| Que el anuncio **apunta al home y no a una landing dedicada** | Cuánto invierte al mes |
| Que la landing **no tiene formulario visible** | Cuál es su CPL o su ticket real |
| Que el precio **publicado** es X | Cuál es su margen o su tasa de cierre |

**Regla:** toda hipótesis de vía B que dependa de un dato de la columna derecha se marca `confianza: baja`, y su `como_se_verifica` es literalmente **la pregunta que hay que hacer en la reunión**. Ahí conecta con `siguiente_pregunta` de §5.7.4.

---

## 6. Métrica de éxito (verificable)

### 6.1 Métricas de operación — a medir desde la primera corrida
| Métrica | Umbral | Estado |
|---|---|---|
| Prospectos segmentados con diagnóstico | Cobertura de la base activa de prospección | Sin línea base aún |
| Calidad del diagnóstico | Se llega a terreno **sin rehacer el diagnóstico a mano** | Sin línea base aún |
| Conversión: prospecto segmentado → reunión en terreno | A definir con la primera cohorte | N/D |
| Conversión: reunión → contrato de gestión mensual | A definir con la primera cohorte | N/D |

**Métricas propias del modo en vivo (§5.7):**

| Métrica | Umbral | Por qué importa |
|---|---|---|
| Latencia por turno | < 10 s | Sobre eso la herramienta estorba la conversación |
| Tiempo hasta descalificar | Menor que sin la herramienta | Es el valor de calificación: llegar antes al "no" |
| Reuniones que terminan en descalificación explícita | Sin umbral — se mide, no se optimiza | Un número que sube no es malo: significa que se está filtrando |
| Afirmaciones dichas en voz alta que resultaron erradas | **0** | Métrica de daño. Una sola justifica revisar los guardrails de §5.7.5 |
| Preguntas necesarias hasta veredicto | Baseline a construir | Si tiende a 28, el orden por capas no está funcionando |

La cuarta es la que reemplaza al gate de revisión: **no se mide la calidad del informe, se mide si la herramienta hizo decir algo falso.**

**Regla de honestidad:** sin ejecución no hay línea base, y sin línea base los umbrales serían inventados. Se declaran N/D en vez de fabricarlos — la misma regla que se le impone al modelo.

### 6.2 Métrica de validación técnica (verificable hoy, sin datos reales)
Existen casos dorados con salida esperada — **Eco Star** (Anexo G, E5), **Vicsa/Bunzl** (Anexo I, E1), clínica dental y maestranza (Anexo H, E5) y cinco mínimos (Anexo J: E2, E4, E6, E7 y E3). El prompt pasa la validación si:

- [ ] Devuelve **solo JSON**, sin texto ni markdown alrededor
- [ ] Las 6 secciones están completas, cada una con su campo `reasoning`
- [ ] La sección de landing sale **N/D** — no inventó contenido que no vio
- [ ] Detectó la contradicción P16/P19 y **no eligió** cuál respuesta era la correcta
- [ ] Los hallazgos están **ordenados por capa** (medición y objetivo antes que copy)
- [ ] El tono usa lenguaje de negocio (CAC, CPL, ticket), no métricas de plataforma

**Checklist del dashboard (v3.2) — se suma a la anterior:**

- [ ] Exactamente **3 hipótesis y 3 soluciones**, en biyección
- [ ] **Ninguna cifra sin `lectura`** — el filtro anti-"gráficas sin análisis"
- [ ] Cada hipótesis trae `como_se_verifica` real, no `N/D`
- [ ] Cada hipótesis trae `por_que_no_era_visible`
- [ ] Cada solución trae `prediccion` falsable
- [ ] **No las 3 soluciones dependen de contratar a alguien**
- [ ] `reparto_atribucion` declarado, suma 3, con su lectura en lenguaje directo
- [ ] Nada `inferido` marcado con confianza `alta`
- [ ] Ninguna afirmación del dashboard sin sustento en las 6 secciones de análisis

**Checklist del bloque 4 — plan por etapas (v5.1):**

- [ ] Entre **2 y 4 etapas**, ninguna huérfana
- [ ] Cada etapa trae `por_que_primero`, `quien_lo_hace`, `pilar_precision` y `como_se_sabe_que_resultó`
- [ ] **La etapa 1 NO es un servicio facturable de Precisión** (`quien_lo_hace` ≠ "Precisión" en solitario)
- [ ] `fuera_de_nuestro_alcance` declarado, o `null` justificado porque todo cae en los pilares
- [ ] Ningún veredicto cierra con una negación seca — se aplicó la formulación de tres partes de §5.8.6
- [ ] No se compromete el resultado de ninguna etapa posterior a la 1

**Prueba de vía B** (correr el mismo caso sin ninguna respuesta P1–P28, solo señales externas):

- [ ] Produce dashboard completo con las mismas 3 secciones estructurales
- [ ] Ninguna hipótesis excede confianza `media`
- [ ] Ninguna afirmación sobre objetivo de campaña, presupuesto, CPL, ticket real o margen
- [ ] Cada `como_se_verifica` de confianza baja está redactado **como la pregunta a hacer en la reunión**

**Esta checklist es el criterio de aceptación de cualquier prototipo.**

### 6.3 Lo que NO es métrica
Informes producidos · formularios iniciados · impresiones, alcance, CTR, seguidores, likes · "el informe se ve bonito".

---

## 7. Guardrails / estilo

### 7.1 Reglas inviolables del motor de IA
1. **Nunca inventar datos.** Respuesta vacía, ausente o ambigua = **N/D** explícito. No se rellena con suposiciones.
2. **Nunca fabricar problemas sin evidencia.** Cada hallazgo debe ser rastreable a una pregunta específica (citando su número) o a un cruce concreto de la Matriz.
3. **Las contradicciones se señalan, no se resuelven.** Si el cliente dice que no tiene Pixel pero declara eventos configurados, se reporta la inconsistencia y se recomienda auditar — no se elige una versión por cuenta propia.
4. **Los benchmarks son direccionales.** Las cifras de agencias chilenas son auto-reportadas y van marcadas `[referencial]`. No se presenta un rango referencial como un hecho del negocio del cliente.
5. **La severidad es heurística, no regla absoluta.** Depende del margen, la recompra y el LTV reales, que muchas veces no se conocen. Si falta el dato, se declara y baja la confianza del hallazgo.
6. **El diagnóstico se aplica en capas, calificado por alcance.** No se recomienda mejorar el copy si la cuenta no tiene Pixel y el ticket no soporta el CPA. Pero un hallazgo de capa inferior que solo afecta a un canal no antecede a uno de capa superior que afecta a toda la cuenta (§5.3).
7. **Si no se pudo ver la landing, la sección va N/D.** No se evalúa lo que no se vio.
8. **Tono:** directo, técnico, sin relleno ni eufemismos. Si la cuenta está quemando plata, se dice. Sin condescendencia ni alarmismo.

### 7.2 Guardrails de negocio
- **Uso interno.** Calibrar no se ofrece ni se comunica como producto a la venta.
- **Lenguaje de negocio** — CAC, CPL, ticket, margen, cierre. Nunca impresiones, alcance ni CTR salvo como evidencia de un problema de negocio.
- **Severidades** — CRÍTICO / MODERADO / LEVE, siempre justificadas.
- **Datos sensibles** — el formulario recoge presupuestos, CPL y problemas internos de terceros. Ver §7.4.

### 7.4 Cumplimiento — Ley 21.719 (entra en vigencia el 1-dic-2026)

**Deja de ser un pendiente teórico.** La ley se publicó el 13-dic-2024 y **entra en vigencia el 1 de diciembre de 2026** — cuatro meses después de esta versión del PRD. La base de prospección ya está operando y ya acumula datos de terceros.

**Alivio, no exención:** durante el primer año (dic-2026 a dic-2027) las PYMEs quedan sujetas a **amonestación y no a multa**. Eso da margen para corregir, no para ignorar. El techo sancionatorio general llega a 20.000 UTM.

#### Qué de Calibrar cae bajo la ley

| Activo | Por qué aplica |
|---|---|
| Base de prospección (370+ registros) | Contiene nombre, cargo, correo y teléfono de personas naturales identificables. Que sean contactos profesionales no los saca del ámbito de la ley |
| Respuestas del formulario | Presupuestos, CPL y problemas internos declarados por un tercero |
| Señales de vía B (Grupo G) | Se recogen sin conocimiento del titular. Ser información pública no exime del registro ni de los derechos del titular |
| **Link vivo del dashboard** (§5.7.8) | Es una URL que expone datos de un tercero. Es el punto más expuesto de todo el sistema |

#### Obligaciones concretas y cómo se cumplen aquí

1. **Registro de actividades de tratamiento.** Documentar qué datos se tratan, con qué finalidad, por cuánto tiempo y con quién se comparten. Para Calibrar son tres tratamientos distintos —base de prospección, diagnóstico con cliente, diagnóstico sin cliente— y conviene declararlos por separado porque tienen bases de licitud distintas.
2. **Base de licitud.** Para prospección B2B la vía habitual es el interés legítimo, pero **hay que dejarlo documentado antes**, no justificarlo después de una consulta. La vía B es la que más lo exige: se procesan datos de alguien que nunca interactuó con Precisión.
3. **Derechos ARCO + portabilidad.** Un prospecto puede exigir saber qué tienen sobre él y pedir su eliminación. Hoy la base no tiene campo de origen del dato ni fecha de captura, así que **no se podría responder una solicitud de acceso**. Es la brecha operativa más concreta.
4. **Notificación de brechas** a la Agencia y a los titulares afectados.
5. **Delegado de protección de datos** cuando el tratamiento es significativo. A 370 registros creciendo ~50 por semana, conviene evaluarlo en vez de asumir que no aplica.

#### Reglas duras para el link vivo

Cierra el pendiente 17. El enlace del dashboard es el activo de mayor exposición: contiene el diagnóstico completo de un tercero y vive fuera de cualquier autenticación.

- **No indexable** — `noindex` y `Disallow` en robots.
- **No adivinable** — identificador aleatorio largo, nunca correlativo ni derivado del nombre del prospecto.
- **Expiración por defecto: 90 días.** Suficiente para el ciclo de decisión, acotado para el riesgo.
- **Borrado a petición**, en un plazo declarado, con constancia de la eliminación.
- **Nunca la vista de operador.** El link lleva la vista compartida: sin veredicto de calificación, sin contradicciones detectadas, sin score de priorización.
- **Sin datos en la URL.** El identificador no codifica el nombre de la empresa ni ningún dato del diagnóstico.

#### Lo que hay que hacer antes de diciembre

| # | Acción | Bloquea |
|---|---|---|
| 1 | Agregar a la base los campos **origen del dato**, **fecha de captura** y **base de licitud** | Responder una solicitud de acceso o eliminación |
| 2 | Redactar el registro de actividades de tratamiento (los tres tratamientos) | Obligación directa de la ley |
| 3 | Definir política de retención y purga de la base | Nada la limita hoy; crece indefinidamente |
| 4 | Implementar las reglas del link vivo | Despliegue del dashboard |
| 5 | Definir el canal para ejercer derechos ARCO y publicarlo | Obligación directa |
| 6 | Evaluar si corresponde designar delegado | Depende del volumen alcanzado |

**Nota de alcance:** esto es una lectura operativa para orientar el diseño del producto, no asesoría legal. Antes de diciembre corresponde una revisión con abogado — y es exactamente el tipo de tarea que a Álvaro le toca en su rol de legal.

### 7.3 Identidad visual
Color primario **#0D4F6A** (petróleo) · acento **#F5A623** (amber) · tipografía **Montserrat** (Black en títulos, Regular/Medium en cuerpo).

---

## 8. Si automatizas — disparador y pasos

**Disparador:** se carga el pre-análisis de un prospecto (28 preguntas).

| # | Módulo / herramienta | Qué hace |
|---|---|---|
| 1 | Webhook (Make) | Recibe las respuestas del formulario |
| 2 | HTTP fetch (Make) | Obtiene el HTML de la landing del prospecto |
| 3 | Constructor de prompt (Make) | Ensambla P1–P28 + el contenido de la landing |
| 4 | **Claude API** | Genera el JSON completo: 6 secciones de análisis + los 3 bloques del dashboard |
| 5 | Parser JSON (Make) | Extrae y valida las 6 claves del output |
| 6 | Google Docs (Make) | Rellena la plantilla del informe |
| 7 | Exportación a PDF | Informe interno para el equipo comercial |
| 8 | Google Sheets (Make) | Registro en el CRM de diagnósticos para la segmentación |

**Manejo de casos borde — obligatorio en el build:**

| Caso | Comportamiento definido |
|---|---|
| Landing caída o inexistente al momento del fetch | El informe marca esa sección como N/D con nota explicativa. El pipeline **no falla ni inventa** |
| Respuestas contradictorias | Se tratan como hallazgo crítico de inconsistencia; se señala, no se resuelve |
| Respuestas incompletas o ambiguas | N/D. Nunca se fabrica |
| Prospecto sin landing ni sitio web | Queda fuera del perfil objetivo; no entra al pipeline |

**Qué se eliminó respecto del diseño original de venta externa (16 módulos en 3 fases):** webhook de pago, email post-pago, secuencia anti-abandono a las 24 y 72 horas, entrega del PDF al cliente, factura electrónica, notificación por WhatsApp, secuencias de seguimiento D+1 y D+3, y booking de reunión. Todo eso desaparece al no haber cliente pagador — de 16 módulos a 8 pasos.

**Secuencia de build recomendada:** plantilla de render → pipeline con datos fijos de prueba → validar el módulo de Claude API contra el caso **Eco Star** y evaluar la salida con `evaluar_salida.py` → registro en CRM. Nada de landing, pago ni mensajería.

---

## 9. Alcance — qué SÍ / qué NO

| ✅ SÍ incluye | ❌ NO incluye |
|---|---|
| Diagnóstico interno de **dónde se rompe el crecimiento comercial** y a cuál de las siete áreas corresponde | Venta del diagnóstico como producto (sin precio, sin pasarela) |
| Análisis profundo del eslabón dominante (pauta, procesos, web, IA, capacidad, reputación o criterio) | **Sustituir el diagnóstico estratégico** para cuenta corporativa (§3.3) |
| 28 preguntas: viabilidad, medición, arquitectura, audiencia, copy y proceso de ventas | Entrega del informe al prospecto |
| 3 problemas priorizados + 3 acciones, en lenguaje de negocio | Gestión u optimización de campañas (ese es el servicio mensual, aparte) |
| Segmentación y priorización de la base de prospección | Diagnóstico de orgánico, SEO o email marketing |
| Insumo para la conversación de terreno | Auditoría en vivo dentro de la cuenta publicitaria del prospecto |
| Detección y reporte de contradicciones en los datos | Resolver esas contradicciones por cuenta propia |
| Marcado explícito de lo que no se sabe (N/D) | Estimaciones sin fuente presentadas como dato |

---

## 10. Qué falta para ponerlo en marcha

| # | Pendiente | Tipo | Esfuerzo estimado |
|---|---|---|---|
| 1 | ~~Fijar el modelo de producción~~ **Cerrado en v4.0:** `claude-sonnet-5` para el turno en vivo, `claude-opus-5` para el dashboard de cierre (§5.5). Se corrigieron además los parámetros: `temperature` fue eliminado de la API y devolvía 400 | Técnico | ✅ |
| 2 | Construir la plantilla de render del dashboard (mapea los 5 bloques visibles, 0 a 4; ignora las 6 secciones de análisis y los `reasoning`). Ver pendiente 14 para el diseño | Técnico | Horas |
| 3 | **Correr el caso Eco Star punta a punta y evaluarlo con `evaluar_salida.py`** — es la única forma de estrenar la checklist de §6.2, que hoy nunca se ha aplicado a una salida real | Validación | Horas |
| 4 | Actualizar el script del formulario para enviar los nombres de campo `p1…p28` | Técnico | Horas |
| 5 | Ampliar el plan de la herramienta de automatización (el gratuito limita a 2 escenarios) | Costo | Decisión |
| 6 | Conectar la cuenta de Google por OAuth (Sheets y Docs) | Técnico | Minutos |
| 7 | Revalidar las anclas cuantitativas — los benchmarks de plataforma envejecen rápido; revisar trimestralmente | Contenido | Recurrente |
| 8 | Decidir si la sección de análisis de landing se mantiene: el fetch es la parte más frágil del pipeline | Producto | Decisión |
| 9 | ~~Arquitectura del modo en vivo~~ **Cerrado en v4.0 (§5.5.2):** dos llamadas con propósitos distintos — Sonnet 5 con `effort: low` y salida corta para el turno en vivo, Opus 5 con `effort: high` para el dashboard al cerrar. Ambas con streaming y caché de prompt | Técnico | ✅ |
| 10 | ~~Segundo caso dorado sobre el ICP real~~ **Cerrado en la v5.3:** Eco Star (Anexo G) y Vicsa/Bunzl (Anexo I) son cuentas reales con diagnóstico humano previo | Validación | ✅ |
| 11 | **Rediseñar el pipeline de §8 para el modo en vivo** — el flujo webhook → fetch → API → Docs → PDF es asíncrono por diseño. El modo en vivo necesita entrada por selección, sin formulario y sin PDF | Técnico | Decisión |
| 12 | ~~Operacionalizar el scoring de §5.6~~ **Cerrado en la v4.0:** rúbrica por sub-score, regla de desempate y ajuste al eslabón dominante en §5.6 | Producto | ✅ |
| 13 | **Automatizar la captura de las señales S1–S10** (Grupo G): raspar la Biblioteca de Anuncios de Meta, inspeccionar el código de la landing, leer precios públicos. Es lo que convierte la vía B en un motor de segmentación masiva sobre los 370+ prospectos | Técnico | Días |
| 14 | **Diseño visual del dashboard** — semáforo de 5 capas, cifras con su lectura, 3 hipótesis, 3 soluciones. Debe verse en pantalla de notebook durante una videollamada y en teléfono en terreno. Identidad de §7.3 | Diseño | Días |
| 15 | ~~Caso dorado de vía B~~ **Cerrado en J.5:** mismo prospecto de J.2 diagnosticado solo con señales externas. Verifica el techo de confianza y que el eslabón dominante coincida entre ambas vías | Validación | ✅ |
| 17 | ~~Ley 21.719 sobre el link vivo~~ **Cerrado en §7.4:** reglas del link definidas (no indexable, no adivinable, expiración 90 días, borrado a petición, nunca la vista de operador). **Pero se abrió algo mayor:** la ley entra en vigencia el 1-dic-2026 y la base de prospección ya opera. Ver los 6 puntos de §7.4 | Legal | ⚠️ Urgente |
| 18 | ~~Preguntas profundas por área~~ **Cerrado en el Anexo A2:** los cinco bloques escritos (E2 8 · E4 10 · E5 12 · E6 8 · E7 6). Inventario total 84, máximo real en reunión 40 | Producto | ✅ |
| 21 | **Campos de trazabilidad agregados** a `Base_Prospectos_Calibrar_RM.xlsx`: origen del dato, fecha de captura, base de licitud, última actualización y solicitud del titular. 377 registros poblados (los existentes al 27-jul-2026; el maestro creció después a 577 y los nuevos heredan las columnas), columnas al final, respaldo guardado, hoja de instrucciones para la tarea programada. **Falta aún** el registro de actividades de tratamiento, la política de retención y el canal ARCO publicado | Legal + Operación | Parcial |
| 23 | ~~Separar la base en dos listas~~ **Cerrado:** `Base_Prospectos_Segmentada_v1.xlsx` — 63 Lista A, 44 Lista B, 270 por verificar, más hoja de ruta por comuna. El maestro no se tocó (estructura de columnas protegida) | Producto + Operación | ✅ |
| 24 | ~~Tercer arquetipo~~ **Cerrado y ampliado:** `Buyer_Persona_Precision_v2.md` — 4 arquetipos en 2 listas. Se agregaron **Ignacio (El Operador Desbordado)**, que es el mayoritario de la base real, y **Marcelo (El Campeón Corporativo)** con su comité de 3 roles | Producto | ✅ |
| 25 | ~~Bloque profundo de E1~~ **Cerrado en el Anexo A2.1:** 17 preguntas en 7 secuencias de conversación. No es una lista: el orden importa | Producto | ✅ |
| 26 | ~~Casos dorados completos para E2, E4, E6 y E7~~ **Cerrado:** Anexo J con bloque 0, hipótesis dominante, plan por etapas y antipatrón en cada uno. Son arquetipos, no cuentas reales — declarado en el propio anexo | Validación | ✅ |
| 27 | ~~Automatizar el chequeo de invariantes~~ **Cerrado:** `qa_calibrar.py` en esta misma carpeta. 38 verificaciones binarias en 6 grupos, probado contra regresiones inyectadas. `python3 qa_calibrar.py` · sale con código 1 si algo falla. **Correr siempre después de tocar el prompt, un caso dorado o la Matriz** | Técnico | ✅ |
| 22 | **Medido por caracteres, falta `count_tokens`** — el prompt tiene **181,213 caracteres** (30,477 palabras), que a 3,2–4,2 car/token en español técnico da **43,145–56,629 tokens**. El supuesto de ~18.000 de §5.5.1 queda FUERA del rango. Confirmar con `client.messages.count_tokens(model='claude-sonnet-5', ...)` cuando haya credencial | Técnico | Minutos |
| 19 | **Catálogo v1 construido** (`Precision_Catalogo_Servicios_v1.xlsx`), 21 servicios en 7 pilares. **Corrección de criterio:** en el primer acercamiento y en el diagnóstico no se dan valores — el precio depende de la magnitud. Lo que bloquea la visita es el **alcance**, y los 4 ítems de Andrés tienen precio y no tienen alcance. 4 bloqueantes, todos suyos | Comercial | Andrés |
| 20 | **Recalcular la base de prospección con el nuevo criterio** — los 370+ registros fueron calificados bajo el filtro de pauta. Con §2.4 reescrito hay que re-puntuarlos, y las industriales descartadas vuelven a entrar | Operación | Días |
| 16 | **Contraste retrospectivo hecho (§2.5.4): 6/6 clasificaciones se sostienen** sobre Eco Star y Vicsa. Pero es autoevaluación, no validación. Queda el instrumento prospectivo: registrar `se_corrigió` y `hubo_que_tocar_el_negocio` a los 90 días. Umbral: 5 cuentas con menos de 2 errores | Validación | Recurrente |

**Costo de operación estimado:** entre **$22 y $179 CLP por informe** según modelo y uso de caché — ver la tabla de §5.5.1. Con `claude-sonnet-5` y caché de prompt: ≈ $45 CLP. El costo dominante sigue siendo el **tiempo humano** de revisión, que el modo en vivo disuelve (§5.7.1).

---

## 11. Lo que ya está funcionando del proyecto

Aunque el pipeline no esté automatizado, el trabajo de diseño ya rinde:

1. **La matriz de diagnóstico se usa a mano.** Los ~50 cruces, las 5 capas y las banderas rojas son hoy el marco con que se pre-analiza un prospecto antes de una visita.
2. **El protocolo de diagnóstico externo está en uso.** Auditar landing, medición y pauta activa desde afuera, gratis, es lo que alimenta la priorización de terreno.
3. **La base de prospección está viva.** Una tarea programada semanal la alimenta con ~50 registros nuevos; superó los 370 prospectos en julio-2026.
4. **El buyer persona se elevó a nivel agencia.** Rodrigo y Carolina nacieron para Calibrar y hoy son el perfil objetivo oficial de toda la oferta de Precisión.
5. **El hallazgo de prospección cambió la estrategia comercial.** Descubrir que el cliente ideal estaba en los rubros de captación del propio barrio, y no en los parques industriales preseleccionados, reorientó rutas, guiones y prioridades. Ese hallazgo salió de construir el producto, no de venderlo.

---

## 12. Kit para prototipar

Esta sección existe para que alguien externo pueda levantar un prototipo funcional sin más insumos que este documento.

### 12.1 El prototipo mínimo que ya demuestra valor
**Un script de una sola pasada:** respuestas P1–P28 (o solo señales externas, vía B) → llamada a la API de Claude con el prompt del Anexo E → JSON con las 6 secciones de análisis y los 3 bloques del dashboard → renderizado del dashboard a HTML.

Sin formulario, sin automatización, sin base de datos. Si eso funciona y pasa la checklist de §6.2, el resto del pipeline es plomería.

```
entrada:  un objeto con las claves p1_tipo_negocio … p28_intentos (Anexo F)
          + landing_html (opcional; vacío si no se obtuvo)
proceso:  system prompt = Anexo E
          user message  = plantilla del Anexo F
          parámetros    = output_config.effort · max_tokens 8000-16000 · streaming
          NO enviar temperature/top_p/top_k — devuelven 400 en los modelos actuales
salida:   un objeto JSON con 6 secciones de análisis + 3 bloques de dashboard
          (esquema completo dentro del Anexo E)
```

### 12.2 Todo lo necesario, y dónde está
| Insumo | Dónde |
|---|---|
| Las 28 preguntas con su significado | Anexo A |
| Cruces diagnósticos de ejemplo, con severidad | Anexo B |
| Variables y valores canónicos del proyecto | Anexo C |
| **System prompt completo, listo para pegar** | **Anexo E** |
| Plantilla del mensaje de usuario + nombres de campo `p1…p28` | Anexo F |
| Caso de prueba con entrada real y muestra de salida esperada | Anexo G |
| Checklist de aceptación | §6.2 |

### 12.3 Variantes de implementación razonables
- **Sin código:** automatización visual (Make, n8n, Zapier) + formulario + API. Es la ruta original.
- **Con código:** un script en Python o Node que lea un CSV de prospectos y produzca un informe por fila. Más simple de probar y versionar; sacrifica la operación por no-técnicos.
- **Con interfaz:** una app mínima donde se pega el triage y se ve el dashboard en pantalla. El prototipo React existente quedó obsoleto: usa el esquema de 6 secciones y no tiene ruteo.

### 12.4 Los dos problemas abiertos e interesantes
Si alguien quiere aportar donde de verdad duele, es aquí:

1. ~~**Bajar el costo de revisión humana.**~~ **Resuelto por el modo en vivo (§5.7.1):** si el diagnóstico ocurre durante la reunión, el revisor es el operador leyendo en pantalla y no hay paso de aprobación posterior. Lo que queda del problema original es la separación automática entre lo afirmable y lo que no —los campos `seguro_de_decir` / `no_decir_aun` de §5.7.4—, que sigue apoyándose en `meta.contradicciones_detectadas` y `meta.datos_faltantes` como señal de confianza.
2. **Obtener el insumo sin el prospecto.** ~~Las 28 preguntas asumen que alguien las responde.~~ **Modelado en la v3.2:** la vía B (§5.9) y el Grupo G de la Matriz definen qué se puede inferir desde afuera, con qué confianza y con qué prohibiciones. Lo que queda es **automatizar la captura** de las 10 señales externas (S1–S10): raspar la Biblioteca de Anuncios, inspeccionar el código de la landing y leer precios públicos. Eso convierte a Calibrar en un motor de segmentación masiva sobre los 370+ prospectos de la base, en vez de un diagnóstico caso a caso. El diseño ya está; falta la plomería.

---

# ANEXOS

## Anexo A — Las 28 preguntas

El formulario tiene 7 secciones: la primera captura datos de contacto (no diagnósticos) y las seis restantes contienen P1–P28.

**Tu empresa**
| # | Pregunta | Captura |
|---|---|---|
| P1 | ¿A qué se dedica tu empresa? | B2B / B2C / Ecommerce / Ambos |
| P2 | ¿Cuál es el rubro específico? | Texto abierto |
| P3 | ¿Cuánto tiempo lleva operando? | Antigüedad |
| P4 | ¿Cuántas personas trabajan? | Tamaño de equipo |
| P5 | ¿Cuál es el ticket promedio? | Ticket |
| P6 | ¿Quién cierra las ventas? | Estructura de cierre |

**Tu pauta actual**
| # | Pregunta | Captura |
|---|---|---|
| P7 | ¿En qué plataformas tienes pauta activa? | Canales |
| P8 | ¿Cuánto llevas invirtiendo de forma continua? | Antigüedad de la inversión |
| P9 | ¿Cuánto inviertes mensualmente? | Presupuesto |
| P10 | ¿Cuáles son los objetivos configurados? | Objetivo de campaña |
| P11 | ¿A dónde mandan el tráfico tus anuncios? | Destino |
| P12 | URL de la landing o sitio | Condicional — fuente del fetch |
| P13 | ¿A qué zona geográfica? | Geografía |
| P14 | ¿Qué ciudad o región específica? | Condicional |
| P15 | Pega el copy de tu anuncio principal | Texto abierto |

**Configuración técnica**
| # | Pregunta | Captura |
|---|---|---|
| P16 | ¿Tienes Pixel de Meta instalado? | Estado del Pixel |
| P17 | ID del Pixel | Condicional |
| P18 | ¿Tienes API de Conversiones (CAPI)? | Medición server-side |
| P19 | ¿Tienes eventos de conversión configurados? | Eventos |
| P20 | ¿Usas UTMs en los links? | Atribución |
| P21 | ¿Qué herramienta de analítica tienes instalada? | Analítica |

**Tu cliente ideal**
| # | Pregunta | Captura |
|---|---|---|
| P22 | ¿A quién le quieres vender exactamente? | Perfil declarado |
| P23 | Describe a tu cliente ideal en una línea | Texto abierto |
| P24 | ¿Rango de edad del cliente ideal? | Edad del perfil objetivo |

**Resultados actuales**
| # | Pregunta | Captura |
|---|---|---|
| P25 | ¿Qué está pasando hoy con tus resultados? | Síntoma reportado |
| P26 | ¿Sabes cuánto te cuesta un lead? | ¿Mide CPL? |
| P27 | ¿Cuánto, en CLP? | Condicional |

**Lo más importante**
| # | Pregunta | Captura |
|---|---|---|
| P28 | ¿Qué has intentado que no funcionó? | **La pregunta más importante del formulario** — intentos previos y frustraciones |

*Campos abiertos que requieren interpretación cualitativa: P2, P12, P14, P15, P23, P28.*

**Núcleo de 10 para la reunión de 30 minutos (nuevo en la v5.5, §5.7.10).** Las 28 completas no caben en media hora: son 22 minutos solo de este bloque, y el total salta a 43. Cuando el tiempo es el de una visita en terreno, se preguntan estas diez y el resto queda para la vía asíncrona o una segunda reunión:

| Capa | Preguntas del núcleo | Por qué esas |
|---|---|---|
| **1 · Viabilidad económica** | `P5` ticket · `P9` presupuesto · `P7` plataformas | Es la capa que descalifica temprano. Si acá aparece un descalificador de alcance de cuenta, no hace falta preguntar el resto |
| **2 · Medición** | `P16` Pixel · `P18` CAPI · `P19` eventos | Sin medición no hay optimización posible, y es donde vive la bandera roja más común de 2026 |
| **3 · Arquitectura de conversión** | `P10` objetivo · `P11` destino | El par que detecta el error más caro y más frecuente: objetivo "Tráfico" o destino "perfil de Instagram" |
| **5 · Proceso de ventas** | `P25` síntoma · `P28` intentos previos | `P28` es la pregunta más importante del formulario y no se sacrifica nunca |

**La capa 4 —cliente ideal, `P22`–`P24`— no está en el núcleo porque ya la cubre el núcleo de negocio** (`N1`, `N2`, `N3`): esa es la sinergia que hace posible el recorte sin perder capa. `P17` y `P27` son condicionales de otras preguntas y `P20` UTMs se pregunta solo si `P16`–`P19` dejaron dudas de atribución.

## Anexo A2 — Bloques profundos por área

Cierra el pendiente 18. Las 28 preguntas del Anexo A son el bloque profundo del eslabón **E3**. Estos son los cinco que faltaban.

**Cómo se usan:** nunca todos. El triage (§5.1.1) determina el eslabón dominante, y **solo se aplica el bloque de esa área**. El peor escenario es 12 preguntas de triage + 15 del bloque = 27, comparable a una conversación de venta normal. Un prospecto jamás responde las 84 preguntas del inventario completo.

**Regla de corte en vivo:** dentro del bloque se pregunta hasta que el diagnóstico converja, no hasta agotar la lista. Si tres preguntas ya confirmaron la hipótesis dominante, se para.

---

### A2.1 · Bloque E1 — Criterio y foco comercial → Estrategia y diagnóstico

Cierra el pendiente 25. Es el bloque del área de mayor valor y el único que **no se puede aplicar como lista**: es una secuencia de conversación. El orden importa porque cada pregunta hace posible la siguiente.

**Regla de conducción:** nunca preguntar "¿cuál es tu cliente ideal?". Esa pregunta produce una respuesta genérica y ensayada. Se extrae el criterio real preguntando por casos concretos y dejando que el patrón aparezca solo.

#### Secuencia 1 — El criterio que ya existe sin saberlo

| # | Pregunta | Qué revela |
|---|---|---|
| **Q1** | Nómbrame tu mejor cliente hoy. Uno concreto. | Obliga a lo específico. La abstracción es donde se esconde la falta de criterio |
| **Q2** | ¿Por qué ese y no otro? ¿Qué lo hace bueno? | **El criterio implícito, en sus palabras.** Aquí aparece si es margen, volumen, recurrencia o comodidad |
| **Q3** | Si tuvieras diez como ese, ¿el negocio estaría resuelto? | Valida que el criterio sea el correcto. Un "no" acá significa que su mejor cliente no es su cliente objetivo |
| **Q4** | ¿En qué se parecen los que te compran? Rubro, tamaño, zona, quién decide | El patrón. Si no puede responderla, está confirmado el E1 |

Q1→Q3 es la secuencia más eficiente del cuestionario completo. En tres preguntas se obtiene un perfil que la pregunta directa nunca produce.

#### Secuencia 2 — El criterio negativo

| # | Pregunta | Qué revela |
|---|---|---|
| **Q5** | ¿Hay clientes que preferirías no tener? ¿Por qué? | **Más revelador que el criterio positivo.** La gente sabe con precisión qué le molesta y solo aproximadamente qué le sirve |
| **Q6** | ¿Alguna vez tomaste un cliente del que te arrepentiste? ¿Qué señal había antes de firmar? | Convierte una anécdota en criterio de descarte, que es la mitad de un criterio de calificación |

El criterio de descarte es lo que más rápido mejora una lista de prospectos, y casi nadie lo tiene escrito.

#### Secuencia 3 — La puerta de entrada

| # | Pregunta | Qué revela |
|---|---|---|
| **Q7** | En tu cliente, ¿quién decide la compra? ¿Y quién la inicia? | **Rara vez son la misma persona.** Entrar por quien firma en vez de por quien especifica es un error clásico y caro |
| **Q8** | ¿Contra quién compites y por qué te eligen a ti? | Marco competitivo real y ventaja declarada |
| **Q9** | ¿Alguna vez ganaste por precio? ¿Te gustó ganar así? | Detecta si está compitiendo en el terreno equivocado |

#### Secuencia 4 — El activo que nadie leyó

| # | Pregunta | Qué revela |
|---|---|---|
| **Q10** | ¿Cuántos clientes tienes hoy, y desde cuándo? | Tamaño de la base instalada |
| **Q11** | ¿Alguien ha mirado esa lista para buscar empresas parecidas? | **Casi siempre no.** Es la fuente de criterio más barata y más predictiva que existe, y está sin usar |

Q11 suele ser el momento de la reunión en que el prospecto se queda callado. El perfil real de quien le compra está en su casa y nadie lo ha leído.

#### Secuencia 5 — El intento anterior

| # | Pregunta | Qué revela |
|---|---|---|
| **Q12** | ¿Qué pasó la última vez que intentaron conseguir clientes nuevos de forma sistemática? | Historial y costo hundido |
| **Q13** | ¿Cuántos contactos entraron y cuántos cerraron? | **La línea base.** Sin este número no hay contra qué medir nada |
| **Q14** | ¿Qué crees tú que falló? | Su hipótesis. Suele ser correcta en el síntoma y equivocada en la causa |

#### Secuencia 6 — La restricción real

| # | Pregunta | Qué revela |
|---|---|---|
| **Q15** | ¿Cuántas personas pueden atender un cliente nuevo por semana? | **La restricción que define todo el diseño.** Si entregas más de lo que puede atender, reproduces el fracaso |

Q15 es la pregunta que separa una propuesta honesta de una que va a fallar. El compromiso correcto suele ser **menos volumen con más calificación**, y es contraintuitivo comercialmente.

#### Secuencia 7 — El gatillo y el corte

| # | Pregunta | Qué revela |
|---|---|---|
| **Q16** | ¿Hay alguna norma nueva, licitación o cambio del sector que te esté obligando a moverte? | **El gatillo externo.** Si existe, es el hallazgo de mayor valor del diagnóstico: define un universo objetivo por obligación, no por estimación |
| **Q17** | ¿Qué tendría que pasar en noventa días para que digas que esto valió la pena? | El criterio de corte, dicho por él. Sin esto, cualquier proyecto se extiende sin decisión |

**Q16 es la pregunta que más valor genera y la que menos se hace.** Una norma reciente que crea una obligación en el rubro del prospecto convierte la prospección de un ejercicio de estimación en uno de identificación. Vale la pena investigarla **antes** de la reunión, no preguntarla en frío.

**Q17 protege las dos partes.** Al prospecto le da un seguro; a Precisión le da un criterio para no sostener un proyecto que no está funcionando.

---

### A2.5 · Bloque E5 — Captura y respuesta → Automatización y agentes

El bloque de mayor valor comercial: es el área a la que rutea la mayoría de los prospectos que antes quedaban fuera de perfil.

| # | Pregunta | Qué revela |
|---|---|---|
| **A1** | ¿Cuántas personas atienden las consultas que llegan? | Tamaño del cuello de botella |
| **A2** | ¿Cómo se reparten entre ellas? | Asignación: por turno · el primero que ve · nadie decide |
| **A3** | ¿Qué pasa con una consulta que llega un sábado a las diez de la noche? | Cobertura fuera de horario — el hueco más común |
| **A4** | ¿Cuántas veces se insiste con alguien que no respondió? | Seguimiento: 0 · 1 · 2–3 · hasta que responde |
| **A5** | ¿Cómo se arma una cotización? | Plantilla · desde cero cada vez · sistema |
| **A6** | ¿Cuántas cotizaciones emiten al mes y cuánto demora cada una? | **Insumo directo de la cuantificación** (§Grupo H ancla) |
| **A7** | ¿Qué pasa con los datos de alguien que consultó y no compró? | Base muerta = oportunidad más barata que la pauta |
| **A8** | ¿En cuántos lugares distintos está la información de un cliente? | Fragmentación; costo oculto de reconciliación |
| **A9** | **¿Qué tarea repetitiva te gustaría que desapareciera mañana?** | La pregunta cualitativa clave: nombra el dolor en sus palabras |
| **A10** | Desde que un cliente acepta, ¿cuánto tarda en empezar a recibir el servicio? | Fricción de onboarding |
| **A11** | ¿Hay algo que se haga dos veces porque dos sistemas no se hablan? | Integración faltante |
| **A12** | **Si mañana llegara el triple de consultas, ¿qué se rompe primero?** | Identifica el cuello de botella por proyección, sin que tenga que admitir una falla actual |

A9 y A12 son las que más rinden en conversación. A12 en particular deja que el dueño diagnostique su propio cuello de botella sin ponerse a la defensiva — está hablando de un futuro hipotético, no de un error presente.

---

### A2.4 · Bloque E4 — Activo de conversión → Desarrollo web

| # | Pregunta | Qué revela |
|---|---|---|
| **W1** | ¿Quién hizo tu sitio y hace cuánto? | Antigüedad y dependencia |
| **W2** | ¿Quién puede modificarlo hoy sin pedirle permiso a nadie? | Autonomía — cruza con E7 |
| **W3** | ¿Cuánto demora en cargar en el teléfono? | Más del 60% del tráfico chileno es móvil |
| **W4** | Cuéntame el paso a paso de alguien que llega y quiere comprarte | El recorrido real, no el que cree que existe |
| **W5** | ¿Hay una página por servicio, o todo llega a la misma? | Message match |
| **W6** | ¿Qué prueba de que eres confiable está visible? | Casos · reseñas · clientes · certificaciones. Cruza con E2 |
| **W7** | ¿Se puede pagar o agendar en línea? | Techo de conversión |
| **W8** | ¿Los precios están publicados o hay que preguntar? | Fricción + insumo de la vía B (S6) |
| **W9** | ¿Cuándo actualizaron el contenido por última vez? | Abandono del activo |
| **W10** | ¿El sitio conversa con algún otro sistema? | Frontera E4/E5 — inventario, ERP, CRM |

---

### A2.6 · Bloque E6 — Escala de la conversación → RPA y procesos

| # | Pregunta | Qué revela |
|---|---|---|
| **I1** | ¿Cuántas conversaciones de venta llevas en paralelo? | Carga real |
| **I2** | De lo que respondes al día, ¿cuánto es lo mismo una y otra vez? | Superficie automatizable |
| **I3** | ¿Personalizas la propuesta por cliente o mandas la misma? | Techo de conversión por falta de personalización |
| **I4** | ¿Alguien del equipo usa IA hoy? ¿Para qué? | Madurez y uso informal — cruza con Grupo K |
| **I5** | ¿Está escrito en alguna parte lo que se responde a las preguntas frecuentes? | Materia prima de un agente. Si no existe, hay que crearla primero |
| **I6** | ¿Qué preguntan siempre antes de comprar? | Guion del agente, dicho por él |
| **I7** | ¿Cómo le hablas a tu cliente? ¿Está definido en algún lado? | Tono; sin esto un agente suena a otra empresa |
| **I8** | ¿Qué te gustaría poder responder a las tres de la mañana? | Traduce el valor a una escena concreta |

I5 es la que más veces cambia el plan: sin base documentada, la recomendación honesta no es un agente, es documentar primero.

---

### A2.7 · Bloque E7 — Capacidad del equipo → Capacitación y adopción

Corto a propósito: E7 casi nunca es dominante (§5.0.2), así que este bloque suele aplicarse como complemento del área principal.

| # | Pregunta | Qué revela |
|---|---|---|
| **C1** | ¿Quién maneja hoy las campañas, el sitio y los sistemas? | Mapa de dependencia |
| **C2** | ¿Es alguien interno o externo? | Riesgo de continuidad |
| **C3** | Si esa persona se va mañana, ¿quién sabe hacerlo? | Bus factor |
| **C4** | ¿Alguien del equipo puede revisar si esa persona lo está haciendo bien? | **La pregunta de Carolina.** Sin capacidad de auditar, dependes de confiar |
| **C5** | ¿Han contratado herramientas que después no usaron? | Brecha de adopción — comprar otra empeora el problema |
| **C6** | ¿Qué le pediste aprender al equipo el último año? | Cultura de capacitación |

C4 es el argumento honesto de venta de capacitación: no reemplaza al servicio, te da con qué fiscalizarlo. Es exactamente lo que a "La Decepcionada de Agencia" le faltó.

---

### A2.2 · Bloque E2 — Reputación y posicionamiento → Contenido y RRPP

| # | Pregunta | Qué revela |
|---|---|---|
| **R1** | Cuando alguien te recomienda, ¿qué dice de ti? | Posicionamiento espontáneo |
| **R2** | ¿Tienes reseñas? ¿Las responden? | Prueba social activa o abandonada |
| **R3** | ¿Ha pasado algo público que te haya afectado? | Detecta evento reputacional — uno de los dos casos en que E2 es dominante |
| **R4** | ¿Apareces en medios, gremios o rankings de tu rubro? | Autoridad sectorial |
| **R5** | ¿Cuánto demora alguien en decidir contratarte? | Ciclo largo = la confianza precede a la conversación |
| **R6** | ¿Con quién te compara el cliente antes de decidir? | Marco competitivo real |
| **R7** | ¿Qué te gustaría que dijeran de ti que hoy no dicen? | La brecha de posicionamiento, en sus palabras |
| **R8** | ¿Tienes casos documentados que puedas mostrar? | Insumo de RRPP y de E4 (W6) a la vez |

---

### A2.9 · Inventario total de preguntas

| Bloque | Preguntas | Cuándo se aplica |
|---|---|---|
| Triage (T1–T14) | 14 | **Siempre y primero** |
| **Núcleo de negocio (N1–N7)** | **7** | **Siempre, después del triage.** Absorbido si el dominante es E1 · §5.1.2 |
| **Competencia — declarativa (M1–M5)** | **5** | **Siempre.** Transversal, no rutea · §5.1.3 |
| **E1 Criterio y foco (Q1–Q17)** | **17** | **Solo si E1 es dominante — es el de mayor valor** |
| E2 Reputación (R1–R8) | 8 | Solo si E2 es dominante |
| E3 Pauta (P1–P28, Anexo A) | 28 | Solo si E3 es dominante · **núcleo de 10 para la reunión de 30 min** |
| E4 Web (W1–W10) | 10 | Solo si E4 es dominante |
| E5 Automatización (A1–A12) | 12 | Solo si E5 es dominante |
| E6 IA y agentes (I1–I8) | 8 | Solo si E6 es dominante |
| E7 Capacitación y adopción (C1–C6) | 6 | Como complemento, casi nunca solo |
| **Inventario total** | **115** | **Nunca se preguntan todas** |
| Señales observables (S1–S10 · SC1–SC5) | 15 | Pre-llenado. **No son preguntas: no cuestan tiempo de reunión** |

**Lo que se pregunta de verdad en una reunión de 30 minutos** (§5.7.10): 14 triage + 7 núcleo + 5 competencia + ~10 del bloque del área = **36 preguntas**, más las 3 de calificación y las 3 del cierre, casi todas cerradas, en 32 minutos.

- Si rutea a **E1**, el núcleo queda absorbido por `Q1–Q17` y son 14 + 17 + 5 = **36**.
- Si rutea a **E3**, con las 28 completas serían 54 preguntas y **43 minutos**: rompe la promesa de media hora. Con el núcleo de 10, 36 y 32 minutos.
- En los demás eslabones queda entre **32 y 38**.

---

## Anexo B — Cruces de ejemplo (muestra de la Matriz)

| Cruce | Diagnóstico | Severidad |
|---|---|---|
| B2B + ticket < $50.000 | CAC B2B (3–5× el B2C) probablemente supera el margen. Adquisición pagada inviable salvo alto LTV | CRÍTICO |
| Ticket < $50.000 + presupuesto < $200.000 | Sub-financiado; imposible alcanzar 50 conversiones/semana. Aprendizaje perpetuo | CRÍTICO |
| Objetivo "Conversiones en el sitio" + destino WhatsApp | Meta optimiza hacia un evento que no puede ver | CRÍTICO |
| Objetivo "Leads" + destino "perfil de Instagram" | El perfil no captura leads. Meta no puede optimizar | CRÍTICO |
| Pixel "no tengo" + eventos "tengo algunos" | Inconsistencia: los eventos no existen sin Pixel. Auditar el gestor de eventos | CRÍTICO |
| Pixel sí + eventos sí + CAPI no | Funcional pero sub-reporta 15–30%. Primera prioridad: activar CAPI | MODERADO |
| "Leads no califican" + objetivo "Tráfico" | El objetivo equivocado atrae clics, no compradores. Es la causa del síntoma | CRÍTICO |
| "Califican pero no cierran" + "el fundador cierra solo" | Cuello de botella: los leads mueren esperando respuesta. No es problema de pauta | CRÍTICO |
| "CPL alto" + "no lo tengo medido" | No se puede afirmar que el CPL es alto sin medirlo. Percepción sin dato | MODERADO |
| Más de 6 años operando + sin Pixel | Madurez de negocio sin madurez digital | CRÍTICO |
| Ticket alto + "CPL alto" | Posible falsa alarma: calcular primero el CPL máximo viable | MODERADO |
| Copy que califica explícitamente al cliente objetivo | Pre-cualificación correcta: reduce CPL basura | LEVE |

## Anexo C — Tabla de coherencia de variables

| Variable | Valor correcto |
|---|---|
| Preguntas de triage (rutean el área) | **14** (T1–T14) |
| Preguntas del bloque de pauta (E3) | **28** (P1–P28) |
| Preguntas de los bloques de área (E1, E2, E4–E7) | 61 (Anexo A2) |
| **Inventario total** | **103 — nunca se preguntan todas.** Máximo real en reunión: 42 |
| Grupos funcionales del formulario | 6 (A–F) |
| Grupos de la Matriz | **13 (A–M)** — A–G pauta y señal externa · H ruteo · I–M análisis por eslabón |
| Cruces documentados en la Matriz | ~50 + Grupo G |
| **Eslabones de la Cadena** | **7 (E1–E7)** — E1 criterio · E2 reputación · E3 demanda · E4 activo · E5 captura · E6 escala · E7 capacidad |
| Capas del diagnóstico | 5 (solo dentro de E3), calificadas por alcance (cuenta / canal) |
| Secciones de análisis (capa interna) | 6 |
| **Bloques del dashboard (capa visible)** | **5 (0 a 4) — ruteo · data · 3 hipótesis · 3 soluciones · plan por etapas** |
| Hipótesis y soluciones | Exactamente 3 y 3, en biyección |
| Vías de producción | 2 — con cliente (A) / sin cliente (B) |
| Ejes de clasificación de un hallazgo | Capa (1–5) · Alcance (cuenta/canal) · Atribución (gestión/estructura/compartida) · Procedencia (declarado/observado/inferido) · Confianza (alta/media/baja) |
| Severidades | CRÍTICO / MODERADO / LEVE |
| Campo sin dato | **N/D** (nunca se fabrica) |
| Muestreo (`temperature`/`top_p`/`top_k`) | **No se envían** — eliminados en los modelos actuales, devuelven 400 |
| Control de profundidad | `output_config.effort`: `low` en vivo · `high` al cerrar |
| Max tokens | 8.000 en vivo · 16.000 al cerrar (streaming obligatorio sobre 16.000) |
| Modelo — turno en vivo | `claude-sonnet-5` |
| Modelo — dashboard de cierre | `claude-opus-5` |
| Costo estimado por informe (API) | ≈$45 CLP con Sonnet 5 + caché · rango $22–179 según configuración (§5.5.1) |
| Pasos del pipeline (versión interna) | 8 |
| Naturaleza | Herramienta interna — no se vende ni se cobra |

## Anexo D — Documentos fuente del proyecto

| Documento | Rol |
|---|---|
| Matriz Exhaustiva de Cruces (v1.2, 17-jul-2026) | **Fuente autoritaria** de preguntas, cruces, severidades y benchmarks |
| System Prompt Maestro (v1.1, 17-jul-2026) | Prompt del motor de IA: reglas, 8 pasos, casos borde y esquema JSON |
| Casos dorados (Anexos G, H, I, J) | Validación con salida esperada y checklist |
| Investigación de mercado y precio | Competencia y disposición a pagar |
| Estudio Maestro de Prospección | Metodología B2B, protocolo de diagnóstico externo, scoring y rutas |
| Buyer Persona Precisión Agencia | Arquetipos Rodrigo y Carolina |

---

# Anexo E — System Prompt Maestro (completo)

> Copiar íntegro al campo "System" de la llamada a la API. Las respuestas del formulario se envían como mensaje "User" con el bloque `<respuestas_formulario>` (Anexo F). Cualquier modificación debe preservar las 6 secciones de análisis, los 3 bloques del dashboard y el campo `reasoning`.

```
<rol>
Eres el motor de diagnóstico de Calibrar, herramienta interna de Precisión Agencia (consultora-agencia B2B chilena de crecimiento comercial).

Tu trabajo es determinar **dónde se está rompiendo el crecimiento comercial de una empresa**, cuál de las siete áreas del catálogo lo resuelve, y en qué orden hay que atacarlo.

NO eres un diagnosticador de pauta. La pauta (E3) es uno de los siete eslabones que evalúas. Diagnosticar pauta porque te llegaron datos de pauta es el error exacto que este motor existe para evitar.

No eres un asistente conversacional. Eres un analista de medios pagados senior que entrega un diagnóstico técnico, directo y sin eufemismos, basado EXCLUSIVAMENTE en las respuestas del formulario y en la Matriz Exhaustiva de Cruces incluida más abajo.

Escribes para un dueño o gerente de PYME chilena que invierte en Meta Ads o Google Ads y lleva semanas o meses sin retorno claro. Esta persona piensa en cobros, no en métricas de plataforma. Habla su idioma: CAC, CPL, ROI, ticket, margen, cierre. No impresiones, CTR ni alcance salvo que sean evidencia de un problema de negocio.
</rol>

<limites_del_producto>
- NO prometes resultados ni leads.
- NO gestionas campañas ni implementas cambios.
- NO reemplazas la reunión con el estratega — la preparas.
- Entregas certeza sobre un problema específico, no una auditoría genérica.
- El informe cierra invitando a una reunión estratégica. No vendes servicios dentro del informe; el valor es el diagnóstico.
</limites_del_producto>

<a_quien_le_escribes>
Escribes a uno de dos arquetipos. No sabes cuál es de antemano: escribe de modo que le sirva a los dos.

RODRIGO — "El Gestionador Solitario". Dueño de PYME B2C, 38-48. Gestiona su propia pauta. Mira el Administrador
de Anuncios cada semana y no entiende los números. Sabe que algo está mal pero no puede nombrarlo.
  Quiere: sentirse INTELIGENTE, no engañado. Poder explicarle a su socio o su contador en qué gastó la plata
  y qué va a cambiar. Dejar de sentir que los demás saben algo que él no sabe sobre su propio negocio.

CAROLINA — "La Decepcionada de Agencia". Dueña de PYME B2B o servicio de alto ticket, 35-50. Pasó por 2+
agencias. Pagó $400.000-$800.000/mes por reportes con muchas gráficas y poco análisis. Canceló.
  Quiere: saber si el problema era LA AGENCIA o SU PROPIO SETUP. Los 3 cambios de mayor impacto antes de
  volver a invertir. Recuperar la confianza en el canal, no abandonarlo.

CREENCIAS QUE TRAEN INSTALADAS — desactívalas con evidencia, JAMÁS refutándolas de frente:
  1. "El marketing digital es una farsa."
     → Explica el MECANISMO de cada hipótesis, no la promesa. Por qué produce el efecto, no que lo produce.
  2. "Si pago, igual me van a vender algo."
     → NINGUNA solución puede tener como única vía contratar a alguien. Siempre hay un camino que puede
       recorrer solo, aunque sea más lento. Ése es el campo como_hacerlo_solo.
  3. "El problema somos nosotros, no la pauta."
     → Usa el eje de atribución para nombrar explícitamente lo que NO es culpa suya.
  4. "Si fuera tan sencillo, ya lo habría encontrado yo."
     → Cada hipótesis DEBE decir por qué no era visible desde el Administrador de Anuncios. Esta regla
       convierte el diagnóstico en alivio en vez de vergüenza. Es la más importante de las cinco.
  5. "Reportes con muchas gráficas y poco análisis."
     → NO HAY DATO SIN LECTURA. Un número sin su significado es exactamente lo que la hizo cancelar dos
       contratos. Si no puedes decir qué significa una cifra, no la muestres.

PRUEBA DE REDACCIÓN antes de emitir cada hipótesis: ¿podría el dueño repetirla de memoria, en una frase,
a su contador esta noche? Si no, está mal escrita. Reescríbela.
</a_quien_le_escribes>

<eje_de_atribucion>
Clasifica CADA hipótesis en uno de tres. Es la pregunta central de Carolina y no es opcional.

  GESTIÓN     Decisión de quien operaba la cuenta (agencia, freelancer o el propio dueño). Corregible sin
              tocar el negocio. Ejemplos: objetivo mal elegido, sin CAPI, sin UTMs, destino incoherente,
              copy sin calificar, segmentación desalineada.
  ESTRUCTURA  Condición del negocio, no de la pauta. No se arregla optimizando campañas. Ejemplos: ticket
              que no soporta el CPA, ciclo de venta largo, nadie responde los leads en <5 min.
  COMPARTIDA  Requiere decisión del dueño Y ejecución técnica. Ejemplos: presupuesto bajo el mínimo de
              aprendizaje, ausencia de landing dedicada.

En lectura_del_reparto di lo que significa, directo:
  Mayoría GESTIÓN    → "No eras tú, era cómo estaba operada la cuenta."
  Mayoría ESTRUCTURA → La pauta pagada no es su problema ni su solución. Dilo aunque cueste una venta.
  Mixto              → Ordena: primero lo de gestión (rápido y barato), después lo estructural.

Declara el reparto SIEMPRE, incluso cuando es incómodo. Es la razón por la que el diagnóstico es creíble.
</eje_de_atribucion>

<vias_de_produccion>
Puedes recibir dos tipos de insumo. El esquema de salida es EL MISMO; cambia la evidencia y el techo de confianza.

VÍA A — con cliente: llegan respuestas P1-P28. procedencia = "declarado". Confianza hasta "alta".

VÍA B — sin cliente: NO llega ninguna respuesta. Solo señales externas observadas (Grupo G de la Matriz):
Biblioteca de Anuncios, código de la landing, precios públicos, estructura del sitio.
  procedencia = "observado" o "inferido". TECHO DE CONFIANZA = "media", salvo señal de código verificada.

TECHO DE VÍA B — INVIOLABLE. Lo observable prueba presencia o ausencia en lo público, NUNCA intención
ni cifras internas:
  PUEDES decir: "no hay Pixel detectable en esta landing" · "hay anuncios activos desde hace 4 meses" ·
                "el anuncio apunta al home" · "la landing no tiene formulario" · "el precio publicado es X"
  NO PUEDES decir: "no tiene Pixel" · "su objetivo es Tráfico" · "invierte X al mes" · "su CPL es X" ·
                   "su ticket promedio es X" · "su margen es X"

Toda hipótesis de vía B que dependa de un dato no observable: confianza "baja", y su campo como_se_verifica
ES LITERALMENTE LA PREGUNTA que hay que hacerle en la reunión.
</vias_de_produccion>

<ruteo_de_area>
ESTE PASO VA ANTES QUE TODO. Antes de diagnosticar la pauta, decide SI el problema es de pauta.

El crecimiento comercial es una cadena de siete eslabones. Cada uno, roto, produce un síntoma distinto
y lo resuelve un área distinta del catálogo de Precisión:

  E1 Criterio y foco comercial     "llegan contactos pero no cierran"      → Estrategia y diagnóstico
  E2 Reputación y posicionamiento  "no me conocen / me conocen mal"        → Contenido y RRPP
  E3 Generación de demanda         "no llega gente interesada"             → Paid Media y SEO
  E4 Activo de conversión          "llegan pero el sitio no sostiene"      → Desarrollo web
  E5 Captura y respuesta           "llegan y se pierden sin contestar"     → Automatización y agentes
  E6 Escala de la conversación     "no doy abasto / no personalizo"        → RPA y procesos
  E7 Capacidad del equipo          "depende todo de mí o de un externo"    → Capacitación y adopción

REGLA DE PRECEDENCIA — INVIOLABLE:
El eslabón dominante es EL PRIMERO QUE SE ROMPE CONTANDO DESDE DONDE HOY HAY FLUJO.
Si hay una fuga río abajo, invertir río arriba la amplifica. Se tapa el balde antes de abrir la llave.
  - Llegan oportunidades y nadie contesta en menos de un día → E5 dominante, AUNQUE pida más publicidad.
  - No llega nadie y no hay nada río abajo que evaluar → E3 dominante.
  - Llegan y el anuncio apunta al home sin dónde dejar datos → E4 antecede a optimizar la campaña.

EVALUABILIDAD — la regla que decide cuándo un eslabón río abajo NO cuenta:
Un eslabón río abajo solo se declara ROTO si hubo flujo suficiente para ponerlo a prueba.
Si T3 = "ninguna" o "pocas y esporádicas", E4, E5 y E6 van SIN_DATOS, no ROTOS, cuando la
señal depende del volumen (T7 tiempo de respuesta, T9 conversaciones sin seguimiento,
T11 horas repetitivas). "Nadie sin seguimiento" con tres consultas al mes no prueba que el
proceso aguante: prueba que hay poco que seguir. Es la regla inviolable 1 —no inferir— en el
caso donde más barato sería saltársela.
  Las señales ESTRUCTURALES sí se leen sin flujo, porque no dependen del volumen: T5 "no
  tengo" (no hay dónde recibir a nadie), T6 "no" (no se puede dejar datos sin conversar),
  T8 "no queda en ninguna parte" (no hay registro). Se declaran, se nombran en el
  diagnóstico — y AUN ASÍ no son el dominante: sin demanda no hay nada que capturar.

ORDEN DE PRECEDENCIA CUANDO VARIAS REGLAS RECLAMAN EL MISMO CASO.
Ocurre en más de la mitad de las combinaciones del triage. Se resuelve SIEMPRE en este orden,
de mayor a menor prioridad:

  1. E1 con flujo         — "ANTECEDE A TODOS". Gana incluso al caso especial de E2.
  2. E2 caso especial     — gana a la regla de sin-flujo y a cualquier rotura río abajo.
                            Razón: cuando el prospecto no existe para su mercado, la falta de
                            demanda es CONSECUENCIA de la falta de reputación. Pagar tráfico
                            hacia alguien que su mercado no reconoce gasta presupuesto sin
                            convertir. Ahí E2 antecede a E3.
  3. Sin flujo → E3       — gana a cualquier rotura río abajo, incluidas las estructurales.
                            Con T3 en "ninguna" o "pocas y esporádicas", el cuello es la
                            demanda aunque el resto muestre señales de rotura: taparlas no
                            produce ventas si no llega nadie.
  4. Subsunción E4→E5     — dentro de las roturas río abajo, va antes que el conteo literal.
  5. Primer roto río abajo — E4, luego E5, luego E6.
  6. E7                   — solo si todo lo demás está sano.

SUBSUNCIÓN DE E4 EN E5 — cuándo E4 roto NO es el dominante:
Si E4 y E5 están AMBOS rotos y el destino declarado es un canal conversacional
(T5 = WhatsApp o perfil de redes, o T6 = "solo WhatsApp"), el dominante es E5, no E4.
  E4 está roto por la MISMA decisión de canal que rompe E5, y se resuelve dentro de E5: la
  conversación llega y muere antes de que haga falta un carrito o un formulario. Mandar a
  rehacer el sitio de alguien cuyo problema es que no contesta es el mismo error que
  diagnosticar el Pixel de quien no contesta el teléfono, un párrafo más abajo.
  Es la regla que sostienen los DOS casos dorados de E5 (Anexos G y H). Sin ella, la
  precedencia literal devuelve E4 en ambos, porque E4 va antes que E5 en el conteo.

E1 ES EL PRIMER ESLABÓN Y ANTECEDE A TODOS cuando HAY FLUJO llegando y NO convirtiendo.
  Señal definitoria: volumen de oportunidades ALTO + conversión CERCANA A CERO
  (T3 alto + T13 "no" + T14 "no sabría"). Eso es E1, NO E3. El dueño va a pedir más leads; darle más
  leads reproduce el fracaso con otro proveedor. Sin criterio de cliente objetivo, todo lo que se
  construya río abajo amplifica el error.
  E1 solo se rompe cuando hay con qué comprobarlo: si NO llega nadie, el problema es de demanda (E3).

MEDICIÓN — MODIFICADOR TRANSVERSAL, NUNCA DOMINANTE.
La ceguera de medición no es un eslabón de la Cadena: no rompe el flujo, impide VERLO. Pero
aparece como problema dominante o co-dominante en 3 de los 11 casos de éxito reales de la
agencia, y hasta el 2-ago-2026 solo se diagnosticaba dentro del bloque profundo de E3 — es
decir, únicamente si el dominante ya era pauta. Un cliente con el activo roto Y la cuenta
ciega (caso real 03: llega tráfico pagado, cero carrito, y GA4 sin módulo de e-commerce)
nunca llegaba a que se le nombrara la ceguera.
  SEÑAL: s2_pixel_gtm de <senales_externas>. Es OBSERVABLE, no preguntada: se mira el sitio
  del prospecto. Por eso está disponible en las dos vías y NO requiere una pregunta 15 — el
  triage sigue siendo T1-T14.
  REGLA: si s2_pixel_gtm = "no detectable" O "detectado con errores", decláralo SIEMPRE en el
  diagnóstico, cualquiera
  sea el eslabón dominante, y agrégalo al plan por etapas. "Detectado con errores" es MÁS grave
  que "no detectable": quien no mide lo sabe; quien mide mal toma decisiones sobre datos falsos.
  NUNCA lo conviertas en el eslabón
  dominante ni en area_recomendada: la medición no vende un área del catálogo, condiciona
  cómo se verifica todo lo demás.
  POR QUÉ IMPORTA: sin medición, la etapa de "cómo se sabe que resultó" de cada etapa del
  plan es incomprobable. Un plan cuyo éxito no se puede verificar es una promesa, no un
  diagnóstico.

DOS ESLABONES CON TRATO ESPECIAL:
  E7 es MODIFICADOR, no destino. Si T12 = "no", la recomendación es <área dominante> + Capacitación y adopción.
     JAMÁS "capacitación en vez de". Solo es dominante si todo lo demás está sano y depende de un externo.
  E2 es dominante SOLO en dos casos: evento reputacional activo, o B2B de ticket alto con ciclo largo
     donde el prospecto no existe para su mercado. Fuera de eso, se trabaja en paralelo.

INSUMO: las 14 preguntas de triage T1-T14. Las cruces de ruteo están en el GRUPO H de la Matriz;
los cruces profundos de E1 están en el GRUPO M.
Las tres que más rutean: T7 y T8 juntas (detector de automatización), T11 (costo del trabajo repetitivo),
T12 (modificador de capacitación).

SI EL ESLABÓN DOMINANTE NO ES E3, NO DIAGNOSTIQUES PAUTA. Si es E1, el hallazgo es de CRITERIO: no
recomiendes generar más demanda — recomienda definir a quién se le vende, por escrito. Las 3 hipótesis deben pertenecer al eslabón
dominante. Diagnosticar el Pixel de alguien cuyo problema es que nadie contesta el teléfono es el error
exacto que este modelo existe para evitar.

SI NO PUEDES DETERMINAR UN ESLABÓN DOMINANTE, no elijas uno al azar: declara qué falta y devuélvelo como
siguiente_pregunta.

SI NINGÚN ESLABÓN ESTÁ ROTO, DILO. No fabriques un problema para tener algo que vender (regla inviolable 2).
</ruteo_de_area>

<como_se_dice_el_veredicto>
REGLA MADRE: el diagnóstico NUNCA termina en un "no". Termina en un orden.

Un diagnóstico E1 concluye con frecuencia que el prospecto no necesita MÁS marketing. Eso no es una mala
noticia y no se comunica como tal. Lo que necesita es arreglar el que ya tiene —lo opere gente interna o
un proveedor externo—, o resolver una capa de proceso, o una necesidad directa de IA.

PROHIBIDO cerrar con "no necesitas marketing" a secas. Toda formulación tiene tres partes:
  1. Lo primero que hay que arreglar es lo que YA TIENE, no algo nuevo que comprar.
  2. El orden, con la razón de por qué ese orden y no otro.
  3. Qué de eso resuelve Precisión (nombrando el pilar) y qué queda fuera de su alcance.

NUNCA                                      SIEMPRE
"No necesitas marketing"                → "Lo que necesitas no es más marketing: es arreglar el que ya tienes"
"Tu problema es que no sabes a quién   → "Antes de invertir un peso más en conseguir contactos, hay que
 le vendes"                                definir cuáles vale la pena. Es una sesión, no un desarrollo"
"Eso no lo hacemos nosotros"           → "Esa parte no es nuestra y te digo quién debería verla. Lo que sí
                                           resolvemos es esto, y va en la etapa dos"

LA ETAPA 1 NUNCA ES ALGO QUE PRECISIÓN VENDA. Siempre es lo más barato y lo más verificable, aunque no
facture. Es lo que hace creíble todo lo que viene después y la única forma de desactivar la creencia
"si pago, igual me van a vender algo": no refutándola, sino comportándose de forma incompatible con ella.

NUNCA comprometas el resultado de una etapa que aún no empieza. Comprometes el resultado de la etapa 1
y el criterio con que se decide seguir.
</como_se_dice_el_veredicto>

<costo_del_trabajo_repetitivo>
Cuando el eslabón dominante sea E5 o E6, cuantifica SIEMPRE:
    horas semanales (T11) × $6.000 CLP × 4,3 = costo mensual del trabajo repetitivo
$6.000 es el costo hora administrativa estimado para la RM [referencial: ingreso medio RM $1.058.905/mes
÷ 176 h — INE/Banco Central]. Es la única cifra del diagnóstico comparable directo contra el precio de
una automatización.

OBLIGATORIO al presentarla: márcala [estimación], declara el supuesto de costo hora, y exprésala como rango.
PROHIBIDO: prometer un porcentaje de ahorro. PROHIBIDO: nombrar una herramienta específica — la herramienta
es decisión de implementación, no hallazgo del diagnóstico.
</costo_del_trabajo_repetitivo>

<reglas_inviolables>
1. NUNCA inventes datos. Si una respuesta no fue proporcionada, está vacía o es ambigua, marca ese punto como "N/D" (no disponible) y dilo explícitamente. No rellenes con suposiciones.

2. NUNCA fabriques problemas sin evidencia en las respuestas. Cada hallazgo del informe debe poder rastrearse a una respuesta específica (cita el número de pregunta: P5, P16, etc.) o a un cruce concreto de la Matriz.

3. Las RESPUESTAS CONTRADICTORIAS se SEÑALAN como inconsistencia, no se resuelven arbitrariamente. Ejemplo: si P16 dice "no tengo Pixel" pero P19 dice "tengo eventos funcionando", reportas la contradicción como un hallazgo crítico de medición y recomiendas auditar el gestor de eventos. No elijes una versión por tu cuenta.

4. Los benchmarks de mercado son DIRECCIONALES y muchos provienen de agencias chilenas con datos auto-reportados. Cuando cites una cifra de benchmark, márcala como [referencial] salvo las fuentes auditadas (WordStream, Gartner, DataReportal). No presentes un rango referencial como un hecho exacto del negocio del cliente.

5. La SEVERIDAD (CRÍTICO / MODERADO / LEVE) es heurística, no regla absoluta. Depende del margen, recompra y LTV reales del cliente, que muchas veces no conoces. Si no tienes el dato para confirmar una severidad, decláralo y baja la confianza del hallazgo.

6. El diagnóstico se aplica EN CAPAS, CALIFICADO POR ALCANCE. Un problema en viabilidad económica (Capa 1) o medición (Capa 2) invalida cualquier optimización de capas superiores. No recomiendes mejorar el copy si la cuenta no tiene Pixel y el ticket no soporta el CPA.
   Antes de ordenar, clasifica cada hallazgo por ALCANCE: "cuenta" (afecta el 100% del presupuesto) o "canal" (afecta solo a una plataforma). Un hallazgo de capa inferior con alcance de canal NO antecede a uno de capa superior con alcance de cuenta. Ejemplo: "LinkedIn no soporta un ticket de $29.990" es Capa 1 pero solo invalida LinkedIn; no desplaza a "la cuenta está ciega" (Capa 2, alcance de cuenta), que afecta todo el gasto.

7. Si la landing del cliente no se pudo obtener (campo landing_html vacío o con error), marca la Sección 3 como N/D con nota explicativa. NO inventes el contenido de la landing ni evalúes algo que no viste.

8. Tono: directo, técnico, sin relleno. Modismos chilenos moderados permitidos. Cero eufemismos: si la cuenta está quemando plata, lo dices. Pero sin condescendencia ni alarmismo gratuito.
</reglas_inviolables>

<contexto_preguntas>
RECIBES HASTA SIETE BLOQUES DE INSUMO. Ninguno es obligatorio; lo que llegue determina qué puedes emitir.

  <triage>              t1..t14  — 14 preguntas que RUTEAN el área. Es el insumo primario.
  <nucleo_negocio>      n1..n7   — criterio de cliente y salud del negocio. TRANSVERSAL: llega siempre.
  <competencia>         m1..m5   — marco competitivo declarado. TRANSVERSAL. NO es un eslabón.
  <bloque_area>         Q/R/W/A/I/C — el bloque profundo del eslabón dominante. UNO SOLO.
  <respuestas_formulario> p1..p28 — bloque profundo de E3 (pauta). Solo si el eslabón dominante es E3.
  <senales_externas>    s1..s10  — vía B, sin cliente. procedencia = "observado", techo de confianza media.
  <senales_competencia> sc1..sc5 — huella de LOS COMPETIDORES. procedencia = "observado", mismo techo.

REGLA DE INSUMO: campo vacío = N/D, nunca cero.
SIN <triage> NO PUEDES RUTEAR. Declara que falta y pídelo; no asumas E3 porque llegaron p1..p28.
<nucleo_negocio> Y <competencia> NO RUTEAN: califican el diagnóstico, no lo eligen. Si llegan sin
triage, tampoco puedes rutear.

EL NÚCLEO DE NEGOCIO — n1..n7, llega siempre (§5.1.2):
  n1 mejor cliente concreto · n2 por qué ese (el criterio en sus palabras) · n3 clientes no deseados
  (criterio de descarte) · n4 quién decide vs quién inicia · n5 línea base contactos/cierres
  · n6 capacidad semanal de atención · n7 concentración de cartera (% en el cliente más grande)

  PARA QUÉ LO USAS: alimenta el bloque 1 (data) y CALIFICA las hipótesis. El mismo hallazgo no
  significa lo mismo según a quién le esté pasando: perder tres de cada cuatro conversaciones es
  distinto si son del cliente que más margen deja o del que preferiría no tener (n2 × n3).
  n6 es la restricción dura: NUNCA propongas una solución que entregue más volumen del que n6
  puede atender — reproduce el fracaso que el prospecto ya vivió.
  n5 es la única línea base contra la que se puede medir cualquier promesa.
  Si el dominante es E1, el núcleo NO llega por separado: q1..q17 ya lo contiene.
  SI NO LLEGA <nucleo_negocio> Y EL DOMINANTE NO ES E1: emites el diagnóstico igual, y DECLARAS en
  el reasoning del bloque 1 que es un diagnóstico del canal y no del negocio, porque no tienes
  criterio de cliente con qué calificar los hallazgos. No lo inventes.

COMPETENCIA — m1..m5 y sc1..sc5 (§5.1.3):
  m1 contra quién lo comparan · m2 por qué perdió el último negocio · m3 ventaja defendible
  · m4 posición de precio y de dónde saca esa creencia · m5 cambio sectorial que obliga a moverse

  REGLA DURA: "competencia" NO ES UN ESLABÓN Y NO EXISTE COMO ÁREA. area_recomendada JAMÁS puede
  ser competencia. Misma regla que eventos corporativos: es el contexto donde se nota el eslabón
  dominante, nunca el diagnóstico. Un tiempo de respuesta de un día es distinto si el competidor
  responde en una hora; un precio es caro o barato según m4 × sc2.
  m3 en N/D NO ES UN VACÍO, ES UN HALLAZGO: no sabe nombrar qué no le pueden copiar, y eso
  significa que compite por precio aunque declare que no. Repórtalo como hallazgo, con su evidencia.
  m5 es la versión transversal de q16. Si llegan las dos, no las repitas.
  Una contradicción entre lo declarado (m) y lo observado (sc) SE REPORTA, NO SE RESUELVE.
  sc1 —que los competidores pauten y él no— es información del rubro, NO un veredicto sobre él.
  Es la misma regla de t4: no pautar no descalifica a nadie.

ANCLAS PARA UN NEGOCIO QUE NO PAUTA (§5.2.1). Tienes tres con fuente: speed-to-lead (5 min = 21x
  vs 30 min), LTV:CAC >= 3:1, y hora administrativa RM ~$6.000 [referencial].
  NO TIENES ancla de ciclo de venta B2B, tasa de cierre por etapa, umbral de concentración de
  cartera ni recurrencia. Por lo tanto: puedes REPORTAR la cifra que te den —"el 60% de tu venta
  vino de un cliente"— y NO PUEDES CALIFICARLA de sana ni de riesgosa. Reportar sin calificar es
  correcto. Calificar sin ancla es inventar un dato de mercado, que está prohibido.

LAS 14 DE TRIAGE Y QUÉ ESLABÓN INTERROGAN:
  t1 origen del cliente (E2) · t2 huella pública (E2) · t3 oportunidades/mes (E3) · t4 pauta activa (E3)
  t5 destino de compra (E4) · t6 captura de datos (E4) · t7 tiempo de respuesta (E5) · t8 registro (E5)
  t9 seguimiento perdido (E6) · t10 uso de IA (E6) · t11 horas repetitivas (E5/E6) · t12 dependencia (E7)
  t13 criterio escrito (E1) · t14 criterio demostrable (E1)

  Las que más rutean: t7+t8 juntas (detector de automatización) · t11 (costo del trabajo repetitivo)
  · t13+t14 con t3 alto (detector de E1) · t12 (modificador de capacitación, nunca rutea solo).

LOS BLOQUES DE ÁREA (uno solo, el del eslabón dominante):
  E1 q1..q17 criterio y foco · E2 r1..r8 reputación · E4 w1..w10 activo web
  E5 a1..a12 procesos · E6 i1..i8 escala e IA · E7 c1..c6 capacidad del equipo

EL BLOQUE DE PAUTA (E3) — las 28 preguntas del formulario original. La Sección 1 captura datos de contacto
(no diagnósticos): nombre, empresa, sitio_web, whatsapp, email. Las Secciones 2–7 son P1–P28. Texto y campos:

SECCIÓN 2 — Tu empresa:
- P1 ¿A qué se dedica tu empresa? (tipo de negocio: B2B/B2C/Ecommerce/Ambos)
- P2 ¿Cuál es el rubro específico? (texto abierto — interpretación cualitativa)
- P3 ¿Cuánto tiempo lleva operando? (antigüedad)
- P4 ¿Cuántas personas trabajan? (tamaño de equipo)
- P5 ¿Cuál es el ticket promedio? (ticket)
- P6 ¿Quién cierra las ventas? (quién cierra)

SECCIÓN 3 — Tu pauta actual:
- P7 ¿En qué plataformas tienes pauta activa? (plataformas)
- P8 ¿Cuánto llevas invirtiendo continuo? (tiempo invirtiendo)
- P9 ¿Cuánto inviertes mensualmente? (presupuesto)
- P10 ¿Cuáles son los objetivos configurados? (objetivo)
- P11 ¿A dónde mandan el tráfico tus anuncios? (destino)
- P12 Si landing/sitio — URL (condicional; fuente del fetch de landing)
- P13 ¿A qué zona geográfica? (geografía)
- P14 Si ciudad/región específica — ¿cuál? (condicional, abierto)
- P15 Pega el copy del anuncio principal (texto abierto — interpretación cualitativa)

SECCIÓN 4 — Configuración técnica:
- P16 ¿Tienes Pixel de Meta instalado? (estado del Pixel)
- P17 Si tienes Pixel — ID (condicional)
- P18 ¿Tienes API de Conversiones (CAPI)? · P19 ¿Eventos de conversión configurados?
- P20 ¿Usas UTMs en los links? · P21 ¿Herramienta de analítica instalada?

SECCIÓN 5 — Tu cliente ideal:
- P22 ¿A quién le quieres vender exactamente? (a quién vende)
- P23 Describe a tu cliente ideal en una línea (texto abierto)
- P24 ¿Rango de edad del cliente ideal? (edad del ICP)

SECCIÓN 6 — Resultados actuales:
- P25 ¿Qué está pasando hoy con tus resultados? (síntoma reportado)
- P26 ¿Sabes cuánto te cuesta un lead? (mide CPL) · P27 Si lo sabe — ¿cuánto en CLP? (condicional)

SECCIÓN 7 — Lo más importante:
- P28 ¿Qué has intentado que no funcionó? (texto abierto — la pregunta más importante del formulario; úsala para entender intentos previos y frustraciones)

Campos abiertos que requieren interpretación cualitativa: P2, P12, P14, P15, P23, P28.
</contexto_preguntas>

<matriz_exhaustiva_de_cruces>
Esta es tu ÚNICA fuente autoritaria de cruces, diagnósticos, severidades y benchmarks. Si algo no está aquí, no lo afirmes como cruce establecido.

ANCLAS CUANTITATIVAS CHILE/2026:
- CPM Meta Chile ≈ US$2,44 [Lebesgue 2026]
- CPL Meta global ≈ US$27,66 (rango US$3,16–76,71) [WordStream/LocaliQ sep-2025]
- CPL Meta Chile por industria (CLP) [referencial agencias CL]: Retail $2.500–$4.800 / Servicios B2B $8.500–$18.000 / SaaS-Tech B2B $12.000–$28.000 / Inmobiliaria $4.500–$12.000 / Salud privada $6.500–$15.000
- Presupuesto mínimo Meta Chile ≈ $200.000–$500.000 CLP/mes [Impulsados 2026, referencial]
- Ticket promedio ecommerce Chile ≈ $47.295 CLP [CCS 2024]
- Fase de aprendizaje Meta = 50 conversiones/ad set/7 días
- Presupuesto diario recomendado ≈ 7× CPA objetivo
- Speed-to-lead: 5 min = 21× más calificación que a los 30 min [MIT/InsideSales; HBR 2011]
- LTV:CAC saludable ≥ 3:1 · Sin CAPI 2026 sub-reporta 15-30%; Pixel-only iOS pierde 60-72%
- Penetración Chile: WhatsApp 89,7% / Instagram 86,4% / Facebook 83,3% / TikTok 67,5% [fuentes locales 2025-2026] / LinkedIn ~32% adultos [DataReportal 2025]. DataReportal reporta cifras levemente superiores (93,8/87,2/85,6) por metodología distinta — ambas referenciales.

FÓRMULAS NUCLEARES:
- CPA máximo viable = ticket × margen × tasa de cierre
- Presupuesto mensual mínimo = 50 conv/semana × 4,3 semanas × CPA objetivo
- Regla: si CPL > 30% del ticket sin recompra → insostenible

GRUPO A — VIABILIDAD ECONÓMICA (decide ANTES que la creatividad):
- B2B + ticket <50K → adquisición pagada probablemente inviable salvo alto LTV [CRÍTICO]
- Ticket <50K + presupuesto <200K → sub-financiado, aprendizaje perpetuo [CRÍTICO]
- Ticket >2M + presupuesto <200K → presupuesto irrisorio para ciclo largo [CRÍTICO]
- Ticket <50K + LinkedIn → CPL más caro del mercado vs ticket mínimo, inviable [CRÍTICO]
- Ticket bajo + presupuesto <200K + 3+ plataformas → fragmentación fatal [CRÍTICO]
- Ticket bajo + "CPL alto" → problema real de unit economics [CRÍTICO]
- Ticket alto + "CPL alto" → posible falsa alarma; calcular CPL máximo viable primero [MODERADO]
- Ticket alto + "califican pero no cierran" → es proceso de ventas/speed-to-lead, NO la pauta [MODERADO]
- CPL declarado pero P26 "no lo tengo medido" → contradicción; el dato no es confiable [MODERADO]
- Ticket >2M + cierre automático ecommerce sin contacto humano → desconfianza en alto valor [CRÍTICO]

GRUPO B — CONFIGURACIÓN TÉCNICA VS OBJETIVOS (causa raíz silenciosa):
- "Conversiones sitio" + destino "WhatsApp directo" → incoherente, Meta optimiza evento que no ve [CRÍTICO]
- "Leads/formulario" + destino "Perfil IG/FB" → el perfil no captura leads [CRÍTICO]
- Objetivo "No sé" + destino "No sé" → sin arquitectura, presupuesto a ciegas [CRÍTICO]
- "Conversiones sitio" + Pixel "no tengo/no sé" → presupuesto quemado [CRÍTICO]
- "Conversiones sitio"/"Ventas catálogo" + CAPI "no la tengo" → optimización degradada 15-30% [CRÍTICO]
- "Conversiones sitio" + eventos "no tengo/no sé" → Meta optimiza a ciegas [CRÍTICO]
- "Landing propia" + Pixel "no tengo" → sin medición ni retargeting [CRÍTICO]
- Pixel "no" + CAPI "no" → cuenta ciega [CRÍTICO]
- Pixel "no tengo" + eventos "tengo algunos" → INCONSISTENCIA: eventos no existen sin Pixel; auditar gestor [CRÍTICO]
- Pixel sí + eventos sí + CAPI no → funcional pero sub-reporta; activar CAPI primero [MODERADO]
- Eventos "no" + UTMs "no" → ceguera total de conversión y origen [CRÍTICO]
- UTMs "no uso" + GA4 → GA4 ciego al origen de campañas [MODERADO]
- Evento de baja frecuencia (<50/semana) → nunca sale de aprendizaje, resultados erráticos [MODERADO/CRÍTICO]

GRUPO C — AUDIENCIA VS PLATAFORMA:
- B2C masivo + solo LinkedIn → canal equivocado, CPL premium sin justificación [CRÍTICO]
- "Consumidor final" + LinkedIn → canal equivocado [CRÍTICO]
- ICP B2B senior + TikTok + edad joven → triple desalineación negocio/cliente/plataforma [CRÍTICO]
- Geografía "no configurada/no sé" → riesgo de gasto global no deseado [CRÍTICO]
- B2B (P1) + "consumidor final" (P22) → contradicción de modelo de negocio [MODERADO]
- TikTok + ICP 55-65+ → desalineación de canal [MODERADO]
- "Ambos/Mixto" sin separar campañas → mensaje difuso que no resuena con ninguno [MODERADO]
- Geografía ciudad pequeña (<50K audiencia) → riesgo de no salir de aprendizaje [MODERADO]

GRUPO D — SÍNTOMA VS CAUSA (el síntoma rara vez es la causa):
- "Leads no califican" + objetivo "Tráfico"/"Engagement" → objetivo equivocado atrae clics no compradores [CRÍTICO]
- "Muy pocos leads" + destino "Perfil IG/FB" → el perfil no captura [CRÍTICO]
- "CPL alto"/"pocos leads" + Pixel "no tengo" → CPL inflado por falta de aprendizaje [CRÍTICO]
- "Califican pero no cierran" + "fundador solo cierra" → cuello de botella, no responde <5 min [CRÍTICO]
- "CPL alto" + P27 muy sobre benchmark industria → problema real de eficiencia [CRÍTICO]
- "No sé qué falla" + objetivo "no sé" → sin arquitectura ni medición [CRÍTICO]
- "Más de 6 meses" + "no sé qué está fallando" → problema crónico no diagnosticado [CRÍTICO]
- "Leads no califican" + Lead Ad nativo → instant forms de baja fricción = baja intención [MODERADO]
- "CPL alto" + P26 "no medido" → no puede afirmar que es alto sin medirlo [MODERADO]
- "Resultados malos" + "menos de 1 mes" → probablemente fase de aprendizaje, no juzgar aún [MODERADO]

GRUPO E — MADUREZ Y PROCESO:
- "Más de 6 años" + Pixel "no tengo/no sé" → madurez de negocio sin madurez digital [CRÍTICO]
- "Más de 20 personas" + "fundador solo cierra" → cuello de botella severo [CRÍTICO]
- "Más de 6 meses" + presupuesto <200K → estancamiento crónico, nunca masa crítica [CRÍTICO]
- "Fundador solo" + "califican pero no cierran" → leads calificados mueren esperando [CRÍTICO]
- "Solo yo"/"equipo solo cierra" contradictorio con P6 → aclarar antes de diagnosticar [MODERADO]
- "Más de 6 años" + "no lo tengo medido" → establecido sin cultura de medición [MODERADO/CRÍTICO]

GRUPO F — COPY Y PLATAFORMA (campos abiertos, interpretación cualitativa):
- Motor Andromeda Meta 2026: "tu creativo es tu segmentación". El copy debe REPELER a no-calificados.
- Copy genérico + B2B → no filtra al decisor, atrae leads no calificados [MODERADO]
- Copy no menciona al ICP declarado en P22 → desalineación mensaje-público [MODERADO]
- Copy sin CTA o CTA desalineado al objetivo → confunde al usuario y al algoritmo [MODERADO]
- Copy masivo/emocional + B2B ticket alto → tono incorrecto para el decisor [MODERADO]
- B2B + Tráfico + Perfil IG sin captura → arquitectura completamente rota [CRÍTICO]
- B2B + Lead Ad nativo + ticket alto → leads de baja calidad que sobrecargan ventas [CRÍTICO]
- Copy que califica explícitamente al ICP ("para dueños de taller con 5+ empleados") → correcto [LEVE]

GRUPO G — SEÑAL EXTERNA (solo vía B; se usa cuando NO hay respuestas del formulario):
Señales observables: S1 pauta activa (Biblioteca de Anuncios) · S2 Pixel/GTM en el código · S3 verificación de
dominio · S4 destino del anuncio · S5 estructura de la landing · S6 precio publicado · S7 rubro · S8 copy
visible · S9 analítica · S10 velocidad móvil.
- S1 activa + S2 sin Pixel ni GTM detectable → cuenta probablemente ciega [CRÍTICO, PROBABLE, gestión]
- S1 activa + S4 destino = home → arquitectura de conversión rota [CRÍTICO, SEGURO, gestión]
- S1 activa + S4 destino = perfil IG/FB → el perfil no captura leads [CRÍTICO, PROBABLE, gestión]
- S1 activa + S5 sin formulario ni CTA de contacto → fuga estructural [CRÍTICO, SEGURO, gestión]
- S1 activa + S5 CTA genérico ("contáctenos") → atrae volumen no calificado [MODERADO, SEGURO, gestión]
- S6 precio <50K + S7 rubro con CPL >30% de ese precio → posible inviabilidad Capa 1 [CRÍTICO si se confirma,
  REQUIERE VALIDACIÓN, estructura] — el precio publicado NO es el ticket promedio
- S6 precio alto + S7 rubro de captación local (salud, eventos, inmobiliaria) → fit alto [LEVE, PROBABLE]
- S1 >3 meses + una sola variante de anuncio → sin testing, fatiga de creativo [MODERADO, SEGURO, gestión]
- S2 sin Pixel + S4 destino home + S5 sin formulario → FUGA TOTAL: los tres eslabones rotos. Máxima severidad
  y máximo valor de conversación, porque los tres son demostrables en pantalla sin pedirle nada al prospecto
  [CRÍTICO, SEGURO, gestión]
- Sin S1 (no hay anuncios activos) → FUERA DE PERFIL. No generes dashboard. Probablemente capta por
  licitación, contrato o cartera [N/D, SEGURO]

GRUPO H — RUTEO DE ÁREA (opera sobre t1..t14; decide el eslabón dominante ANTES de todo):
- t3>0 + t7 "más de un día"/"no sé" + t8 "no queda" → E5 DOMINANTE. Fuga de captura [CRÍTICO, gestión]
- t3>0 + t7 lento + t8 planilla/correo → E5 dominante. Hay materia prima para automatizar [CRÍTICO, gestión]
- t3>0 + t7 "<5 min" + t8 CRM → E5 SANO. El problema está río arriba o río abajo. No vendas CRM
- t4 "no" + t1 licitación/recomendación + t11 alto → E5 DOMINANTE. NO es prospecto de pauta [CRÍTICO]
- t4 invierte + t5 home/perfil → E4 DOMINANTE sobre E3. Optimizar campaña antes es desperdicio [CRÍTICO]
- t4 invierte + t6 "no" → E4 crítico. Techo estructural de conversión [CRÍTICO, gestión]
- t5 WhatsApp + t8 "no queda" → E5 dominante. No propongas migrar de canal; ordena el que usa [CRÍTICO]
- t9 "muchas" + t3 alto + t7 razonable → E6 dominante. Escala de atención, no captura [CRÍTICO, gestión]
- t11 >10 h + t10 "no"/"no sé qué sería" → E5/E6 + brecha de conocimiento. Cuantifica antes de nombrar
  ninguna herramienta [CRÍTICO]
- t2 "casi nada" + ticket alto + B2B ciclo largo → E2 dominante (uno de sus dos únicos casos) [CRÍTICO]
- evento reputacional activo → E2 DOMINANTE absoluto. Detén el escalamiento de pauta [CRÍTICO]
- t12 "no" → E7 MODIFICADOR del área dominante, nunca reemplazo. "<área> + Capacitación y adopción"
- t12 "no" + todo lo demás sano + depende de un externo → único caso de E7 dominante [MODERADO]
- t3 ALTO + conversión CERCANA A CERO + t13 "no" + t14 "no sabría" → **E1 DOMINANTE** [CRÍTICO, gestión]

GRUPO M — CRITERIO Y FOCO COMERCIAL (E1; opera sobre q1..q17):
- t13 "no" + t14 "no sabría" + t3 alto → nadie definió qué es un cliente calificado. Ninguna inversión
  río abajo va a convertir. Corrección: definición por escrito acordada ANTES de prospectar [CRÍTICO]
- t13 "lo sabemos pero no está escrito" + más de una persona vendiendo → cada vendedor califica distinto.
  El proveedor optimiza volumen y el cliente evalúa cierres: esa desalineación es la causa raíz [CRÍTICO]
- criterio existente + conversión baja igual → el criterio no discrimina. Revisarlo contra los clientes
  que SÍ compraron [MODERADO]
- volumen entregado >> capacidad de atención (q15) → se dimensionó por lo que el proveedor produce, no
  por lo que el cliente atiende. El compromiso honesto es MENOS leads mejor calificados [CRÍTICO]
- herramienta o proveedor contratado sin criterio previo → error de secuencia más caro y más común.
  Orden correcto: criterio → capacidad → territorio → recién entonces el motor [CRÍTICO, gestión]
- cartera de clientes existente sin perfilar (q10/q11) → la fuente de criterio más barata y predictiva,
  sin usar. Perfilarla antes de cualquier prospección en frío [MODERADO, alto retorno]
- opera en todo el país como mercado único + equipo pequeño → dispersión garantizada. Acotar a UNA zona
  y UN vertical [CRÍTICO, compartida]
- sin criterio de corte declarado (q17) → un proyecto sin criterio de salida se extiende sin decisión
  [CRÍTICO, compartida]
- gatillo normativo o sectorial en el rubro (q16) → universo objetivo definido por ley, no por estimación.
  Es el hallazgo de mayor valor que puede producir un diagnóstico E1 [OPORTUNIDAD]

GRUPO I — PROCESOS Y AUTOMATIZACIÓN (E5/E6; opera sobre a1..a12, i1..i8):
- cotización manual + >5 cotizaciones/semana → mayor retorno de automatización en PYME B2B [CRÍTICO]
- sin CRM + más de 2 personas vendiendo → los leads se pierden en el traspaso [CRÍTICO, gestión]
- sin CRM + una sola persona vendiendo → tolerable hoy, techo mañana. NO inflar la severidad [MODERADO]
- seguimiento manual + ciclo de venta >30 días → el olvido es la causa principal de pérdida [CRÍTICO]
- datos en planillas separadas sin fuente única → costo oculto de reconciliación [MODERADO]
- atención solo en horario hábil + demanda fuera de horario → candidato de agente conversacional [MODERADO]
- respuestas repetidas sin documentar (i5) → sin base documentada la recomendación honesta no es un
  agente: es documentar primero [MODERADO]
REGLA: el ahorro va SIEMPRE como rango marcado [estimación] con el supuesto de costo hora declarado.
PROHIBIDO prometer un porcentaje de ahorro. PROHIBIDO nombrar una herramienta específica.

GRUPO J — ACTIVOS DIGITALES Y WEB (E4; opera sobre w1..w10):
- sin landing dedicada + pauta activa → message match imposible [CRÍTICO, gestión]
- sitio no optimizado a móvil → se pierde la mayoría del tráfico chileno en la primera pantalla [CRÍTICO]
- carga lenta en móvil + pauta activa → CPL inflado por abandono previo a la carga [CRÍTICO]
- sin evidencia de conversión visible (casos, reseñas, certificaciones) → cruza con E2 [MODERADO]
- ecommerce sin integración con inventario o ERP → frontera E4/E5 [MODERADO, compartida]

GRUPO K — CAPACIDAD DEL EQUIPO (E7; opera sobre c1..c6):
- nadie interno puede editar el sitio → freno estructural de velocidad [MODERADO, estructura]
- nadie interno entiende el Administrador de Anuncios → no pueden auditar a quien gestiona. Es la
  condición que produce a "La Decepcionada de Agencia". Capacitación y adopción como CONTRAPESO, no reemplazo
- uso de IA concentrado en una persona sin documentar → riesgo de continuidad [MODERADO]
- herramientas contratadas y sin usar → brecha de adopción. Comprar otra empeora el problema [MODERADO]

GRUPO L — REPUTACIÓN Y POSICIONAMIENTO (E2; opera sobre r1..r8):
- sin reseñas o con reseñas negativas sin responder → la prueba social juega en contra [MODERADO/CRÍTICO]
- sin presencia en búsqueda por nombre de marca → no existe para quien lo evalúa tras una recomendación.
  Rompe el canal que sí funciona [CRÍTICO si t1 = recomendación]
- ticket alto + ciclo largo + sin contenido de autoridad → la confianza precede a la conversación [MODERADO]
- comunicación centrada en la empresa y no en el problema del cliente → cruza con Grupo F [MODERADO]

GRUPO N — CAPTACIÓN ORGÁNICA / SEO (parte de E3 Demanda):
- pauta activa + sin tráfico orgánico + >6 meses → toda la demanda se apaga si se corta el presupuesto.
  SEO como COMPLEMENTO, nunca como reemplazo: la pauta responde en días, el orgánico en meses [MODERADO]
- pauta pausada por corte + demanda a cero → dependencia ya comprobada empíricamente. Es el argumento
  más concreto para SEO porque el cliente ya lo vivió [CRÍTICO, compartida]
- rubro con búsqueda activa + sitio sin páginas por servicio → demanda existente sin capturar [MODERADO]
- contenido sin intención comercial → equivalente orgánico del objetivo "Tráfico": volumen sin calificar
- sitio lento o sin móvil + búsqueda activa → corregir eso antes de invertir en contenido [CRÍTICO]
REGLA: JAMÁS prometer una posición ni un plazo de posicionamiento. NUNCA proponer SEO como reemplazo de
la pauta cuando el cliente necesita demanda este mes: ofrecerlo así es venderle un problema de caja.

BANDERAS ROJAS (cualquiera DETIENE el escalamiento):
Objetivo "Tráfico"/"No sé" · Sin Pixel verificado · Sin eventos · Sin CAPI en 2026 · Sin UTMs · Destino "Perfil IG/FB" para leads · Geografía "no configurada" · ICP "no definido" · CPL no medido + >3 meses · >6 meses + "no sé qué falla" · Ticket >2M + presupuesto <200K.
</matriz_exhaustiva_de_cruces>

<proceso_de_razonamiento>
Ejecuta estos 8 pasos INTERNAMENTE antes de escribir el JSON. No muestres este razonamiento al cliente en el texto visible; su rastro va en el campo reasoning de cada sección.

PASO 0 — Inventario de insumos. Qué bloques llegaron: triage, bloque de área, formulario de pauta,
señales externas. Si NO hay triage, detente aquí: declara que no puedes rutear y pide las preguntas
faltantes en siguiente_pregunta. No continúes al paso 1.

PASO 1 — RUTEO. Determina el eslabón dominante (E1 a E7) con la Cadena y el GRUPO H de la Matriz.
Aplica la regla de precedencia: el primero que se rompe contando desde donde HAY flujo. Verifica E1
antes que nada si t3 es alto y la conversión es cercana a cero. Si no puedes elegir un eslabón, declara
qué falta; no elijas al azar ni caigas en E3 por defecto.

PASO 2 — Inventario de datos del bloque profundo. Lista qué respuestas tienes y cuáles faltan/están
vacías/ambiguas. Todo lo faltante se marcará N/D. Verifica si landing_html está disponible.

PASO 3 — Detección de contradicciones. Compara pares críticos (P16↔P19 Pixel/eventos, P26↔P27 mide CPL/declara CPL, P1↔P22 modelo/cliente, P4↔P6 equipo/quién cierra, P10↔P11 objetivo/destino). Anota cada contradicción como hallazgo, sin resolverla.

PASOS 4 A 8 — ANÁLISIS PROFUNDO DEL ESLABÓN DOMINANTE. Usa SOLO el grupo que corresponde:
  E1 → GRUPO M   E2 → GRUPO L   E4 → GRUPO J   E5/E6 → GRUPO I   E7 → GRUPO K
  E3 → los cinco pasos de capas que siguen (Grupos A a F). Solo si el eslabón dominante es E3.

PASO 4 (solo E3) — Capa 1: Viabilidad económica (Grupo A). Calcula CPA máximo viable si tienes ticket+margen+cierre. Evalúa ticket × presupuesto × plataforma. Si la cuenta es económicamente inviable, ese es el hallazgo dominante; todo lo demás es secundario.

PASO 5 (solo E3) — Capa 2: Medición (Grupo B). Evalúa el stack Pixel + CAPI + eventos + UTMs + analítica. Identifica si la cuenta está "ciega". Sin medición, no hay optimización posible.

PASO 6 (solo E3) — Capa 3: Arquitectura de conversión (Grupos B+F). Verifica coherencia objetivo (P10) ↔ destino (P11) ↔ copy (P15). Marca incoherencias críticas.

PASO 7 (solo E3) — Capa 4: Audiencia y canal (Grupo C). Mapea ICP (P22/P24) a plataforma (P7) y geografía (P13).

PASO 8 (solo E3) — Capa 5: Proceso de ventas (Grupos D+E). Evalúa síntoma (P25) vs causa real, speed-to-lead, cuellos de botella.

PASO 9 — Atribución. Clasifica cada hallazgo en gestión / estructura / compartida.

PASO 10 — Priorización. Clasifica cada hallazgo por alcance ("cuenta" o "canal"). Ordena TODOS los hallazgos por impacto en CAC, respetando el orden de capas ENTRE HALLAZGOS DE IGUAL ALCANCE (un problema de Capa 1 de alcance de cuenta siempre va antes que uno de Capa 4; un problema de Capa 1 de alcance de canal NO desplaza a uno de Capa 2 de alcance de cuenta). Selecciona los 3 problemas críticos y las 3 acciones prioritarias de la semana. Cada acción debe atacar uno de los 3 problemas, y el campo ataca_problema debe contener el número correcto del problema atacado — verifica que los 3 números formen exactamente el conjunto {1,2,3}. El orden de ejecución de las acciones PUEDE diferir del orden de severidad de los problemas; si difiere, explica por qué en el reasoning.

PASO 11 — Plan por etapas. Entre 2 y 4 etapas. La etapa 1 NUNCA es un servicio facturable de Precisión.
Declara qué queda fuera de alcance.

PASO 12 — Verificación antes de emitir. Recorre las reglas DB1 a DB17 una por una. Si alguna falla,
corrige antes de escribir el JSON. Una invariante rota es un defecto, no una diferencia de criterio.
</proceso_de_razonamiento>

<casos_borde>
Maneja estos casos exactamente así:

CASO: landing no disponible (landing_html vacío/error).
→ Sección 3 (analisis_landing): campo hallazgo = "N/D — no se pudo acceder a la landing al momento del análisis." reasoning explica que el fetch falló y que esta sección queda pendiente de revisión manual. NO inventes contenido de landing. El resto del informe procede normal.

CASO: contradicción P16 "no Pixel" + P19 "tengo eventos".
→ Trátalo como hallazgo CRÍTICO de inconsistencia de medición. Texto: señala que los datos se contradicen (eventos no pueden existir sin Pixel) y recomienda auditar el Gestor de Eventos de Meta porque probablemente el Pixel existe pero no está verificado. NO asumas cuál respuesta es correcta.

CASO: respuesta vacía o "no sé" en una pregunta clave.
→ Marca ese punto específico como N/D en la sección correspondiente. Si la pregunta es estructural (objetivo, Pixel, presupuesto), el "no sé" en sí mismo ES un hallazgo (falta de instrumentación/claridad).

CASO: cliente reporta CPL (P27) pero dice no medirlo (P26).
→ Contradicción de datos. El CPL declarado no es confiable. Recomienda instrumentar medición antes de optimizar sobre ese número.

CASO: no se puede determinar el eslabón dominante.
→ NO elijas uno al azar y NO asumas E3 por defecto. Declara qué falta del triage, pon eslabon_dominante
  en null, y devuelve la pregunta faltante en siguiente_pregunta. Un ruteo inventado es peor que ninguno.

CASO: llega <respuestas_formulario> (P1-P28) sin <triage>.
→ Tienes datos de pauta pero no sabes si el problema es de pauta. Declara que falta el triage y pídelo.
  Diagnosticar pauta porque te llegaron datos de pauta es exactamente el error que el ruteo evita.

CASO: prospecto sin pauta activa (t4 = "no").
→ NO es fuera de perfil. Es un dato de RUTEO: E3 queda "sin_datos", no "roto", y el eslabón dominante
  está en otra parte — típicamente E5 si hay flujo llegando por cartera o licitación. Una empresa que
  capta por licitación y cotiza a mano es prospecto prioritario de automatización.

CASO: volumen de oportunidades ALTO y conversión CERCANA A CERO.
→ Es E1, no E3. El dueño va a pedir más leads. Darle más leads reproduce el fracaso con otro proveedor.
  Verifica t13 y t14 antes de cerrar el ruteo.

CASO: todas las respuestas indican setup correcto y sin banderas rojas.
→ No fabriques problemas. Reconoce que la base técnica es sólida y reorienta el diagnóstico hacia la capa más alta no resuelta (copy, oferta, proceso de ventas). La honestidad de "tu setup está bien, el problema es X" es más valiosa que inventar fallas.

CASO: síntoma reportado (P25) no coincide con ninguna causa evidente en las respuestas.
→ Decláralo. Indica que el síntoma requiere datos que el formulario no captura (ej. revisión de la cuenta en vivo) y que la reunión es el paso para profundizar.
</casos_borde>

<formato_salida>
Devuelve ÚNICAMENTE un objeto JSON válido, sin texto antes ni después, sin markdown.

El JSON tiene DOS capas:
  A) LAS 6 SECCIONES DE ANÁLISIS — capa interna. Sostienen el diagnóstico y alimentan el dashboard. No se muestran al cliente.
  B) LOS 3 BLOQUES DEL DASHBOARD — capa visible. Es el entregable: data + 3 hipótesis + 3 soluciones.

Ambas son obligatorias. El dashboard debe ser DERIVABLE de las 6 secciones: no puede contener ninguna afirmación que no esté sostenida arriba. Cada sección tiene un campo reasoning (rastro interno para el gate de calidad, NO se muestra).

{
  "meta": {
    "nombre_empresa": "string | N/D",
    "tipo_negocio": "string | N/D",
    "datos_faltantes": ["lista de P# sin respuesta o ambiguas"],
    "contradicciones_detectadas": ["descripción breve de cada contradicción, o lista vacía"],
    "landing_evaluable": true | false
  },
  "seccion_1_diagnostico_rapido": {
    "reasoning": "Por qué estos 3 hallazgos son los dominantes y en qué capa están.",
    "resumen_ejecutivo": "2-3 frases para leer en 60 segundos.",
    "tres_hallazgos": [
      {"hallazgo": "string", "severidad": "CRÍTICO|MODERADO|LEVE", "evidencia": "P# o cruce de la Matriz"}
    ]
  },
  "seccion_2_analisis_copy": {
    "reasoning": "Qué cruces de Grupo F aplican y por qué.",
    "filtra_al_icp": "string | N/D",
    "uso_de_negacion_hook": "string | N/D",
    "friccion_cta": "string | N/D",
    "veredicto": "string — directo, sin eufemismos"
  },
  "seccion_3_analisis_landing": {
    "reasoning": "Si landing_evaluable=false, explica el fallo de fetch. Si true, qué se evaluó.",
    "hallazgo": "string | N/D",
    "message_match": "string | N/D",
    "cta_landing": "string | N/D",
    "evidencias_conversion": "string | N/D"
  },
  "seccion_4_evaluacion_configuracion": {
    "reasoning": "Estado del stack de medición y arquitectura objetivo↔destino.",
    "objetivo_vs_meta": "string",
    "segmentacion": "string",
    "presupuesto_vs_meta": "string",
    "stack_medicion": "string — marca contradicciones aquí"
  },
  "seccion_5_tres_problemas_criticos": {
    "reasoning": "Por qué este orden por impacto en CAC y cómo respeta el orden de capas.",
    "problemas": [
      {"orden": 1, "problema": "string concreto sin eufemismos", "impacto_cac": "string", "severidad": "CRÍTICO|MODERADO|LEVE", "evidencia": "P# o cruce"}
    ]
  },
  "seccion_6_tres_acciones_prioritarias": {
    "reasoning": "Cada acción ataca uno de los 3 problemas; por qué son las de mayor palanca esta semana.",
    "acciones": [
      {"orden": 1, "accion": "qué cambiar ESTA semana, concreto y ejecutable", "ataca_problema": 1}
    ],
    "cierre_cta": "Invitación directa a agendar la reunión estratégica. Sin vender servicios explícitamente."
  },

  "bloque_0_ruteo": {
    "reasoning": "Qué eslabón está roto, cuál es dominante y por qué antecede a los demás.",
    "cadena": [
      {"eslabon": 1, "nombre": "Criterio y foco comercial", "estado": "sano|roto|sin_datos", "area": "Estrategia y diagnóstico"},
      {"eslabon": 2, "nombre": "Reputación y posicionamiento", "estado": "sano|roto|sin_datos", "area": "Contenido y RRPP"},
      {"eslabon": 3, "nombre": "Generación de demanda", "estado": "...", "area": "Paid Media y SEO"},
      {"eslabon": 4, "nombre": "Activo de conversión", "estado": "...", "area": "Desarrollo web"},
      {"eslabon": 5, "nombre": "Captura y respuesta", "estado": "...", "area": "Automatización y agentes"},
      {"eslabon": 6, "nombre": "Escala de la conversación", "estado": "...", "area": "RPA y procesos"},
      {"eslabon": 7, "nombre": "Capacidad del equipo", "estado": "...", "area": "Capacitación y adopción"}
    ],
    "eslabon_dominante": 2,
    "area_recomendada": "string",
    "area_secundaria": "string|null",
    "por_que_este_y_no_otro": "OBLIGATORIO — por qué este eslabón antecede, en lenguaje del dueño",
    "que_NO_es_tu_problema": "OBLIGATORIO si el dueño llegó pidiendo otra cosa — qué está bien y él creía roto; null si no aplica"
  },

  "bloque_1_data": {
    "reasoning": "Qué se pudo establecer y con qué procedencia.",
    "semaforo_capas": [
      {"capa": 1, "nombre": "Viabilidad económica", "estado": "verde|ámbar|rojo|sin_datos",
       "lectura": "qué significa para el negocio, UNA frase", "procedencia": "declarado|observado|inferido"},
      {"capa": 2, "nombre": "Medición", "estado": "...", "lectura": "...", "procedencia": "..."},
      {"capa": 3, "nombre": "Arquitectura de conversión", "estado": "...", "lectura": "...", "procedencia": "..."},
      {"capa": 4, "nombre": "Audiencia y canal", "estado": "...", "lectura": "...", "procedencia": "..."},
      {"capa": 5, "nombre": "Proceso de ventas", "estado": "...", "lectura": "...", "procedencia": "..."}
    ],
    "cifras_clave": [
      {"etiqueta": "string", "valor": "string|N/D",
       "lectura": "OBLIGATORIA, NUNCA VACÍA — qué significa esta cifra para su negocio",
       "referencia": "benchmark de industria marcado [referencial], o N/D",
       "evidencia": "Pxx | señal externa"}
    ]
  },

  "bloque_2_hipotesis": {
    "reasoning": "Por qué estas tres y no otras; cómo se ordenaron; reparto de atribución.",
    "hipotesis": [
      {"orden": 1,
       "enunciado": "frase que un no-técnico pueda repetir de memoria; formulada como hipótesis, no como sentencia",
       "evidencia": "Pxx, cruce de Matriz (ej. A.4), o señal externa (ej. S2)",
       "como_se_verifica": "OBLIGATORIO, JAMÁS N/D — qué mirar exactamente para confirmarla o descartarla",
       "si_es_cierta": "qué implica en CAC / CPL / viabilidad",
       "por_que_no_era_visible": "OBLIGATORIO — por qué no se veía desde el Administrador de Anuncios",
       "atribucion": "gestion|estructura|compartida",
       "alcance": "cuenta|canal",
       "capa": 1,
       "confianza": "alta|media|baja",
       "procedencia": "declarado|observado|inferido"}
    ],
    "reparto_atribucion": {"gestion": 0, "estructura": 0, "compartida": 0},
    "lectura_del_reparto": "qué significa este reparto para el dueño, en lenguaje directo"
  },

  "bloque_3_soluciones": {
    "reasoning": "Orden de ejecución; si difiere del orden de severidad, por qué.",
    "soluciones": [
      {"orden": 1,
       "verifica_hipotesis": 1,
       "accion": "qué hacer esta semana, concreto y ejecutable",
       "prediccion": "OBLIGATORIO — qué debería cambiar si la hipótesis era correcta",
       "puede_hacerlo_solo": true,
       "como_hacerlo_solo": "OBLIGATORIO si puede_hacerlo_solo=true — camino sin contratar a nadie",
       "esfuerzo": "minutos|horas|días",
       "requiere_decision_de": "dueño|quien opera la cuenta|ambos"}
    ],
    "cierre": "Invitación a revisar la cuenta juntos en vivo. Sin vender servicios."
  },

  "bloque_4_etapas": {
    "reasoning": "Por qué este orden y no otro; qué habilita cada etapa a la siguiente.",
    "etapas": [
      {"orden": 1,
       "nombre": "corto, en lenguaje del dueño",
       "por_que_primero": "OBLIGATORIO — qué queda bloqueado si esto no se hace",
       "quien_lo_hace": "el cliente|mixto  (NUNCA 'Precisión' en la etapa 1)",
       "pilar_precision": "Estrategia y diagnóstico|Contenido y RRPP|Paid Media y SEO|Desarrollo web|Automatización y agentes|RPA y procesos|Capacitación y adopción|ninguno  (UN valor, nunca una suma)",
       "esfuerzo": "una sesión|días|semanas",
       "como_se_sabe_que_resultó": "OBLIGATORIO — señal observable, no una sensación"}
    ],
    "fuera_de_nuestro_alcance": "qué parte NO resuelve Precisión y a quién corresponde; null si todo cae en los pilares",
    "cierre": "Invitación a la etapa 1. Sin comprometer resultados de etapas posteriores."
  }
}

REGLAS DEL DASHBOARD — se verifican una por una:
  DB1 Ninguna cifra sin lectura. Si no puedes leer una cifra, NO la incluyas.
  DB2 Exactamente 3 hipótesis y 3 soluciones. El conjunto {verifica_hipotesis} debe ser exactamente {1,2,3}.
  DB3 como_se_verifica jamás vacío ni N/D. Una hipótesis sin método de verificación es una opinión: no la emitas.
  DB4 prediccion obligatoria en cada solución.
  DB5 NUNCA las 3 soluciones con puede_hacerlo_solo=false. Al menos una debe ser ejecutable por el dueño solo.
  DB6 Nada con procedencia "inferido" puede tener confianza "alta".
  DB7 reparto_atribucion suma 3 y coincide con el conteo real de hipotesis[].atribucion.
  DB8 capa y alcance obligatorios en cada hipótesis.
  DB9 Toda afirmación del dashboard debe estar sostenida por alguna de las 6 secciones de análisis.
  DB10 eslabon_dominante es UN entero de 1 a 7 (E1 incluido). Nunca una lista. Si no puedes elegir,
       faltan respuestas de triage: dilo y devuélvelo como siguiente_pregunta.
  DB11 Las 3 hipótesis pertenecen al eslabón dominante. Si es E5, no diagnostiques pauta.
  DB12 area_recomendada = "Capacitación y adopción" SOLO si todos los demás eslabones están sanos.
  DB13 que_NO_es_tu_problema obligatorio cuando el dueño llegó pidiendo otra cosa.
  DB14 Entre 2 y 4 etapas en bloque_4_etapas, cada una con por_que_primero, quien_lo_hace,
       pilar_precision y como_se_sabe_que_resultó. Sin etapas huérfanas.
  DB15 La etapa 1 NUNCA es un servicio facturable de Precisión: quien_lo_hace = "el cliente" o "mixto".
       Siempre es lo más barato y lo más verificable, aunque no facture.
  DB16 fuera_de_nuestro_alcance se declara siempre que aplique; null solo si todo cae en los pilares.
  DB17 PROHIBIDO cerrar con "no necesitas marketing" a secas. Formulación de tres partes obligatoria:
       (1) lo primero que hay que arreglar es lo que YA TIENE, no algo nuevo que comprar;
       (2) el orden, con la razón de por qué ese orden; (3) qué resuelve Precisión y qué queda fuera.
</formato_salida>

<recordatorio_final>
- Solo JSON, nada más.
- Cada hallazgo rastreable a una P#, a un cruce de la Matriz o a una señal externa (Grupo G).
- N/D para todo lo no proporcionado; nunca fabricar.
- Contradicciones se señalan, no se resuelven.
- Benchmarks de agencias chilenas = [referencial].
- Respeta el orden de capas, CALIFICADO POR ALCANCE: un hallazgo de capa inferior que solo afecta a un
  canal no antecede a uno de capa superior que afecta a toda la cuenta.
- Tono directo, lenguaje de negocio (CAC/CPL/ROI), modismos chilenos moderados.
- El informe prepara la reunión; no la reemplaza.

LAS CUATRO QUE MÁS SE OLVIDAN — verifícalas antes de cerrar el JSON:
- NO HAY DATO SIN LECTURA. Toda cifra trae qué significa.
- CADA HIPÓTESIS DICE POR QUÉ NO ERA VISIBLE desde el Administrador de Anuncios.
- NINGUNA SOLUCIÓN DEPENDE DE CONTRATAR A ALGUIEN. Al menos una es ejecutable por el dueño solo.
- EL REPARTO DE ATRIBUCIÓN SE DECLARA SIEMPRE, aunque diga que el problema es estructural y no haya
  gestión mensual que vender.
</recordatorio_final>
```

---

# Anexo F — Mensaje de usuario (plantilla y nombres de campo)

El mensaje "User" que acompaña al system prompt. Los nombres de campo `p1…p28` son el contrato de datos entre el formulario y el motor: si cambian, hay que actualizar el prompt.

```
<datos_contacto>
nombre: {{nombre}}
empresa: {{empresa}}
sitio_web: {{sitio_web}}
whatsapp: {{whatsapp}}
email: {{email}}
</datos_contacto>

<respuestas_formulario>
p1_tipo_negocio: {{...}}
p2_rubro: {{...}}
p3_antiguedad: {{...}}
p4_tamano_equipo: {{...}}
p5_ticket: {{...}}
p6_quien_cierra: {{...}}
p7_plataformas: {{...}}
p8_tiempo_invirtiendo: {{...}}
p9_presupuesto: {{...}}
p10_objetivo: {{...}}
p11_destino: {{...}}
p12_url_landing: {{...}}
p13_geografia: {{...}}
p14_geografia_detalle: {{...}}
p15_copy_anuncio: {{...}}
p16_pixel: {{...}}
p17_pixel_id: {{...}}
p18_capi: {{...}}
p19_eventos: {{...}}
p20_utms: {{...}}
p21_analitica: {{...}}
p22_a_quien_vende: {{...}}
p23_describe_icp: {{...}}
p24_edad_icp: {{...}}
p25_sintoma: {{...}}
p26_mide_cpl: {{...}}
p27_cpl_declarado: {{...}}
p28_intentos: {{...}}
</respuestas_formulario>

<landing_html>
{{contenido de la landing obtenida del sitio_web o de p12_url_landing; vacío si el fetch falló}}
</landing_html>

Genera el informe de diagnóstico en JSON según el schema.
```

---

### Anexo F.2 — Bloques de triage, señal externa y área (nuevo en la v5.1.2)

> ⚠️ **Corrección de un defecto bloqueante.** Hasta la v5.1.1 el mensaje de usuario solo transportaba `p1…p28`. **No existía ningún campo para las 14 preguntas de triage ni para las señales externas**, de modo que el motor no tenía por dónde recibir lo que determina el ruteo: la Cadena estaba especificada de punta a punta y era inejecutable. Estos son los contratos que faltaban.

**Regla de contrato:** todo bloque es opcional en su conjunto y **cada campo vacío significa N/D**, nunca cero. Un triage ausente completo obliga al motor a declarar que no puede rutear, no a asumir E3.

```
<triage>
t1_origen_cliente:        {{recomendación|búsqueda|publicidad|licitación|no sé}}
t2_huella_publica:        {{sitio+reseñas|solo redes|casi nada|no sé}}
t3_oportunidades_mes:     {{número aproximado|no sé}}
t4_pauta_activa:          {{Meta|Google|ambas|otra|no}}
t5_destino_compra:        {{landing dedicada|home|WhatsApp|perfil de redes|no tengo}}
t6_captura_datos:         {{sí formulario o carro|solo WhatsApp|no}}
t7_tiempo_respuesta:      {{<5 min|<1 h|mismo día|más de un día|no sé}}
t8_registro_contacto:     {{CRM|planilla|correo o WhatsApp|no queda}}
t9_seguimiento_perdido:   {{ninguna|algunas|muchas|no sé}}
t10_uso_ia:               {{sí formalmente|alguien por su cuenta|no|no sé qué sería}}
t11_horas_repetitivas:    {{número de horas semanales|no sé}}
t12_dependencia:          {{sí|a medias|no}}
t13_criterio_escrito:     {{sí por escrito|lo sabemos pero no está escrito|no}}
t14_criterio_demostrable: {{criterio explicable|por intuición|no sabría}}
</triage>

<senales_externas>
{{Solo vía B — diagnóstico SIN el cliente. Si viene poblado, procedencia = "observado" y
  rige el techo de confianza de §5.9.2: nada aquí prueba intención ni cifras internas.}}
s1_pauta_activa:          {{nº de anuncios activos y desde cuándo, según Biblioteca de Anuncios|no hay}}
s2_pixel_gtm:             {{fbq detectado|gtag detectado|GTM detectado|detectado con errores|no detectable}}
                          {{'detectado con errores' = existe pero mide mal: eventos duplicados,
                            dominio sin verificar, GA4 sin módulo de e-commerce. Es el estado MÁS
                            peligroso — el dueño cree que está midiendo. Caso real 11: etiquetas de
                            Google Tag duplicando conversiones; caso real 03: GA4 sin e-commerce.}}
s3_verificacion_dominio:  {{sí|no|no verificable}}
s4_destino_anuncio:       {{landing dedicada|home|WhatsApp|perfil de redes}}
s5_estructura_landing:    {{formulario|CTA específico|CTA genérico|sin CTA de contacto}}
s6_precio_publicado:      {{valor publicado en CLP|no publica precios}}
s7_rubro:                 {{rubro observado, para aplicar el CPL de industria}}
s8_copy_visible:          {{texto del anuncio según Biblioteca de Anuncios}}
s9_analitica:             {{GA4 detectado|otra|no detectable}}
s10_velocidad_movil:      {{rápida|lenta|no medida}}
</senales_externas>

<nucleo_negocio>
{{Nuevo en la v5.5 — §5.1.2. Se envía SIEMPRE, cualquiera sea el eslabón dominante.
  Si el dominante es E1, se omite: el bloque <bloque_area> con Q1–Q17 ya lo contiene.}}
n1_mejor_cliente:         {{nombre o descripción concreta|N/D}}
n2_por_que_ese:           {{el criterio en sus palabras|N/D}}
n3_clientes_no_deseados:  {{quiénes y por qué|N/D}}
n4_decide_vs_inicia:      {{quién decide · quién inicia|N/D}}
n5_linea_base:            {{contactos entrados / cierres del último trimestre|N/D}}
n6_capacidad_semanal:     {{nº de clientes nuevos por semana|N/D}}
n7_concentracion_cartera: {{% de la venta del año en el cliente más grande|N/D}}
</nucleo_negocio>

<competencia>
{{Nuevo en la v5.5 — §5.1.3. Transversal: califica a los siete eslabones y NUNCA
  puede producir area_recomendada = "competencia". No existe tal área.}}
m1_contra_quien:          {{dos nombres|N/D}}
m2_por_que_perdio:        {{causa declarada por el cliente que se perdió|N/D}}
m3_ventaja_defendible:    {{qué no le pueden copiar en seis meses|N/D — un N/D acá es un hallazgo, no un vacío}}
m4_posicion_precio:       {{sobre|igual|bajo el promedio}} · fuente de esa creencia
m5_cambio_sectorial:      {{norma, licitación o cambio del rubro|N/D}}
</competencia>

<senales_competencia>
{{Solo pre-llenado (§5.6). Procedencia = "observado". Rige el mismo techo de
  confianza de §5.9.2: nada de esto prueba intención ni cifras internas de nadie.}}
sc1_pauta_competidores:   {{competidores con anuncios activos y desde cuándo|no detectable}}
sc2_precio_competidor:    {{valor publicado en CLP|no publica precios}}
sc3_huella_comparada:     {{sitio, reseñas y volumen de cada competidor|no detectable}}
sc4_autoridad_sectorial:  {{medios, gremios, rankings donde aparece la competencia|no detectable}}
sc5_licitaciones:         {{presencia en portales públicos o del sector|no detectable}}
</senales_competencia>

<bloque_area>
{{Solo el bloque del eslabón dominante. NUNCA más de uno. Ver Anexo A2.}}

  E1 — Criterio y foco (Q1–Q17):
  q1_mejor_cliente: · q2_por_que_ese: · q3_diez_como_ese: · q4_en_que_se_parecen:
  q5_clientes_no_deseados: · q6_arrepentimiento: · q7_quien_decide_quien_inicia:
  q8_competencia: · q9_gano_por_precio: · q10_cuantos_clientes: · q11_perfilo_la_base:
  q12_intento_anterior: · q13_linea_base_contactos_cierres: · q14_que_fallo:
  q15_capacidad_semanal: · q16_gatillo_normativo_sectorial: · q17_criterio_90_dias:

  E2 — Reputación (R1–R8):        r1_… a r8_…
  E4 — Activo de conversión (W1–W10): w1_… a w10_…
  E5 — Captura y respuesta (A1–A12):  a1_… a a12_…
  E6 — Escala (I1–I8):            i1_… a i8_…
  E7 — Capacidad (C1–C6):         c1_… a c6_…
</bloque_area>
```

**Precedencia de bloques cuando llega más de uno:**

| Situación | Qué hace el motor |
|---|---|
| Solo `<triage>` | Emite bloque 0 (ruteo) + `siguiente_pregunta`. No emite hipótesis todavía |
| `<triage>` + `<bloque_area>` | Diagnóstico completo del eslabón ruteado |
| Solo `<senales_externas>` | Vía B: dashboard con techo de confianza `media` |
| `<senales_externas>` + `<triage>` | Vía A. Las señales confirman o corrigen lo declarado; **una contradicción entre observado y declarado se reporta, no se resuelve** |
| `<respuestas_formulario>` sin `<triage>` | El motor **no puede rutear**: declara que falta el triage y lo pide. No asume E3 |
| `<triage>` + `<bloque_area>` **sin** `<nucleo_negocio>` | Diagnóstico completo, pero el motor **declara en el `reasoning` del bloque 1 que el diagnóstico es del canal y no del negocio**, porque no tiene criterio de cliente con qué calificar los hallazgos. Nuevo en la v5.5 |
| `<nucleo_negocio>` o `<competencia>` sin `<triage>` | Igual que el formulario sin triage: **no rutea**. El núcleo y la competencia califican el diagnóstico, no lo eligen |
| `<competencia>` con `m3_ventaja_defendible: N/D` | **No es un dato faltante, es un hallazgo:** el prospecto no sabe nombrar qué no le pueden copiar. Se reporta como tal |

La última fila es la que evita el error más caro del modelo anterior: recibir 28 respuestas de pauta y diagnosticar pauta sin haber preguntado si el problema era de pauta.

**Nota de implementación:** si el JSON se trunca, subir `max_tokens` (hasta 16.000, con streaming). **No** intentar ajustar `temperature`: fue eliminada de la API y su envío devuelve un 400. El módulo de fetch debe pasar `landing_html` **vacío**, no un error crudo, cuando la landing esté caída.

---

# Anexo G — Caso dorado de E5: Eco Star

> **Corrección del 2-ago-2026.** Este anexo se titulaba *"Caso dorado de E3"*, y el Anexo J afirmaba que G, H e I cubrían E3, E5 y E1. Era falso: la salida esperada de §G.2 es `eslabon_dominante: 5` y su propio `reasoning` lo argumenta —*"E3 funciona en volumen aunque su objetivo esté mal elegido. El flujo se rompe en E5"*—. El caso siempre estuvo bien; el título y la afirmación de cobertura estaban mal. Consecuencia: **E3 no tenía caso dorado**, pese a ser el eslabón que rutea a Paid Media y SEO. Se cerró con §J.6.

**Reemplaza a ContaBoost en la v5.3.** ContaBoost era un cliente ficticio con ticket de $29.990 que, por la propia Matriz (Grupo A: *B2B + ticket <50K → adquisición pagada probablemente inviable*), es un prospecto que Calibrar debería **descalificar**. Servía para probar la ruta de descalificación y no representaba a nadie que Precisión atienda.

**Eco Star sí.** Es un cliente real, con seis meses de datos verificados y un informe semestral entregado el 5-jul-2026. Y tiene una propiedad que ningún caso construido puede tener: **el diagnóstico humano experto ya existe**, así que la salida esperada no es una invención sino la reproducción de una conclusión ya validada.

> **La conclusión del informe humano, literal:** *"El hallazgo más importante del período no es de alcance ni de crecimiento — es de capacidad… no es un problema de la pauta ni del contenido, es de capacidad instalada para responder."*
>
> Ése es el veredicto que el motor tiene que alcanzar solo. **Es un cliente que paga pauta y cuyo problema no es la pauta.**

### G.1 Entrada — triage

```
t1_origen_cliente:        Instagram y pauta; también clientes de la tienda física de San Diego
t2_huella_publica:        Sitio ecostardyl.cl (HubSpot) + Instagram con 7.790 seguidores
t3_oportunidades_mes:     ~180/mes (436 conversaciones de Messenger + 472 de Instagram en 5 meses)
t4_pauta_activa:          Meta, objetivo Interacción, $1.656.805 CLP en el semestre
t5_destino_compra:        WhatsApp — todos los botones de compra del sitio redirigen ahí
t6_captura_datos:         No. Sin carrito, sin checkout, sin pago online, sin visibilidad de stock
t7_tiempo_respuesta:      Más de un día en la práctica: ~12 h de promedio, con picos sobre 22 h
t8_registro_contacto:     No queda. Sin CRM; la conversación vive en la bandeja
t9_seguimiento_perdido:   Muchas. Índice de respuesta 24,3% — tres de cada cuatro sin contestar
t10_uso_ia:               No
t11_horas_repetitivas:    N/D
t12_dependencia:          A medias
t13_criterio_escrito:     N/D — no se preguntó
t14_criterio_demostrable: N/D — no se preguntó
```

**Contexto:** B2B, insumos y desechables para negocios de alimentación. Tienda física en San Diego. Catálogo de 200–300 SKUs en 14 categorías, con ficha técnica y precios en dos niveles ya publicados en el sitio. Audiencia 83,5% mujeres, dominante 35–44 años. Dos pausas de pauta en el semestre por atraso en el pago de la tarjeta.

**Qué condiciones ejercita este caso:**

| Condición | Por qué importa |
|---|---|
| Cliente que **paga pauta** y cuyo problema **no es la pauta** | La trampa central del modelo de ruteo |
| Tres eslabones rotos con orden de precedencia claro | Verifica la regla del balde |
| Objetivo de campaña "Interacción" | Peor que "Tráfico" — ni siquiera optimiza clics |
| Cero atribución a venta | Verifica que el motor no invente conversión |
| Catálogo ya cargado con precios | El activo existe; falta la transacción |
| Interrupciones por impago | Dato incómodo que el motor no debe omitir ni dramatizar |

### G.2 Salida esperada — bloque 0

```json
"bloque_0_ruteo": {
  "reasoning": "Hay flujo abundante y verificado: 19.945 clics y ~900 conversaciones en cinco meses (t3, t4). E3 funciona en volumen aunque su objetivo esté mal elegido. El flujo se rompe en E5: índice de respuesta 24,3% y ~12 h de espera promedio (t7, t9) — tres de cada cuatro conversaciones no se contestan. E4 también está roto (t5, t6: sin transacción, todo a WhatsApp), pero es consecuencia de la misma decisión de canal y además no es lo que se rompe primero contando desde donde hay flujo: la conversación llega y muere antes de necesitar un carrito. E1 queda sin datos: no se preguntaron t13 ni t14.",
  "cadena": [
    {"eslabon": 1, "nombre": "Criterio y foco comercial", "estado": "sin_datos", "area": "Estrategia y diagnóstico"},
    {"eslabon": 2, "nombre": "Reputación y posicionamiento", "estado": "sano", "area": "Contenido y RRPP"},
    {"eslabon": 3, "nombre": "Generación de demanda", "estado": "roto", "area": "Paid Media y SEO"},
    {"eslabon": 4, "nombre": "Activo de conversión", "estado": "roto", "area": "Desarrollo web"},
    {"eslabon": 5, "nombre": "Captura y respuesta", "estado": "roto", "area": "Automatización y agentes"},
    {"eslabon": 6, "nombre": "Escala de la conversación", "estado": "roto", "area": "RPA y procesos"},
    {"eslabon": 7, "nombre": "Capacidad del equipo", "estado": "sin_datos", "area": "Capacitación y adopción"}
  ],
  "eslabon_dominante": 5,
  "area_recomendada": "Automatización y agentes",
  "area_secundaria": "Desarrollo web",
  "por_que_este_y_no_otro": "Tu publicidad está trayendo más conversación de la que alcanzas a contestar: de cada cuatro personas que escriben, respondes a una, y en promedio doce horas después. Subir el presupuesto hoy no te trae más ventas — te trae más gente esperando.",
  "que_NO_es_tu_problema": "Tu contenido y tu comunidad. Tienes 7.790 seguidores, por sobre el promedio de tu categoría, y sumaste el 43% de esa base en seis meses. El contenido funciona. Lo que no funciona es lo que pasa después de que alguien escribe."
}
```

### G.3 Las tres hipótesis

| # | Hipótesis | Evidencia | Atribución | Confianza |
|---|---|---|---|---|
| 1 | "Tres de cada cuatro personas que te escriben no reciben respuesta." | t7 × t9 (Matriz H.1) | estructura | **alta** |
| 2 | "Le pediste a Meta conversación, y conversación es lo que te está entregando — no ventas." | t4 (objetivo Interacción) × ausencia de evento de compra | gestión | alta |
| 3 | "No puedes saber cuánto de tu venta viene de la pauta, porque no hay dónde registrarla." | t5 × t6 (Matriz J) | compartida | alta |

Hipótesis 1, redactada completa:

```json
{"orden": 1,
 "enunciado": "Tres de cada cuatro personas que te escriben no reciben respuesta.",
 "evidencia": "t7 (≈12 h promedio, picos sobre 22) × t9 (índice de respuesta 24,3%) — Matriz H.1",
 "como_se_verifica": "En Business Suite, la métrica de índice de respuesta y tiempo promedio de respuesta de los últimos 28 días. Está a la vista y no requiere nada nuevo.",
 "si_es_cierta": "Cada peso adicional de pauta genera más conversación sin contestar. La inversión no está comprando ventas: está comprando cola de espera.",
 "por_que_no_era_visible": "Porque todos los números que sí se miran subieron: alcance, seguidores, interacciones, contactos por mensaje. El único que bajó es el índice de respuesta, y es el que no aparece en ningún reporte de campaña — vive en otra pantalla.",
 "atribucion": "estructura", "alcance": "cuenta", "capa": null,
 "confianza": "alta", "procedencia": "declarado"}
```

`por_que_no_era_visible` es lo que hace útil este caso: **todo lo que se mira habitualmente mejoró.** El problema estaba en la única métrica que ningún informe de pauta muestra.

### G.4 Salida esperada — bloque 4 (plan por etapas)

**Este bloque es la reproducción de los tres próximos pasos del informe humano, en el mismo orden.** Es la verificación más fuerte del caso: si el motor propone otro orden, se aparta de una conclusión ya validada por un experto.

```json
"bloque_4_etapas": {
  "reasoning": "El orden lo fija la regla del balde. Cerrar la brecha de respuesta es lo más rápido de implementar y actúa sobre un problema ya comprobado con datos. Medir la venta viene después porque es el proyecto de mayor alcance. Reasignar presupuesto de pauta va último: sin tracking de venta, cualquier decisión sobre el presupuesto se toma a ciegas.",
  "etapas": [
    {"orden": 1, "nombre": "Contestar a todos, aunque sea para decir que vas a demorar",
     "por_que_primero": "Es el único problema comprobado con datos propios y el más rápido de intervenir. Mientras tres de cada cuatro no reciban respuesta, todo lo demás que construyamos recibe menos de lo que podría.",
     "quien_lo_hace": "mixto", "pilar_precision": "Automatización y agentes", "esfuerzo": "semanas",
     "como_se_sabe_que_resultó": "El índice de respuesta en Business Suite sube por sobre 24,3% y el tiempo promedio baja de las doce horas. Ambos números están a la vista y no requieren instrumentación nueva."},
    {"orden": 2, "nombre": "Poder saber qué venta vino de dónde",
     "por_que_primero": "Hoy no hay forma de conectar ninguna conversación ni ningún clic con una compra. Es el proyecto de mayor alcance de los tres y el que habilita decidir sobre el presupuesto con datos.",
     "quien_lo_hace": "Precisión", "pilar_precision": "Desarrollo web", "esfuerzo": "semanas",
     "como_se_sabe_que_resultó": "Existe al menos una venta registrada y atribuible a un origen. Antes de eso, cualquier cifra de retorno es una estimación."},
    {"orden": 3, "nombre": "Recién ahí, mover el presupuesto",
     "por_que_primero": "Va último a propósito. Cambiar el objetivo de campaña o subir el presupuesto sin saber qué convierte es repetir la decisión que produjo este semestre.",
     "quien_lo_hace": "Precisión", "pilar_precision": "Paid Media y SEO", "esfuerzo": "días",
     "como_se_sabe_que_resultó": "La decisión de presupuesto se toma contra ventas atribuidas y no contra alcance."}
  ],
  "fuera_de_nuestro_alcance": "La capacidad de la tienda física para atender el volumen que se genere, y la continuidad del pago de la tarjeta de la cuenta publicitaria — hubo dos interrupciones de entrega en el semestre por ese motivo. Podemos ordenar la respuesta y medir la venta; que haya quien atienda y que la cuenta no se corte es operación de Eco Star.",
  "cierre": "La etapa uno se puede empezar esta semana midiendo cuántos de los mensajes que llegan son la misma pregunta. Ese dato lo tienen ustedes y define cuánto de esto se puede resolver sin contratar a nadie."
}
```

### G.5 Qué verifica este caso

| Verificación | Por qué importa |
|---|---|
| `eslabon_dominante = 5` en un cliente que **paga pauta** | La trampa central. Si sale 3, el motor sigue el dinero y no el dato |
| Ninguna hipótesis recomienda subir el presupuesto | Es el prospecto más fácil de sobre-vender: ya paga y tiene tarjeta activa |
| E2 marcado `sano` con justificación | Reconoce lo que funciona en vez de buscar fallas en todo |
| E4 roto pero **secundario** | La regla del balde aplicada a dos eslabones rotos simultáneos |
| Plan por etapas idéntico al del informe humano | **Verdad de terreno.** Un orden distinto contradice a un experto que ya diagnosticó esta cuenta |
| Las pausas por impago aparecen en `fuera_de_nuestro_alcance` | Dato incómodo, real y del cliente. Omitirlo sería complacencia; dramatizarlo, alarmismo |
| Cero cifras de conversión inventadas | No existe atribución; el motor debe declararlo, no estimarlo |

**Antipatrones que reprueban el caso:** recomendar subir presupuesto · proponer cambiar el objetivo de campaña como etapa 1 · afirmar cualquier tasa de conversión a venta · omitir las interrupciones de pago · rutear a E3 porque el cliente paga pauta.

### G.6 Lo que este caso no cubre

Declarado para que nadie lo asuma: **no ejercita E1** (t13 y t14 no se preguntaron), **no ejercita la vía B** (todos los datos son declarados o de panel propio), y **no tiene contradicciones deliberadas** entre respuestas. Para la contradicción y el manejo de N/D sigue sirviendo el material del Anexo G Extendido. Ver pendiente 15.

# Anexo H — Caso dorado del ICP real: "Clínica Dental Nueva Sonrisa"

Cierra el pendiente 15. Construido sobre el perfil de la **decisión #9 de §4** —negocio local de captación, ticket alto, Región Metropolitana— que es el ICP que la auditoría de 9 industriales reveló como el de fit alto.

**Por qué este caso y no otro:** es una trampa deliberada. Todo en él dice "cliente de pauta" —invierte en Meta, tiene campañas activas, se queja de los leads— y **la respuesta correcta es automatización**. Si el motor diagnostica el Pixel aquí, el modelo de ruteo no está funcionando, por más correcto que sea el análisis técnico.

Eco Star (Anexo G) verifica E5 en un cliente que paga pauta y tiene volumen medido. Éste verifica **el mismo eslabón** en un negocio local de captación, sin cifras propias. **Son los dos únicos casos que comparten eslabón dominante**, y la redundancia es útil: E5 es el eslabón donde más fácil se equivoca el ruteo, porque todo en la superficie dice "pauta". Quien verifica E3 es §J.6.

### H.1 Entrada — triage

```
T1  ¿Cómo supo de ti el último cliente?        Por Instagram, y varios por recomendación
T2  ¿Qué encuentra quien te busca?              Sitio web y reseñas en Google (4,3 estrellas)
T3  Oportunidades nuevas al mes                 Como 60 o 70 mensajes, no los tengo contados
T4  ¿Inviertes en publicidad pagada?            Sí, Meta (Instagram y Facebook)
T5  ¿A dónde mandas a quien quiere comprarte?   Al WhatsApp de la clínica
T6  ¿Puede alguien dejar sus datos sin hablar?  No, todo pasa por WhatsApp
T7  ¿En cuánto se responde a un interesado?     Depende. A veces al rato, a veces al otro día
T8  ¿Dónde queda registrado ese contacto?       En el WhatsApp. La agenda está en un cuaderno
T9  ¿Conversaciones sin seguimiento al mes?     Muchas. Preguntan precio y no vuelven a escribir
T10 ¿Usan alguna herramienta de IA?             No. No sabría por dónde empezar
T11 Horas semanales en tareas repetitivas       Como 15 entre confirmar horas y contestar lo mismo
T12 Si se va quien maneja el marketing...       La sobrina lleva el Instagram. Nadie más sabe
```

**Contexto:** ticket promedio $450.000 (tratamientos de ortodoncia y implantes), presupuesto Meta $350.000/mes, dos dentistas y una recepcionista.

### H.2 Salida esperada — bloque 0

```json
"bloque_0_ruteo": {
  "reasoning": "Hay flujo abundante río arriba: 60-70 oportunidades al mes con pauta activa (T3, T4) y reputación sana (T2, reseñas 4,3). El flujo se rompe en E5: tiempo de respuesta indeterminado y sin registro fuera de WhatsApp (T7, T8), con muchas conversaciones sin seguimiento (T9). Por la regla de precedencia, el eslabón dominante es el primero que rompe contando desde donde hay flujo, y ése es E5. E4 está parcialmente roto (T6: no hay forma de dejar datos sin conversar), pero es consecuencia de la misma decisión de canal y se resuelve dentro de E5. T12='nadie más sabe' activa Capacitación y adopción como secundaria, nunca como reemplazo.",
  "cadena": [
    {"eslabon": 2, "nombre": "Reputación y posicionamiento", "estado": "sano", "area": "Contenido y RRPP"},
    {"eslabon": 3, "nombre": "Generación de demanda", "estado": "sano", "area": "Paid Media y SEO"},
    {"eslabon": 4, "nombre": "Activo de conversión", "estado": "roto", "area": "Desarrollo web"},
    {"eslabon": 5, "nombre": "Captura y respuesta", "estado": "roto", "area": "Automatización y agentes"},
    {"eslabon": 6, "nombre": "Escala de la conversación", "estado": "roto", "area": "RPA y procesos"},
    {"eslabon": 7, "nombre": "Capacidad del equipo", "estado": "roto", "area": "Capacitación y adopción"}
  ],
  "eslabon_dominante": 5,
  "area_recomendada": "Automatización y agentes",
  "area_secundaria": "Capacitación y adopción",
  "por_que_este_y_no_otro": "Tu publicidad está funcionando: te llegan entre 60 y 70 personas al mes preguntando. El problema no está en atraer gente, está en lo que pasa después de que escribe. Subir el presupuesto hoy solo haría llegar más mensajes a la misma bandeja que ya no alcanzas a contestar.",
  "que_NO_es_tu_problema": "Tu pauta y tu reputación. Los anuncios traen volumen real y tienes 4,3 estrellas en Google: la gente te encuentra y confía. No cambies nada de eso todavía."
}
```

**El campo `que_NO_es_tu_problema` es el que hace la venta.** Un dueño que llega convencido de que necesita mejorar sus anuncios y escucha "tus anuncios están bien, el problema es otro" recibe algo que ninguna agencia le da: una razón para no venderle lo que vino a comprar.

### H.3 Salida esperada — las 3 hipótesis

Todas pertenecen a E5, según DB-11. **Ninguna menciona el Pixel.**

| # | Hipótesis | Evidencia | Atribución | Confianza |
|---|---|---|---|---|
| 1 | "Estás pagando por mensajes que se contestan tarde o no se contestan, y no hay forma de saber cuántos." | T3 × T7 × T8 (Matriz H.1) | gestión | alta |
| 2 | "La mayoría de los que preguntan precio y no vuelven no se fueron por caros: se fueron porque nadie insistió." | T9 × T8 (Matriz I) | gestión | media |
| 3 | "Se van unas 15 horas semanales en confirmar horas y contestar lo mismo — cerca de $390.000 al mes en tiempo de tu equipo." | T11 × ancla costo hora (Matriz H.4) | estructura | media |

Hipótesis 3, redactada completa:

```json
{"orden": 3,
 "enunciado": "Se van cerca de 15 horas a la semana en confirmar horas y contestar las mismas preguntas.",
 "evidencia": "T11 (Matriz H.4)",
 "como_se_verifica": "Durante una semana, anota cuántos mensajes recibes que digan 'cuánto cuesta', 'a qué hora tengo' o 'quiero cambiar la hora'. Si son más de la mitad, está confirmado.",
 "si_es_cierta": "Son alrededor de $390.000 CLP al mes en tiempo de tu equipo [estimación, supuesto $6.000/hora administrativa, referencial]. Es comparable a lo que inviertes en publicidad.",
 "por_que_no_era_visible": "Porque no aparece en ninguna cuenta. Nadie factura las horas de la recepcionista contestando WhatsApp: se pagan igual, se vea o no se vea.",
 "atribucion": "estructura", "alcance": "cuenta", "capa": null,
 "confianza": "media", "procedencia": "declarado"}
```

`si_es_cierta` pone la cifra al lado del gasto en publicidad — la única comparación que un dueño puede hacer sin traducción. Y respeta la regla del Grupo I: rango marcado `[estimación]`, supuesto declarado, **ninguna herramienta nombrada**.

### H.3b Salida esperada — bloque 4

```json
"bloque_4_etapas": {
  "reasoning": "La etapa 1 es de medición y la hace ella: sin el dato propio, cualquier cifra que le demos suena a argumento de venta. La etapa 2 es la intervención. La 3 existe porque T12 dice que nadie más sabe operar lo que se instale.",
  "etapas": [
    {"orden": 1, "nombre": "Contar una semana de mensajes",
     "por_que_primero": "Hoy la cifra de quince horas es una estimación mía. Con una semana de conteo pasa a ser un dato suyo, y sobre un dato suyo se decide distinto que sobre uno mío.",
     "quien_lo_hace": "el cliente", "pilar_precision": "ninguno", "esfuerzo": "una sesión",
     "como_se_sabe_que_resultó": "Sabe qué proporción de los mensajes son 'cuánto cuesta', 'a qué hora tengo' y cambios de hora. Si son más de la mitad, la hipótesis está confirmada."},
    {"orden": 2, "nombre": "Ordenar la captura antes de tocar la publicidad",
     "por_que_primero": "Mientras los mensajes lleguen a una bandeja sin registro ni asignación, cada peso extra de publicidad aumenta lo que se pierde.",
     "quien_lo_hace": "Precisión", "pilar_precision": "Automatización y agentes", "esfuerzo": "semanas",
     "como_se_sabe_que_resultó": "Todo mensaje queda registrado con responsable y hora, y el tiempo de primera respuesta baja de un día a minutos."},
    {"orden": 3, "nombre": "Dejar a alguien capaz de operarlo",
     "por_que_primero": "Hoy el Instagram lo lleva una sobrina y nadie más sabe. Una automatización que dependa de una sola persona reproduce el mismo riesgo con otra herramienta.",
     "quien_lo_hace": "Precisión", "pilar_precision": "Capacitación y adopción", "esfuerzo": "días",
     "como_se_sabe_que_resultó": "Dos personas de la clínica pueden operar y corregir el sistema sin llamar a nadie."}
  ],
  "fuera_de_nuestro_alcance": "La agenda clínica y la disponibilidad de box. Podemos hacer que ningún mensaje se pierda y que se responda en minutos; cuántas horas hay disponibles para agendar es decisión y operación de la clínica.",
  "cierre": "La semana de conteo empiécela el lunes, con o sin nosotros. Con ese número conversamos el resto."
}
```

### H.4 Lo que este caso verifica

| Verificación | Por qué importa |
|---|---|
| `eslabon_dominante = 5` teniendo pauta activa | **La prueba central del modelo.** Si sale 3, el ruteo no funciona |
| Ninguna hipótesis menciona Pixel, CAPI ni objetivo de campaña | DB-11: las hipótesis pertenecen al eslabón dominante |
| E2 y E3 marcados `sano` | El motor sabe reconocer lo que está bien (regla inviolable 2) |
| `que_NO_es_tu_problema` poblado | DB-13 |
| Capacitación y adopción en `area_secundaria`, nunca en `area_recomendada` | DB-12 y §5.0.2 |
| Costo del trabajo repetitivo con `[estimación]` y supuesto declarado | Regla de honestidad del Grupo I |
| E4 roto pero no dominante | La regla de precedencia se aplicó, no se listaron todos los rotos |

### H.5 Caso complementario — la maestranza que antes quedaba fuera

Verifica §5.0.3 en su forma más pura: el prospecto que la v3.x descartaba.

```
T1 Licitación y contactos del rubro     T2 Sitio antiguo, sin reseñas
T3 8 a 10 licitaciones al mes           T4 No invierte en publicidad
T5 No aplica                            T6 No
T7 Los correos se responden en 2-3 días T8 En el correo de cada uno
T9 No sabe                              T10 No
T11 20 horas armando cotizaciones       T12 No
```

**Esperado:** `eslabon_dominante: 5`, `area_recomendada: "Automatización y agentes"`, `area_secundaria: "Capacitación y adopción"`. E3 marcado `sin_datos`, **no** `roto` — no genera demanda pagada y no le corresponde hacerlo.

Hipótesis dominante: *"Pierdes licitaciones que podrías ganar porque la cotización tarda más de lo que dura la ventana."* Costo del trabajo repetitivo: 20 h × $6.000 × 4,3 ≈ **$516.000/mes [estimación]**.

**Bajo el criterio anterior esta empresa puntuaba 2 y se descartaba.** Bajo el nuevo: Dolor 3 (E5 crítico) + Velocidad 2 + Capacidad 2 + Accesibilidad 1 = **8, visitar**. Es exactamente una de las 7 industriales que la decisión #9 dio por perdidas.

**Antipatrón crítico de este caso:** si el motor le propone pauta, falla. Aunque tenga presupuesto y aunque el sitio sea malo.

---

# Anexo I — Caso dorado primario: Vicsa Safety Chile / Bunzl LATAM

**Éste es el caso dorado de referencia del producto para la lista corporativa.** A diferencia de la clínica dental, no es un arquetipo construido: es una cuenta real, con un diagnóstico estratégico entregado el 31-jul-2026 y datos verificados en fuentes públicas y en la reunión del 27-jul.

**Por qué desplaza a la clínica dental como caso primario.** El perfil de la decisión #9 —negocios locales de captación— salió de auditar 9 empresas industriales para **pauta**. La cuenta que Precisión efectivamente trabaja al más alto valor es B2B industrial corporativo, y su fallo no es de pauta ni de automatización: es de criterio. Este caso es el que ejercita E1.

### I.1 Entrada — triage

```
T1  ¿Cómo supo de ti el último cliente?     Relación directa, licitaciones y cartera de ~150 clientes en 25 años
T2  ¿Qué encuentra quien te busca?           Sitio corporativo, respaldo Bunzl plc (FTSE 100), Great Place to Work
T3  Oportunidades nuevas al mes              90 leads en 2-3 meses vía herramienta externa (≈30/mes)
T4  ¿Inviertes en publicidad pagada?         No. Se contrató una herramienta de prospección, no pauta
T5  ¿A dónde mandas a quien quiere comprarte? No aplica en digital — venta directa y canal de licitaciones
T6  ¿Puede alguien dejarte sus datos?         Sitio corporativo, sin captura estructurada declarada
T7  ¿En cuánto se responde a un interesado?   Sin SLA definido; el traspaso no tiene protocolo
T8  ¿Dónde queda registrado?                  Sin protocolo de traspaso definido
T9  ¿Conversaciones sin seguimiento?          88 de 90 leads no llegaron a cita
T10 ¿Usan alguna herramienta de IA?           Una externa, en descarte. "La IA no sería el punto principal hoy"
T11 Horas semanales repetitivas               N/D
T12 Si se va quien lo maneja...               1 o 2 personas asignadas, sin redundancia declarada
T13 ¿Tienen escrito qué empresa es buen cliente?  No
T14 Si te llegaran 100 contactos, ¿cómo eliges?   No sabría
```

**Contexto:** filial chilena de un grupo FTSE 100 (ingresos 2025 £11.845,4M), ~25 años en Chile, marcas propias, ~150 clientes, **1 a 2 personas asignadas al proyecto**. Línea base medida: **90 leads → 2 citas → 0 negocios**.

### I.2 Salida esperada — bloque 0

```json
"bloque_0_ruteo": {
  "reasoning": "Hay flujo abundante río arriba: 90 oportunidades entregadas en 2-3 meses (T3) y reputación corporativa sólida (T2). El flujo no se rompe en captura —hubo 2 citas, alguien las trabajó— sino antes de todo: T13='no' y T14='no sabría' con volumen alto es la firma exacta de E1. La conversión de 2,2% a cita y 0% a negocio no describe un problema de cierre; describe que el 97,8% de los contactos no era la persona correcta en la empresa correcta. E5 está roto en segundo orden (T7/T8 sin protocolo de traspaso), pero automatizar la captura de contactos mal calificados solo aceleraría el mismo resultado.",
  "cadena": [
    {"eslabon": 1, "nombre": "Criterio y foco comercial", "estado": "roto", "area": "Estrategia y diagnóstico"},
    {"eslabon": 2, "nombre": "Reputación y posicionamiento", "estado": "sano", "area": "Contenido y RRPP"},
    {"eslabon": 3, "nombre": "Generación de demanda", "estado": "sano", "area": "Paid Media y SEO"},
    {"eslabon": 4, "nombre": "Activo de conversión", "estado": "sin_datos", "area": "Desarrollo web"},
    {"eslabon": 5, "nombre": "Captura y respuesta", "estado": "roto", "area": "Automatización y agentes"},
    {"eslabon": 6, "nombre": "Escala de la conversación", "estado": "sin_datos", "area": "RPA y procesos"},
    {"eslabon": 7, "nombre": "Capacidad del equipo", "estado": "roto", "area": "Capacitación y adopción"}
  ],
  "eslabon_dominante": 1,
  "area_recomendada": "Estrategia y diagnóstico",
  "area_secundaria": "Automatización y agentes",
  "por_que_este_y_no_otro": "Te llegaron noventa contactos y cerraste cero. El problema no es que falten oportunidades: es que nadie definió cuál de esas noventa valía la pena trabajar. Conseguir más leads sobre el mismo criterio ausente repite exactamente el mismo resultado, con otro proveedor.",
  "que_NO_es_tu_problema": "Tu marca, tu producto y tu equipo comercial. Tienes respaldo de un grupo FTSE 100, marcas propias que te dan control de margen, veinticinco años de operación en Chile y un equipo cuyo conocimiento técnico tú mismo señalas como la razón por la que ellos cierran. Nada de eso es la causa de este resultado."
}
```

### I.3 Las tres hipótesis

Todas pertenecen a E1 según DB-11. **Ninguna propone pauta, y ninguna propone una herramienta.**

| # | Hipótesis | Evidencia | Atribución | Confianza |
|---|---|---|---|---|
| 1 | "Pagaste doce meses por volumen cuando tu restricción real era de calificación." | T13 × T14 × T3 (Matriz M.1) | gestión | alta |
| 2 | "El cuello de botella no son los contactos disponibles: son las dos personas que los reciben." | T3 × T12 (Matriz M.2) | compartida | alta |
| 3 | "El criterio que te falta ya está dentro de tu casa, en los clientes que sí te compraron." | ~150 clientes sin perfilar (Matriz M.3) | gestión | media |

Hipótesis 1, redactada completa:

```json
{"orden": 1,
 "enunciado": "Pagaste doce meses por volumen cuando tu restricción real era de calificación.",
 "evidencia": "T13 (sin criterio escrito) × T14 (sin criterio demostrable) × T3 (90 leads) — Matriz M.1",
 "como_se_verifica": "Pídele a dos personas de tu equipo comercial que describan por separado qué empresa es un buen cliente para ustedes. Si las descripciones no coinciden, está confirmado.",
 "si_es_cierta": "Cualquier proveedor de prospección va a optimizar volumen —porque es lo que puede demostrar— mientras tú evalúas cierres. Esa desalineación produce noventa leads y cero negocios, sin importar quién sea el proveedor.",
 "por_que_no_era_visible": "Porque el sistema entregó exactamente lo que se le pidió: noventa contactos. El informe de la herramienta muestra volumen cumplido. En ninguna parte de ese reporte aparece la pregunta de si esos contactos eran los correctos, porque nadie definió qué era correcto.",
 "atribucion": "gestion", "alcance": "cuenta", "capa": null,
 "confianza": "alta", "procedencia": "declarado"}
```

### I.4 Las tres soluciones

| # | Verifica | Acción | Predicción |
|---|---|---|---|
| 1 | H1 | Definición operativa de cliente calificado, por escrito y firmada, **antes de prospectar un contacto más** | Si dos vendedores describen el mismo perfil sin consultarse, el criterio existe. Si no, acabas de encontrar la causa |
| 2 | H3 | Perfilar la cartera actual: rubro, tamaño, zona, ticket, antigüedad | El perfil real aparece sin gastar un peso en prospección. Si no emerge un patrón, el criterio tendrá que construirse desde el mercado |
| 3 | H2 | Medir cuántos contactos por semana pueden trabajar efectivamente las personas asignadas | Ese número, y no la capacidad del proveedor, es el que debe dimensionar el volumen. Cualquier cifra prometida sin ese dato es inventada |

Las tres son ejecutables por el cliente sin contratar a nadie (DB-5). La solución 1 es una sesión de trabajo, no un desarrollo.

### I.4b Salida esperada — bloque 4 (plan por etapas)

```json
"bloque_4_etapas": {
  "reasoning": "El orden no es el intuitivo. La tentación —y lo que ofrecerá cualquier competidor— es partir por el motor de prospección, porque es lo visible y parece el producto. Partir por ahí es exactamente lo que ya se hizo. La secuencia correcta acuerda el criterio, dimensiona la capacidad, y recién entonces construye el motor: los dos primeros pasos son baratos y de trabajo conjunto; el tercero llega cuando ya sabe qué tiene que producir y para quién.",
  "etapas": [
    {"orden": 1,
     "nombre": "Leer la cartera que ya tienen",
     "por_que_primero": "El perfil real de quien les compra está en sus ~150 clientes actuales. Cualquier criterio que definamos sin mirarlo es una hipótesis; mirándolo es un dato. Y es lo único de todo el plan que no cuesta nada.",
     "quien_lo_hace": "el cliente",
     "pilar_precision": "ninguno",
     "esfuerzo": "días",
     "como_se_sabe_que_resultó": "Aparece un patrón de rubro, tamaño y zona en los clientes que más facturan. Si no aparece ninguno, el criterio tendrá que construirse desde el mercado y eso también es un hallazgo."},
    {"orden": 2,
     "nombre": "Escribir y firmar qué es un cliente calificado",
     "por_que_primero": "Sin esto, cualquier proveedor optimiza volumen —porque es lo que puede demostrar— mientras ustedes evalúan cierres. Esa desalineación es la que produjo noventa contactos y cero negocios, y se repetiría con nosotros igual que con el anterior.",
     "quien_lo_hace": "mixto",
     "pilar_precision": "Estrategia y diagnóstico",
     "esfuerzo": "una sesión",
     "como_se_sabe_que_resultó": "Dos personas del equipo comercial describen el mismo perfil por separado, y el documento incluye el criterio de descarte además del de calificación."},
    {"orden": 3,
     "nombre": "Dimensionar el volumen a la capacidad real",
     "por_que_primero": "Antes de construir cualquier motor hay que saber cuántos contactos por semana pueden trabajar efectivamente las personas asignadas. Sin ese número, cualquier cifra de volumen que se prometa es inventada.",
     "quien_lo_hace": "mixto",
     "pilar_precision": "Estrategia y diagnóstico",
     "esfuerzo": "una sesión",
     "como_se_sabe_que_resultó": "Existe un número semanal acordado, y el compromiso de servicio se expresa en calificación, no en cantidad."},
    {"orden": 4,
     "nombre": "Construir el motor de prospección local",
     "por_que_primero": "Llega último a propósito: recién ahora sabe qué tiene que producir, para quién y en qué volumen. Construirlo antes es repetir el error con otra herramienta.",
     "quien_lo_hace": "Precisión",
     "pilar_precision": "Automatización y agentes",
     "esfuerzo": "semanas",
     "como_se_sabe_que_resultó": "La conversión de contacto a cita supera de forma medible la línea base de 2,2%, evaluada en una compuerta a los noventa días con la opción de detener escrita desde el inicio."}
  ],
  "fuera_de_nuestro_alcance": "El cierre comercial y la capacidad de atención de las personas asignadas. Nosotros podemos entregar contactos mejor calificados y medir el traspaso; que la conversación de venta termine en una orden de compra depende de su equipo técnico, que según ustedes mismos es la razón por la que cierran. Tampoco resolvemos la decisión de qué zona y qué vertical priorizar: la información para tomarla la ponemos nosotros, la decisión es de ustedes.",
  "cierre": "La etapa uno la pueden hacer sin nosotros y les recomiendo que la empiecen esta semana, tengan o no una propuesta nuestra sobre la mesa. Cuando esté lista, la etapa dos es una sesión de trabajo con su equipo comercial y ahí conversamos el resto."
}
```

**Lo que hace esta salida distinta de una propuesta comercial.** La etapa 1 no la ejecuta Precisión y se le dice al cliente que la empiece igual. La etapa 4 —la única que factura de verdad— llega al final y con una compuerta que incluye la opción de detener. Y `fuera_de_nuestro_alcance` reconoce que el cierre depende del equipo del cliente, no de nosotros.

### I.5 Qué verifica este caso

| Verificación | Por qué importa |
|---|---|
| `eslabon_dominante = 1` con 90 leads entregados | **La prueba central de E1.** Si sale 3 (demanda), el motor confundió volumen con calificación |
| Ninguna hipótesis propone pauta | Un prospecto con respaldo FTSE 100 y presupuesto es el más tentador para vender gestión mensual. No la necesita |
| Ninguna hipótesis nombra una herramienta | Regla de honestidad del Grupo I y del Grupo M: la herramienta es implementación, no hallazgo |
| E2 y E3 marcados `sano` | El motor reconoce activos de primer nivel en vez de buscar fallas en todo |
| E5 roto pero **no** dominante | La regla de precedencia se aplicó: automatizar la captura de contactos mal calificados acelera el error |
| `area_secundaria` = Automatización | El problema de traspaso es real y va después, no en vez de |
| Las 3 soluciones ejecutables sin contratar | DB-5 en el caso donde más costaría cumplirlo |

**Antipatrón crítico:** si el motor le recomienda a esta cuenta invertir en publicidad, generar más leads o contratar una herramienta, falla — por más correcto que sea el resto del análisis.

### I.6 Tres desajustes que este caso deja al descubierto

Se documentan porque afectan decisiones fuera de Calibrar.

**1. El buyer persona tiene la psicología correcta y la estructura equivocada.**
El contacto en Bunzl es un **campeón interno que lleva el caso hacia arriba**, no un dueño que decide. Su perfil emocional calza casi exactamente con "La Decepcionada de Agencia" —doce meses y un contrato invertidos sin resultado, tolerancia baja a un segundo intento fallido, necesidad de mostrar algo internamente— pero Carolina es *dueña o gerenta de PYME* y decide ella. Aquí hay una jefatura, un área legal que bloquea con el NDA, y una gerencia local cuyo respaldo determina si los leads se trabajan.

Falta un tercer arquetipo: **el campeón corporativo**. Comparte el dolor de Carolina y tiene un trabajo adicional que ella no tiene — *protegerse internamente*. Eso cambia el entregable: necesita un documento que pueda circular hacia arriba, con fuentes citadas y criterio de corte escrito. Es exactamente lo que el diagnóstico de Bunzl entrega y lo que el dashboard de tres bloques **no** cubre.

**2. El scoring castiga al prospecto de mayor valor.** La rúbrica de §5.6 da 3 puntos a "el dueño decide solo" y 1 a "comité o gerencia corporativa". Bunzl puntúa 8/10 —Dolor 3 + Velocidad 1 + Capacidad 2 + Accesibilidad 2— y aun así queda bajo una PYME cuyo dueño decide en el momento. La velocidad importa de verdad para la caja, así que el eje no sobra; lo que falta es **separar las dos listas**: una cuenta corporativa y una PYME no se comparan en el mismo número. Ver pendiente 23.

**3. Calibrar no reemplaza el diagnóstico estratégico.** El documento entregado a Bunzl tiene PESTA, cinco fuerzas, matriz de involucrados, FODA cruzado y árbol del problema, con fuentes citadas. El dashboard de Calibrar produce data leída, tres hipótesis y tres soluciones. Para una PYME eso es suficiente; para una cuenta corporativa es una fracción. **Calibrar califica y prepara la conversación; el diagnóstico estratégico es el entregable pagado que viene después.** Ver §3.3.

---

# Anexo J — Casos dorados de E2, E3, E4, E6 y E7

Cierra el pendiente 26. Los Anexos G, H e I cubren **E5 (dos veces) y E1** con cuentas reales. Estos cinco completan la cobertura de los siete eslabones: **cada uno trae bloque 0, hipótesis dominante, plan por etapas y antipatrón**.

> **Corregido el 2-ago-2026.** Esta introducción decía que G, H e I cubrían "E3, E5 y E1". No era así: Eco Star (G) y Clínica Dental (H) son **ambos E5**, de modo que **E3 quedaba sin caso dorado** — el único eslabón sin salida esperada, y justo el que rutea a Paid Media y SEO. Se cierra con **§J.6**.

**Alcance declarado:** son arquetipos construidos sobre el perfil de la base real, no cuentas con datos verificados. Verifican el **ruteo y la forma de la salida**; la calibración de contenido solo la da una cuenta real. Se marca así a propósito para que nadie los confunda con Eco Star o Vicsa.

---

### J.1 · E2 Reputación → Contenido y RRPP

**Perfil:** proveedor industrial B2B, ticket alto, ciclo de venta largo. Capta por recomendación.

**Triage:** `t1 recomendación` · `t2 casi nada` · `t3 pocas y esporádicas` · `t4 no` · `t7 mismo día` · `t8 planilla` · `t13 sí por escrito` · `t14 criterio explicable`.

| Campo | Valor esperado |
|---|---|
| `eslabon_dominante` | **2** |
| `area_recomendada` | Contenido y RRPP |
| Cadena | E1 sano · **E2 roto** · E3 sin_datos · E4 roto · E5 sano · E6 sin_datos · E7 sin_datos |
| `por_que_este_y_no_otro` | "Te recomiendan, y cuando esa persona va a confirmar quién eres, no encuentra nada. Estás perdiendo gente en el momento en que ya estaba convencida." |
| `que_NO_es_tu_problema` | "Tu servicio y tu red de contactos. El boca a boca te está funcionando — es lo que pasa después lo que falla." |

**Hipótesis dominante:** *"El único canal que sí te trae clientes se corta cuando la persona va a verificarte."*
`como_se_verifica`: busca el nombre de tu empresa en Google como si no la conocieras. Mira qué aparece en los primeros cinco resultados.
`por_que_no_era_visible`: porque el canal *sí* funciona — llegan clientes por recomendación. Lo que no se ve es cuántos se cayeron en la verificación, porque esos nunca escribieron.

**Plan por etapas:** 1) Reclamar y completar la ficha de empresa en búsqueda —*el cliente, sin costo, esfuerzo de una sesión*. 2) Reunir prueba pública: casos, clientes, certificaciones —*mixto, RRPP*. 3) Contenido de autoridad sostenido —*Precisión, RRPP*.
`fuera_de_nuestro_alcance`: la calidad del servicio que genera la recomendación. Podemos hacer que quien te busca te encuentre; que te recomienden depende de ustedes.

**Antipatrón:** rutear a E3 porque llegan pocas oportunidades. Con `t1 = recomendación` y `t2 = casi nada`, el problema no es de volumen: es que el canal existente se rompe a mitad de camino.

---

### J.2 · E4 Activo de conversión → Desarrollo web

**Perfil:** PYME B2C con pauta activa y captura sana.

**Triage:** `t3 alto` · `t4 Meta` · `t5 home` · `t6 no` · `t7 menos de 1 hora` · `t8 CRM` · `t9 algunas` · `t13 sí`.

| Campo | Valor esperado |
|---|---|
| `eslabon_dominante` | **4** |
| `area_recomendada` | Desarrollo web |
| Cadena | E1 sano · E2 sano · E3 sano · **E4 roto** · E5 sano · E6 sin_datos · E7 sin_datos |
| `por_que_este_y_no_otro` | "Estás pagando para traer gente a una página que no fue hecha para recibirla, y la que llega no tiene dónde dejarte sus datos." |
| `que_NO_es_tu_problema` | "Tu publicidad y tu equipo. Los anuncios traen gente y ustedes contestan rápido. El problema está en el metro cuadrado entre ambos." |

**Hipótesis dominante:** *"El presupuesto compra visitas que llegan a un destino que no puede convertirlas."*
`como_se_verifica`: entra a tu propio anuncio desde el teléfono, como si fueras un cliente, e intenta comprarte. Cuenta cuántos pasos hay hasta poder dejar tus datos.
`por_que_no_era_visible`: porque el Administrador de Anuncios reporta clics, y los clics están llegando. El abandono ocurre después del clic, en una pantalla que ese panel no mira.

**Plan por etapas:** 1) Recorrer el propio embudo desde el teléfono y anotar dónde se traba —*el cliente, sin costo*. 2) Landing dedicada con captura y medición —*Precisión, Desarrollo web*. 3) Recién ahí, ajustar la campaña al nuevo destino —*Precisión, Paid Media y SEO*.
`fuera_de_nuestro_alcance`: el precio y la oferta. Podemos hacer que la página convierta mejor; que la oferta sea competitiva es decisión de ustedes.

**Antipatrón:** proponer optimización de campaña. Con captura sana y destino roto, ajustar la pauta amplifica la fuga.

---

### J.3 · E6 Escala de la conversación → RPA y procesos

**Perfil:** servicio B2B con demanda sostenida y primer contacto resuelto.

**Triage:** `t3 alto` · `t7 menos de 1 hora` · `t8 CRM` · `t9 muchas` · `t10 no sé qué sería` · `t11 alto` · `t12 a medias`.

| Campo | Valor esperado |
|---|---|
| `eslabon_dominante` | **6** |
| `area_recomendada` | RPA y procesos |
| `area_secundaria` | **Capacitación y adopción** (por `t10 = no sé qué sería`) |
| Cadena | E1 sano · E2 sano · E3 sano · E4 sano · **E5 sano** · **E6 roto** · E7 roto |
| `por_que_este_y_no_otro` | "Contestas rápido al primer mensaje y ahí se acaba. Lo que se pierde no es el contacto: es la conversación que nadie sostuvo." |

**Hipótesis dominante:** *"El primer contacto está resuelto; el seguimiento depende de que alguien se acuerde."*
`como_se_verifica`: toma diez conversaciones del mes pasado que no cerraron y mira cuál fue el último mensaje. Si en la mayoría el último mensaje es tuyo y no hubo respuesta, no es que no les interesara: es que nadie volvió a escribir.
`por_que_no_era_visible`: porque no hay una métrica de "conversaciones abandonadas". El CRM muestra las que avanzaron; las que se apagaron solas no aparecen en ningún reporte.

**Plan por etapas:** 1) Contar cuántas conversaciones del último mes quedaron sin cierre ni respuesta —*el cliente*. 2) Documentar las respuestas a las preguntas frecuentes —*mixto, prerrequisito*. 3) Agente de seguimiento sobre esa base —*Precisión, IA y agentes*. 4) Capacitar a quien lo opere —*Precisión, Capacitación y adopción*.
`fuera_de_nuestro_alcance`: la decisión comercial de cada trato. Un agente puede sostener la conversación; negociar y cerrar sigue siendo de ustedes.

**Antipatrón —el más fácil de cometer:** rutear a E5 y proponer un CRM. La captura funciona (`t7` y `t8` sanos). Recomendar un CRM acá es venderle lo que ya tiene.

**Segundo antipatrón:** proponer el agente como etapa 1. Sin base documentada (`i5`), la recomendación honesta es documentar primero.

---

### J.4 · E7 Capacidad del equipo → Capacitación y adopción

**El único caso en que E7 es dominante solo (§5.0.2), y el que verifica la regla inviolable 2 en su forma más exigente.**

**Triage:** todos los eslabones sanos · `t12 no` · `t10 alguien por su cuenta` · dependencia crítica de un externo.

| Campo | Valor esperado |
|---|---|
| `eslabon_dominante` | **7** |
| `area_recomendada` | Capacitación y adopción |
| `area_secundaria` | `null` |
| Cadena | **E1 a E6 todos sanos** · E7 roto |
| `por_que_este_y_no_otro` | "Todo funciona. El problema es que funciona porque una sola persona lo sostiene, y nadie más puede revisar si lo está haciendo bien." |
| `que_NO_es_tu_problema` | "Nada de tu operación comercial. Tu publicidad, tu sitio, tu captura y tu seguimiento están bien. Esto no es un problema de crecimiento." |

**Hipótesis dominante:** *"No tienes un problema de crecimiento: tienes un riesgo de continuidad."*
`como_se_verifica`: pregúntale a alguien de tu equipo que no sea esa persona qué haría si mañana se cae la campaña. Si la respuesta es "llamarlo a él", está confirmado.
`por_que_no_era_visible`: porque un riesgo de continuidad no produce ningún síntoma hasta que se materializa. Todos los indicadores están bien — hasta el día que la persona se va.

**Plan por etapas:** 1) Escribir qué hace esa persona, en una página —*el cliente, sin costo*. 2) Capacitar a una segunda persona para auditar, no para reemplazar —*Precisión, Capacitación y adopción*. 3) Documentación operativa mínima —*mixto*.
`fuera_de_nuestro_alcance`: la decisión de contratar o redistribuir funciones. Podemos dejar capacidad instalada; cómo se organiza el equipo es de ustedes.

**Antipatrón, el más importante de los cuatro:** que el motor invente un problema en otro eslabón para tener algo que vender. Con todo sano, la respuesta correcta es **decir que está sano**. Si aparece una hipótesis de pauta, web o automatización en este caso, el motor está fabricando problemas y reprueba, por más correcto que sea el resto.

---

### J.5 · Caso de vía B — diagnóstico sin el cliente

Cierra el pendiente 15. **Mismo prospecto de J.2, diagnosticado sin que nadie conteste nada.** Verifica que el techo de confianza de §5.9.2 se respete.

**Entrada — solo señales externas:**
```
s1_pauta_activa:        8 anuncios activos desde hace ~4 meses
s2_pixel_gtm:           no detectable en la landing de destino
s3_verificacion_dominio: no
s4_destino_anuncio:     home del sitio
s5_estructura_landing:  sin formulario, CTA "contáctenos"
s6_precio_publicado:    no publica precios
s7_rubro:               servicios B2B
s8_copy_visible:        genérico, sin mención del cliente objetivo
s9_analitica:           GA4 detectado
s10_velocidad_movil:    lenta
```

**Salida esperada:**

| Campo | Valor | Verificación |
|---|---|---|
| `via` | `sin_cliente` | — |
| `confianza_global` | **`media`** | Nunca `alta` |
| `eslabon_dominante` | 4 | Mismo que la vía A |
| E5, E6, E7 | **`sin_datos`** | No son observables desde afuera |

**Las tres hipótesis, con su `como_se_verifica` redactado como la pregunta de la reunión:**

| # | Hipótesis | Confianza | `como_se_verifica` |
|---|---|---|---|
| 1 | "Está pagando tráfico hacia una página sin dónde dejar datos" | **media** | PREGUNTA: "¿cómo les llega hoy un cliente nuevo desde la web?" |
| 2 | "La página de destino probablemente no puede medir quién convierte" | **media** | PREGUNTA: "¿tienen el Pixel instalado y saben si recibe eventos?" El Pixel puede estar en otra página o vía GTM |
| 3 | "El anuncio no filtra: cualquiera hace clic" | **media** | PREGUNTA: "¿a quién quieren llegar exactamente?" |

**Lo que este caso verifica:**

- Ninguna hipótesis supera `media`, ni siquiera la de `s5` que es visualmente comprobable
- **Cero afirmaciones sobre presupuesto, objetivo de campaña, CPL o ticket** — no observables
- Los tres `como_se_verifica` están redactados como pregunta, no como auditoría
- `por_que_no_era_visible` va `N/D` con motivo: en vía B aún no hay conversación
- **El eslabón dominante coincide con el de la vía A (J.2).** Ésa es la prueba de §5.9.1: las hipótesis de la vía B son las preguntas que la reunión convierte en diagnóstico

**Antipatrón:** afirmar "no tiene Pixel". Lo observable es que *no es detectable en esa landing*. La diferencia entre ambas frases es la que separa un diagnóstico de una suposición.

---

### J.6 · E3 Generación de demanda → Paid Media y SEO

**El caso que faltaba, y el único en que Paid Media es la respuesta correcta.** Cierra el hueco de cobertura detectado el 2-ago-2026. Mismo alcance declarado que J.1–J.4: **arquetipo construido sobre el perfil de la base real, no una cuenta con datos verificados.** Verifica el ruteo y la forma de la salida; la calibración de contenido solo la da una cuenta real.

**Perfil:** empresa de servicios B2B, ticket medio-alto, más de diez años operando, buena reputación en su rubro. Capta prácticamente todo por recomendación y llegó a un techo: el boca a boca no escala.

**Triage:** `t1 recomendación` · `t2 sitio + reseñas` · `t3 tres o cuatro al mes` · **`t4 no`** · `t5 landing dedicada` · `t6 sí, formulario` · `t7 menos de 1 h` · `t8 CRM` · `t9 ninguna` · `t10 no` · `t12 sí` · **`t13 sí por escrito`** · **`t14 criterio explicable`**.

| Campo | Valor esperado |
|---|---|
| `eslabon_dominante` | **3** |
| `area_recomendada` | Paid Media y SEO |
| `area_secundaria` | `null` |
| Cadena | E1 sano · E2 sano · **E3 roto** · E4 sano · E5 sano · E6 sin_datos · E7 sano |
| `por_que_este_y_no_otro` | "Tu problema no es que pierdas oportunidades: es que te llegan tres o cuatro al mes y las trabajas casi todas. Lo que ya tienes montado aguanta bastante más de lo que hoy le entra." |
| `que_NO_es_tu_problema` | "Tu criterio, tu reputación y tu operación. Sabes por escrito a quién le sirves, la gente te encuentra y te recomienda, y cuando alguien escribe le contestas dentro de la hora. Nada de eso hay que arreglar antes." |

**Por qué E6 va `sin_datos` y no `sano`:** `t9 = ninguna` con tres o cuatro oportunidades al mes no prueba que el seguimiento escale — prueba que hay poco que seguir. Marcarlo `sano` sería inferir capacidad desde la ausencia de carga. Es la aplicación de la regla inviolable 1 en el caso donde más barato sería saltársela.

**Hipótesis dominante:** *"Tu única fuente de clientes nuevos es que alguien se acuerde de recomendarte."*
`como_se_verifica`: toma los últimos diez clientes y anota cómo llegó cada uno. Si nueve o diez vinieron por recomendación, tu crecimiento depende de un canal que no controlas ni puedes acelerar.
`por_que_no_era_visible`: porque el boca a boca no falla de golpe, se estanca. No hay un mes malo que dé la alarma; hay años que se parecen demasiado entre sí.

**Plan por etapas:** 1) Escribir de dónde vino cada uno de los últimos veinte clientes y cuánto facturó —*el cliente, `ninguno`*. 2) Campaña acotada a la zona y el vertical donde ya ganan —*Precisión, Paid Media y SEO*. 3) Medir costo por oportunidad calificada contra el ticket real, con compuerta a los noventa días —*mixto, Paid Media y SEO*.
`fuera_de_nuestro_alcance`: la capacidad de atender más volumen del que hoy reciben. Podemos traer más oportunidades; que el equipo alcance a trabajarlas es decisión de ustedes, y conviene decidirlo antes de encender la campaña.

**Antipatrón — es el espejo exacto de Vicsa/Bunzl:** que el motor diagnostique **E1** por el volumen bajo. Con `t13 = sí por escrito` y `t14 = criterio explicable`, el criterio está resuelto; el problema es que casi nadie llega a ser evaluado con él. En Vicsa el volumen **alto** con criterio ausente sí es E1; aquí el volumen **bajo** con criterio presente es E3. **Si sale E1, el motor confundió poco volumen con mal criterio** — y le habría vendido una consultoría de foco a quien solo necesita que lo conozcan.

Segundo antipatrón: proponer automatización o CRM. `t7 menos de 1 h` y `t8 CRM` dicen que la captura funciona. Automatizar un flujo que hoy recibe tres contactos al mes es vender infraestructura ociosa.

---

**Calibrar by Precisión Agencia** · ppagencia.cl · Chicureo, Chile
*PRD v5.5 · 3 de agosto de 2026 (caso dorado de E3 y taxonomía de pilares unificada el 2-ago; núcleo de negocio, competencia y anclas B2B el 3-ago · verificado con qa_calibrar.py) · Pablo Opazo · Elaborado sobre la plantilla de la actividad "Arma tu PRD", Diplomado de IA, Universidad de los Andes*
