# Instrumento Calibrar v2 — base de evidencia y decisión
**19-ago-2026 · Mandato de Pablo: «rehacer las preguntas con investigación seria».**
Investigación ejecutada sobre 17 fuentes primarias: SPIN/Rackham (35.000 llamadas), Gong Labs (519.000 llamadas de discovery B2B), Challenger/CEB, Gap Selling, Sandler, MEDDICC, JTBD/Moesta, Voss, Mom Test, HBR (Brooks & John 2018), Pew Research, Krosnick, RAIN Group y Corporate Visions. El informe completo con las URLs quedó en la conversación del 19-ago; este documento fija las conclusiones operativas.

## Qué cambió y qué no

**NO cambió (y el QA sigue verde):** los identificadores (T1–T14, N1–N7, M1–M5), los **valores de opciones** del contrato Anexo F.2, el mapeo pregunta→eslabón y las reglas de ruteo de `motor.js`. La Matriz sigue siendo la fuente de los cruces.

**SÍ cambió — la capa de conducción (`04 Cabina/assets/preguntas_v2.js`):** cómo se dice cada pregunta en voz alta. Hallazgos que obligaron cada regla:

1. **Nada hipotético; todo anclado al pasado concreto** (Mom Test). Las dos preguntas que fallaron en reuniones reales (T14 «si mañana te llegaran cien contactos», M5 futuro del rubro) eran hipotéticos puros.
2. **Una idea por pregunta** (Pew/Kantar): T13, N4 y M4 eran doble cañón; se parten en pregunta + repregunta, registradas como datos separados.
3. **Cómo/qué, no por qué** (Voss): cero preguntas acusatorias.
4. **Sin jerga** («ChatGPT o algo parecido», no «herramienta de IA»).
5. **Rangos nunca leídos en voz alta**: se pregunta abierto y el operador clasifica; anclas cotidianas si duda («¿una por semana? ¿una al día?»).
6. **«No sé» tiene escalera antes de aceptarse** (5 escalones; el escalón donde contesta es dato). El N/D que sobrevive es hallazgo, no vacío.
7. **Multi-respuesta explícita + principal** donde la realidad la admite (T1, T4, T5): la principal rutea, las demás son contexto.
8. **Máximo 14–16 preguntas dichas en voz alta por reunión** (Gong: sobre eso, la tasa de éxito cae). La grilla se llena escuchando narraciones de proceso («llega la cotización, ¿y después qué pasa?» responde T7+T8+T9 de una vez); solo se pregunta lo que la conversación no entregó.
9. **Protocolo de oro espontáneo**: cuando el dueño suelta un dolor fuera de guion, el guion SE PAUSA — espejo → etiqueta → embudo Sandler (ejemplo → hace cuánto → qué intentaron → cuánto costó → cómo te tiene). La cita textual va entre comillas al informe.
10. **Orden por sensibilidad** (HBR): gatillo → mejor cliente (grato) → proceso → plata y dependencia → decisión y avance. Las «preguntas 0» dejan la apertura y pasan al **cierre**, reformuladas por episodio pasado (MEDDICC).

## Preguntas nuevas (X1–X5)

- **X1 Gatillo** (JTBD): «¿Qué pasó para que nos recibieras justo ahora?» — abre la reunión; suele rutear mejor que cualquier T.
- **X2 Intentos previos** (Sandler/Mom Test): «¿Qué han intentado ya para arreglar eso? ¿Qué pasó?»
- **X3 Costo del problema** (SPIN implicación — la pregunta que los top hacen 4× más): «Eso, a ojo, ¿cuánta plata te cuesta al mes?»
- **X4 Éxito definido por él** (SPIN need-payoff / MEDDICC metrics): «En un año más, ¿qué número tendría que verse distinto para que digas "valió la pena"?»
- **X5 Red final** (HBR): «¿Qué no te pregunté que debería haberte preguntado?»

## Pendiente de consolidación formal

La redacción v2 vive hoy en la capa de conducción de la Cabina. La consolidación en la **Matriz v1.7 / PRD §5.1.x** (para que el texto canónico y el operativo vuelvan a ser uno) queda como tarea siguiente y debe correr `qa_calibrar.py` completo al hacerse.
