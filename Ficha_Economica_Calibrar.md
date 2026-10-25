# FICHA ECONÓMICA DE CALIBRAR
### Costo por corrida · horas liberadas · payback · v1.0 · 10-ago-2026

---

## 1 · La línea base: cuánto cuesta hoy, sin la herramienta

| Concepto | Valor | Procedencia |
|---|---|---|
| Elaboración manual de un diagnóstico equivalente | **4 a 5 días hábiles** | Declarado por Pablo Opazo, 10-ago-2026 |
| Traducido a horas (jornada de 8 h) | **32 a 40 horas** | Conversión directa |

Es la única línea base que existe y **es declarada, no medida**. Queda así rotulada.

---

## 2 · El costo marginal, medido

Precios de API verificados el 30-jul-2026. Tipo de cambio $934 CLP/USD.

| Modo | Costo por corrida |
|---|---|
| Informe individual, una llamada, con caché | **$42 – $43 CLP** (Sonnet 5) · **$106 – $108 CLP** (Opus 5) |
| Informe individual, sin caché | $63 – $175 CLP según modelo |
| **Reunión completa en modo en vivo** | **$290 – $340 CLP** · 12–14 turnos Sonnet 5 + cierre Opus 5 |
| Escritura de caché 1 h | $45 – $60 CLP, **compartida** entre todas las reuniones de la jornada |

La caché es la palanca dominante: sin ella cada turno paga el prompt completo y la reunión multiplica su costo varias veces.

**Dos reservas que hay que decir en voz alta:**

1. El precio de Sonnet 5 es **introductorio hasta el 31-ago-2026**. Desde el 1-sep sube de $2/$10 a $3/$15 por millón de tokens — la columna Sonnet crece ~50 %.
2. El pendiente 22 del PRD afirma que el prompt tiene 181.213 caracteres, **más de tres veces** los 51.187 medidos sobre el Anexo E. Hasta resolver esa discrepancia con `count_tokens`, el costo podría multiplicarse por ~3.

---

## 3 · Horas liberadas — y la pregunta que el evaluador va a hacer

### ¿Contaste el tiempo de revisión dentro del costo?

**Sí, y la respuesta es estructural, no un ajuste.**

El PRD §5.7.1 cambió el modo de uso: Calibrar dejó de ser un pipeline que produce un informe para revisar después, y pasó a ser un copiloto de reunión. Con eso, **la revisión humana deja de existir como etapa separada**: el revisor es el operador leyendo en pantalla, durante una reunión que iba a ocurrir de todas formas.

No hay un paso de aprobación posterior que pagar. El ahorro no es un traslado.

### El caveat más duro, que conviene decir antes de que lo pregunten

**Esas 32 a 40 horas no están hoy en el calendario.** Precisión no produce diagnósticos de cuatro días en volumen — justamente porque cuestan cuatro días.

Entonces el valor honesto de Calibrar **no es devolver horas ya ocupadas**. Es hacer económicamente posible un diagnóstico que hoy simplemente no se hace. Presentarlo como "libera 40 horas al mes" sería inflar un ahorro que no existe en la agenda actual.

| Lectura | ¿Es defendible? |
|---|---|
| "Libera 32–40 h por diagnóstico que hoy se hacen" | ❌ No. Ese volumen no existe hoy |
| "Baja el costo de producir un diagnóstico de 32–40 h de trabajo humano a menos de $350 en cómputo" | ✅ Sí. Es la afirmación correcta |

---

## 4 · La relación de costo

Ancla conservadora: **$6.000 CLP la hora administrativa en la RM** — cifra `[referencial]` del estudio de buyer persona, no una tarifa de Precisión. Se usa el piso a propósito: la hora de un consultor vale más, y eso solo agranda la brecha.

| | Método manual | Modo en vivo |
|---|---|---|
| Tiempo humano | 32 – 40 h | Dentro de una reunión ya existente |
| Costo del tiempo (a $6.000/h) | $192.000 – $240.000 | — |
| Costo de cómputo | $0 | $290 – $340 |

**El costo marginal del diagnóstico queda bajo el 0,2 % del costo del trabajo humano equivalente.**

Es el número grande de la lámina de costo. Y va con su reserva: compara un costo de tiempo estimado contra un costo de cómputo medido.

---

## 5 · Payback

**Numerador: `N/D`.** El payback exige saber cuánto cuesta terminar el desarrollo pendiente, y ese dato no existe: el motor está en pausa y las horas de Andrés Farías no están cotizadas — la agencia todavía no tiene su tarifario "desde".

Se declara `N/D` en vez de fabricarlo, que es la misma regla que el PRD le impone al modelo.

**Lo que sí se puede afirmar:** el payback se cuenta **en diagnósticos, no en meses**.

```
diagnósticos hasta recuperar  =  costo del desarrollo pendiente
                                 ─────────────────────────────
                                    $192.000 a $240.000
```

Con un ahorro de ese orden por diagnóstico, incluso un desarrollo de varios millones se recupera en **decenas de diagnósticos, no en cientos**. Cerrar el numerador es un paso concreto y barato: pedirle a Andrés la cotización de las horas pendientes.

---

## 6 · Lo que esta ficha NO afirma

- **No hay costo real medido de una corrida**, porque el motor nunca ha corrido. Todo el §2 sale de precios de lista aplicados a un conteo de tokens estimado por caracteres, no contado por la API.
- **No hay tasa de éxito, latencia ni consumo real.** Sin corridas no hay denominador. Se declara `N/D`.
- **La línea base de 4–5 días es declarada por el operador**, no cronometrada.

---

*Precisión Agencia · Proyecto Calibrar · Precios de API verificados el 30-jul-2026 · Línea base declarada por Pablo Opazo el 10-ago-2026 · Elaborado sobre PRD v5.5 e `Informe_Confiabilidad_Calibrar`*
