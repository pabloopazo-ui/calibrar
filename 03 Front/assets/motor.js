/* CALIBRAR · Front de demostración
   motor.js — Ruteo local por triage + verificación de invariantes del dashboard.

   ⚠️ ESTO NO ES EL MOTOR. El motor real es Claude con el System Prompt Maestro
   del Anexo E del PRD (claude-sonnet-5 en vivo / claude-opus-5 al cerrar,
   profundidad por output_config.effort, sin temperature/top_p/top_k).
   Lo de acá abajo es una traducción determinista de las reglas de precedencia de
   §5.0.1–5.0.3 a JavaScript, para que la demo rutee sola y sin llamar a la API.
   Sirve para mostrar el comportamiento; no reemplaza el razonamiento del motor. */

/* ── Estado de cada eslabón a partir del triage ───────────────────────────── */
function estadoEslabones(r) {
  const e = {};

  // 01 Criterio — solo se evalúa si hay con qué comprobarlo (§5.0, regla de precedencia de E1)
  if (!r.t13 && !r.t14) e[1] = 'sin_datos';
  else if (r.t13 === 'no' || r.t14 === 'no_sabria') e[1] = 'roto';
  else if (r.t13 === 'no_escrito' && r.t14 === 'intuicion') e[1] = 'roto';
  else if (r.t13 === 'si_escrito' && r.t14 === 'explicable') e[1] = 'sano';
  else e[1] = r.t14 === 'intuicion' ? 'roto' : 'sano';

  // 02 Reputación
  if (!r.t2 || r.t2 === 'no_se') e[2] = 'sin_datos';
  else if (r.t2 === 'sitio_resenas') e[2] = 'sano';
  else e[2] = 'roto';                       // solo redes o casi nada

  // 03 Demanda — pocas oportunidades, o pauta activa sin dónde registrar lo que produce
  const opp = numDe('t3', r.t3);
  if (opp === null && !r.t4) e[3] = 'sin_datos';
  else if (opp !== null && opp < 6) e[3] = 'roto';
  else if (pautaActiva(r) && (r.t8 === 'no_queda' || r.t8 === 'correo_wsp')) e[3] = 'roto';
  else if (opp !== null) e[3] = 'sano';
  else e[3] = 'sin_datos';

  // 04 Activo de conversión
  if (!r.t5 && !r.t6) e[4] = 'sin_datos';
  else if (['home', 'whatsapp', 'perfil', 'no_tengo'].includes(r.t5) || r.t6 === 'no') e[4] = 'roto';
  else e[4] = 'sano';

  // 05 Captura y respuesta — T7 × T8, el detector de automatización
  if ((!r.t7 || r.t7 === 'no_se') && !r.t8) e[5] = 'sin_datos';
  else if (['mismo_dia', 'mas_1dia'].includes(r.t7) || ['correo_wsp', 'no_queda'].includes(r.t8)) e[5] = 'roto';
  else e[5] = 'sano';

  // 06 Escala
  const hrs = numDe('t11', r.t11);
  if ((!r.t9 || r.t9 === 'no_se') && hrs === null) e[6] = 'sin_datos';
  else if (r.t9 === 'muchas' || (hrs !== null && hrs >= 6)) e[6] = 'roto';
  else e[6] = 'sano';

  // 07 Capacidad — modificador, no destino (§5.0.2)
  if (!r.t12) e[7] = 'sin_datos';
  else if (r.t12 === 'si') e[7] = 'sano';
  else e[7] = 'roto';

  return e;
}

function numDe(id, v) {
  if (!v || v === 'no_se') return null;
  const q = TRIAGE.find(x => x.id === id);
  const op = q && q.opciones.find(o => o.v === v);
  return op && typeof op.num === 'number' ? op.num : null;
}

const pautaActiva = r => ['meta', 'google', 'ambas', 'otra'].includes(r.t4);

/* ¿Hay flujo, y hasta dónde llega? Es lo que fija desde dónde se cuenta.       */
function puntoDeFlujo(r) {
  const opp = numDe('t3', r.t3);
  if (opp !== null && opp > 0) return 5;      // llegan oportunidades → el flujo alcanza la captura
  // El VOLUMEN declarado manda sobre el CANAL. T3 pregunta cuántas oportunidades
  // llegan; T1 pregunta por dónde entran cuando entran. Nombrar un canal no dice
  // que hoy esté llegando alguien, y T3=0 dice explícitamente que no.
  // Esta línea estaba debajo del chequeo de T1 y quedaba inalcanzable en 32 de
  // las 36 combinaciones de T1×T4: quien declaraba CERO oportunidades pero
  // nombraba un canal salía con punto de flujo 4 y rutéaba a 04 Activo de
  // conversión → Desarrollo web. O sea, sitio web para quien no recibe a nadie:
  // el error que la Cadena existe para evitar, al revés.
  if (opp === 0) return 3;                    // declaró que no llega nadie
  if (pautaActiva(r) || ['recomendacion', 'busqueda', 'publicidad', 'licitacion'].includes(r.t1)) return 4;
  return null;                                // todavía no se sabe
}

/* ── Ruteo: el eslabón dominante es el primero que se rompe contando desde
      donde hoy sí hay flujo (§5.0.1). 01 antecede cuando hay flujo que no
      convierte. 07 nunca va solo (DB-12). ─────────────────────────────────── */
function rutear(r) {
  const est = estadoEslabones(r);
  const desde = puntoDeFlujo(r);
  const respondidas = TRIAGE.filter(q => r[q.id]).map(q => q.cod);

  if (respondidas.length < 3 || desde === null) {
    return { estados: est, dominante: null, secundaria: null, veredicto: 'insuficiente',
             confianza: 'baja', respondidas, desde,
             motivo: 'Faltan respuestas de triage para ubicar dónde hay flujo. Sin eso no se puede aplicar la regla de precedencia, y el motor no debe asumir que el problema es de pauta.' };
  }

  // 01 antecede a todo cuando llega flujo y no hay criterio para filtrarlo
  let dominante = null;
  if (desde >= 4 && est[1] === 'roto') dominante = 1;

  // Orden de conteo río abajo desde el punto de flujo, y después río arriba
  const orden = desde >= 5 ? [5, 6, 4, 2, 3, 7]
              : desde === 4 ? [4, 5, 6, 2, 3, 7]
              : [3, 2, 4, 5, 6, 7];
  if (!dominante) dominante = orden.find(n => est[n] === 'roto') || null;

  // DB-12 · 07 solo es dominante si todo lo demás está sano
  if (dominante === 7 && [1, 2, 3, 4, 5, 6].some(n => est[n] === 'roto')) {
    dominante = [1, 2, 3, 4, 5, 6].find(n => est[n] === 'roto');
  }

  // Secundaria: el roto más cercano al dominante en la cadena — es el que
  // comparte causa con él. 07 toma precedencia cuando el equipo no puede
  // sostener solo lo que se recomiende (§5.0.2).
  let secundaria = [1, 2, 3, 4, 5, 6, 7]
    .filter(n => n !== dominante && est[n] === 'roto')
    .sort((a, b) => Math.abs(a - dominante) - Math.abs(b - dominante) || a - b)[0] || null;
  if (est[7] === 'roto' && dominante !== 7 && r.t12 === 'no') secundaria = 7;

  const rotos = Object.values(est).filter(v => v === 'roto').length;
  const sinDatos = Object.values(est).filter(v => v === 'sin_datos').length;
  const confianza = respondidas.length >= 10 && sinDatos <= 1 ? 'alta'
                  : respondidas.length >= 6 ? 'media' : 'baja';

  return {
    estados: est, dominante, secundaria,
    veredicto: dominante ? 'califica' : (rotos === 0 && respondidas.length >= 10 ? 'no califica' : 'insuficiente'),
    confianza, respondidas, desde,
    motivo: dominante ? explicarRuteo(dominante, est, desde, r)
                      : 'No aparece ningún eslabón roto con las respuestas dadas. Si se confirma, este prospecto no tiene hoy un problema que resolvamos: descalificar es un resultado correcto.'
  };
}

function explicarRuteo(dom, est, desde, r) {
  const nombre = CADENA[dom - 1].nombre.toLowerCase();
  const otros = [1, 2, 3, 4, 5, 6, 7].filter(n => n !== dom && est[n] === 'roto');
  const base = desde >= 5
    ? 'Hay flujo llegando: entran oportunidades todos los meses.'
    : desde === 4 ? 'Hay actividad de captación, pero todavía no está confirmado cuánto llega.'
    : 'No está llegando flujo suficiente.';
  const cola = otros.length
    ? ` También aparecen rotos ${otros.map(n => String(n).padStart(2, '0')).join(', ')}, pero ${String(dom).padStart(2, '0')} es el primero contando desde donde hoy hay flujo: invertir río arriba de una fuga la amplifica.`
    : '';
  return `${base} El primer eslabón que se rompe desde ahí es ${String(dom).padStart(2, '0')} · ${nombre}.${cola}`;
}

/* ── Siguiente mejor pregunta (§5.7.3): la que más reduce incertidumbre ───── */
function siguientePregunta(r) {
  const flujo = puntoDeFlujo(r);
  for (const id of ORDEN_SIGUIENTE) {
    const q = TRIAGE.find(x => x.id === id);
    if (!q || r[id]) continue;
    if (q.gatillo === 'flujo' && !(flujo !== null && flujo >= 4)) continue;  // 13 y 14 solo con flujo
    return q;
  }
  return null;
}

/* ── Lo afirmable y lo que todavía no (§5.7.4 / §5.7.5) ───────────────────── */
function loQueSePuedeDecir(r, ruta) {
  const seguro = [], noAun = [];
  const est = ruta.estados;
  const opp = numDe('t3', r.t3);

  if (['mismo_dia', 'mas_1dia'].includes(r.t7) && ['correo_wsp', 'no_queda'].includes(r.t8) && opp > 0)
    seguro.push({ t: 'Llegan interesados, se responden tarde y no queda registro de quién preguntó. Eso no es un problema de publicidad.', ev: 'T3 × T7 × T8' });
  else if (['mismo_dia', 'mas_1dia'].includes(r.t7))
    seguro.push({ t: 'El tiempo de respuesta que declaras deja la conversación fuera de la ventana en que la gente todavía está decidiendo.', ev: 'T7' });

  if (r.t8 === 'no_queda' && opp > 0)
    seguro.push({ t: 'Hoy no hay forma de saber a cuántos de los que preguntaron se les hizo seguimiento, porque no queda registrado en ninguna parte.', ev: 'T8' });

  if (est[1] === 'roto' && opp > 0)
    seguro.push({ t: 'Están llegando oportunidades y no hay un criterio escrito para decidir cuáles trabajar. Más contactos no arregla eso: lo amplifica.', ev: 'T13 × T14' });

  if (est[2] === 'sano')
    seguro.push({ t: 'Lo que se ve de ustedes cuando alguien los busca está bien. Esa parte no hay que tocarla.', ev: 'T2' });

  if (r.t9 === 'muchas')
    seguro.push({ t: 'Hay conversaciones de venta que se quedan sin seguimiento todos los meses, y son ventas que ya estaban pagadas.', ev: 'T9' });

  const hrs = numDe('t11', r.t11);
  if (hrs !== null && hrs >= 6)
    seguro.push({ t: `Se van cerca de ${hrs} horas semanales en tareas que no venden ni producen. A hora administrativa RM referencial de $6.000, son unos $${(hrs * 6000 * 4.3).toLocaleString('es-CL', { maximumFractionDigits: 0 })} al mes que nadie factura.`, ev: 'T11 · ancla referencial' });

  // Lo que NO se dice todavía
  if (r.t3 === 'no_se') noAun.push({ t: 'Cuánto flujo llega. Sin ese número no se puede decir dónde empieza la fuga.', ev: 'T3 = no sé' });
  if (r.t7 === 'no_se') noAun.push({ t: 'Si la captura está rota. Se declara desconocido, no se estima.', ev: 'T7 = no sé' });
  if (est[1] === 'sin_datos' && opp > 0) noAun.push({ t: 'Si el problema es de criterio. Hay flujo llegando y todavía no se preguntó T13 ni T14.', ev: '01 sin datos' });
  if (pautaActiva(r)) noAun.push({ t: 'Cualquier cifra de CPL o de retorno de su cuenta. Los benchmarks se citan como rango de industria [referencial], nunca como estimación de lo suyo.', ev: 'regla 4 del modo en vivo' });
  if (ruta.confianza === 'baja') noAun.push({ t: 'El veredicto de ruteo. Con esta cantidad de respuestas es provisional y no se afirma en voz alta.', ev: 'confianza baja' });

  return { seguro, noAun };
}

/* ── Contradicciones: en vivo no se resuelven, se convierten en la siguiente
      pregunta (§5.7.5 regla 2) ─────────────────────────────────────────────── */
function contradicciones(r) {
  const out = [];
  if (r.t8 === 'crm' && r.t9 === 'muchas')
    out.push({ par: 'T8 × T9', txt: 'Dice tener CRM y a la vez muchas conversaciones sin seguimiento. Preguntar: ¿quién carga los contactos al CRM y cuándo?' });
  if (r.t6 === 'si' && r.t5 === 'no_tengo')
    out.push({ par: 'T5 × T6', txt: 'Dice que pueden dejar sus datos, pero declara no tener a dónde mandarlos. Preguntar dónde está ese formulario.' });
  if (r.t13 === 'si_escrito' && r.t14 === 'no_sabria')
    out.push({ par: 'T13 × T14', txt: 'Dice tener el criterio escrito y no poder aplicarlo a cien contactos. Pedir verlo: el documento existe o no está en uso.' });
  if (pautaActiva(r) && numDe('t3', r.t3) === 0)
    out.push({ par: 'T3 × T4', txt: 'Invierte en publicidad y declara cero oportunidades al mes. Preguntar desde cuándo y cuánto.' });
  return out;
}

/* ── Invariantes del dashboard (§5.8.4) — el QA en pantalla ────────────────── */
function verificarInvariantes(d) {
  const c = [];
  const push = (id, txt, ok) => c.push({ id, txt, ok });
  const h = d.bloque_2_hipotesis.hipotesis, s = d.bloque_3_soluciones.soluciones, e = d.bloque_4_etapas.etapas;

  push('DB-1', 'Ninguna cifra sin lectura',
    d.bloque_1_data.cifras_clave.every(x => x.lectura && x.lectura !== 'N/D'));
  push('DB-2', 'Biyección hipótesis ↔ soluciones (3 y 3)',
    h.length === 3 && s.length === 3 &&
    JSON.stringify(s.map(x => x.verifica_hipotesis).sort()) === JSON.stringify([1, 2, 3]));
  push('DB-3', 'Toda hipótesis es falsable', h.every(x => x.como_se_verifica && x.como_se_verifica !== 'N/D'));
  push('DB-4', 'Toda solución es predictiva', s.every(x => x.prediccion && x.prediccion !== 'N/D'));
  push('DB-5', 'Ninguna solución depende de contratar', s.some(x => x.puede_hacerlo_solo === true));
  push('DB-6', 'Nada inferido con confianza alta',
    h.every(x => !(x.procedencia === 'inferido' && x.confianza === 'alta')));
  push('DB-7', 'Reparto de atribución consistente y suma 3', (() => {
    const r = d.bloque_2_hipotesis.reparto_atribucion;
    const suma = r.gestion + r.estructura + r.compartida;
    const cuenta = k => h.filter(x => x.atribucion === k).length;
    return suma === 3 && r.gestion === cuenta('gestion') && r.estructura === cuenta('estructura') && r.compartida === cuenta('compartida');
  })());
  push('DB-8', 'Alcance declarado en cada hipótesis', h.every(x => x.alcance === 'cuenta' || x.alcance === 'canal'));
  push('DB-10', 'Un solo eslabón dominante, entero 1–7',
    Number.isInteger(d.bloque_0_ruteo.eslabon_dominante) && d.bloque_0_ruteo.eslabon_dominante >= 1 && d.bloque_0_ruteo.eslabon_dominante <= 7);
  push('DB-12', '07 nunca solo', (() => {
    const rt = d.bloque_0_ruteo;
    if (rt.area_recomendada !== 'Capacitación y adopción') return true;
    return rt.cadena.filter(x => x.eslabon !== 7).every(x => x.estado === 'sano');
  })());
  push('DB-13', 'Se declara qué NO es su problema', !!d.bloque_0_ruteo.que_NO_es_tu_problema);
  push('DB-14', 'Entre 2 y 4 etapas, ninguna huérfana',
    e.length >= 2 && e.length <= 4 && e.every(x => x.por_que_primero && x.quien_lo_hace && x.pilar_precision && x.como_se_sabe_que_resulto));
  push('DB-15', 'La etapa 1 no es un servicio facturable',
    e[0].quien_lo_hace === 'el cliente' || e[0].quien_lo_hace === 'mixto');
  push('DB-16', 'Se declara lo que está fuera de alcance', d.bloque_4_etapas.fuera_de_nuestro_alcance !== undefined);
  push('DB-17', 'El veredicto no cierra con una negación seca',
    !/^no necesitas/i.test((d.bloque_0_ruteo.por_que_este_y_no_otro || '').trim()));

  return c;
}
