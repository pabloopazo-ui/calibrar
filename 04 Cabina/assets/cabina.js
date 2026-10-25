/* CALIBRAR · Cabina de reunión — página de trabajo.
   Reutiliza data.js y motor.js de "03 Front/assets" como única fuente de verdad:
   acá no se redefine ninguna pregunta ni ninguna regla de ruteo. */

const K = 'cabina_estado';        // la reunión activa (la que lee resultados.html)
const KA = 'cabina_archivo';      // TODAS las reuniones, cada una con su info — nada se pierde

/* Modo ejemplo: ?reunion=<archivo.json> carga una reunión completa de solo
   lectura — para mostrar TODO el sistema en otro dispositivo sin depender del
   localStorage local. Nada de lo que se toque en este modo se guarda. */
const CABINA_DEMO = new URLSearchParams(location.search).get('reunion');

function cargar() {
  let e;
  try { e = JSON.parse(localStorage.getItem(K) || 'null') || estadoInicial(); }
  catch { e = estadoInicial(); }
  if (!e.id) { e.id = 'r' + Date.now(); e.creada = new Date().toISOString().slice(0, 10); }
  // Reuniones guardadas antes del módulo profesional (24-sep-2026) nacen como empresa.
  if (!e.modulo) e.modulo = { tipo: 'empresa', salud: false };
  if (e.arquetipo === undefined) e.arquetipo = '';
  return e;
}
function estadoInicial() {
  return { id: 'r' + Date.now(), creada: new Date().toISOString().slice(0, 10),
           ficha: { empresa: '', rubro: '', quienes: '', modo: 'videollamada' }, fichax: {},
           p0: {}, n0: {}, triage: {}, nt: {}, nucleo: {}, num: {}, bloque: {}, comp: {}, cierre: {}, fechaPaso: '',
           extra: [], transcripcion: '', descartadas: [], gx: {}, cx: {},
           crono: { acum: 0, corriendo: false, desde: 0 },
           // Módulo (24-sep-2026): 'empresa' es el instrumento de siempre; 'profesional'
           // cambia preguntas y vocabulario, no el ruteo. La capa de salud agrega límites.
           modulo: { tipo: 'empresa', salud: false }, arquetipo: '' };
}
let E = cargar();

function archivo() {
  try { return JSON.parse(localStorage.getItem(KA) || '{}'); } catch { return {}; }
}
/* Cada guardado escribe la activa Y su copia en el archivo: toda reunión con
   datos queda almacenada sola, sin paso manual. */
function guardar() {
  if (CABINA_DEMO) return;   // modo ejemplo: nada se persiste
  localStorage.setItem(K, JSON.stringify(E));
  if (hayDatos() || E.ficha.empresa) {
    const a = archivo(); a[E.id] = E; localStorage.setItem(KA, JSON.stringify(a));
  }
  const sel = document.getElementById('sel-reu'); if (sel) pintarSelector();
}

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dosDig = n => String(n).padStart(2, '0');

/* ── Ficha completa — los campos de FICHA_EMPRESA (data.js), mismo orden del maestro ── */
function pintarFicha() {
  const fx = E.fichax = E.fichax || {};
  if (E.ficha.empresa && !fx.razon_social && !fx.fantasia) fx.fantasia = E.ficha.empresa;
  const total = FICHA_EMPRESA.reduce((n, g) => n + g.campos.length, 0) + 2;
  const llenos = FICHA_EMPRESA.reduce((n, g) => n + g.campos.filter(c => fx[c.id]).length, 0)
               + (E.ficha.rubro ? 1 : 0) + (E.ficha.quienes ? 1 : 0);
  const campo = c => {
    const v = esc(fx[c.id] || '');
    let inp;
    if (c.tipo === 'select') inp = `<select onchange="rFx('${c.id}',this.value)">
        <option value="">—</option>${(c.opciones || []).map(o => `<option ${fx[c.id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else inp = `<input type="${c.tipo === 'date' ? 'date' : 'text'}" value="${v}" oninput="rFx('${c.id}',this.value)">`;
    return `<label>${esc(c.l)}${inp}${c.nota ? `<span class="f-nota">${esc(c.nota)}</span>` : ''}</label>`;
  };
  $('#ficha').innerHTML = `
    <details class="ficha-det" open>
      <summary>${esProfesional() ? 'Ficha del profesional' : 'Ficha de la empresa'} — ${llenos}/${total} campos</summary>
      <div class="ops" style="margin:10px 0 4px 0">
        ${['terreno', 'videollamada', 'telefono'].map(m =>
          `<button class="chip ${E.ficha.modo === m ? 'sel' : ''}" onclick="rModo('${m}')">${m === 'terreno' ? 'En terreno' : m === 'videollamada' ? 'Videollamada' : 'Por teléfono'}</button>`).join('')}
      </div>
      <div class="grupo-t">A quién estamos diagnosticando</div>
      <div class="ops" style="margin:6px 0 4px 0">
        <button class="chip ${!esProfesional() ? 'sel' : ''}" onclick="rTipo('empresa')">Empresa</button>
        <button class="chip ${esProfesional() ? 'sel' : ''}" onclick="rTipo('profesional')">Profesional independiente</button>
        ${esProfesional() ? `<button class="chip ${conSalud() ? 'sel' : ''}" onclick="rSalud()" title="Médico, dentista, psicólogo u otro profesional que atiende pacientes">${conSalud() ? '✓ ' : ''}Capa de salud</button>` : ''}
      </div>
      ${esProfesional()
        ? `<p class="f-nota" style="margin:2px 0 10px">Módulo profesional: mismas preguntas del ruteo, dichas en su idioma; el motor le escribe al perfil «profesional».${conSalud() ? ' <b>Capa de salud activa:</b> sin nombres ni datos clínicos de pacientes, sin recomendar publicidad para captar.' : ''}</p>`
        : `<div class="ops" style="margin:2px 0 10px">${[['rodrigo', 'Rodrigo'], ['carolina', 'Carolina'], ['ignacio', 'Ignacio'], ['marcelo', 'Marcelo'], ['', 'Sin determinar']].map(([v, l]) =>
            `<button class="chip ${(E.arquetipo || '') === v ? 'sel' : ''}" onclick="rArq('${v}')" title="Perfil al que le escribe el motor">${l}</button>`).join('')}</div>`}
      <div class="ficha">
        <label>Rubro<input value="${esc(E.ficha.rubro)}" oninput="rFicha('rubro',this.value)"></label>
        <label>Quiénes están en la reunión (solo cargo/rol)<input value="${esc(E.ficha.quienes)}" placeholder="Cargo o rol de cada uno — sin nombres (Ley 21.719)" oninput="rFicha('quienes',this.value)"></label>
      </div>
      ${FICHA_EMPRESA.map(g => `
        <div class="grupo-t">${esc(g.g)}</div>
        <div class="ficha">${g.campos.map(campo).join('')}</div>`).join('')}
    </details>`;
  $('#top-emp').textContent = E.ficha.empresa || '—';
}
function rFx(id, v) {
  E.fichax[id] = v;
  if (id === 'fantasia' || id === 'razon_social') {
    E.ficha.empresa = E.fichax.fantasia || E.fichax.razon_social || '';
    $('#top-emp').textContent = E.ficha.empresa || '—';
    pintarCarpeta();
  }
  guardar();
}
function rFicha(k, v) { E.ficha[k] = v; guardar(); }
function rModo(m) { E.ficha.modo = m; guardar(); pintarFicha(); }
/* El módulo cambia lo que se pregunta y cómo se dice: se repinta todo lo que lee textos. */
function rTipo(t) {
  E.modulo = { tipo: t, salud: t === 'profesional' ? !!(E.modulo || {}).salud : false };
  E.arquetipo = t === 'profesional' ? 'profesional' : (E.arquetipo === 'profesional' ? '' : E.arquetipo || '');
  guardar(); pintarTodoSinSelector();
}
function rSalud() { E.modulo.salud = !E.modulo.salud; guardar(); pintarTodoSinSelector(); }
function rArq(v) { E.arquetipo = v; guardar(); pintarFicha(); }
function pintarTodoSinSelector() {
  pintarFicha(); pintarGatillo(); pintarNucleo(); pintarTriage(); pintarBloque(); pintarComp();
  pintarP0(); pintarCierre(); pintarPanel(); pintarEstado(); if (typeof pintarMotor === 'function') pintarMotor();
}

/* ── Conducción v2: qué texto se dice y qué se escucha ── */
function guiaV2(key, fallbackTexto, fallbackPorque) {
  // Con el módulo profesional manda su guía; lo que no cubre cae a la v2 de empresa.
  const pro = (typeof PRO_GUIA !== 'undefined') && esProfesional() && PRO_GUIA[key];
  const v0 = pro || ((typeof V2 !== 'undefined') && V2[key]);
  const v = v0 && pro ? { ...v0, texto: proTx(v0.texto), decir: proTx(v0.decir), oro: proTx(v0.oro), nota_op: v0.nota_op && proTx(v0.nota_op) } : v0;
  return {
    texto: v ? v.texto : fallbackTexto,
    sub: v
      ? `${v.decir ? `Decirlo así si no entiende: «${v.decir}»` : ''}${v.oro ? ` · <b>Escuchar:</b> ${v.oro}` : ''}${v.nota_op ? ` · <b>Operador:</b> ${v.nota_op}` : ''}`
      : esc(fallbackPorque || ''),
    multi: v && v.multi
  };
}

/* ── Gatillo (X1–X3) — abre la reunión ── */
function pintarGatillo() {
  const el = document.getElementById('gatillo'); if (el === null || typeof GATILLO === 'undefined') return;
  const hechas = GATILLO.filter(q => (E.gx || {})[q.id]).length;
  el.innerHTML = `
    <div class="sec-h"><h2>Apertura · el gatillo</h2><span class="min">3 min</span>
      <span class="hecho">${hechas}/${GATILLO.length}</span></div>
    <p class="sec-sub">X1 abre la reunión: revela el eslabón que ya duele y la urgencia. X2 y X3 no son de guion —
      se disparan cuando aparezca el dolor dominante.</p>
    ${GATILLO.map(q => `
      <div class="q ${(E.gx || {})[q.id] ? 'resp' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(q.texto)}</span></div>
        <div class="why">${esc(q.porque)}</div>
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nGx('${q.id}',this.value)">${esc((E.gx || {})[q.id] || '')}</textarea>
      </div>`).join('')}
    <details class="trans" style="margin-top:14px">
      <summary>Protocolo del oro espontáneo — cuando suelta algo fuera de guion</summary>
      <ul style="margin:10px 0 4px 18px;font-size:13px">${PROTOCOLO_ORO.map(r => `<li style="margin-bottom:5px">${esc(r)}</li>`).join('')}</ul>
    </details>`;
}
function nGx(id, v) { E.gx = E.gx || {}; E.gx[id] = v; guardar(); }
function nCx(id, v) { E.cx = E.cx || {}; E.cx[id] = v; guardar(); }

/* ── Decisión y avance (las ex preguntas 0, ahora al cierre y en v2) ── */
function pintarP0() {
  const hechas = PREGUNTAS_0.filter(q => E.p0[q.id] || E.n0[q.id]).length;
  $('#p0').innerHTML = `
    <div class="sec-h"><h2>Decisión y avance · al cierre</h2><span class="min">3 min</span>
      <span class="hecho">${hechas}/${PREGUNTAS_0.length}</span></div>
    <p class="sec-sub">Quién decide y cómo — al final, con la confianza construida, y por episodio pasado
      (la última decisión parecida), no de frente.</p>
    ${PREGUNTAS_0.map(q => {
      const g = guiaV2(q.id, q.texto, q.porque);
      return `<div class="q ${E.p0[q.id] || E.n0[q.id] ? 'resp' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(g.texto)}</span></div>
        <div class="why">${g.sub}</div>
        ${q.opciones.length ? `<div class="ops">${q.opciones.map(o =>
          `<button class="chip ${E.p0[q.id] === o.v ? 'sel' : ''}" onclick="rP0('${q.id}','${o.v}')">${esc(o.l)}</button>`).join('')}</div>` : ''}
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nP0('${q.id}',this.value)">${esc(E.n0[q.id] || '')}</textarea>
      </div>`; }).join('')}`;
}
function rP0(id, v) { E.p0[id] = E.p0[id] === v ? null : v; guardar(); pintarP0(); }
function nP0(id, v) { E.n0[id] = v; guardar(); }

/* ── Triage ── */
function pintarTriage() {
  const flujo = puntoDeFlujo(E.triage);
  const abiertas = flujo !== null && flujo >= 4;
  const resp = TRIAGE.filter(q => E.triage[q.id]).length;
  $('#triage').innerHTML = `
    <div class="sec-h"><h2>Triage · rutea el eslabón</h2><span class="min">9 min</span>
      <span class="hecho">${resp}/${TRIAGE.length}</span></div>
    <p class="sec-sub">Las 14, cerradas, antes de cualquier pregunta profunda. El ruteo se recalcula con cada respuesta — míralo en la barra de abajo.
      <b>Si aplican dos opciones:</b> el primer clic marca la principal (la que rutea) y un clic en otra opción la deja como secundaria.</p>
    ${TRIAGE.map(q => {
      const gated = q.gatillo === 'flujo' && !abiertas;
      const multi = (E.multi || {})[q.id] || [];
      const g = guiaV2(q.id, q.texto, q.porque);
      const notaSinMarca = !gated && (E.nt || {})[q.id] && !E.triage[q.id];
      return `<div class="q ${E.triage[q.id] ? 'resp' : ''} ${gated ? 'gated' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(g.texto)}</span>${g.multi ? '<span class="clave-tag" title="Admite más de una respuesta">multi</span>' : ''}${notaSinMarca ? '<span class="alerta-nota" title="Escribiste una nota pero no marcaste la respuesta: el ruteo no puede leer notas, solo marcas">⚠ nota sin respuesta marcada</span>' : ''}</div>
        <div class="why">${g.sub}</div>
        ${gated ? `<div class="gate-nota">Se abre cuando T3 confirme que llega flujo.</div>` : `
        <div class="ops">${q.opciones.map(o =>
          `<button class="chip ${E.triage[q.id] === o.v ? 'sel' : multi.includes(o.v) ? 'sel2' : ''}" onclick="rT('${q.id}','${o.v}')">${esc(etiquetaOpcion(q.id, o))}</button>`).join('')}</div>
        <textarea class="nota" rows="1" placeholder="Nota corta (opcional)" oninput="nT('${q.id}',this.value)">${esc(E.nt[q.id] || '')}</textarea>`}
      </div>`; }).join('')}`;
}
function rT(id, v) {
  E.multi = E.multi || {};
  const m = E.multi[id] || [];
  if (E.triage[id] === v) {
    // deseleccionar la principal: si hay secundaria, la primera asciende
    if (m.length) { E.triage[id] = m[0]; E.multi[id] = m.slice(1); }
    else { delete E.triage[id]; delete E.multi[id]; }
  } else if (!E.triage[id]) {
    E.triage[id] = v;
  } else {
    // ya hay principal: alterna esta opción como secundaria
    E.multi[id] = m.includes(v) ? m.filter(x => x !== v) : [...m, v];
    if (!E.multi[id].length) delete E.multi[id];
  }
  guardar(); pintarTriage(); pintarBloque(); pintarPanel(); pintarEstado();
}
function nT(id, v) { E.nt[id] = v; guardar(); }

/* ── Puente: pegar lo que el cliente va diciendo → propone respuestas con cita ──
   Reutiliza PISTAS_TRANSCRIPCION de data.js. No es IA ni es el motor: son
   expresiones regulares locales. Propone, nunca rellena solo; al aceptar, la
   cita queda escrita en la nota de la pregunta. */
function sugerencias(texto) {
  if (!texto || !texto.trim()) return [];
  const frases = texto.split(/(?<=[.?!¿¡])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const props = [];
  for (const [qid, pistas] of Object.entries(PISTAS_TRANSCRIPCION)) {
    if (E.triage[qid]) continue;
    if ((E.descartadas || []).includes(qid)) continue;
    for (const p of pistas) {
      const frase = frases.find(f => p.re.test(f));
      if (frase) { props.push({ qid, v: p.v, cita: frase }); break; }
    }
  }
  return props;
}
function pintarPuente() {
  const props = sugerencias(E.transcripcion);
  const et = (qid, v) => {
    const q = TRIAGE.find(x => x.id === qid);
    const o = q && q.opciones.find(x => x.v === v);
    return { cod: q ? q.cod : qid, texto: q ? q.texto : qid, op: o ? o.l : v };
  };
  $('#puente').innerHTML = `
    <details class="trans" ${E.transcripcion ? 'open' : ''}>
      <summary>Puente · pegar lo que el cliente va diciendo (o la transcripción)</summary>
      <p class="sec-sub" style="margin:10px 0">Busca frases y <b>propone</b> respuestas del triage con la cita que las sostiene.
        Tú aceptas o descartas — lo que contestaste a mano nunca se pisa, y la cita aceptada queda escrita en la nota de la pregunta.
        No es IA: son expresiones regulares en tu navegador, sin conexión. Sirve durante la reunión (pega de a pedazos) o al final.</p>
      <textarea id="p-txt" class="nota" style="margin:0;width:100%" rows="5"
        placeholder="Pega acá lo que dijo el cliente…">${esc(E.transcripcion || '')}</textarea>
      <div class="ops" style="margin:10px 0 0 0">
        <button class="chip" onclick="analizarPuente()">Buscar respuestas en el texto</button>
        <button class="chip" onclick="limpiarPuente()">Borrar texto</button>
      </div>
      ${E.transcripcion ? (props.length ? props.map(p => { const e = et(p.qid, p.v); return `
        <div class="prop">
          <div><span class="cod">${esc(e.cod)}</span> <b>${esc(e.texto)}</b></div>
          <div class="prop-r">Propone: <b>${esc(e.op)}</b> — <i>«${esc(p.cita)}»</i></div>
          <div class="ops" style="margin:6px 0 0 0">
            <button class="chip" onclick='aceptarProp(${JSON.stringify(p.qid)},${JSON.stringify(p.v)},${JSON.stringify(p.cita).replace(/'/g, "&#39;")})'>Aceptar</button>
            <button class="chip" onclick="descartarProp('${p.qid}')">Descartar</button>
          </div>
        </div>`; }).join('')
        : '<p class="vacio" style="margin-top:10px">Ninguna frase calza con los literales del triage. No significa que no se haya dicho: contesta a mano.</p>') : ''}
      ${E.transcripcion ? pintarQA() : ''}
    </details>`;
}
/* Aviso de lo agregado automáticamente desde la conversación. */
function pintarQA() {
  const autos = (E.extra || []).filter(x => x.auto === 'conversación').length;
  return autos ? `<p class="sec-sub" style="margin-top:12px">✔ ${autos} pregunta${autos === 1 ? '' : 's'} con su respuesta
    detectada${autos === 1 ? '' : 's'} en la conversación y agregada${autos === 1 ? '' : 's'} automáticamente a
    <b>Preguntas extra</b> — bórralas allá si alguna no aporta.</p>` : '';
}
/* Detección de pares pregunta→respuesta en texto con hablantes ("Nombre: dicho").
   Propone preguntas extra ya escritas: tú solo aceptas, editas o descartas. */
function detectarQA(texto) {
  if (!texto || !texto.trim()) return [];
  const turnos = [];
  for (const l of texto.split(/\n+/)) {
    const m = l.match(/^\s*\*{0,2}([^:*]{2,40}?)\*{0,2}\s*:\s*(.+)$/);
    if (m) turnos.push({ quien: m[1].trim(), dice: m[2].replace(/^\*+\s*/, '').trim() });
    else if (turnos.length && l.trim()) turnos[turnos.length - 1].dice += ' ' + l.trim();
  }
  const yaExtra = (E.extra || []).map(x => x.q);
  const desc = E.qaDescartadas || [];
  const props = [];
  for (let i = 0; i < turnos.length - 1; i++) {
    const t = turnos[i];
    const preg = (t.dice.match(/¿[^?]{15,200}\?|[^.?!¿]{20,200}\?/g) || []).pop();
    if (!preg) continue;
    const q = preg.trim();
    if (yaExtra.includes(q) || desc.includes(q)) continue;
    const r = turnos.slice(i + 1, i + 4).find(x => x.quien !== t.quien && x.dice.length > 15);
    if (r) props.push({ q, full: t.dice, r: r.dice.slice(0, 400) });
  }
  // No duplicar lo que ya cubre el instrumento: se compara contra la FRASE COMPLETA
  // del turno (no solo la cláusula con «?»), para cazar la pregunta dicha con rodeos.
  const instrumento = [...TRIAGE.map(x => x.texto), ...NUCLEO_NEGOCIO.preguntas.map(x => x.texto),
                       ...BLOQUE_COMPETENCIA.preguntas.map(x => x.texto),
                       ...Object.values(typeof V2 !== 'undefined' ? V2 : {}).map(v => v.texto),
                       ...Object.values(typeof PRO_GUIA !== 'undefined' ? PRO_GUIA : {}).map(v => proTx(v.texto))];
  const norm = s => s.toLowerCase().replace(/[^a-záéíóúñü ]/g, '').split(/\s+/).filter(w => w.length > 3);
  return props.filter(p => {
    const pw = new Set(norm(p.full || p.q));
    return !instrumento.some(t => { const tw = norm(t); return tw.filter(w => pw.has(w)).length >= Math.min(4, tw.length); });
  }).map(({ q, r }) => ({ q, r })).slice(0, 10);
}
function aceptarQA(i) {
  const props = detectarQA(E.transcripcion);
  if (!props[i]) return;
  E.extra.push({ q: props[i].q, r: props[i].r });
  guardar(); pintarPuente(); pintarExtra();
}
function descartarQA(i) {
  const props = detectarQA(E.transcripcion);
  if (!props[i]) return;
  E.qaDescartadas = [...(E.qaDescartadas || []), props[i].q];
  guardar(); pintarPuente();
}
function analizarPuente() {
  E.transcripcion = $('#p-txt').value; E.descartadas = []; E.qaDescartadas = [];
  // Las preguntas y respuestas detectadas en la conversación se agregan SOLAS a
  // Preguntas extra (ya pasaron el filtro: no duplican el instrumento ni lo ya agregado).
  const qa = detectarQA(E.transcripcion);
  qa.forEach(p => E.extra.push({ q: p.q, r: p.r, auto: 'conversación' }));
  guardar(); pintarPuente(); pintarExtra();
}
function limpiarPuente() { E.transcripcion = ''; E.descartadas = []; E.qaDescartadas = []; guardar(); pintarPuente(); }
function aceptarProp(qid, v, cita) {
  E.triage[qid] = v;
  E.nt[qid] = (E.nt[qid] ? E.nt[qid] + ' · ' : '') + '«' + cita + '»';
  guardar(); pintarTriage(); pintarPuente(); pintarBloque(); pintarPanel(); pintarEstado();
}
function descartarProp(qid) { E.descartadas = [...(E.descartadas || []), qid]; guardar(); pintarPuente(); }

/* ── Preguntas extra del estudio — las que salen en la conversación y no están
   en el instrumento. Quedan guardadas con la reunión y entran al modelado. ── */
function pintarExtra() {
  const xs = E.extra = E.extra || [];
  $('#extra').innerHTML = `
    <div class="sec-h"><h2>Preguntas extra del estudio</h2>
      <span class="hecho">${xs.length} agregada${xs.length === 1 ? '' : 's'}</span></div>
    <p class="sec-sub">Lo que preguntaste fuera del instrumento porque la conversación lo pedía. Quedan
      guardadas con la reunión y se incorporan al análisis posterior.</p>
    ${xs.map((x, i) => `
      <div class="q resp">
        <div class="qh"><span class="cod">X${i + 1}</span>
          <input class="x-preg" value="${esc(x.q)}" placeholder="La pregunta que hiciste…" oninput="xQ(${i},this.value)">
          ${x.auto ? `<span class="clave-tag" title="Agregada automáticamente">${esc(x.auto)}</span>` : ''}
          <button class="chip x-del" onclick="xDel(${i})" title="Eliminar">✕</button></div>
        <textarea class="nota" rows="1" placeholder="La respuesta, con sus palabras…" oninput="xR(${i},this.value)">${esc(x.r || '')}</textarea>
      </div>`).join('')}
    <div class="ops" style="margin:12px 0 0 0"><button class="chip" onclick="xAdd()">＋ Agregar pregunta</button></div>`;
}
function xAdd() { E.extra.push({ q: '', r: '' }); guardar(); pintarExtra(); }
function xQ(i, v) { E.extra[i].q = v; guardar(); }
function xR(i, v) { E.extra[i].r = v; guardar(); }
function xDel(i) { E.extra.splice(i, 1); guardar(); pintarExtra(); }

/* ── Núcleo de negocio ── */
function pintarNucleo() {
  const L = esProfesional() ? proEtiquetasNum()
    : { n5in: 'Contactos que entraron', n5out: 'Cerraron', n7pct: '% de la venta en el cliente más grande' };
  const hechas = NUCLEO_NEGOCIO.preguntas.filter(q => E.nucleo[q.cod] || (q.cod === 'N5' && E.num.n5in)).length;
  $('#nucleo').innerHTML = `
    <div class="sec-h"><h2>Núcleo de negocio</h2><span class="min">5 min</span>
      <span class="hecho">${hechas}/7</span></div>
    <p class="sec-sub">Siempre, cualquiera sea el eslabón. Es lo que hace que el diagnóstico hable del negocio y no del canal.${conSalud() ? ' <b>Capa de salud: se anota el tipo de paciente, nunca un nombre ni un dato clínico.</b>' : ''}</p>
    ${NUCLEO_NEGOCIO.preguntas.map(q => { const g = guiaV2(q.cod, q.texto, q.revela); return `
      <div class="q ${E.nucleo[q.cod] || (q.cod === 'N5' && E.num.n5in) ? 'resp' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(g.texto)}</span>${q.clave ? '<span class="clave-tag">alto rendimiento</span>' : ''}</div>
        <div class="why">${g.sub}</div>
        ${q.cod === 'N5' ? `
          <div class="numrow">
            <label>${esc(L.n5in)}<input type="number" min="0" value="${esc(E.num.n5in ?? '')}" oninput="nNum('n5in',this.value)"></label>
            <label>${esc(L.n5out)}<input type="number" min="0" value="${esc(E.num.n5out ?? '')}" oninput="nNum('n5out',this.value)"></label>
          </div>` : ''}
        ${q.cod === 'N7' ? `
          <div class="numrow">
            <label>${esc(L.n7pct)}<input type="number" min="0" max="100" value="${esc(E.num.n7pct ?? '')}" oninput="nNum('n7pct',this.value)"></label>
          </div>` : ''}
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nN('${q.cod}',this.value)">${esc(E.nucleo[q.cod] || '')}</textarea>
      </div>`; }).join('')}`;
}
function nN(cod, v) { E.nucleo[cod] = v; guardar(); }
function nNum(k, v) { E.num[k] = v === '' ? null : Number(v); guardar(); }

/* ── Bloque del área dominante ── */
function pintarBloque() {
  const ruta = rutear(E.triage);
  if (!ruta.dominante) {
    $('#bloque').innerHTML = `
      <div class="sec-h"><h2>Bloque del área dominante</h2><span class="min">~8 min</span></div>
      <div class="bloq-cerrado">Se abre cuando el triage fije un eslabón dominante. Sin dominante no hay bloque — nunca se abre más de uno.</div>`;
    return;
  }
  const b = BLOQUES_AREA[ruta.dominante];
  const esl = CADENA[ruta.dominante - 1];
  const hechas = Object.keys(E.bloque).filter(c => E.bloque[c] && E.bloque[c].nota).length;
  $('#bloque').innerHTML = `
    <div class="sec-h"><h2>Bloque ${dosDig(ruta.dominante)} · ${esc(esl.nombre)}</h2><span class="min">~8 min</span>
      <span class="hecho">${hechas} con nota</span></div>
    ${esProfesional() ? `<p class="sec-sub"><b>${esc(proTx(PRO_NOTA_BLOQUE))}</b></p>` : ''}
    <p class="sec-sub">${esc(b.nota)} <b>Regla de corte:</b> se pregunta hasta converger, no hasta agotar la lista. Las de <span class="clave-tag" style="vertical-align:0">alto rendimiento</span> primero.</p>
    ${b.grupos.map(g => `
      <div class="grupo-t">${esc(g.nombre)}</div>
      ${g.preguntas.map(q => `
        <div class="q ${E.bloque[q.cod] && E.bloque[q.cod].nota ? 'resp' : ''}">
          <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(esProfesional() && PRO_BLOQUE[q.cod] ? proTx(PRO_BLOQUE[q.cod]) : q.texto)}</span>${q.clave ? '<span class="clave-tag">alto rendimiento</span>' : ''}</div>
          <div class="why">${esc(q.revela)}</div>
          <textarea class="nota" rows="1" placeholder="Respuesta (o «sin dato»)…" oninput="nB('${q.cod}',this.value)">${esc((E.bloque[q.cod] || {}).nota || '')}</textarea>
        </div>`).join('')}`).join('')}`;
}
function nB(cod, v) { E.bloque[cod] = { nota: v }; guardar(); }

/* ── Competencia ── */
function pintarComp() {
  const hechas = BLOQUE_COMPETENCIA.preguntas.filter(q => E.comp[q.cod]).length;
  $('#comp').innerHTML = `
    <div class="sec-h"><h2>Competencia y mercado</h2><span class="min">4 min</span>
      <span class="hecho">${hechas}/5</span></div>
    <p class="sec-sub">Transversal: califica a los siete eslabones y nunca es el diagnóstico. La mitad observable ya se levantó antes de la reunión.</p>
    ${BLOQUE_COMPETENCIA.preguntas.map(q => { const g = guiaV2(q.cod, q.texto, q.revela); return `
      <div class="q ${E.comp[q.cod] ? 'resp' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(g.texto)}</span>${q.clave ? '<span class="clave-tag">alto rendimiento</span>' : ''}</div>
        <div class="why">${g.sub}</div>
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nC('${q.cod}',this.value)">${esc(E.comp[q.cod] || '')}</textarea>
      </div>`; }).join('')}`;
}
function nC(cod, v) { E.comp[cod] = v; guardar(); }

/* ── Cierre ── */
function pintarCierre() {
  const hechas = PREGUNTAS_CIERRE.filter(q => E.cierre[q.id]).length;
  $('#cierre').innerHTML = `
    <div class="sec-h"><h2>Cierre</h2><span class="min">3 min</span>
      <span class="hecho">${hechas}/3</span></div>
    <p class="sec-sub">${esc(PROMESA_DE_SALIDA)} Nunca se sacrifica el cierre: si vas atrasado, corta el bloque del área y ven directo acá.</p>
    ${PREGUNTAS_CIERRE.map(q => `
      <div class="q ${E.cierre[q.id] ? 'resp' : ''}">
        <div class="qh"><span class="cod">${q.cod}</span><span class="txt">${esc(q.texto)}</span></div>
        <div class="why">${esc(q.porque)}</div>
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nCi('${q.id}',this.value)">${esc(E.cierre[q.id] || '')}</textarea>
      </div>`).join('')}
    ${(typeof CIERRE_X !== 'undefined' ? CIERRE_X : []).map(q => `
      <div class="q ${(E.cx || {})[q.id] ? 'resp' : ''}">
        <div class="qh"><span class="cod amb">${q.cod}</span><span class="txt">${esc(q.texto)}</span></div>
        <div class="why">${esc(q.porque)}</div>
        <textarea class="nota" rows="1" placeholder="Con sus palabras…" oninput="nCx('${q.id}',this.value)">${esc((E.cx || {})[q.id] || '')}</textarea>
      </div>`).join('')}
    <div class="numrow" style="margin-left:0">
      <label>Fecha comprometida del próximo paso
        <input type="date" value="${esc(E.fechaPaso || '')}" oninput="nFecha(this.value)"></label>
      <label>Hora
        <input type="time" value="${esc(E.horaPaso || '10:00')}" oninput="nHora(this.value)"></label>
    </div>
    <div class="ops" style="margin-top:12px">
      <button class="chip ${E.fechaPaso ? '' : 'gated'}" onclick="agendarProxima()">📅 Agendar la próxima reunión con ${esc(E.ficha.empresa || 'el cliente')}</button>
    </div>`;
}
function nHora(v) { E.horaPaso = v; guardar(); }
/* Abre Google Calendar con el evento de la próxima reunión ya armado (1 hora). */
function agendarProxima() {
  if (!E.fechaPaso) { alert('Primero fija la fecha comprometida del próximo paso.'); return; }
  const hora = E.horaPaso || '10:00';
  const ini = E.fechaPaso.replace(/-/g, '') + 'T' + hora.replace(':', '') + '00';
  const finH = String((parseInt(hora.slice(0, 2), 10) + 1) % 24).padStart(2, '0');
  const fin = E.fechaPaso.replace(/-/g, '') + 'T' + finH + hora.slice(2).replace(':', '') + '00';
  const detalle = (E.cierre && E.cierre.c3 ? E.cierre.c3 + '\n\n' : '') + 'Agendada desde Calibrar · Precisión Agencia';
  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent((E.ficha.empresa || 'Cliente') + '-Precisión')
    + '&dates=' + ini + '/' + fin
    + '&ctz=America/Santiago'
    + '&details=' + encodeURIComponent(detalle);
  window.open(url, '_blank');
}
function nCi(id, v) { E.cierre[id] = v; guardar(); }
function nFecha(v) { E.fechaPaso = v; guardar(); }

/* ── Panel interno: solo esta página ── */
function pintarPanel() {
  const ruta = rutear(E.triage);
  const dicho = loQueSePuedeDecir(E.triage, ruta);
  const contra = contradicciones(E.triage);
  $('#panel').innerHTML = `
    <div class="sec-h"><h2>Panel interno · solo tú</h2></div>
    <p class="sec-sub">Nada de esto se comparte. Las contradicciones se convierten en la siguiente pregunta, no en una conclusión.</p>
    <h3 class="si">Seguro de decir</h3>
    ${dicho.seguro.length ? `<ul>${dicho.seguro.map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.ev)}</span></li>`).join('')}</ul>` : '<p class="vacio">Todavía nada con evidencia suficiente.</p>'}
    <h3 class="no">No decir aún</h3>
    ${dicho.noAun.length ? `<ul>${dicho.noAun.map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.ev)}</span></li>`).join('')}</ul>` : '<p class="vacio">—</p>'}
    <h3 class="no">Contradicciones → preguntar</h3>
    ${contra.length ? `<ul>${contra.map(x => `<li>${esc(x.txt)}<span class="ev">${esc(x.par)}</span></li>`).join('')}</ul>` : '<p class="vacio">Ninguna detectada.</p>'}
    ${conSalud() ? `<h3 class="no">Capa de salud · límites que mandan</h3>
      <ul>${alertasSalud(E, ruta).map(x => `<li>${esc(x.t)}<span class="ev">${esc(x.ev)}</span></li>`).join('')}</ul>` : ''}
    ${esProfesional() ? pintarSistemaHTML(ruta) : ''}`;
}
/* El sistema personalizado, en borrador: se arma solo con el ruteo y se lee con él. */
function pintarSistemaHTML(ruta) {
  const s = armarSistema(ruta, E);
  if (!s) return `<h3 class="si">Sistema personalizado</h3><p class="vacio">Se arma cuando el triage fije el eslabón dominante.</p>`;
  return `<h3 class="si">Sistema personalizado · borrador</h3>
    ${s.fases.map(f => `<div class="grupo-t">Fase ${f.orden} · ${esc(f.nombre)}</div>
      <ul>${f.componentes.map(c => `<li><b>${dosDig(c.n)} · ${esc(c.nombre)}</b> — ${esc(c.piezas.join(' · '))}
        <span class="ev">Se mide: ${esc(c.mide)}${c.cuidado ? ' · ' + esc(c.cuidado) : ''}</span></li>`).join('')}</ul>`).join('')}
    ${s.sinDatos.length ? `<p class="vacio">Sin datos todavía: ${s.sinDatos.map(dosDig).join(', ')}. Pregúntalos antes de cerrar el sistema.</p>` : ''}`;
}

/* ── Cronómetro del presupuesto de 32 minutos (PRD §5.7.10) ── */
const TRAMOS = [['Apertura', 3], ['Triage', 9], ['Núcleo', 5], ['Bloque del área', 8], ['Competencia', 4], ['Cierre', 3]];
function crSeg() {
  const c = E.crono || { acum: 0, corriendo: false, desde: 0 };
  return c.acum + (c.corriendo ? (Date.now() - c.desde) / 1000 : 0);
}
function crTramo(min) {
  let t = 0;
  for (const [nombre, dur] of TRAMOS) { t += dur; if (min < t) return nombre; }
  return null;
}
function crToggle() {
  const c = E.crono = E.crono || { acum: 0, corriendo: false, desde: 0 };
  if (c.corriendo) { c.acum += (Date.now() - c.desde) / 1000; c.corriendo = false; }
  else { c.desde = Date.now(); c.corriendo = true; }
  guardar(); pintarEstado();
}
function crReset() { E.crono = { acum: 0, corriendo: false, desde: 0 }; guardar(); pintarEstado(); }
/* Pedir el informe = fin de la conversación medida: el cronómetro se detiene solo. */
function irAResultados(ev) {
  if (ev) ev.preventDefault();
  const c = E.crono;
  if (c && c.corriendo) { c.acum += (Date.now() - c.desde) / 1000; c.corriendo = false; guardar(); }
  // En modo ejemplo el destino conserva la reunión cargada
  window.location.href = 'resultados.html' + (CABINA_DEMO ? '?reunion=' + encodeURIComponent(CABINA_DEMO) : '');
}
function crPintar() {
  const el = document.getElementById('cr-t'); if (!el) return;
  const s = crSeg(), min = s / 60;
  el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const tramo = document.getElementById('cr-tramo');
  if (tramo) {
    if (min >= 32) { tramo.textContent = 'Fuera de presupuesto — cierra con próximo paso y fecha'; tramo.style.color = '#d9534f'; tramo.style.fontWeight = '800'; }
    else if (min >= 30) { tramo.textContent = '30′ — corta el bloque y ve al CIERRE'; tramo.style.color = '#d9534f'; tramo.style.fontWeight = '800'; }
    else { const t = crTramo(min); tramo.textContent = t ? `según presupuesto: ${t}` : ''; tramo.style.color = ''; tramo.style.fontWeight = ''; }
  }
}
setInterval(crPintar, 1000);

/* ── Barra de estado ── */
function pintarEstado() {
  const ruta = rutear(E.triage);
  const sig = siguientePregunta(E.triage);
  const c = E.crono || {};
  const dom = ruta.dominante
    ? `<span class="num">${dosDig(ruta.dominante)}</span> ${esc(CADENA[ruta.dominante - 1].nombre)} → ${esc(CADENA[ruta.dominante - 1].area)}`
    : 'Sin dominante todavía';
  const sinMarca = TRIAGE.filter(q => (E.nt || {})[q.id] && !E.triage[q.id]).length;
  $('#estado').innerHTML = `
    ${sinMarca ? `<span class="alerta-nota">⚠ ${sinMarca} nota${sinMarca > 1 ? 's' : ''} sin respuesta marcada — el ruteo no las ve</span>` : ''}
    <span class="crono"><span id="cr-t" class="cr-t">00:00</span>
      <button class="cr-btn" onclick="crToggle()">${c.corriendo ? '⏸' : '▶'}</button>
      <button class="cr-btn" onclick="crReset()" title="Reiniciar cronómetro">↺</button>
      <span id="cr-tramo" class="cr-tramo"></span></span>
    <span class="dom">${dom}</span>
    <span class="meta">${ruta.respondidas.length}/14 · confianza ${esc(ruta.confianza)}</span>
    ${sig ? `<span class="sig">Siguiente: <b>${esc(sig.cod)}</b> ${esc(sig.texto)}</span>` : ''}
    <a class="btn-res" href="resultados.html${CABINA_DEMO ? '?reunion=' + encodeURIComponent(CABINA_DEMO) : ''}" ${CABINA_DEMO ? '' : 'onclick="irAResultados(event)"'}>Resultados →</a>`;
  crPintar();
}

/* Respaldo: descarga la reunión completa como JSON, nombrada por empresa y fecha.
   Sirve para archivar la reunión y para pasársela a Claude en el modelado posterior. */
function exportar() {
  const emp = (E.ficha.empresa || 'reunion').replace(/[^\w-]+/g, '_');
  const f = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(E, null, 2));
  a.download = `calibrar_${emp}_${f}.json`;
  document.body.appendChild(a); a.click(); a.remove();
}

function hayDatos() {
  return Object.keys(E.triage).length || Object.keys(E.p0).length || Object.keys(E.nucleo).length ||
         Object.keys(E.comp).length || Object.keys(E.cierre).length || Object.keys(E.bloque).length;
}

/* ── Archivo de reuniones: selector, nueva, cambiar, importar ── */
/* Historial publicado: los .json de Reuniones/ (visibles desde cualquier equipo) */
async function cargarHistorialPublicado() {
  try {
    const html = await (await fetch('Reuniones/')).text();
    const archivos = [...html.matchAll(/href="([^"\/]+\.json)"/gi)].map(m => decodeURIComponent(m[1]));
    window.__demoLista = [];
    for (const f of archivos) {
      let etiqueta = f.replace(/\.json$/i, '').replace(/_/g, ' ');
      let empresa = '', creada = '';
      try {
        const j = await (await fetch('Reuniones/' + encodeURIComponent(f))).json();
        empresa = (j.ficha || {}).empresa || '';
        creada = j.creada || '';
        const emp = empresa || etiqueta;
        const fecha = creada ? new Date(creada + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '';
        const completa = Object.keys(j.triage || {}).length >= 5;
        etiqueta = `${emp}${fecha ? ' · ' + fecha : ''}${completa ? '' : ' · preparación previa'}`;
      } catch { }
      window.__demoLista.push({ f, etiqueta, empresa, creada });
    }
    window.__demoLista.sort((a, b) => (a.etiqueta.includes('preparación') ? 1 : 0) - (b.etiqueta.includes('preparación') ? 1 : 0));
  } catch { window.__demoLista = []; }
}

function pintarSelector() {
  const sel = document.getElementById('sel-reu'); if (!sel) return;
  const pub = window.__demoLista || [];
  const opNueva = `<option value="__nueva">＋ Reunión nueva</option>`;
  if (CABINA_DEMO) {
    // Modo ejemplo: reunión nueva siempre disponible + actual en pantalla + pasadas
    sel.innerHTML = opNueva + pub.map(x => {
      const actual = CABINA_DEMO.endsWith(x.f);
      return `<option value="pub:${esc(x.f)}" ${actual ? 'selected' : ''}>${actual ? '▶ ' : ''}${esc(x.etiqueta)}${actual ? ' (en pantalla)' : ''}</option>`;
    }).join('');
    sel.disabled = false;
    sel.onchange = e => cambiarReunion(e.target.value);
    return;
  }
  // Carpetas por cliente: cada empresa agrupa sus reuniones (locales y publicadas)
  const a = archivo();
  const carpetas = {};
  const meter = (emp, html) => { const k = (emp || 'Sin cliente').toUpperCase(); (carpetas[k] = carpetas[k] || []).push(html); };
  Object.values(a).sort((x, y) => (y.creada || '').localeCompare(x.creada || '')).forEach(r =>
    meter(r.ficha.empresa, `<option value="${r.id}" ${r.id === E.id ? 'selected' : ''}>${r.id === E.id ? '▶ ' : ''}${esc(r.creada || 'sin fecha')} · en este equipo</option>`));
  if (!a[E.id]) meter(E.ficha.empresa, `<option value="${E.id}" selected>▶ Reunión actual</option>`);
  pub.forEach(x => meter(x.empresa || x.etiqueta, `<option value="pub:${esc(x.f)}">${esc(x.etiqueta)}</option>`));
  sel.innerHTML = opNueva + Object.entries(carpetas)
    .sort(([k]) => (k === (E.ficha.empresa || '').toUpperCase() ? -1 : 0))
    .map(([emp, ops]) => `<optgroup label="📁 ${esc(emp)}">${ops.join('')}</optgroup>`).join('');
}

/* Reuniones anteriores del MISMO cliente (locales + publicadas), la actual excluida */
function reunionesDelCliente(empresa) {
  const emp = (empresa || '').trim().toUpperCase();
  if (!emp) return { locales: [], publicadas: [] };
  const locales = Object.values(archivo())
    .filter(r => (r.ficha.empresa || '').trim().toUpperCase() === emp && r.id !== E.id)
    .sort((x, y) => (y.creada || '').localeCompare(x.creada || ''));
  const publicadas = (window.__demoLista || []).filter(x =>
    (x.empresa || '').trim().toUpperCase() === emp && !(CABINA_DEMO || '').endsWith(x.f));
  return { locales, publicadas };
}

/* La carpeta del cliente: sus reuniones + nueva reunión + preparación con el motor */
function pintarCarpeta() {
  const el = document.getElementById('carpeta'); if (!el) return;
  const emp = (E.ficha.empresa || '').trim();
  if (!emp) { el.style.display = 'none'; return; }
  el.style.display = '';
  const { locales, publicadas } = reunionesDelCliente(emp);
  const filas = [
    `<div class="carp-item actual">▶ Esta reunión · ${esc(E.creada || '')}</div>`,
    ...locales.map(r => `<div class="carp-item" onclick="cambiarReunion('${r.id}')">${esc(r.creada || 'sin fecha')} · en este equipo</div>`),
    ...publicadas.map(x => `<div class="carp-item" onclick="cambiarReunion('pub:${esc(x.f)}')">${esc(x.etiqueta)} · publicada</div>`)
  ];
  el.innerHTML = `
    <div class="sec-h"><h2>📁 Carpeta · ${esc(emp)}</h2>
      <span class="hecho">${filas.length} reunión${filas.length === 1 ? '' : 'es'}</span></div>
    <div class="carp-lista">${filas.join('')}</div>
    <div class="ops" style="margin-top:12px">
      ${CABINA_DEMO ? '' : `<button class="chip" onclick="nuevaReunionCliente()">＋ Nueva reunión con ${esc(emp)}</button>`}
      ${(locales.length + publicadas.length) ? `<button class="chip" onclick="prepararSiguiente()">🧭 Preparar la siguiente reunión (motor)</button>` : ''}
    </div>
    <div id="prep-motor"></div>`;
  if (typeof pintarPrep === 'function') pintarPrep();
}

/* Nueva reunión del mismo cliente: hereda la ficha, parte limpia, queda enlazada */
function nuevaReunionCliente() {
  if (!confirm(`¿Abrir una nueva reunión con ${E.ficha.empresa}? La actual queda guardada en la carpeta.`)) return;
  const nueva = estadoInicial();
  nueva.ficha = { ...E.ficha };
  nueva.fichax = { ...(E.fichax || {}) };
  nueva.prev = E.id;
  E = nueva; localStorage.setItem(K, JSON.stringify(E)); guardar(); pintarTodo();
}
function cambiarReunion(id) {
  if (id === '__nueva') {
    if (CABINA_DEMO) { location.href = 'reunion.html'; return; }
    nuevaReunion(); pintarSelector(); return;
  }
  if (id.startsWith('pub:')) {
    location.href = 'reunion.html?reunion=' + encodeURIComponent('Reuniones/' + id.slice(4));
    return;
  }
  if (id === E.id) return;
  const a = archivo(); if (!a[id]) return;
  E = a[id]; if (E.crono) E.crono.corriendo = false;
  localStorage.setItem(K, JSON.stringify(E));
  pintarTodo();
}
function nuevaReunion() {
  if (!confirm('¿Empezar un prospecto nuevo? La reunión actual queda guardada y puedes volver a ella desde el selector.')) return;
  E = estadoInicial(); localStorage.setItem(K, JSON.stringify(E)); pintarTodo();
}
/* Importa una reunión preparada (el mismo formato que descarga Exportar). */
function importar() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const e = JSON.parse(r.result);
        if (!e.ficha || !e.triage) { alert('Ese archivo no es una reunión de la cabina.'); return; }
        if (!e.id) e.id = 'r' + Date.now();
        if (!e.creada) e.creada = new Date().toISOString().slice(0, 10);
        E = e; guardar(); localStorage.setItem(K, JSON.stringify(E)); pintarTodo();
      } catch { alert('No se pudo leer el archivo.'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

function pintarTodo() {
  pintarSelector(); pintarFicha(); pintarCarpeta(); pintarGatillo(); pintarP0(); pintarTriage(); pintarPuente(); pintarNucleo();
  pintarBloque(); pintarExtra(); pintarComp(); pintarCierre(); pintarPanel(); pintarEstado();
  if (typeof pintarMotor === 'function') pintarMotor();
}
document.addEventListener('DOMContentLoaded', async () => {
  if (CABINA_DEMO) {
    try {
      const r = await fetch(CABINA_DEMO);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      E = await r.json();
    } catch (e2) { alert('No se pudo cargar el ejemplo (' + CABINA_DEMO + '): ' + e2.message); }
    // Los enlaces entre páginas conservan el modo ejemplo (y sin handlers que lo pierdan)
    document.querySelectorAll('.top nav a').forEach(a => {
      a.removeAttribute('onclick');
      a.href = a.getAttribute('href').split('?')[0] + '?reunion=' + encodeURIComponent(CABINA_DEMO);
    });
    // En modo ejemplo: Importar/Exportar no aplican; «Nueva reunión» lleva a una reunión propia en blanco
    document.querySelectorAll('.top nav button').forEach(b => {
      if (/Importar|Exportar/.test(b.textContent)) b.style.display = 'none';
      if (/Nueva reunión/.test(b.textContent)) b.onclick = () => { location.href = 'reunion.html'; };
    });
  }
  pintarTodo();
  await cargarHistorialPublicado();   // en ambos modos: el historial publicado siempre está en el selector
  pintarSelector();
});
