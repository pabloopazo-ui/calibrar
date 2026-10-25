# Calibrar · Cabina de reunión

> **QA propio: `python3 qa_cabina.py` (141 verificaciones, necesita `node`) — correr
> después de tocar CUALQUIER archivo de esta carpeta.** No lee el código por encima:
> lo ejecuta — casos dorados de ruteo, hash verbatim del prompt maestro contra el
> Anexo E, login (incluido el saneo de redirecciones y el SHA-256 de respaldo),
> consistencia del rompe-caché `?v=`, y anti-fuga/anti-bluffing de la vista cliente.
>
> **El grupo LEY 21.719 barre por `glob`, no por lista:** todos los `.json` de
> `Reuniones/` y **todos los `.html` de esta carpeta**. Es así desde el 28-ago-2026
> porque el 24-ago entraron tres entregables nuevos sin que nadie los agregara a
> ninguna lista, y uno traía el nombre completo del gerente de un prospecto.
>
> **El prompt maestro NO se edita acá.** Se corrige el Anexo E en el PRD y se propaga
> con `python3 "Calibrar/01 Producto/regenerar_prompt_maestro.py"`. Al revés, el hash
> se pone rojo — y peor, fija el defecto.

**Qué es.** La herramienta de trabajo para conducir el diagnóstico Calibrar en una
reunión real. Creada el 19-ago-2026 para la reunión con Aforo, reutilizable para
cualquier prospecto. **El 19-ago Pablo reactivó el MOTOR**: además del ruteo local
determinista (`motor.js`), la cabina llama a la API con el System Prompt Maestro
del PRD (extraído verbatim a `assets/prompt_maestro.js`) — `claude-sonnet-5` en el
turno en vivo (effort low, con búsqueda web para verificar hechos públicos) y
`claude-opus-5` en el cierre (effort high). La salida del cierre solo llega a la
página Resultados si pasa las 15 invariantes del dashboard (`verificarInvariantes`).
Sin clave de API configurada, todo lo demás sigue funcionando local y sin conexión.

**Instrumento v2 (19-ago).** La redacción de las preguntas se rehizo con
investigación (ver `01 Producto/Instrumento_v2_Investigacion_2026-08-19.md`):
`assets/preguntas_v2.js` es la **capa de conducción** — cambia cómo se dice cada
pregunta, agrega «decirlo así», qué escuchar, la escalera del «no sé», el protocolo
del oro espontáneo y las preguntas X1–X5 (gatillo, intentos, costo, éxito, red final).
Los ids, valores de opciones y el ruteo NO cambiaron: el contrato del Anexo F.2 sigue
intacto. Pendiente: consolidar la redacción v2 en la Matriz v1.7 / PRD.

**Acceso.** La entrada es `login.html` (Google Sign-In con Client ID en
`assets/config.js` + lista de correos autorizados, o clave local). «Iniciar
Cabina.command» levanta el servidor local y abre el login con doble clic.

**Fuente única de verdad.** Las tres páginas cargan `../03 Front/assets/data.js` y
`motor.js` por referencia. **Acá no se redefine ninguna pregunta ni ninguna regla**:
si cambia el PRD, se actualiza `data.js` en `03 Front` y la cabina hereda el cambio.
No tocar `03 Front` sin correr después `python3 qa_calibrar.py` (113 verificaciones).

**Módulo «Profesional independiente», con capa de salud (24-sep-2026, PRD §2.6).**
`assets/modulo_profesional.js` es una **capa**, como `preguntas_v2.js`: redacción en fácil y de usted
para las 14 del triage, N1–N7, M1–M5 y p01–p03, etiquetas de opción, vocabulario (paciente o cliente),
el **sistema personalizado** (`armarSistema`: Reparar · Ordenar · Acelerar, una pieza por eslabón con su
métrica) y los cuatro límites de la capa de salud. **No cambia ids, valores de opción ni ruteo.** Se
activa en la ficha. Con él la cabina manda `<arquetipo>profesional</arquetipo>` y un bloque `<modulo>`
al motor, y la capa de salud exige confirmar que no hay datos de pacientes antes de cada llamada a la
API. Desde ese día la cabina manda **siempre** el bloque `<arquetipo>`, que el Anexo E esperaba desde
la v5.7 y nunca llegaba. Grupo **MÓDULO PROFESIONAL** del QA (25 verificaciones, con su prueba de mutación
hecha a mano: 6 defectos metidos, 6 cazados).

## Las tres páginas — y no son intercambiables

| Página | Para quién | Qué es |
|---|---|---|
| `reunion.html` | **Solo Pablo** | El instrumento: ficha, cronómetro de 32 min, preguntas 0, triage (14), núcleo N1–N7, bloque del área dominante, competencia M1–M5, cierre y panel interno (seguro de decir / contradicciones) |
| `guia.html` | Interno | El manual de uso |
| `resultados.html` | **La única compartible en videollamada** | El documento: Cadena 01–07, lo declarado, cifras con gráficos, hipótesis de trabajo «para validar», lo que no es el problema y próximo paso. Se rearma en tiempo real y **se protege sola**: sin dominante con confianza media/alta muestra un aviso neutro |

Además viven acá los **demos aplicados** a un prospecto concreto (`aplicado_particulas.html`,
`modelo_particulas.html`, `resultados_particulas.html`): páginas autocontenidas que **se
proyectan**. No reemplazan a `resultados.html` — son material preparado a mano para una
reunión puntual. Regla dura: **sin nombres de personas**, cargo o rol siempre; el QA lo
verifica en todos los `.html` de la carpeta. La tabla de usos completa vive en `CLAUDE.md`.

**En videollamada se comparte SOLO la ventana de `resultados.html`, nunca la
pantalla completa.** `reunion.html` contiene el veredicto interno y las
contradicciones — jamás se muestra.

## Cómo se abre

Doble clic en `reunion.html` (y `resultados.html` en una segunda ventana). Las
respuestas se guardan solas en `localStorage` del navegador y sobreviven al cierre
de la pestaña. **Cada reunión queda almacenada por separado con su información**:
el selector de la barra superior cambia entre reuniones guardadas, **Nueva reunión**
abre un prospecto nuevo sin borrar nada, **Exportar** descarga la reunión como
`.json` (para archivarla o pasársela a Claude) e **Importar** carga una reunión
preparada — las precargadas viven en `Reuniones/`. También corre servida
(`.claude/launch.json`, puerto 8642, sirve `Calibrar/` completo).

## Guardarraíles heredados (no negociables)

- El diagnóstico se presenta como **trabajo conducido por una persona, con fecha** —
  nunca «automático», «con IA» ni «al instante».
- Numeración pública **01–07**; la taquigrafía `E<n>` no existe en estas páginas.
- Ninguna cifra del negocio que el prospecto no haya declarado; referencias de
  industria siempre `[referencial]`. Sin dato = no aparece (no se rellena).
- Las hipótesis se emiten como **«de trabajo, para validar»**, máximo 3,
  construidas por reglas fijas por eslabón — no son el motor ni se presentan como tal.
