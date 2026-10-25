# Decisiones para la corrección crítica de Calibrar

> **Qué es esto.** Las decisiones que Pablo tomó el 22-ago-2026 para corregir los hallazgos
> críticos del mantenimiento semanal del 21-ago. Se escribe acá para que el chat de ejecución
> arranque ejecutando y no volviendo a preguntar.
>
> **Estado: TODAS LAS DECISIONES TOMADAS (22-ago-2026).** Los seis bloques cerrados; lo único
> abierto son **2c, 2d y 2f, que son de Álvaro** (retención general, canal de derechos y resolverlo
> una vez para los tres frentes). El chat de ejecución puede arrancar sin preguntar nada más.
> Reporte de origen: `Calibrar/02 Prospeccion/Reporte_Mantenimiento_Semanal.md` (21-ago).

## Orden de ejecución (propuesto, pendiente de confirmar en 5b)

1. Ley 21.719 en la cabina — único frente con dato de un tercero ya escrito en disco
2. Anexo E → regenerar `prompt_maestro.js` → correr `qa_cabina.py` **en ese orden**
3. Catálogo §3.1 (Automatizaciones)
4. Resto: QA, archivos de datos, `CLAUDE.md`

---

## Bloque 1 · Anexo E — CERRADO (22-ago-2026)

El Anexo E del PRD es el System Prompt Maestro y desde el 19-ago **corre en producción**: la
cabina lo manda verbatim a la API. Estuvo escrito para el producto viejo («diagnóstico de
pauta», dos arquetipos) durante cuatro semanas; se cerró el 22-ago con los cuatro arquetipos.
Hoy lo verifican `qa_calibrar.py` (arquetipos) y `qa_cabina.py` (hash del Anexo E).

| # | Decisión |
|---|---|
| **1a** | El rol pasa de *«analista de medios pagados senior»* a **«consultor senior de crecimiento comercial B2B»**. |
| **1b** | **Opción A — el arquetipo se le pasa al motor como dato de entrada.** Se acaba el «escribe a ciegas para los dos»: el motor sabe a quién le escribe y adapta el lenguaje. |
| **1c** | Las **5 creencias instaladas se reescriben para los cuatro arquetipos**. Hoy las cinco suponen que el lector pauta. Ignacio (no pauta, dolor de operación) y Marcelo (corporativo, protege su reputación interna) necesitan las suyas — **y las de Marcelo son de otra naturaleza: su miedo no es haber gastado mal, es quedar expuesto hacia arriba**. |
| **1d** | `<limites_del_producto>` deja de cerrar con *«El informe cierra invitando a una reunión estratégica»* (resto del funnel de venta externa, ya inexistente). **Cierra con el próximo paso acordado en la reunión, con fecha.** |
| **1e** | **Claude propone la reescritura completa** de los tres bloques; Pablo aprueba o corrige. La decisión de contenido sigue siendo de Pablo. |
| **1f** | **Opción (i) — el arquetipo lo elige Pablo en la cabina**, con un selector de cuatro opciones. Para cuando cierra el triage ya lo sabe. Nada de derivarlo por una regla que hoy no existe. |
| **1g** | **Si el arquetipo no viene** (reunión a medias, vía B sin triage): el motor **escribe en modo neutro y lo declara**. Nunca asume Rodrigo por defecto. Misma regla que ya rige para el eslabón indeterminable. |

### Alcance real de 1b — seis lugares, una sola pasada

La palabra «arquetipo» **no existe hoy en el contrato**. Crear el campo toca:

| Archivo | Qué cambia |
|---|---|
| PRD **Anexo F.2** | bloque nuevo `<arquetipo>` en el contrato de entrada |
| PRD **Anexo E** | el prompt lo lee y adapta el lenguaje |
| `04 Cabina/assets/motor_api.js` | arma el bloque y lo envía |
| `04 Cabina/` (ficha) | el selector de cuatro opciones (decisión 1f) |
| `01 Producto/qa_calibrar.py` | verificación nueva del contrato |
| `04 Cabina/qa_cabina.py` | *«los nombres de campo del Anexo F.2 están completos»* **se pone roja** si no se actualiza junto |

### ⚠️ Orden obligatorio, o se rompe un test que hoy está verde

`qa_cabina.py` verifica **por hash** que `assets/prompt_maestro.js` sea VERBATIM el Anexo E.
Es una buena verificación —impide que la cabina derive del PRD por su cuenta— pero hoy su
efecto es **fijar el defecto**. Va, sin excepción:

1. Corregir el **Anexo E** en el PRD
2. Regenerar **`prompt_maestro.js` desde él**
3. Recién ahí correr **`qa_cabina.py`**

### Nota de diseño (no requiere decisión)

La cabina hace **dos** llamadas: el turno en vivo (`claude-sonnet-5`, effort `low`) durante la
reunión, y el cierre (`claude-opus-5`, effort `high`). El arquetipo recién se aclara **durante**
el triage, así que el turno en vivo puede dispararse sin el dato. Lo cubre 1g: modo neutro
declarado. El selector arranca vacío y se fija cuando se aclara.

---

## Bloque 2 · Ley 21.719 — PARCIAL (22-ago-2026)

Único frente donde el dato de un tercero **ya está escrito en disco**.

| # | Decisión |
|---|---|
| **2a** | **Opción A — anonimizar a rol.** Se conserva el archivo íntegro (sirve para trabajar la cuenta) y se reemplaza el nombre por el cargo. |
| **2b** | **De acuerdo — el campo de la cabina deja de pedir el nombre.** Pasa de *«Nombre y rol de cada uno»* a **solo cargo/rol**, para que el problema no se reproduzca en cada reunión. |
| **2e** | **Pablo NO usó la cabina en la reunión de Aforo del 20-ago.** Consecuencia importante: **el inventario está completo** — los dos `.json` de AMBROT son todo lo que hay, y no quedan datos sueltos en el `localStorage` del navegador. El arreglo es acotado y verificable. |

### ⚠️ 2g — dato que falta para poder ejecutar 2a

Los archivos **no guardan ningún cargo**: `ficha.quienes` es solo `"Matías Retamal"`. El único
«dueño» del JSON es una respuesta sobre cómo compran *los clientes de Ambrot* (`N4`), no sobre él.

**Pendiente: el cargo de Matías Retamal en AMBROT.** Si no está confirmado, se escribe
`Contraparte · AMBROT` — la regla de la casa es `N/D` antes que dato fabricado.

### Hallazgo lateral, de la cuenta y no de la ley

La propuesta dice *«Preparado para **Allan** Retamal · AMBROT»* y la cabina registró la reunión
con **Matías** Retamal. Mismo desajuste ya anotado (el correo lo firma Matías, no Allan). O son
dos personas —y el documento va dirigido a quien no estuvo en la reunión— o el encabezado está
mal. **Zanjar antes de la reunión del martes 25.** No es parte de este arreglo.

### Abierto — es de Álvaro, no de Pablo

| # | Qué falta | Por qué es de Álvaro |
|---|---|---|
| **2c** | Plazo de **retención** de una reunión | definición legal |
| **2d** | **Canal de derechos** publicado (qué dirección) | definición legal |
| **2f** | Si se resuelve **una vez para los tres frentes** (prospección · cabina · tienda GEA) o solo Calibrar | alcance de cumplimiento |

Recomendación en pie: **una vez para los tres**. Hoy el mismo trabajo se está haciendo tres
veces a medias, y GEA ya tiene su página de privacidad en borrador esperándolo.

---

## Bloque 3 · Catálogo §3.1 Automatizaciones — CERRADO (22-ago-2026)

Quinta semana bloqueado. Es lo que más se ofrece en terreno y hoy no se puede cotizar
ni comprometer plazo, con 623 visitables en ruta.

### El hallazgo que enmarca todo: no hay ancla porque los dos tarifarios están vacíos

| Archivo | Estado |
|---|---|
| `SOLICITUDES 2026 + TARIFARIO - DESARROLLO Y AUTOMATIZACIONES.xlsx` | taxonomía completa, **0 celdas con valor** |
| `PRESUPUESTOS/Tarifario_Desde_Desarrollo_IA_paraAndres.xlsx` | 59 líneas de estructura y la metodología del «desde» bien escrita, **0 valores**. Desde el 29-jul |
| hoja `JULIO` (trabajos ejecutados) | solo el encabezado — **ningún trabajo de automatización con monto real** |

**Y el marco cambió con lo que dijo Pablo:** *«el lunes me junto con Andrés, pero siempre será
por cotizar sus cosas»*. Si Andrés cotiza caso a caso, **el tarifario no va a llegar nunca**.
Esto no es un parche provisional: **es el método de precio de la casa**, con Andrés cotizando
encima cada trabajo concreto. El catálogo debe decirlo así y no prometer un tarifario inexistente.

| # | Decisión |
|---|---|
| **3a** | **Pablo fija el rango**, no se sigue esperando a Andrés. |
| **3b** | No hay ancla previa: ningún trabajo de automatización ejecutado tiene monto registrado. |
| **3d** | **Valor hora = $25.000** … y **3g: es COSTO, no precio de venta.** |
| **3e** | §3.1 se expresa con **alcance literal del «desde» + HH estimadas + plazo**, rotulado como referencia sujeta a confirmación técnica. |
| **3f** | **Opción A** — las HH las propone Claude, razonadas desde la taxonomía de la planilla, **marcadas como estimación a validar con Andrés**. |
| **3h** | **Al catálogo van solo HH, alcance y plazo — sin cifra.** El número lo dice Pablo en la visita. Coherente con la regla ya vigente de que los precios no van a la visita. |
| **3c** | Reunión con Andrés el **lunes 24-ago**. Sirve para validar las HH, no para esperar un tarifario. |

### Las dos piezas — estimación a validar

**Automatización de cotización**
- *Alcance del «desde»:* una plantilla, una lista de precios como fuente, entrada por formulario, salida en PDF al correo del cliente, registro de cada cotización emitida.
- ~8-10 módulos Make → categoría **«intermedio (6 a 15 módulos)»** de la propia taxonomía
- **16 HH** (levantamiento del proceso actual, construcción, pruebas con casos reales, entrega) · **plazo ~2 semanas** · costo interno $400.000

**Captura y respuesta en WhatsApp**
- *Alcance del «desde»:* conexión a WhatsApp Business API, respuesta automática de preguntas frecuentes desde base de conocimiento acotada, derivación a humano cuando no sabe, registro de cada conversación.
- ~12-16 módulos; **cruza dos líneas más de la taxonomía** (*Integración WhatsApp Business API* y *Agente IA con base de conocimiento*). Es la más cara de las dos.
- **24 HH** · **plazo ~3-4 semanas** · costo interno $600.000
- ⚠️ **Decirlo en la visita:** la verificación del número por parte de Meta no depende de Precisión y es la que suele atrasar.

### Cierre del bloque (3i · 3j · 3k)

| # | Decisión |
|---|---|
| **3i** | **Margen 2,5x sobre el costo.** |
| **3j** | El número interno vive en el tarifario… **corregido por 3k** (ver abajo). |
| **3k** | **Opción A — archivo interno propio.** |

**Números que resultan** (a validar el 24-ago):

| Pieza | HH | Costo | **Venta neta** |
|---|---|---|---|
| Automatización de cotización | 16 | $400.000 | **$1.000.000** |
| Captura y respuesta WhatsApp | 24 | $600.000 | **$1.500.000** |

### ⚠️ Por qué 3j se ejecutó distinto de como se preguntó

El `Tarifario_Desde_..._paraAndres.xlsx` **viaja a Andrés** — su encabezado dice *«Para completar
por Andrés Farías»*. Escribir ahí el precio de venta le habría mostrado al colaborador el margen
de 2,5x que se le aplica encima. Se separó en dos:

| Archivo | Qué lleva | Quién lo ve |
|---|---|---|
| `PRESUPUESTOS/Tarifario_Desde_..._paraAndres.xlsx` | alcance · **HH** · qué lo encarece · stack · plazo. **`Desde — neto CLP` en blanco a propósito: es el número de Andrés** | Andrés |
| `PRESUPUESTOS/Precios_Venta_Internos.xlsx` **(nuevo)** | parámetros ($25.000 · 2,5x) y **venta con fórmula viva** | solo Pablo |

### Hecho el 22-ago (no queda para el chat nuevo)

- **Dos líneas nuevas en el tarifario**, al final de su bloque: fila 39 *Automatización de cotización* (AUTOMATIZACIÓN) y fila 48 *Captura y respuesta en WhatsApp* (AGENTES / IA). Ninguna existía; la planilla ya preveía agregarlas. Respaldo: `_backup_pre_lineas_2026-08-22.xlsx`.
- **`Precios_Venta_Internos.xlsx` creado**, con fórmula viva y las cinco reglas escritas.

### Lo que queda para el chat nuevo, en este bloque

Escribir **§3.1 del catálogo** con alcance + HH + plazo y **sin cifra** (decisión 3h), y sacar el
*«Plazo: por definir con Andrés»*. Redacción sugerida del encuadre: **Andrés cotiza cada trabajo
caso a caso** — el catálogo no debe prometer un tarifario cerrado que, por cómo trabaja, no va a existir.

### Para la reunión del lunes 24 con Andrés

Llegar con el alcance escrito y la estimación de horas, y pedir **solo** que confirme o corrija
las HH de esas dos líneas. Es una conversación mucho más corta que «lléname 59 líneas», que es la
que lleva cuatro semanas sin ocurrir.


---

## Bloque 2 · Ley 21.719 — PARCIAL (22-ago-2026)

| # | Decisión |
|---|---|
| **2a** | **Opción A — anonimizar a rol.** «Matías Retamal» → «Gerente Comercial» en los dos `.json` de AMBROT. El diagnóstico nunca necesitó el nombre. |
| **2b** | **De acuerdo** — el campo de la cabina deja de pedir nombre y pide **solo cargo/rol**, así el problema no se reproduce cada reunión. |
| **2e** | **La cabina NO se usó en Aforo el 20-ago.** No hay datos sueltos en `localStorage` por esa reunión. |

**Sigue abierto y es de Álvaro:** 2c (retención general), 2d (canal de derechos) y 2f (resolverlo
una vez para los tres frentes: prospección, cabina y la tienda de GEA). **Plazo de la grabación
fijado en 4d.**

---

## Bloque 4 · Archivos, grabadora y herramientas de reunión — CERRADO (22-ago-2026)

| # | Decisión |
|---|---|
| **4a** | `04 Pitch Modulo V/Calibrar_Demo.html` se declara **obsoleto** y se mueve a `_Archivo obsoleto/` — **pero la grabadora de pantalla y voz se PORTA a la cabina**, no se pierde. Cierra de paso el mapeo de columnas corrido. |
| **4b** | **Confirmado el reparto de los tres usos** (ver tabla abajo). |
| **4c** | **Opción A** — la grabación **no parte** hasta que Pablo confirme en pantalla *«pedí y obtuve consentimiento verbal»*, y la cabina lo **registra en el archivo de la reunión** con fecha y hora. |
| **4d** | Las grabaciones viven en `04 Cabina/Grabaciones/` (fuera de respaldo automático) y **se borran a los 30 días**. Criterio: el único fin de la grabación es escribir el diagnóstico, y eso ocurre en horas (Ambrot: reunión 16:00, informe 20:36). 30 días es margen amplio y plazo defendible. Las notas ya anonimizadas a cargo no caducan con eso. Álvaro puede ajustarlo. |
| **4f/4h** | **Se contrata Read AI Enterprise** (~US$22,50/mes anual ≈ $21.400 CLP), porque incluye **reproducción de audio y video** y en las reuniones se hacen presentaciones en vivo. **Minutes se suma y es gratis.** |
| **4g** | La cañería Minutes → cabina es **FASE 2**, después de cerrar los tres críticos. |

### El reparto de los tres usos (para `CLAUDE.md`)

| Uso | Archivo |
|---|---|
| **Proyectar** ante un prospecto | `03 Front/presentacion.html` |
| **Conducir** la reunión (solo Pablo) | `04 Cabina/reunion.html` |
| **Compartir** en videollamada | `04 Cabina/resultados.html` |

### Hallazgo técnico sobre la grabadora (corrige una alarma previa)

El código pide `getDisplayMedia({ video: true, **audio: false** })` + `getUserMedia({ audio: true })`:
graba **video de pantalla + micrófono de Pablo**. En videollamada **la voz del cliente NO entra a la
mezcla** (sale por los parlantes); sí entra su **imagen y nombre en pantalla**. En **presencial sí
graba a todos**. Y **no pedía consentimiento de ninguna forma** — de ahí 4c.

### Las dos herramientas de reunión — ya estaban conectadas, no hay que construir nada

Read AI **ya está autenticado** en la cuenta de Pablo y lleva meses grabando **en la plataforma del
cliente**: entró a los **Teams de UANDES y de BEKA** y a los **Meet** propios. `live_enabled` está en
`false` en todas — la parte en vivo no estaba activada.

| | Read AI Enterprise | Minutes (useminutes.app) |
|---|---|---|
| **Cuándo** | después de la reunión | **durante** |
| **Para qué** | respaldo, transcripción, resumen, **video**, prueba de lo dicho | **alimentar la cabina en vivo** |
| **Plataformas** | bot visible en Zoom/Teams/Meet | captura audio del sistema: cualquiera, y presencial |
| **Dónde vive el dato** | nube de Read AI | **el Mac de Pablo, no sube nada** (whisper.cpp local) |
| **Costo** | ~$21.400 CLP/mes | **$0** — MIT, gratis para siempre |

⚠️ **El MCP de Read AI no expone transcripción en vivo** (`create_meeting_agent`, `list_meetings`,
`get_meeting_by_id`, `share_meeting_report` — todo posterior). **La única con lectura en vivo es
Minutes** (`read_live_transcript`, con cursor `since`). Por eso van las dos.

⚠️ **Minutes sí captura la voz del cliente y su plataforma no le avisa.** Es la vía más potente y la
que más consentimiento exige: **4c deja de ser buena práctica y pasa a ser obligatoria**.

### FASE 2 — el copiloto, y por qué es más chico de lo que parece

**La cabina ya tiene el «Puente»** (`assets/cabina.js:189-299`): se pega lo que el cliente va
diciendo y **propone respuestas con su cita**, detecta pares pregunta→respuesta y permite aceptarlas
o descartarlas. Lo difícil está hecho. **Falta solo que el texto entre solo en vez de pegarlo**, y
hay un camino sin backend: Minutes escribe transcripción en archivos locales y la cabina **ya se
sirve desde `localhost:8642` sobre `Calibrar/`**, así que puede leer ese archivo con `fetch` cada
pocos segundos.

**⚠️ Diseño corregido por Pablo — DOS CARRILES, no autocompletado.** Lo que pidió no es que la IA
llene el instrumento, sino que **complemente lo que él va escribiendo** con notas de lo que oye,
porque muchas veces hay presentaciones en vivo:

- **Carril de Pablo** — lo que escribe. **Manda siempre. Nada lo sobrescribe.**
- **Carril de la IA** — registro corrido de lo que va oyendo, del que **él toma lo que sirve**, más sugerencias de preguntas.

Encaja con la regla de la casa: **el diagnóstico lo conduce una persona; la IA toma notas al lado,
no en su lugar.**

---

## Bloque 5 · Ejecución — CERRADO (22-ago-2026)

| # | Decisión |
|---|---|
| **5a** | **Sí** — Claude ejecuta directamente scripts y archivos de datos (verificaciones de QA, Estudio Maestro, Buyer Persona, `Solicitud del titular`). No requieren decisión de contenido. |
| **5b** | **Orden confirmado:** (1) Ley 21.719 en la cabina · (2) Anexo E → regenerar `prompt_maestro.js` → `qa_cabina.py` · (3) §3.1 del catálogo · (4) el resto. |
| **5c** | **La cabina se queda SOLO en el equipo de Pablo.** Si algún día se la pasa a alguien, primero la muestra y después decide qué puede ver o usar cada uno. Con eso la API key en el navegador deja de ser un riesgo. |

---

## Bloque 6 · Datos — CERRADO (22-ago-2026)

| # | Decisión |
|---|---|
| **6a** | **Las 318 sin sitio web se abordan por otras vías** — todas las propuestas (lista abajo). No se declaran fuera de alcance. |
| **6b** | **HECHO el 22-ago.** `SKILL.md` de `calibrar-mantenimiento-semanal` actualizado: el motor ya no figura «en pausa», se aclara qué sigue siendo error de versión (venderlo/cobrarlo, o el atributo «automático» ante el cliente) y se agrega `qa_cabina.py` como sexta suite. Respaldo: `SKILL.md.backup-2026-08-22`. |

### 6a — las vías, en orden de rendimiento esperado

| # | Vía | Por qué rinde acá | Coste |
|---|---|---|---|
| 1 | **Mercado Público / ChileProveedores** | **La de mayor señal.** Ignacio *capta por licitación*: si la empresa licita, ahí están su contacto, su rubro y **qué gana y qué pierde** — que además es material de venta de los eslabones 03 Demanda y 05 Captura | gratis, público |
| 2 | **Google Maps / Perfil de Empresa** | La mayoría de las industriales sin web sí tienen ficha: teléfono, horario, fotos, reseñas | gratis |
| 3 | **Instagram / Facebook** | Muchas PYMEs chilenas usan IG **como su único sitio** | gratis |
| 4 | **LinkedIn de empresa** | Sobre todo para Lista B (Marcelo) | gratis |
| 5 | **Gremios sectoriales** — ASIMET (metalmecánica), SOFOFA, AIA, cámaras de comercio | Directorios con contacto verificado del rubro exacto de la base | gratis |
| 6 | **Mercado Libre y marketplaces** | Proveedores industriales que venden ahí y no tienen web | gratis |
| 7 | **Terreno directo** | **`Dirección` está al 96,7 %.** Para las que no aparecen en ninguna de las anteriores, la dirección basta: se visitan | ya cubierto |

⚠️ **Límite que no se mueve:** estas vías se usan para **datos de empresa**. `RUT` y
`Decisor (cargo/nombre)` siguen cerrados a las rutinas (`PERMITIR_DATOS_PERSONALES = False`), y
`WhatsApp del decisor` / `Quién más decide` **siempre**. Un nombre de persona en LinkedIn **no se
cosecha**: se captura en la visita.

💡 **Y no perder de vista:** que una empresa **no tenga sitio web es un hallazgo de venta**
—eslabón **04 Activo** roto—, no un hueco de datos. Va en `Señal / Gancho de visita`.



---

# LISTA DE EJECUCIÓN PARA EL CHAT NUEVO

Todo lo de abajo tiene la decisión ya tomada. **No hay que volver a preguntar.**

## Paso 1 · Ley 21.719 en la cabina — ✅ EJECUTADO 23-ago ~01:50 (sesión interactiva con Pablo)

- [x] `ficha.quienes` anonimizado en los dos `.json` de AMBROT *(2a)* — con la regla 2g: cargo sin confirmar → **«Contraparte · AMBROT»** (no «Gerente Comercial», que era dato fabricado). Se anonimizó igual el `PARTICULAS_2026-08-24.json` nuevo (nombres → cargos también en las notas).
- [x] `assets/cabina.js` — el campo pide **solo cargo/rol** (rótulo y placeholder con la mención Ley 21.719) *(2b)*
- [x] `qa_cabina.py` extendido: grupo **LEY 21.719** — por cada `Reuniones/*.json`: `ficha.quienes` sin patrón nombre-apellido, sin correos nominativos, sin celulares. **76/76 en verde.**

## Paso 2 · Anexo E — EN ESTE ORDEN, sin excepción

- [~] **Propuesta ESCRITA y entregada a Pablo** (23-ago ~02:00): `01 Producto/PROPUESTA_AnexoE_bloques_2026-08-23.md` — los tres bloques + `<arquetipo>` para F.2. **Esperando su aprobación (1e); nada aplicado al PRD todavía.**
- [x] ~~Reescribir en el **PRD** los tres bloques: `<rol>` *(1a)*, `<limites_del_producto>` *(1d)*, `<a_quien_le_escribes>` con **los cuatro arquetipos y las cinco creencias reescritas** *(1c)* — **Claude propone, Pablo aprueba** *(1e)*~~ **Cerrado** (verificado 8-sep-2026: PRD v5.7, 28-ago-2026)
- [x] ~~Agregar `<arquetipo>` al **Anexo F.2** *(1b)*, con la regla de **modo neutro declarado** si no viene *(1g)*~~ **Cerrado** (verificado 8-sep-2026: verificado por `qa_calibrar.py`)
- [ ] **Selector de cuatro opciones** en la cabina, arranca vacío *(1f)*
- [ ] `motor_api.js` arma y envía el bloque nuevo
- [x] ~~**Regenerar `assets/prompt_maestro.js` DESDE el Anexo E corregido**~~ **Cerrado** (verificado 8-sep-2026: hash idéntico verificado por `qa_cabina.py`)
- [x] ~~Verificación nueva en `qa_calibrar.py`: que el Anexo E **no** diga «dos arquetipos» ni «analista de medios pagados», y que los cuatro estén en `<a_quien_le_escribes>` *(el hueco de 4 semanas)*~~ **Cerrado** (verificado 8-sep-2026: las tres del grupo MOTOR)
- [x] ~~Actualizar la verificación de campos del Anexo F.2 en `qa_cabina.py`~~ **Cerrado** (verificado 8-sep-2026: «los nombres de campo del Anexo F.2 están completos»)
- [x] ~~**Correr `qa_calibrar.py` y `qa_cabina.py` al final**~~ **Cerrado** (verificado 8-sep-2026: 117/117 y 114/114)

## Paso 3 · Catálogo §3.1

- [ ] Reescribir §3.1 con **alcance + HH + plazo, SIN cifra** *(3h)*; sacar el «Plazo: por definir con Andrés»
- [ ] Encuadre: **Andrés cotiza caso a caso** — no prometer un tarifario cerrado que no va a existir
- [ ] Correr `qa_comercial.py`

## Paso 4 · El resto

- [x] ~~Mover `04 Pitch Modulo V/Calibrar_Demo.html` a `_Archivo obsoleto/` con su entrada en el `LEEME.md` *(4a)*~~ 🔴 **NO se movió: se BORRÓ.** Verificado el 8-sep-2026 con una búsqueda en todo el proyecto — el archivo no existe en `04 Pitch Modulo V/`, ni en ningún `_Archivo obsoleto/`, ni en ninguna otra carpeta. **Contradice la regla general de versiones de `CLAUDE.md` («nada se borra; archivar es mover y documentar») y repite exactamente el precedente de `qa_memoria_prd_parser.py`**, que el propio `CLAUDE.md` dejó anotado como «el precedente a no repetir: mover primero, borrar después — nunca al revés». Su mapeo de columnas corrido, que este documento discutió tres semanas, se perdió con él. **No hay nada que restituir; queda como antecedente.**
- [ ] **Portar la grabadora a la cabina** con la puerta de consentimiento *(4c)*, carpeta `04 Cabina/Grabaciones/` y borrado a 30 días *(4d)*
- [x] ~~`CLAUDE.md`: los **tres usos** *(4b)*, y retirar la exclusividad de los dos `LEEME.md`~~ **Cerrado** (verificado 8-sep-2026: quedaron cuatro usos, uno por archivo)
- [x] ~~`VENTAS/Buyer_Persona_Precision_v2.md:19` — fechar la cifra en vez de solo corregirla *(1.7 del reporte)*~~ **Cerrado** (verificado 8-sep-2026: dejó de fijar el tamaño y remite al archivo)
- [x] ~~`qa_comercial.py` — extender la verificación DATOS al Buyer Persona, no solo a la Guía~~ **Cerrado** (verificado 8-sep-2026: «El buyer persona tampoco fija el tamaño de la base»)
- [x] ~~`Calibrar_Estudio_Maestro_Prospeccion.md` líneas **306, 307, 308** (y fechar la 187)~~ **Cerrado** (verificado 8-sep-2026: remite al archivo)
- [x] ~~Normalizar `Solicitud del titular` **vía `maestro_io.py`** y vigilar constantes también en esa columna~~ **Cerrado** (verificado 8-sep-2026: «usa UN literal», y el default de `maestro_io` se corrigió el 2-sep)
- [x] ~~`PRD:1394` — fechar el «hoy 577»~~ **Cerrado** (verificado 8-sep-2026: el 8-sep salieron TODAS las cifras de la base del PRD: remiten al archivo)
- [x] ~~`ANDREW NG/Blackbox_Dev_Set_Calibrar.md` — renombrar el centinela `E0` a `sin_eslabon`~~ **Cerrado** (verificado 8-sep-2026: hecho el 8-sep-2026 — seguía abierto pese a declararse cerrado el 28-ago)
- [ ] Enriquecimiento de las **sin sitio web** (la cifra se lee con `python3 _tools/qa_prospeccion.py`; al 8-sep-2026 son 382) por las 7 vías de 6a, respetando el interruptor de datos personales

## FASE 2 — después, no ahora *(4g)*

- [ ] Cañería **Minutes → Puente** de la cabina, con **los dos carriles**: el de Pablo manda y nada lo sobrescribe
- [ ] Activar lo **en vivo** en Read AI (hoy `live_enabled: false`)

## Ya ejecutado el 22-ago — no rehacer

- ✅ Dos líneas nuevas en `PRESUPUESTOS/Tarifario_Desde_..._paraAndres.xlsx` (filas 39 y 48) con alcance, HH y plazo
- ✅ `PRESUPUESTOS/Precios_Venta_Internos.xlsx` creado, con fórmula viva y el margen **fuera** del archivo que viaja a Andrés
- ✅ `SKILL.md` de `calibrar-mantenimiento-semanal` actualizado *(6b)*

## Para Pablo, fuera del chat

- **Lunes 24 con Andrés:** pedir **solo** que confirme o corrija las HH de las dos líneas (16 y 24). No pedir el tarifario completo.
- **Contratar Read AI Enterprise** y activar lo en vivo.
- **Instalar Minutes** (gratis).
- **Pasarle a Álvaro** 2c, 2d y 2f.
