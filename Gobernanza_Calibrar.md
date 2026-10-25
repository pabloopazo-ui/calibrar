# GOBERNANZA DE CALIBRAR
### Quién responde si falla · v1.0 · 10-ago-2026

Documento de una página. Responde las tres preguntas: **dueño · aviso · freno**.
Todo lo que sigue está anclado al PRD v5.5 o a código verificable. Nada es aspiracional.

---

## DUEÑO — quién decide si sigue corriendo o se detiene

**Pablo Opazo, CEO.** No es una designación nominal: en el modo de uso vigente el dueño **es** el mecanismo de control.

Calibrar dejó de ser un pipeline asíncrono que produce un informe y pasa a ser un copiloto de reunión (PRD §5.7.1). Eso disolvió la etapa de aprobación posterior: **el revisor es el operador leyendo en pantalla, en el momento**. No hay un documento que alguien firme después.

**Consecuencia, y es incómoda:** el control no se puede delegar sin rediseñar el sistema. El gate es la lectura de Pablo en vivo. Si él no conduce la reunión, no hay gate.

**Riesgo declarado.** El PRD lo dice sin adornos (§5.7): el modo en vivo *traslada* el riesgo, no lo elimina. Antes una alucinación se atrapaba en la revisión previa; ahora, si pasa el filtro visual de Pablo, **se dice en voz alta frente al prospecto y no hay vuelta atrás**.

**Hueco abierto:** no hay suplente definido. Hoy la respuesta honesta es que sin Pablo la herramienta no se usa.

**Dueño de datos personales: Álvaro Jorquera.** Ley 21.719, vigencia 1-dic-2026. El punto más expuesto del sistema es el link vivo del dashboard (§5.7.8): es una URL que expone datos de un tercero.

---

## AVISO — a quién le llega la falla, no solo el registro

### La métrica de daño

| Métrica | Umbral | Qué dispara |
|---|---|---|
| **Afirmaciones dichas en voz alta que resultaron erradas** | **0** | Una sola obliga a revisar los guardrails de §5.7.5 |

Es deliberada: **no se mide la calidad del informe, se mide si la herramienta hizo decir algo falso.** Un error de contenido que nadie dijo en voz alta es un defecto; un error que se dijo frente al prospecto es un daño.

### Las señales automáticas que ya existen

| Señal | Estado hoy (10-ago-2026) | Si se pone en rojo |
|---|---|---|
| `qa_calibrar.py` — 110 invariantes | **110/110 pasan** | El corpus está roto: no se opera |
| `qa_mutacion.py` — capacidad de fallar del propio QA | **104 de 110 falsificables, 0 decorativas** | El verificador dejó de verificar |
| `evaluar_salida.py` vs. caso dorado | **9/9 · APTA en niveles 1 y 2** | La salida no es confiable: no se usa |

### El canal — y esto todavía no existe

Hoy las señales se leen corriendo los scripts a mano. **No hay aviso que llegue solo a nadie.**

Propuesta mínima, para cerrarlo:

1. **Falla de contenido en reunión** → Pablo la registra el mismo día. Sin registro no hay métrica de daño; con umbral 0, un evento no registrado destruye el indicador entero.
2. **Falla técnica** → destinatario Andrés Farías. Los tres scripts corren antes de cualquier reunión donde se use.
3. **Incidente de datos personales** → Álvaro, con el reloj de la ley corriendo.

---

## FRENO — qué no hace nunca sin aprobación

Diez frenos. Los ocho primeros están **codificados y verificados**; los dos últimos son de operación.

### En el motor (PRD §7.1, verificados por `qa_calibrar.py`)

1. **Nunca inventa datos.** Respuesta vacía, ausente o ambigua = `N/D` explícito.
2. **Nunca fabrica un problema sin evidencia.** Cada hallazgo es rastreable a una pregunta `Pxx` o a un cruce de la Matriz.
3. **Nunca resuelve una contradicción por cuenta propia.** La señala y recomienda auditar.
4. **Nunca presenta un benchmark como hecho del cliente.** Van marcados `[referencial]`.
5. **Nunca evalúa lo que no vio.** Si no se pudo ver la landing, la sección va `N/D`.

### En lo que se muestra (§5.7.5 y contrato del dashboard)

6. **Ninguna afirmación se muestra sin su evidencia `Pxx` al lado.**
7. **DB-17 · Ningún veredicto cierra con una negación seca.** El diagnóstico nunca termina en un "no": termina en un orden.
8. **MED-1 · La medición nunca es el área recomendada.** No se vende medir por medir.

### En la operación

9. **Nunca se describe el diagnóstico como automático, con IA, instantáneo o "la herramienta lo procesa".** Se promete un diagnóstico hecho por una persona, con fecha. Este freno está verificado en el build de presentación por el grupo PRESENTACIÓN del QA.
10. **El panel del operador nunca se proyecta.** Contiene el veredicto de calificación y las contradicciones detectadas — mostrarlos a la cara del prospecto lo pone a la defensiva. Se proyecta `03 Front/presentacion.html`; nunca `index.html`.

### Y un freno que es un resultado, no una restricción

**Descalificar es un resultado exitoso.** Si el prospecto no califica, la salida correcta es "no califica" con su explicación. El motor no busca un ángulo para que califique.

---

## Estado del sistema al que aplica esta gobernanza

Para que no se lea como más de lo que es: **el motor nunca ha corrido punta a punta.** Está en pausa de desarrollo desde el 19-jul-2026 por prioridad de caja.

Lo que sí opera hoy es el **método** conducido a mano por Pablo. Los frenos 1 a 8 gobiernan un motor que aún no arranca; los frenos 9 y 10 gobiernan lo que ya se está haciendo en terreno, y esos son los que están en uso.

---

*Precisión Agencia · Proyecto Calibrar · Elaborado sobre PRD v5.5 (3-ago-2026), `qa_calibrar.py`, `qa_mutacion.py` y `evaluar_salida.py`, ejecutados el 10-ago-2026.*
