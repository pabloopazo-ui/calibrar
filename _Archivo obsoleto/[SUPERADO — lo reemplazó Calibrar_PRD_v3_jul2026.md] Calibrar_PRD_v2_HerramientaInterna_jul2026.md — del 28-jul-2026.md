# PRD — CALIBRAR
### Herramienta interna de segmentación de clientes potenciales
**Precisión Agencia · ppagencia.cl · Chile · Actualizado: julio 2026 (v2)**

> **Origen.** Calibrar nació en el Diplomado de IA (U. de los Andes) — la actividad *"Arma tu PRD"* de la sesión *"De la herramienta a la empresa"*. Pablo hizo el mismo ejercicio que hoy pide a los alumnos: llevar su propio PRD. **Este documento es ese PRD.** El diseño quedó completo; lo único pendiente era la producción (implementación técnica).

> **Naturaleza y estado (clave).** Calibrar **no es un producto que se venda** a terceros: fue diseñado como **herramienta interna de Precisión** para **segmentar y priorizar clientes potenciales**. **Hoy está EN PAUSA — no está en producción ni en uso.** Este PRD documenta el proyecto tal como se concibió; su valor actual es servir de ejemplo trabajado del ejercicio "Arma tu PRD".

---

## 1. Problema (1 frase)
Precisión prospecta y visita en terreno sin un criterio objetivo previo de qué tan mal está la pauta de cada prospecto — y por lo tanto no sabe **a quién priorizar** ni **con qué argumento entrar**, gastando tiempo comercial en cuentas que no califican.

- **Dolor central (interno):** "Invertimos tiempo de venta sin saber dónde está el dolor real ni quién puede contratar."
- **Antes:** prospección + visita en frío, sin diagnóstico previo del prospecto.
- **Costo de no tenerla:** esfuerzo comercial disperso; conversaciones sin gancho técnico específico.

## 2. Usuario (quién usa la herramienta)
- **Usuario de la herramienta:** el equipo comercial de Precisión — Pablo (estrategia y venta en terreno).
- **Sujeto que se segmenta:** clientes potenciales de Precisión, definidos por los **arquetipos oficiales de la agencia**:
  - **Rodrigo — "El Gestionador Solitario"**
  - **Carolina — "La Decepcionada de Agencia"**
  - *(Fuente: `Buyer_Persona_Precision_Agencia.docx`.)*
- **Para quién NO segmenta:** prospectos fuera del ICP de Precisión (sin pauta activa, sin capacidad de contratar gestión).

## 3. Solución / propuesta de valor (interna)
Calibrar toma el pre-análisis de un prospecto (28 preguntas / Matriz Exhaustiva de Cruces), lo procesa con Claude API y devuelve un diagnóstico estructurado de su pauta. El diseño contempla que Precisión pueda usar ese diagnóstico para:

1. **Segmentar y priorizar** — decidir a qué prospectos entrar primero según severidad del problema y ajuste al ICP.
2. **Armar la conversación de terreno** — llegar a la visita con los 3 problemas prioritarios y 3 acciones concretas ya identificados, en lenguaje de negocio (CAC, CPL, ticket).

*Valor interno previsto: convertir la prospección en una lista priorizada con argumento técnico, en vez de visitas en frío.*

## 4. Decisiones con evidencia
- **28 preguntas, no 7** — 7 preguntas no daban señal para los cruces diagnósticos. La Matriz Exhaustiva documenta ~50 cruces P1–P28. *(Vigente.)*
- **Sin cobro / sin pasarela de pago** — al ser herramienta interna se elimina todo el flujo de pago. *(El PRD anterior asumía Stripe, que además no opera para empresas chilenas; la pasarela de la agencia es Mercado Pago, pero aquí no aplica.)* *(Corregido.)*
- **Claude API como motor** — costo por diagnóstico ínfimo; la calidad depende del system prompt (benchmarks Chile verificados + regla de no fabricar datos). *(Vigente.)*
- **Fuente de verdad única: Matriz Exhaustiva de Cruces** — ningún deliverable puede contradecir sus 28 preguntas. *(Vigente.)*
- **Stack mínimo** — a definir en producción; sin dependencia de pasarela de pago ni landing de venta.

## 5. Métrica de éxito (verificable, interna)
| Métrica | Umbral |
|---|---|
| Prospectos segmentados/priorizados con diagnóstico | Cobertura de la base activa de prospección |
| Calidad del diagnóstico | Pablo llega a terreno sin rehacer el diagnóstico a mano |
| Conversión: segmentado → reunión en terreno | A definir con línea base (N/D) |
| Conversión: reunión → gestión mensual $590.000 + IVA | A definir con línea base (N/D) |

**Lo que NO es métrica:** informes vendidos · formularios iniciados · "el informe se ve bonito".

## 6. Guardrails / estilo
- **Identidad visual:** #0D4F6A (petróleo) + #F5A623 (amber), Montserrat. *(Vigente.)*
- **Lenguaje de negocio** (CAC, CPL, ticket, margen) — nunca impresiones / alcance / CTR.
- **IA:** sin fabricación de datos (campo sin evidencia = **N/D**); severidades CRÍTICO / MODERADO / LEVE; benchmarks solo de fuentes verificadas.
- **Uso interno** — Calibrar no se ofrece ni se comunica como producto a la venta.

## 7. Si automatizas — disparador + pasos
**Disparador:** Precisión carga el pre-análisis de un prospecto (28 preguntas).

| # | Módulo / Herramienta | Descripción |
|---|---|---|
| 1 | Webhook — Make | Recibe las respuestas |
| 2 | HTTP Fetch — Make | Obtiene la landing del prospecto (P12 = URL) |
| 3 | Prompt builder — Make | Ensambla P1–P28 + contenido de la landing |
| 4 | Claude API — Anthropic | Genera el diagnóstico (6 secciones). **Modelo a fijar en producción** — el ID `claude-sonnet-4-6` del PRD anterior no es válido; usar un modelo vigente (p. ej. `claude-sonnet-5`) |
| 5 | JSON parser — Make | Extrae y valida las 6 claves del output |
| 6 | Google Docs — Make | Rellena el template del diagnóstico. **Responsable: Andrés Farías** (reemplazó a Cristian) |
| 7 | PDF export — Drive | Informe interno para el equipo comercial |
| 8 | Google Sheets — Make | Log en el CRM de diagnósticos para la segmentación |

*Se eliminan los pasos de pago y de entrega al prospecto (Gmail / WhatsApp al cliente) por ser herramienta interna. Una notificación interna al equipo es opcional, a definir en producción.*

## 8. Alcance — qué SÍ / qué NO
| SÍ incluye | NO incluye |
|---|---|
| Diagnóstico interno de pauta Meta/Google de prospectos | Venta del diagnóstico como producto (sin cobro, sin precio, sin pilotos de precio) |
| 28 preguntas: viabilidad, medición, arquitectura, audiencia, copy, proceso de ventas | Entrega del informe al prospecto como entregable pagado |
| 3 problemas priorizados + 3 acciones, en lenguaje de negocio | Pasarela de pago (Stripe / Mercado Pago) en el flujo |
| Segmentación/priorización de la base de prospección | Gestión / optimización de campañas (ese es el servicio mensual, aparte) |
| Insumo para la conversación de terreno | Diagnóstico de orgánico, SEO o email marketing |

---

> **Estado:** proyecto del diplomado · diseño completo · producción pendiente · **EN PAUSA (no en uso)**.
> **Oferta comercial asociada (aparte, no es Calibrar):** gestión mensual Precisión — **$590.000 CLP + IVA / mes** (1 canal) · **$950.000** (2 canales), sin permanencia.

**Calibrar by Precisión Agencia** · *ppagencia.cl · Chile · Actualizado julio 2026 · Documento interno — no distribuir sin autorización de Pablo Opazo*
