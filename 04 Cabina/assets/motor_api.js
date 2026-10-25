/* CALIBRAR · Motor conectado — reactivado por decisión de Pablo el 19-ago-2026.
   Parámetros del PRD §5.5: claude-sonnet-5 en vivo (effort low) · claude-opus-5 al
   cierre (effort high) · JAMÁS temperature/top_p/top_k (eliminados: devuelven 400).
   La llamada sale directo del navegador (header anthropic-dangerous-direct-browser-access);
   la clave vive SOLO en el localStorage de este equipo. */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODELO_VIVO = 'claude-sonnet-5';
const MODELO_CIERRE = 'claude-opus-5';

function apiKey() { return localStorage.getItem('cabina_api_key') || ''; }
function configurarKey() {
  const k = prompt('Pega tu API key de Anthropic (queda guardada solo en este equipo):', apiKey());
  if (k === null) return;
  localStorage.setItem('cabina_api_key', k.trim());
  pintarMotor();
}

/* ── Construcción del mensaje de usuario según el contrato del Anexo F.2 ── */
function etiquetaDe(qid, v) {
  const q = TRIAGE.find(x => x.id === qid);
  const o = q && q.opciones.find(x => x.v === v);
  if (!o) return v;
  return typeof etiquetaOpcion === 'function' ? etiquetaOpcion(qid, o) : o.l;
}
/* Perfil al que le escribe el motor (Anexo F.2, bloque <arquetipo>). Lo fija el
   operador; el módulo profesional lo fija solo. Vacío = no_determinado: el motor
   nunca lo infiere. Hasta el 24-sep-2026 la cabina no mandaba este bloque. */
const ARQUETIPOS = ['rodrigo', 'carolina', 'ignacio', 'marcelo', 'profesional'];
/* Bloque <modulo> del Anexo F.2: solo viaja con el módulo profesional. Va también en
   preparación y análisis digital, para que los límites de salud rijan en todas las llamadas. */
function bloqueModulo(e) {
  if (typeof esProfesional !== 'function' || !esProfesional(e)) return '';
  const v = proVocab(e);
  return ['<modulo>', 'tipo: profesional_independiente', `capa_salud: ${conSalud(e) ? 'sí' : 'no'}`,
          `vocabulario: ${v.persona} / ${v.servicio}`, '</modulo>'].join('\n');
}
function arquetipoDe(e) {
  if (typeof esProfesional === 'function' && esProfesional(e)) return 'profesional';
  return ARQUETIPOS.includes(e.arquetipo) ? e.arquetipo : 'no_determinado';
}
function construirMensaje(vivo) {
  const L = [];
  const fx = E.fichax || {};
  L.push('<datos_contacto>');
  L.push(`empresa: ${E.ficha.empresa || 'N/D'}`);
  L.push(`rubro: ${E.ficha.rubro || fx.rubro || 'N/D'}`);
  L.push(`sitio_web: ${fx.web || 'N/D'}`);
  L.push(`quienes_en_reunion: ${E.ficha.quienes || 'N/D'}`);
  L.push('</datos_contacto>');

  L.push('<arquetipo>\n' + arquetipoDe(E) + '\n</arquetipo>');
  const pro = typeof esProfesional === 'function' && esProfesional(E);
  if (pro) L.push(bloqueModulo(E));

  // Apertura (preguntas 0)
  const p0txt = PREGUNTAS_0.map(q => {
    const v = (E.p0 || {})[q.id]; const n = (E.n0 || {})[q.id];
    if (!v && !n) return null;
    const op = v && q.opciones.length ? (q.opciones.find(o => o.v === v) || {}).l : '';
    return `${q.cod} ${q.texto} → ${op || ''}${n ? ` · en sus palabras: "${n}"` : ''}`;
  }).filter(Boolean);
  if (p0txt.length) L.push('<apertura>\n' + p0txt.join('\n') + '\n</apertura>');

  // Triage
  L.push('<triage>');
  const NOMBRES_T = { t1: 't1_origen_cliente', t2: 't2_huella_publica', t3: 't3_oportunidades_mes',
    t4: 't4_pauta_activa', t5: 't5_destino_compra', t6: 't6_captura_datos', t7: 't7_tiempo_respuesta',
    t8: 't8_registro_contacto', t9: 't9_seguimiento_perdido', t10: 't10_uso_ia',
    t11: 't11_horas_repetitivas', t12: 't12_dependencia', t13: 't13_criterio_escrito', t14: 't14_criterio_demostrable' };
  for (const [qid, campo] of Object.entries(NOMBRES_T)) {
    const v = E.triage[qid];
    if (!v) { L.push(`${campo}: `); continue; }
    let val = etiquetaDe(qid, v);
    const extras = ((E.multi || {})[qid] || []).map(x => etiquetaDe(qid, x));
    if (extras.length) val += ` (también aplica: ${extras.join(', ')})`;
    const nota = (E.nt || {})[qid];
    if (nota) val += ` — nota del operador: "${nota}"`;
    L.push(`${campo}: ${val}`);
  }
  L.push('</triage>');

  // Núcleo de negocio
  const NN = { N1: 'n1_mejor_cliente', N2: 'n2_por_que_ese', N3: 'n3_clientes_no_deseados',
    N4: 'n4_decide_vs_inicia', N5: 'n5_linea_base', N6: 'n6_capacidad_semanal', N7: 'n7_concentracion_cartera' };
  L.push('<nucleo_negocio>');
  for (const [cod, campo] of Object.entries(pro ? PRO_CAMPOS_NUCLEO : NN)) {
    let val = (E.nucleo || {})[cod] || '';
    if (cod === 'N5' && (E.num.n5in != null || E.num.n5out != null))
      val = (pro ? `${E.num.n5in ?? 'N/D'} personas nuevas consultaron el último mes / ${E.num.n5out ?? 'N/D'} ${proVocab(E).cierre}`
                 : `${E.num.n5in ?? 'N/D'} contactos entrados / ${E.num.n5out ?? 'N/D'} cierres`) + (val ? ` · "${val}"` : '');
    if (cod === 'N7' && E.num.n7pct != null && E.num.n7pct !== '')
      val = (pro ? `${E.num.n7pct}% de lo nuevo llega recomendado` : `${E.num.n7pct}% en el cliente más grande`) + (val ? ` · "${val}"` : '');
    L.push(`${campo}: ${val}`);
  }
  L.push('</nucleo_negocio>');

  // Competencia
  const MM = { M1: 'm1_contra_quien', M2: 'm2_por_que_perdio', M3: 'm3_ventaja_defendible',
    M4: 'm4_posicion_precio', M5: 'm5_cambio_sectorial' };
  L.push('<competencia>');
  for (const [cod, campo] of Object.entries(MM)) L.push(`${campo}: ${(E.comp || {})[cod] || ''}`);
  L.push('</competencia>');

  // Bloque del área dominante (uno solo)
  const ruta = rutear(E.triage);
  if (ruta.dominante && Object.keys(E.bloque || {}).length) {
    const b = BLOQUES_AREA[ruta.dominante];
    L.push('<bloque_area>');
    L.push(`(eslabón ${ruta.dominante} — prefijo ${b.prefijo})`);
    for (const g of b.grupos) for (const q of g.preguntas) {
      const r = (E.bloque || {})[q.cod];
      if (r && r.nota) L.push(`${q.cod.toLowerCase()} (${q.texto}): ${r.nota}`);
    }
    L.push('</bloque_area>');
  }

  // Gatillo y avance (X1–X5) — la energía de la demanda y el criterio de éxito
  const gx = E.gx || {}, cx = E.cx || {};
  const xg = [];
  if (gx.x1) xg.push(`gatillo (qué lo hizo recibirnos ahora): "${gx.x1}"`);
  if (gx.x2) xg.push(`intentos_previos: "${gx.x2}"`);
  if (gx.x3) xg.push(`costo_declarado_del_problema: "${gx.x3}"`);
  if (cx.x4) xg.push(`exito_definido_por_el: "${cx.x4}"`);
  if (cx.x5) xg.push(`lo_que_no_pregunte: "${cx.x5}"`);
  if (xg.length) L.push('<gatillo_y_avance>\n' + xg.join('\n') + '\n</gatillo_y_avance>');

  // Preguntas extra del estudio — evidencia declarada fuera del instrumento
  const xs = (E.extra || []).filter(x => x.q && x.r);
  if (xs.length) {
    L.push('<preguntas_extra>');
    L.push('(Preguntas ad-hoc que el operador hizo en la conversación. Trátalas como evidencia declarada, citables.)');
    xs.forEach((x, i) => L.push(`x${i + 1}: "${x.q}" → "${x.r}"`));
    L.push('</preguntas_extra>');
  }

  // Conversación en vivo (solo modo vivo): transcripción/notas pegadas
  if (vivo && E.transcripcion && E.transcripcion.trim()) {
    L.push('<conversacion_en_vivo>');
    L.push(E.transcripcion.slice(-9000));
    L.push('</conversacion_en_vivo>');
  }

  L.push(vivo
    ? 'Emite el JSON reducido del modo en vivo según <modo_en_vivo>.'
    : 'Genera el informe de diagnóstico en JSON según el schema.');
  return L.join('\n');
}

/* ── Llamada a la API (capa base) ── */
async function llamarAPI(body) {
  const key = apiKey();
  if (!key) { alert('Falta la API key. Configúrala con el botón ⚙ del panel Motor.'); throw new Error('sin API key'); }
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`API ${resp.status}: ${(data.error || {}).message || 'error desconocido'}`);
  if (data.stop_reason === 'max_tokens') throw new Error('La salida se truncó (max_tokens). Reintenta.');
  const texto = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const a = texto.indexOf('{'), z = texto.lastIndexOf('}');
  if (a < 0 || z < 0) throw new Error('El motor no devolvió JSON. Respuesta: ' + texto.slice(0, 200));
  return JSON.parse(texto.slice(a, z + 1));
}

async function llamarMotor(vivo) {
  const body = {
    model: vivo ? MODELO_VIVO : MODELO_CIERRE,
    max_tokens: vivo ? 6000 : 16000,
    output_config: { effort: vivo ? 'low' : 'high' },
    system: PROMPT_MAESTRO + (vivo ? APENDICE_VIVO : ''),
    messages: [{ role: 'user', content: construirMensaje(vivo) }]
  };
  if (vivo) body.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }];
  return llamarAPI(body);
}

/* ── Preparación de la SIGUIENTE reunión: aprende de las anteriores del cliente ── */
function serializarReunion(j, titulo) {
  const L = [`--- ${titulo} (${j.creada || 'sin fecha'}) ---`];
  for (const [qid, v] of Object.entries(j.triage || {})) {
    const q = TRIAGE.find(x => x.id === qid);
    const o = q && q.opciones.find(x => x.v === v);
    L.push(`${q ? q.cod : qid}: ${o ? o.l : v}${(j.nt || {})[qid] ? ` — «${j.nt[qid]}»` : ''}`);
  }
  for (const [c, v] of Object.entries(j.nucleo || {})) if (v) L.push(`${c}: ${v}`);
  if ((j.num || {}).n7pct != null && j.num.n7pct !== '') L.push(`N7 (% cliente más grande): ${j.num.n7pct}`);
  for (const [c, v] of Object.entries(j.comp || {})) if (v) L.push(`${c}: ${v}`);
  (j.extra || []).forEach(x => { if (x.q) L.push(`Extra: "${x.q}" → "${x.r || 'sin respuesta'}"`); });
  if ((j.gx || {}).x1) L.push(`Gatillo: ${j.gx.x1}`);
  for (const [c, v] of Object.entries(j.cierre || {})) if (v) L.push(`Cierre ${c}: ${v}`);
  return L.join('\n');
}

async function prepararSiguiente() {
  if (motorOcupado) return;
  if (typeof puertaSalud === 'function' && !puertaSalud(E)) return;
  motorOcupado = true; pintarPrep('Leyendo las reuniones anteriores y preparando la siguiente…');
  try {
    const { locales, publicadas } = reunionesDelCliente(E.ficha.empresa);
    const previas = [...locales];
    for (const p of publicadas) {
      try { previas.push(await (await fetch('Reuniones/' + encodeURIComponent(p.f))).json()); } catch { }
    }
    const vistos = new Set();
    const unicas = previas.filter(j => { const id = j.id || 'x'; if (vistos.has(id)) return false; vistos.add(id); return true; })
      .filter(j => Object.keys(j.triage || {}).length || Object.keys(j.nucleo || {}).length);
    if (!unicas.length) throw new Error('No hay reuniones anteriores con contenido para este cliente.');
    const cuerpo = (bloqueModulo(E) ? bloqueModulo(E) + '\n' : '') + '<reuniones_anteriores>\n'
      + unicas.map((j, i) => serializarReunion(j, `Reunión ${i + 1}`)).join('\n\n')
      + '\n</reuniones_anteriores>\n<estado_actual>\n'
      + serializarReunion(E, 'Reunión en preparación (actual)')
      + '\n</estado_actual>\nEmite el JSON del modo preparación según <modo_preparacion>.';
    const r = await llamarAPI({
      model: MODELO_CIERRE, max_tokens: 6000,
      output_config: { effort: 'medium' },
      system: PROMPT_MAESTRO + APENDICE_PREPARACION,
      messages: [{ role: 'user', content: cuerpo }]
    });
    E.prep = r; guardar(); pintarPrep();
  } catch (err) { pintarPrep('⚠ ' + err.message); }
  motorOcupado = false;
}

/* Análisis digital: audita la presencia pública (sitio, canales, benchmark) con la web */
async function analizarDigital() {
  if (motorOcupado) return;
  if (typeof puertaSalud === 'function' && !puertaSalud(E)) return;
  motorOcupado = true; pintarMotor('Auditando el sitio y los canales en la web… (1–2 min)');
  try {
    const fx = E.fichax || {};
    const contexto = [
      `empresa: ${E.ficha.empresa || 'N/D'}`, `rubro: ${E.ficha.rubro || 'N/D'}`,
      `sitio_web: ${fx.web || 'N/D'}`, `redes: ${fx.redes || 'N/D'}`, `comuna: ${fx.comuna || 'N/D'}`,
      `competidores_declarados: ${(E.comp || {}).M1 || 'N/D'}`,
      `notas_del_operador_sobre_su_web: ${Object.entries(E.bloque || {}).map(([c, v]) => v.nota ? `${c}: ${v.nota}` : '').filter(Boolean).join(' · ') || 'N/D'}`
    ].join('\n');
    const r = await llamarAPI({
      model: MODELO_VIVO, max_tokens: 8000,
      output_config: { effort: 'medium' },
      system: PROMPT_MAESTRO + APENDICE_DIGITAL,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
      messages: [{ role: 'user', content: (bloqueModulo(E) ? bloqueModulo(E) + '\n' : '') + '<prospecto>\n' + contexto + '\n</prospecto>\nEmite el JSON del análisis digital según <modo_analisis_digital>.' }]
    });
    E.digital = r; guardar(); pintarMotor('✓ Análisis digital listo — se muestra en la página Resultados.');
  } catch (err) { pintarMotor('⚠ ' + err.message); }
  motorOcupado = false;
}

function agregarPregPrep(i) {
  const s = ((E.prep || {}).preguntas_sugeridas || [])[i];
  if (!s || (E.extra || []).some(x => x.q === s.pregunta)) return;
  E.extra.push({ q: s.pregunta, r: '', auto: 'preparación' });
  guardar(); pintarExtra(); pintarPrep();
}

function pintarPrep(estadoTxt) {
  const el = document.getElementById('prep-motor'); if (!el) return;
  const p = E.prep;
  if (estadoTxt) { el.innerHTML = `<p class="motor-estado">${esc(estadoTxt)}</p>`; return; }
  if (!p) { el.innerHTML = ''; return; }
  const yaExtra = q => (E.extra || []).some(x => x.q === q);
  el.innerHTML = `
    <div class="grupo-t" style="margin-top:16px">Preparación de la siguiente reunión — lo que aprendió el motor</div>
    ${p.mejor_pregunta ? `<div class="prep-mejor">
      <div class="lbl">La mejor pregunta para completar el diagnóstico</div>
      <p style="font-size:15px;font-weight:700;margin:2px 0">${esc(p.mejor_pregunta.pregunta || '')}</p>
      <p style="font-size:12.5px;color:var(--texto2);margin:4px 0 8px">${esc(p.mejor_pregunta.por_que || '')}</p>
      ${yaExtra(p.mejor_pregunta.pregunta) ? '<span class="clave-tag">ya en preguntas extra</span>'
        : `<button class="chip" onclick="E.extra.push({q:E.prep.mejor_pregunta.pregunta,r:'',auto:'preparación'});guardar();pintarExtra();pintarPrep()">＋ Agregar a esta reunión</button>`}
    </div>` : ''}
    ${(p.que_falta || []).length ? `<div class="grupo-t">Qué falta para completar el diagnóstico</div>
      <ul>${p.que_falta.map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.por_que_importa || '')}</span></li>`).join('')}</ul>` : ''}
    ${(p.preguntas_sugeridas || []).length ? `<div class="grupo-t">Preguntas sugeridas (por prioridad)</div>
      ${p.preguntas_sugeridas.map((s, i) => `
        <div class="prop"><div><b>${esc(s.pregunta)}</b></div>
          <div class="prop-r">${esc(s.por_que || '')}</div>
          <div class="ops" style="margin:6px 0 0 0">${yaExtra(s.pregunta)
            ? '<span class="clave-tag">ya agregada</span>'
            : `<button class="chip" onclick="agregarPregPrep(${i})">＋ Agregar a esta reunión</button>`}</div>
        </div>`).join('')}` : ''}
    ${(p.hipotesis_a_validar || []).length ? `<div class="grupo-t">Hipótesis que quedaron abiertas</div>
      <ul>${p.hipotesis_a_validar.map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.como || '')}</span></li>`).join('')}</ul>` : ''}
    ${(p.cuidados || []).length ? `<div class="grupo-t">No olvidar</div>
      <ul>${p.cuidados.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`;
}

/* ── UI del panel Motor (interno — jamás se comparte) ── */
let motorOcupado = false;
async function consultaVivo() {
  if (motorOcupado) return;
  if (typeof puertaSalud === 'function' && !puertaSalud(E)) return;
  motorOcupado = true; pintarMotor('Consultando el motor (en vivo)…');
  try {
    const r = await llamarMotor(true);
    E.motorVivo = r;
    // Las preguntas que el motor considera de interés se agregan SOLAS a Preguntas extra
    (r.sugerencias_preguntas_extra || []).forEach(s => {
      if (s.pregunta && !(E.extra || []).some(x => x.q === s.pregunta))
        E.extra.push({ q: s.pregunta, r: '', auto: 'motor' });
    });
    guardar(); pintarMotor(); if (typeof pintarExtra === 'function') pintarExtra();
  } catch (err) { pintarMotor('⚠ ' + err.message); }
  motorOcupado = false;
}
async function generarCierre() {
  if (motorOcupado) return;
  if (!confirm('Generar el diagnóstico completo de cierre (claude-opus-5, effort high). Puede tardar 1–3 minutos. ¿Continuar?')) return;
  if (typeof puertaSalud === 'function' && !puertaSalud(E)) return;
  motorOcupado = true; pintarMotor('Generando diagnóstico de cierre… (1–3 min, no cierres la pestaña)');
  try {
    const d = await llamarMotor(false);
    const qa = verificarInvariantes(d);
    E.motor = d; E.motorQA = qa; guardar(); pintarMotor();
  } catch (err) { pintarMotor('⚠ ' + err.message); }
  motorOcupado = false;
}
function descartarMotor() { delete E.motor; delete E.motorQA; delete E.motorVivo; guardar(); pintarMotor(); }
function aceptarSugerenciaMotor(i) {
  const s = ((E.motorVivo || {}).sugerencias_preguntas_extra || [])[i];
  if (!s) return;
  E.extra.push({ q: s.pregunta, r: '' });
  guardar(); pintarExtra(); pintarMotor();
}

function pintarMotor(estadoTxt) {
  const el = document.getElementById('motor'); if (!el) return;
  const conKey = !!apiKey();
  const v = E.motorVivo || null;
  const ev = v && v.estado_vivo ? v.estado_vivo : null;
  const qaOk = (E.motorQA || []).filter(c => c.ok).length;
  const qaTot = (E.motorQA || []).length;
  const lista = (arr, cls) => (arr && arr.length)
    ? `<ul>${arr.map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.ev || '')}</span></li>`).join('')}</ul>`
    : '<p class="vacio">—</p>';
  el.innerHTML = `
    <div class="sec-h"><h2>Motor · en vivo</h2>
      <button class="chip" onclick="configurarKey()" title="API key">⚙ ${conKey ? 'clave OK' : 'configurar clave'}</button>
      <span class="hecho">${esc(MODELO_VIVO)} vivo · ${esc(MODELO_CIERRE)} cierre</span></div>
    <p class="sec-sub">Panel interno — jamás se comparte. El motor lee todo lo registrado (triage, núcleo,
      bloque, extra y lo pegado en el Puente), puede verificar hechos públicos en la web, y propone.
      Tú decides qué se dice en voz alta.</p>
    <div class="ops">
      <button class="chip ${conKey ? '' : 'gated'}" onclick="consultaVivo()">▶ Consulta en vivo</button>
      <button class="chip ${conKey ? '' : 'gated'}" onclick="generarCierre()">◼ Generar diagnóstico de cierre</button>
      <button class="chip ${conKey ? '' : 'gated'}" onclick="analizarDigital()">🌐 Análisis digital (web y canales)${E.digital ? ' ✓' : ''}</button>
      ${(E.motor || v) ? '<button class="chip" onclick="descartarMotor()">Descartar salidas del motor</button>' : ''}
    </div>
    ${estadoTxt ? `<p class="motor-estado">${esc(estadoTxt)}</p>` : ''}
    ${ev ? `
      <div class="grupo-t">Estado en vivo — ${esc(ev.veredicto_provisional || '')} · confianza ${esc(ev.confianza || '')}${ev.eslabon_dominante_provisional ? ` · dominante provisional ${dosDig(ev.eslabon_dominante_provisional)}` : ''}</div>
      ${ev.por_que ? `<p class="sec-sub">${esc(ev.por_que)}</p>` : ''}
      ${ev.siguiente_pregunta ? `<p class="motor-sig">Siguiente: <b>${esc(ev.siguiente_pregunta.texto || '')}</b> <span class="ev">${esc(ev.siguiente_pregunta.por_que || '')}</span></p>` : ''}
      <h3 class="si" style="font-size:12px;text-transform:uppercase;margin:10px 0 4px">Seguro de decir</h3>${lista(ev.seguro_de_decir)}
      <h3 class="no" style="font-size:12px;text-transform:uppercase;margin:10px 0 4px">No decir aún</h3>${lista(ev.no_decir_aun)}
      <h3 class="no" style="font-size:12px;text-transform:uppercase;margin:10px 0 4px">Contradicciones → preguntar</h3>${lista(ev.contradicciones)}
      ${(v.sugerencias_preguntas_extra || []).length ? `
        <div class="grupo-t">Preguntas que el motor sugiere hacer ahora — ya agregadas a Preguntas extra</div>
        ${v.sugerencias_preguntas_extra.map(s => `
          <div class="prop"><div><b>${esc(s.pregunta)}</b> <span class="clave-tag">motor</span></div>
            <div class="prop-r">${esc(s.por_que || '')}</div>
          </div>`).join('')}` : ''}
      ${(v.verificaciones_web || []).length ? `
        <div class="grupo-t">Verificado en la web</div>
        <ul>${v.verificaciones_web.map(w => `<li>${esc(w.afirmacion)}: <b>${esc(w.resultado)}</b> <span class="ev">${esc(w.fuente || '')}</span></li>`).join('')}</ul>` : ''}
    ` : ''}
    ${E.motor ? `
      <div class="grupo-t">Diagnóstico de cierre generado</div>
      <p class="sec-sub">Invariantes del dashboard: <b>${qaOk}/${qaTot}</b>${qaOk === qaTot
        ? ' — pasa. Los resultados del motor se muestran en la página Resultados.'
        : ' — <span style="color:#d9534f">NO pasa. Resultados sigue mostrando la versión de reglas; revisa antes de compartir.</span>'}
      ${qaOk !== qaTot ? `</p><ul>${(E.motorQA || []).filter(c => !c.ok).map(c => `<li>${esc(c.id)} · ${esc(c.txt)}</li>`).join('')}</ul><p>` : ''}
      </p>` : ''}`;
}
