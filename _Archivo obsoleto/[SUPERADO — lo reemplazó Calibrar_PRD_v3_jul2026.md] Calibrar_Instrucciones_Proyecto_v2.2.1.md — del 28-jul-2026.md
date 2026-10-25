> # ⚠️ DOCUMENTO SUPERADO — 28-jul-2026
>
> **La fuente de verdad de Calibrar es ahora `01 Producto/Calibrar_PRD_v3_jul2026.md` (v5.3).**
> Este documento describe un producto que ya no existe y **contradice el modelo vigente** en al menos cinco puntos:
>
> | Dice aquí | Vigente |
> |---|---|
> | "diagnostica por qué la pauta no genera leads" | Diagnostica **dónde se rompe el crecimiento comercial** y a cuál de las 7 áreas corresponde (Cadena de Crecimiento, eslabones **01 a 07**) |
> | `claude-sonnet-4-6` con `temperature: 0.4` (Secciones 9, 10 y 15) | `claude-sonnet-5` en vivo y `claude-opus-5` al cerrar. **`temperature` fue eliminado en esos modelos y devuelve error 400** — la profundidad se controla con `output_config.effort`. Ver PRD §5.5 |
> | Buyer persona = Rodrigo y Carolina | **Cuatro arquetipos** en dos listas — `Buyer_Persona_Precision_v2.md` |
> | Top-of-funnel para cerrar gestión mensual | Instrumento de calificación que rutea a **siete** áreas; muchas veces concluye que no corresponde gestión mensual |
> | Caso de prueba ContaBoost | **Eco Star** y **Vicsa/Bunzl**, cuentas reales |
> | `01 Producto/` contiene system prompt, caso e investigación de precio | Esos tres están en `_Archivo obsoleto/` |
>
> Se conserva por trazabilidad. **No lo uses para trabajar.**

# Instrucciones de Proyecto — Calibrar by Precisión Agencia
**Versión 2.2.1 · Julio 2026 · Uso interno — no distribuir**

> **Cambios v2.2 → v2.2.1 (17-jul-2026):** Reorganización de archivos: todo el proyecto Calibrar vive ahora en `PRECISION/Calibrar/` (la carpeta independiente "Calibrar IA" queda descontinuada). Estructura: `01 Producto/` (system prompt, matriz de cruces, caso de prueba, investigación de precio), `02 Prospeccion/` (base maestra de prospectos — renombrada a `Base_Prospectos_Calibrar_RM.xlsx` porque la cobertura es toda la RM, no solo el corredor norte —, estudio maestro, reporte de mantenimiento, subcarpeta `Semanales/`), `03 Archivo/` (estudios superseded de 4 comunas y narrativa podcast). El buyer persona se eleva a nivel agencia: los arquetipos Rodrigo y Carolina son el buyer persona oficial de toda la oferta de Precisión — documento en `PRECISION/Buyer_Persona_Precision_Agencia.docx`. La tarea programada semanal de prospectos escribe en las rutas nuevas.
>
> **Cambios v2.1 → v2.2 (25-jun-2026):** Pivote estratégico: Calibrar pasa a fase de herramienta interna mientras se construyen referencias reales de clientes — la venta externa del producto se activa cuando haya casos documentados. La prioridad comercial inmediata es captación B2B vía visita técnica directa. Equipo actualizado: Cristian reemplazado por **Andrés Farías (Ingeniero Civil Industrial)** como responsable de implementaciones técnicas, automatizaciones y demos en vivo. Se agregan: arquetipos de buyer persona (Rodrigo y Carolina) en Sección 5, nota de fase actual en Sección 1, actualización de servicios activos con automatizaciones e IA.
>
> **Cambios v2.0 → v2.1:** Stripe reemplazado por Mercado Pago (Stripe no opera para empresas chilenas — verificado jun-2026). Se agregan: flujo de facturación SII, secuencia anti-abandono post-pago, gate de aprobación humana en piloto, garantía de devolución 100%, secuencia de seguimiento post-entrega, manejo de edge cases del pipeline, requisitos legales (T&C, privacidad), lead time de Twilio y métricas de éxito del piloto.

---

## 1. Qué es este proyecto

Estamos construyendo **Calibrar**, un producto de IA de Precisión Agencia que diagnostica por qué la pauta de una empresa no genera los leads que necesita. El objetivo comercial es usarlo como top-of-funnel para cerrar clientes en gestión mensual de Meta Ads y Google Ads.

> **Fase actual (jun-2026):** Calibrar opera como herramienta interna de diagnóstico. La prioridad comercial inmediata es captación de nuevos clientes B2B mediante **visita técnica directa** — Pablo visita las empresas, aplica el diagnóstico en reunión, y propone gestión mensual o automatizaciones. La venta externa de Calibrar como producto de pago se activa cuando haya 10+ casos de éxito documentados y referencias reales. La oferta en construcción combina tres ejes: (1) diagnóstico de pauta, (2) diagnóstico de procesos y automatización, (3) agentes IA y automatizaciones a medida.

**Nombre completo:** Calibrar · Precisión  
**Nombre extendido:** Calibrar by Precisión Agencia  
**Por qué el nombre:** Es un verbo en español. Describe exactamente lo que hace el producto.  
**Dominio a verificar:** calibrar.cl / calibrar.ai

---

## 2. Definición del producto

Un diagnóstico preciso de por qué la inversión en pauta de una empresa no genera los leads que necesita — y qué cambiar primero para que sí lo haga.

No promete resultados. No gestiona campañas. No implementa. Entrega certeza sobre un problema específico. El valor no es el PDF — es la respuesta a la pregunta que el cliente lleva meses haciéndose.

### Precio
- Informe puntual (pago único): **$59.990 CLP**
- Precio piloto: $29.990–$39.990 CLP, enmarcado como "precio de lanzamiento por tiempo limitado"
- **Garantía de devolución del 100%** si el cliente no encuentra valor en el informe — palanca clave contra el ancla de $0 de las auditorías gratuitas de agencias
- Roadmap: versión SaaS recurrente con monitoreo continuo y alertas

### Lo que el producto NO hace — límites exactos
- No garantiza resultados ni leads
- No gestiona campañas
- No implementa las recomendaciones
- No reemplaza la reunión con Pablo — la prepara
- No hace auditorías gratuitas ni diagnósticos de cortesía

---

## 3. Arquitectura del funnel (Option B — actualizada v2.1)

```
Meta Ad (Región Metropolitana)
  → Landing page ppagencia.cl/calibrar
      → 3-4 preguntas calificadoras (pre-pago, Tally)
        + campos de facturación: RUT, razón social, giro
        + checkbox de aceptación de T&C y política de privacidad
      → Pago Mercado Pago — link de pago ($59.990 CLP)
  → SECUENCIA ANTI-ABANDONO:
      → Email inmediato post-pago con link al formulario de 28 preguntas
      → +24h sin formulario completado: recordatorio WhatsApp
      → +72h sin respuesta: WhatsApp personal de Pablo ofreciendo
        completarlo juntos por teléfono (15 min)
  → Cliente completa formulario de 28 preguntas (Google Form)
      → Respuestas van a Google Sheets CRM "CRM Diagnósticos · Precisión"
  → Make recibe webhook → fetch landing del cliente → Claude API genera informe
  → GATE DE CALIDAD (solo piloto): PDF llega primero a Pablo,
    que aprueba o corrige antes del envío
  → Entrega: PDF por email (Gmail) + factura electrónica
    + notificación WhatsApp (Twilio)
  → SECUENCIA POST-ENTREGA:
      → D+1: email "¿Alguna duda sobre los 3 problemas que encontramos?"
      → D+3: WhatsApp con invitación directa a la reunión estratégica
  → CTA del informe: "Agenda tu reunión estratégica" → Calendly
  → Pablo entra con informe en mano → reunión de cierre
  → Propuesta de gestión mensual ($590.000 CLP + IVA / 1 canal)
```

**Preguntas calificadoras pre-pago (3–4 preguntas):** invierten en pauta, monto mínimo, tienen pauta activa hoy, plataforma.  
**Formulario post-pago (28 preguntas):** es el diagnóstico completo. La fuente autoritaria de todas las preguntas es el documento **Matriz Exhaustiva de Cruces** — ningún entregable puede contradecirlo.

---

## 4. Pagos y facturación — decisión cerrada v2.1

### Por qué NO Stripe
Verificado en junio 2026: **Stripe no permite el registro de empresas chilenas.** Operar con Stripe requeriría constituir una LLC en EE.UU. — complejidad incompatible con los principios del proyecto.

### Decisión: Mercado Pago

| Criterio | Detalle |
|---|---|
| Modalidad piloto | Link de pago (sin desarrollo, operativo en minutos) |
| Integración Make | Módulos nativos de Mercado Pago para webhook post-pago |
| Comisión | ~3,5% [referencial — confirmar tarifa vigente en la cuenta] |
| Impacto vs Stripe | ~$360 CLP más por venta sobre $59.990 — irrelevante para el margen |
| Tarjetas empresa | Acepta tarjetas de crédito empresariales (perfil B2B) |

### Facturación SII — responsable: Álvaro
- El ICP paga con tarjeta de empresa y **exigirá factura electrónica** para descontar IVA.
- Datos de facturación (RUT, razón social, giro) se capturan en el formulario calificador de Tally, **antes** del pago.
- La factura se emite junto con la entrega del informe.
- Pendiente de Álvaro: definir facturador electrónico (SII gratuito u otro) y validar el flujo boleta vs factura.

### Reembolsos — política escrita obligatoria antes del lanzamiento
- Garantía de devolución del 100% si el cliente no encuentra valor (plazo a definir, ej. 7 días desde la entrega).
- Si el cliente paga y nunca completa el formulario pese a la secuencia anti-abandono: definir plazo máximo (ej. 30 días) y condición de reembolso.

---

## 5. Cliente objetivo

### Perfil exacto
- Dueño o gerente de PYME B2B o B2C consolidada, Región Metropolitana de Chile
- Tiene pauta activa en Meta Ads o Google Ads (mínimo $100.000 CLP/mes)
- Lleva semanas o meses invirtiendo sin retorno claro
- Ya intentó algo: tuvo agencia, lo hizo solo, probó varias cosas
- Busca respuestas específicas, no vendedores

### Momento de máximo dolor (trigger moment)
30 días con campaña activa, presupuesto gastado, sin resultados que justifiquen continuar.

### Para quién NO es — límites de exclusión
- Empresas sin pauta activa
- Startups sin modelo de negocio validado
- Negocios con inversión mensual en pauta inferior a $100.000 CLP
- Negocios sin landing ni sitio web (venden solo por WhatsApp/Instagram)

### Arquetipos de comprador (buyer personas)

> **Alcance ampliado (jul-2026):** Estos arquetipos son el **buyer persona oficial de Precisión Agencia completa** — no solo de Calibrar. Aplican a gestión de pauta, automatizaciones y agentes IA. Estudio completo: `PRECISION/Buyer_Persona_Precision_Agencia.docx`.

**Rodrigo Figueroa — "El Gestionador Solitario"**
- Dueño de PYME B2C consolidada (retail, servicios al consumidor), 38–48 años
- Gestiona sus propias campañas o las delegó a un colaborador interno sin formación en pauta
- Inversión activa: $150.000–$400.000 CLP/mes en Meta Ads
- Dolor: lleva meses invirtiendo sin entender si el problema es el copy, la segmentación o el presupuesto
- Urgencia media: quiere mejorar pero no siente crisis inmediata aún
- Ruta de compra: busca en Google, compara opciones, lee testimonios antes de decidir
- Trigger de máximo dolor: mes con ROAS bajo el break-even sin explicación clara

**Carolina Müller — "La Decepcionada de Agencia"**
- Dueña o gerenta de PYME B2B o servicio de alto ticket, 35–50 años
- Pasó por 2 o más agencias; frustrada con promesas incumplidas y resultados vagos
- Inversión activa: $200.000–$800.000 CLP/mes en Meta Ads o Google Ads
- Dolor: pagó meses de retainer sin resultados claros; sospecha que el problema es estructural y que nadie le ha dicho la verdad
- Urgencia alta: el costo de oportunidad acumulado ya es evidente en su negocio
- Ruta de compra: desconfiada, exige prueba de competencia antes de cualquier conversación de venta
- Trigger de máximo dolor: fin de contrato con la última agencia o CPL que no cierra ningún negocio

---

## 6. Propuesta de valor y comunicación

### Gancho principal aprobado (Meta Ads)
> "No es tu presupuesto. Es tu anuncio, tu landing y tu segmentación."

### Variantes aprobadas

| Contexto | Copy |
|---|---|
| Audiencia fría — alta intención de cambio | "Antes de cambiar de agencia, audita tu pauta. Puede que el problema no sea la agencia." |
| Retargeting | "Llevas meses pagando anuncios. En 15 minutos te decimos exactamente qué está mal — sin hablarte de nuestros servicios primero." |
| Retargeting + garantía | Incluir la garantía de devolución del 100% en retargeting y en la sección de precio de la landing. |

### Diferenciación vs. alternativas

| Alternativa | El problema |
|---|---|
| Consulta gratis de agencia | Es una llamada de ventas. El diagnóstico está sesgado hacia vender su retainer. |
| Herramientas SaaS (Opteo, Madgicx) | Suscripciones en inglés que requieren interpretar dashboards. No diagnostican. |
| Contratar consultor | Mínimo $300K–$800K CLP. Semanas de espera. Inaccesible para PYMEs. |
| No hacer nada | Sigue gastando sin saber qué cambiar. El costo de no saber supera el informe. |
| **Calibrar** | Sin sesgo comercial. Personalizado. Garantía 100%. Sin reunión previa. |

---

## 7. Estructura del informe (6 secciones — output del Claude API)

| N° | Sección | Qué contiene |
|---|---|---|
| 1 | Diagnóstico rápido | 3 hallazgos principales. Executive summary para leer en 60 segundos. |
| 2 | Análisis del copy del anuncio | ¿Filtra al ICP? ¿El hook usa negación? ¿El CTA genera fricción? |
| 3 | Análisis de la landing page | Message match anuncio–landing. CTA. Evidencias de conversión. |
| 4 | Evaluación de la configuración | Objetivo, segmentación y presupuesto vs. meta de leads. |
| 5 | Los 3 problemas críticos | Ordenados por impacto en CAC. Concretos, sin eufemismos. |
| 6 | Las 3 acciones prioritarias | Qué cambiar esta semana. Cierra con CTA a reunión con Pablo. |

---

## 8. Formulario de diagnóstico (28 preguntas — post-pago)

**Fuente autoritaria:** documento *Matriz Exhaustiva de Cruces*.  
**Ningún entregable puede definir preguntas distintas a las de ese documento.**  
**Las preguntas están organizadas en 6 grupos funcionales**, conectadas al Google Sheets CRM "CRM Diagnósticos · Precisión".

| Grupo | Foco |
|---|---|
| A | Viabilidad económica (ticket, presupuesto, plataforma) |
| B | Configuración técnica (Pixel, CAPI, eventos, UTMs) |
| C | Audiencia vs. plataforma |
| D | Síntoma vs. causa |
| E | Madurez y proceso de ventas |
| F | Copy del anuncio y arquitectura de conversión |

---

## 9. Stack técnico (actualizado v2.1)

| Herramienta | Función | Costo |
|---|---|---|
| WordPress (ppagencia.cl/calibrar) | Landing page — gestión: Andrés Farías | Ya activo |
| Tally | Formulario calificador pre-pago + datos de facturación + checkbox T&C | Gratuito |
| Google Form | Formulario de 28 preguntas post-pago | Gratuito |
| Google Sheets | CRM de diagnósticos | Gratuito |
| **Mercado Pago** | Cobro de $59.990 CLP — link de pago | ~3,5% [referencial] |
| Facturador electrónico SII | Emisión de factura — gestión: Álvaro | A definir |
| Make | Automatización central (3 fases, 16 módulos) | Ya activo |
| Claude API (claude-sonnet-4-6) | Generación del informe — parámetros: `temperature: 0.4`, `max_tokens: 6000` | ~$30 CLP / informe |
| Google Docs | Template del informe PDF — gestión: Andrés Farías | Gratuito |
| Gmail via Make | Entrega email con PDF adjunto + secuencias | Gratuito |
| Twilio WhatsApp | Recordatorios + notificación de entrega + seguimiento | ~$30 CLP / mensaje |
| Calendly | Booking de reunión con Pablo | Gratuito |

**Costo total por informe entregado:** ~$2.300 CLP (comisión MP + Claude API + 2–3 mensajes Twilio)  
**Margen bruto: ~96%**

---

## 10. Arquitectura Make (3 fases, 16 módulos — actualizada v2.1)

### Fase 1 — Pago y onboarding
```
Módulo 1   →  Webhook Mercado Pago (trigger pago confirmado)
Módulo 2   →  Gmail: email inmediato con link al formulario de 28 preguntas
Módulo 3   →  Scheduler +24h: si formulario no completado → recordatorio WhatsApp (Twilio)
Módulo 4   →  Scheduler +72h: si sin respuesta → alerta a Pablo para WhatsApp
              personal ("completémoslo juntos por teléfono, 15 min")
```

### Fase 2 — Generación del informe
```
Módulo 5   →  Webhook Google Form (28 respuestas recibidas)
Módulo 6   →  Fetch landing del cliente (URL de P1)
Módulo 7   →  Enriquecimiento de datos (Google Sheets lookup)
Módulo 8   →  Claude API (system prompt maestro + respuestas P1–P28)
              Parámetros: model: claude-sonnet-4-6 · temperature: 0.4 · max_tokens: 6000
              ⚠️ NO COPIAR A MAKE: temperature devuelve error 400 en los modelos
              vigentes. Parámetros correctos en el PRD §5.5.
Módulo 9   →  Parser JSON output del informe
Módulo 10  →  Google Docs template fill (PDF)
Módulo 11  →  GATE DE CALIDAD (solo piloto): PDF a Pablo para aprobación
              manual antes del envío. Se retira al pasar a precio regular.
```

### Fase 3 — Entrega y seguimiento
```
Módulo 12  →  Gmail: envío PDF al cliente + factura electrónica
Módulo 13  →  Twilio: notificación WhatsApp de entrega
Módulo 14  →  Google Sheets: log CRM del diagnóstico entregado
Módulo 15  →  Scheduler D+1: email "¿Alguna duda sobre los 3 problemas
              que encontramos?"
Módulo 16  →  Scheduler D+3: WhatsApp con invitación directa a la
              reunión estratégica (Calendly)
```

### Manejo de edge cases — obligatorio en el build

| Caso | Comportamiento definido |
|---|---|
| Landing caída o inexistente al momento del fetch (Módulo 6) | El informe marca la sección 3 como N/D con nota explicativa. El pipeline NO falla ni inventa contenido. |
| Cliente sin landing/sitio web | Filtrado en el calificador pre-pago (no llega a comprar). |
| Respuestas contradictorias (ej. P16 "no tengo Pixel" + P19 "tengo eventos") | El system prompt las trata como cruce CRÍTICO de inconsistencia según la Matriz; señala la contradicción, no la resuelve arbitrariamente. |
| Respuestas incompletas o ambiguas | Campos sin dato se marcan N/D en el informe. Nunca se fabrica. |

**Secuencia de build recomendada:** Google Doc template → Make Fase 2 con datos fijos de prueba → validar módulo Claude API → Fase 3 → Fase 1 (Mercado Pago + Tally) al final.

---

## 11. Requisitos legales y de plataforma — antes del lanzamiento

| Requisito | Detalle | Responsable |
|---|---|---|
| Términos y condiciones | Publicados en la landing; checkbox obligatorio en Tally antes del pago. Incluyen garantía, plazos de entrega, política de reembolso. | Álvaro (revisión legal) |
| Política de privacidad | Se recopilan datos comerciales sensibles (presupuestos, CPL, problemas internos). Publicar política y verificar obligaciones bajo la Ley 21.719. | Álvaro |
| Plantillas WhatsApp Twilio | Requieren aprobación de Meta + verificación del Meta Business Manager. **Lead time: 1–2 semanas. Iniciar AHORA.** | Pablo |
| Facturación electrónica | Definir facturador y flujo boleta/factura. | Álvaro |

---

## 12. Contexto de Precisión Agencia

| Campo | Dato |
|---|---|
| Nombre | Precisión Agencia |
| Sitio | ppagencia.cl |
| Instagram | @ppagencia |
| Sede | Chicureo, Región Metropolitana |
| Modelo | Boutique de performance marketing con IA como leverage |
| Servicios activos | Meta Ads, Google Ads, desarrollo web, automatizaciones e IA (en construcción con Andrés Farías) |
| Clientes activos | Korea Market, Eco Star |
| Precio gestión mensual | $590.000 CLP + IVA (1 canal) / $950.000 CLP + IVA (2 canales) |
| Condición de contrato | Sin permanencia |

### Identidad visual
- **Color primario:** #0D4F6A (petróleo azul)
- **Color de acento:** #F5A623 (amber)
- **Tipografía títulos:** Montserrat Black
- **Tipografía cuerpo:** Montserrat Regular / Medium

### Equipo
| Persona | Rol |
|---|---|
| Pablo Opazo | CEO, estratega, vendedor principal — realiza visitas técnicas B2B solo |
| Álvaro | Co-propietario, área financiera, administrativa y legal |
| Andrés Farías | Ingeniero Civil Industrial — implementaciones técnicas, automatizaciones, demos en vivo para visitas |

### Links operativos
- **Calendly:** calendar.app.google/oStuhVQG51hj8oWk8
- **GTM Container:** GTM-5LWQQFGM
- **Make Webhook Fase 2:** https://hook.us2.make.com/6n6ck7uwnu8b0n9u479xu97kpe1woi8f
- **Make Escenario Fase 2 ID:** 5362575

---

## 13. Métricas de éxito del piloto

| Métrica | Target | Qué decide |
|---|---|---|
| Pago → formulario completado | > 85% | Salud de la secuencia anti-abandono |
| Informe entregado → reunión agendada | > 25% | Eficacia de la secuencia post-entrega y del CTA |
| Reunión → cierre de retainer | > 20% | El negocio real: el informe como top-of-funnel |
| Conversión landing → pago a precio piloto | < 2–3% con testimonios → reforzar garantía. > 8–10% → subir precio antes. | Calibración del precio regular |

**Objetivo del piloto:** 20–40 informes vendidos, 10+ testimonios, al menos 1 resultado cuantificado antes de subir a $59.990.

---

## 14. Estado del proyecto (junio 2026)

### Completado ✅
- [x] Nombre del producto definido: Calibrar
- [x] Análisis de mercado, FODA y modelo de precios
- [x] Formulario de 28 preguntas (Google Form, 6 secciones, conectado a Google Sheets)
- [x] Matriz Exhaustiva de Cruces (~50 cruces, severidades, benchmarks Chile 2026)
- [x] System prompt maestro Claude API (XML, 8 pasos, schema JSON 6 secciones)
- [x] Arquitectura Make (3 fases / 16 módulos, v2.1)
- [x] Prototipo React demo (4 pantallas, datos ContaBoost, Claude API en vivo)
- [x] Brief creativo (visual, copy, formatos: 3 Reels, 2 Feed, 1 Story, 1 landing)
- [x] Prompts Veo 3.1 (3 prompts en inglés con Scene Extension)
- [x] Brief de remediación ppagencia.cl (20 tareas — originalmente para Cristian, ahora responsabilidad de Andrés Farías)
- [x] Brief landing page ppagencia.cl/calibrar (21 tareas, 8 secciones, /calibrar-gracias)
- [x] Gancho principal y variantes de copy aprobadas
- [x] Base de datos de ~100 empresas B2B Santiago para prospección
- [x] Auditoría de comercialización v2.1 (pagos, legal, anti-abandono, seguimiento)
- [x] Make Fase 2: escenario creado (ID 5362575), webhook activo, módulo Claude API y JSON parser configurados

### Bloqueadores activos 🔴

| Bloqueador | Responsable | Prioridad |
|---|---|---|
| Mercado Pago: cuenta empresa no configurada; links de pago sin crear | Álvaro | CRÍTICO |
| Facturador SII y flujo de facturación sin definir | Álvaro | CRÍTICO |
| T&C y Política de Privacidad pendientes de revisión legal | Álvaro | CRÍTICO |
| Meta Business Manager verificación pendiente | Pablo | CRÍTICO |
| Plantillas WhatsApp Twilio: aprobación Meta (lead time 1-2 semanas) | Pablo | CRÍTICO — iniciar ya |
| Google Doc PDF del informe: template no construido | Andrés Farías | CRÍTICO |
| Apps Script: actualización para POST webhook con field names p1_tipo_negocio → p28_intentos | Andrés Farías | CRÍTICO |
| Landing Carrd ppagencia.cl/calibrar: pendiente | Andrés Farías | CRÍTICO |
| Make Fases 1 y 3: requieren upgrade del plan (límite de 2 escenarios en Free) | Pablo/Álvaro | CRÍTICO |
| Make: cuenta Google no conectada (Gmail y Google Sheets deben vincularse por OAuth) | Pablo | MODERADO |
| Privacy Policy URL: requerida antes de publicar T&C | Andrés Farías | MODERADO |
| Andrés Farías: Excel con productos/servicios estandarizados y precios aún no entregado | Andrés Farías | MODERADO — bloqueador para diseñar oferta de automatizaciones |
| Definir oferta de visita técnica (pauta + automatización + IA): no ejecutable hasta recibir Excel | Pablo | MODERADO |

---

## 15. Variables de referencia — tabla de coherencia

| Variable | Valor correcto |
|---|---|
| Número de preguntas del formulario diagnóstico | 28 |
| Preguntas calificadoras pre-pago | 3–4 |
| Secciones del informe | 6 |
| Precio regular | $59.990 CLP |
| Precio piloto | $29.990–$39.990 CLP |
| Garantía | Devolución 100% |
| Margen bruto por informe | ~96% |
| Costo estimado por informe | ~$2.300 CLP (MP + Claude API + Twilio) |
| Costo estimado Claude API por informe | ~$30 CLP |
| Plataforma de pago | **Mercado Pago** (link de pago en piloto) |
| Facturación | Factura electrónica SII (datos capturados pre-pago en Tally) |
| Modelo de entrega del informe | Email PDF + factura + WhatsApp |
| Promesa de tiempo de entrega (piloto) | < 24 horas |
| Módulos Make | 16, en 3 fases |
| Modelo de Claude API | claude-sonnet-4-6 |
| Temperature Claude API | 0.4 (diagnóstico analítico — consistencia sobre creatividad) |
| Max tokens Claude API | 6.000 (suficiente para las 6 secciones del informe) |
| Make Webhook Fase 2 | https://hook.us2.make.com/6n6ck7uwnu8b0n9u479xu97kpe1woi8f |

---

## 16. Copy que no puede usarse hasta que la automatización esté viva

Durante el piloto con gate de calidad activo:
- ❌ "diagnóstico automatizado"
- ❌ "sin intervención humana"
- ❌ "recibes tu informe en minutos"
- ✅ "recibes tu informe en menos de 24 horas"

Todo copy debe reflejar lo que el producto puede cumplir hoy.

---

*Documento interno Calibrar by Precisión Agencia · Versión 2.2 · Junio 2026 · No distribuir sin autorización*
