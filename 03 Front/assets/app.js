/* CALIBRAR · Front de demostración — app.js
   Tres vistas: portada · panel del operador (modo en vivo) · entregable.     */

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dosDig = n => String(n).padStart(2, '0');

let R = cargar('calibrar_demo_triage');   // respuestas de triage
let B = cargar('calibrar_demo_bloque');   // estado del bloque profundo: {cod: {e, nota}}
// M = la reunión alrededor del triage: modo de visita, preguntas 0, cierre y reloj.
// El triage es el instrumento; esto es la reunión donde se usa.
let M = cargar('calibrar_demo_reunion');

function cargar(k) {
  try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; }
}
function guardar() {
  localStorage.setItem('calibrar_demo_triage', JSON.stringify(R));
  localStorage.setItem('calibrar_demo_bloque', JSON.stringify(B));
  localStorage.setItem('calibrar_demo_reunion', JSON.stringify(M));
}

/* ── El reloj de la reunión ───────────────────────────────────────────────────
   No es un adorno: la promesa del guion de terreno es "toma media hora", y hasta
   ahora nada medía si se cumplía. Se guarda el instante de arranque, no los
   segundos corridos, para que sobreviva a recargar la página.

   Muestra dos cosas a la vez, y esa es la gracia: en qué tramo DEBERÍAS ir según
   el reloj, y en qué tramo VAS según lo que llevas contestado. Cuando se separan,
   se ve al toque si hay que apurar o si sobra tiempo.                          */
function modoActual() { return MODOS_VISITA[M.modo || 'pyme']; }
function presupuestoMin() { return modoActual().tramos.reduce((a, t) => a + t.min, 0); }

function transcurridoMs() {
  const r = M.reloj || {};
  return (r.acumulado || 0) + (r.desde ? Date.now() - r.desde : 0);
}
function relojArrancar() {
  M.reloj = M.reloj || { acumulado: 0 };
  if (!M.reloj.desde) M.reloj.desde = Date.now();
  guardar(); pintarPanel();
}
function relojPausar() {
  const r = M.reloj; if (!r || !r.desde) return;
  r.acumulado = (r.acumulado || 0) + (Date.now() - r.desde); r.desde = null;
  guardar(); pintarPanel();
}
function relojReiniciar() { M.reloj = { acumulado: 0, desde: null }; guardar(); pintarPanel(); }

const mmss = ms => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/* Tramo esperado por reloj vs tramo real por avance contestado. */
function tramoPorReloj() {
  const min = transcurridoMs() / 60000; let acc = 0;
  const ts = modoActual().tramos;
  for (let i = 0; i < ts.length; i++) { acc += ts[i].min; if (min < acc) return i; }
  return ts.length;                                    // se pasó del presupuesto
}
function tramoPorAvance() {
  const ts = modoActual().tramos, idx = id => ts.findIndex(t => t.id === id);
  const p0Listas = PREGUNTAS_0.filter(q => (M.p0 || {})[q.id]).length;
  if (p0Listas < PREGUNTAS_0.length) return Math.max(0, idx('p0'));
  if (idx('tri') >= 0) {
    const flujo = puntoDeFlujo(R);
    const vis = TRIAGE.filter(q => !q.gatillo || (flujo !== null && flujo >= 4) || R[q.id]);
    if (vis.filter(q => R[q.id]).length < vis.length) return idx('tri');
  }
  if (Object.keys(B).length === 0 && idx('nuc') >= 0) return idx('nuc');
  if (PREGUNTAS_CIERRE.some(q => !(M.cierre || {})[q.id])) return Math.max(0, idx('cie'));
  return ts.length;
}

function responder0(id, v) {
  M.p0 = M.p0 || {};
  M.p0[id] = M.p0[id] === v ? null : v;
  if (!M.p0[id]) delete M.p0[id];
  // 0.1 manda sobre el modo: "si te responde que él no decide, estás en modo
  // referido aunque hayas llegado creyendo otra cosa. Cambia ahí mismo."
  if (id === 'p01') {
    const op = PREGUNTAS_0[0].opciones.find(o => o.v === v);
    if (op && op.modo && M.p0[id]) M.modo = op.modo;
  }
  guardar(); pintarPanel();
}
function notar0(k, v) { M.notas = M.notas || {}; M.notas[k] = v; guardar(); }
function responderCierre(id, v) { M.cierre = M.cierre || {}; M.cierre[id] = v; guardar(); }
function fijarModo(m) { M.modo = m; guardar(); pintarPanel(); }
function limpiarReunion() { M = {}; guardar(); pintarPanel(); }

/* ── Navegación ──────────────────────────────────────────────────────────── */
function ir(v) {
  $$('.vista').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('.top nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
  if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
  window.scrollTo(0, 0);
  if (v === 'panel') pintarPanel();
  if (v === 'bloque') pintarBloque();
}
window.addEventListener('hashchange', () => ir((location.hash || '#inicio').slice(1)));

/* ── Diagrama de la Cadena ───────────────────────────────────────────────── */
const PIE_CADENA = `<div class="cadena-pie">
    <span><i class="i-sano"></i>Sano</span>
    <span><i class="i-roto"></i>Roto</span>
    <span><i class="i-dom"></i>Dominante — el primero que se rompe desde donde hay flujo</span>
    <span><i class="i-sd"></i>Sin datos</span>
  </div>`;

/* Horizontal: ancho completo, para el entregable */
function cadenaHTML(estados, dominante, secundaria) {
  return `<div class="cadena">${CADENA.map(e => {
    const st = estados[e.n] || 'sin_datos';
    const cls = ['esl', st, e.n === dominante ? 'dom' : '', e.n === secundaria ? 'sec' : ''].filter(Boolean).join(' ');
    const tag = e.n === dominante ? '<span class="tag">Dominante</span>'
              : e.n === secundaria ? '<span class="tag">Secundario</span>' : '';
    return `<div class="${cls}" title="${esc(e.nombre)} — ${st.replace('_', ' ')} · ${esc(e.area)}">
      ${tag}<div class="num">${dosDig(e.n)}</div>
      <div class="nom">${esc(e.nombre)}</div>
      <div class="ar">${esc(e.area)}</div></div>`;
  }).join('')}</div>${PIE_CADENA}`;
}

/* Vertical: barra lateral angosta, para el panel del operador */
function cadenaVertHTML(estados, dominante, secundaria) {
  const ETQ = { sano: 'Sano', roto: 'Roto', sin_datos: 'Sin datos' };
  return `<div class="cadena-v">${CADENA.map(e => {
    const st = estados[e.n] || 'sin_datos';
    const cls = ['eslv', st, e.n === dominante ? 'dom' : '', e.n === secundaria ? 'sec' : ''].filter(Boolean).join(' ');
    const rol = e.n === dominante ? 'Dominante' : e.n === secundaria ? 'Secundario' : '';
    return `<div class="${cls}">
      <span class="n">${dosDig(e.n)}</span>
      <span class="t"><b>${esc(e.nombre)}</b><i>${esc(e.area)}</i></span>
      <span class="s">${rol || ETQ[st]}</span></div>`;
  }).join('')}</div>`;
}

/* ── VISTA 2 · Panel del operador ────────────────────────────────────────── */
/* ── Cabecera de reunión: modo, guion de apertura y reloj por tramos ──────── */
function pintarReunion() {
  const mo = modoActual(), ts = mo.tramos;
  const enReloj = tramoPorReloj(), enAvance = tramoPorAvance();
  const total = presupuestoMin(), ms = transcurridoMs();
  const corriendo = !!(M.reloj && M.reloj.desde);
  const excedido = ms / 60000 > total;

  $('#reunion').innerHTML = `
  <div class="reu">
    <div class="reu-top">
      <div class="reu-modo">
        <span class="kicker">Modo de visita</span>
        <div class="reu-chips">${Object.entries(MODOS_VISITA).map(([k, v]) =>
          `<button class="op-chip ${(M.modo || 'pyme') === k ? 'sel' : ''}" onclick="fijarModo('${k}')">${esc(v.nombre)}</button>`).join('')}</div>
        <div class="reu-meta"><b>Buscas:</b> ${esc(mo.busca)} · <b>Dura:</b> ${esc(mo.dura)} · <b>Te vas con:</b> ${esc(mo.cierra_con)}</div>
      </div>
      <div class="reu-reloj ${excedido ? 'over' : ''}" id="reu-reloj">
        <div class="reu-t" id="reu-t">${mmss(ms)}</div>
        <div class="reu-p">de ${total}′ presupuestados</div>
        <div class="reu-btns">
          ${corriendo ? `<button class="btn" onclick="relojPausar()">Pausar</button>`
                      : `<button class="btn pri" onclick="relojArrancar()">${ms ? 'Seguir' : 'Empezar'}</button>`}
          <button class="btn gh" onclick="relojReiniciar()">Reiniciar</button>
        </div>
      </div>
    </div>

    <div class="reu-rl" id="reu-rl">${ts.map((t, i) => {
      const cls = [i === enReloj ? 'ahora' : '', i < enReloj ? 'ido' : '', i === enAvance ? 'vas' : ''].filter(Boolean).join(' ');
      return `<span class="reu-seg ${cls}" style="flex:${t.min}" title="${esc(t.nombre)} · ${t.min} min · ${esc(t.fuente)}">
        ${esc(t.nombre)}<i>${t.min}′</i></span>`;
    }).join('')}</div>
    <div class="reu-ley" id="reu-ley">
      <span><i class="l-ahora"></i>Dónde deberías ir según el reloj</span>
      <span><i class="l-vas"></i>Dónde vas según lo contestado</span>
      ${enReloj > enAvance ? `<b class="atrasado">Vas atrasado: el reloj está en “${esc((ts[enReloj] || {}).nombre || 'fuera de presupuesto')}” y todavía estás en “${esc(ts[enAvance].nombre)}”.</b>`
        : enAvance > enReloj ? `<b class="holgado">Vas holgado: puedes profundizar el bloque del eslabón antes de cerrar.</b>` : ''}
    </div>

    <details class="reu-guion" ${ms ? '' : 'open'}>
      <summary>Guion de apertura · ${esc(mo.nombre)}</summary>
      <p class="reu-cita">“${esc(mo.apertura)}”</p>
      <p class="reu-ojo"><b>Ojo:</b> ${esc(mo.ojo)}</p>
    </details>
  </div>`;
}

/* El tick NO repinta el panel. Si lo hiciera, cada segundo borraría el cursor de
   la nota que se está escribiendo en plena reunión — que es el peor momento
   posible para perder texto. Toca solo los dígitos, y las clases de los tramos
   únicamente cuando el tramo cambió de verdad. */
let ultimoTramo = null;
function tic() {
  const n = $('#reu-t'); if (!n) return;
  n.textContent = mmss(transcurridoMs());
  const t = tramoPorReloj();
  if (t === ultimoTramo) return;
  ultimoTramo = t;
  const segs = $$('#reu-rl .reu-seg');
  segs.forEach((s, i) => { s.classList.toggle('ahora', i === t); s.classList.toggle('ido', i < t); });
  $('#reu-reloj').classList.toggle('over', transcurridoMs() / 60000 > presupuestoMin());
  const ley = $('#reu-ley'); if (!ley) return;
  const ts = modoActual().tramos, a = tramoPorAvance();
  const vieja = ley.querySelector('b'); if (vieja) vieja.remove();
  if (t > a) ley.insertAdjacentHTML('beforeend',
    `<b class="atrasado">Vas atrasado: el reloj está en “${esc((ts[t] || {}).nombre || 'fuera de presupuesto')}” y todavía estás en “${esc(ts[a].nombre)}”.</b>`);
  else if (a > t) ley.insertAdjacentHTML('beforeend',
    `<b class="holgado">Vas holgado: puedes profundizar el bloque del eslabón antes de cerrar.</b>`);
}

/* ── Ficha de la empresa ──────────────────────────────────────────────────────
   Sin esto la visita puede salir perfecta y no dejar con quién seguir. Va arriba
   de todo a propósito: los datos se piden al entrar, no cuando ya te estás
   parando de la silla.                                                        */
function anotarFicha(id, v) { M.ficha = M.ficha || {}; M.ficha[id] = v; guardar(); }

function filaParaLaBase() {
  const f = M.ficha || {};
  const hoy = new Date().toISOString().slice(0, 10);
  const mapa = {
    'Nombre de la empresa (razón social)': f.razon_social, 'Nombre de fantasía': f.fantasia,
    'RUT': f.rut, 'Rubro': f.rubro, 'Sector': f.sector, 'Comuna': f.comuna,
    'Dirección': f.direccion, 'Teléfono': f.telefono, 'Sitio web': f.web,
    'Redes sociales': f.redes, 'Decisor (cargo/nombre)': f.decisor,
    'WhatsApp del decisor': f.decisor_wsp, 'Quién más decide': f.quien_mas,
    'Señal / Gancho de visita': f.senal,
    'Próximo paso': f.proximo_paso, 'Fecha del próximo paso': f.fecha_paso,
    'Fuente / Origen del dato': 'Visita en terreno',
    'Fecha de captura': hoy, 'Base de licitud': f.base_licitud,
    'Fecha de última actualización': hoy, 'Estado del registro': 'Activo'
  };
  // Se emite en el orden EXACTO del maestro y separado por tabulaciones: se pega
  // en la fila siguiente de la hoja y cada dato cae en su columna.
  return COLUMNAS_MAESTRO.map(c => (mapa[c] || '').toString().replace(/\t|\n/g, ' ')).join('\t');
}
function copiarFilaBase() {
  const t = filaParaLaBase();
  navigator.clipboard && navigator.clipboard.writeText(t);
  const b = $('#btn-fila'); if (b) { b.textContent = 'Copiado — pégalo en la hoja'; setTimeout(() => pintarPanel(), 2200); }
}

function pintarFicha() {
  const f = M.ficha || {};
  const llenos = FICHA_EMPRESA.flatMap(g => g.campos).filter(c => f[c.id]).length;
  const total = FICHA_EMPRESA.reduce((a, g) => a + g.campos.length, 0);
  const campo = c => {
    const val = esc(f[c.id] || '');
    if (c.tipo === 'select') return `
      <select class="fi-in" onchange="anotarFicha('${c.id}', this.value)">
        <option value="">—</option>
        ${c.opciones.map(o => `<option ${f[c.id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}
      </select>`;
    return `<input class="fi-in" type="${c.tipo || 'text'}" value="${val}"
      oninput="anotarFicha('${c.id}', this.value)">`;
  };
  $('#ficha').innerHTML = `
  <details class="fi" ${llenos ? '' : 'open'}>
    <summary>Ficha de la empresa — ${llenos}/${total} campos${f.razon_social ? ' · ' + esc(f.razon_social) : ''}</summary>
    <div class="fi-via">
      <span class="kicker">Cómo es esta visita</span>
      <div class="reu-chips">
        ${[['terreno', 'En terreno'], ['meet', 'Videollamada'], ['telefono', 'Por teléfono']].map(([v, l]) =>
          `<button class="op-chip ${f.via === v ? 'sel' : ''}" onclick="anotarFicha('via','${f.via === v ? '' : v}');pintarPanel()">${l}</button>`).join('')}
      </div>
    </div>
    ${FICHA_EMPRESA.map(g => `
      <div class="fi-g">
        <h4>${esc(g.g)}</h4>
        <div class="fi-grid">${g.campos.map(c => `
          <label class="fi-c ${c.extra ? 'extra' : ''}">
            <span class="fi-l">${esc(c.l)}${c.extra ? '<i title="No existe en el maestro de prospectos">fuera del maestro</i>' : ''}</span>
            ${campo(c)}
            ${c.nota ? `<span class="fi-n">${esc(c.nota)}</span>` : ''}
          </label>`).join('')}</div>
      </div>`).join('')}
    <div class="fi-exp">
      <button class="btn pri" id="btn-fila" onclick="copiarFilaBase()">Copiar fila para la base de prospectos</button>
      <span class="fi-n">Sale en el orden de las ${COLUMNAS_MAESTRO.length} columnas del maestro, separado por tabulaciones:
        se pega en la fila siguiente de la hoja «Base de Prospectos» y cada dato cae en su columna.</span>
    </div>
  </details>`;
}

/* ── Dolores: la entrada que no está hecha de marketing ───────────────────────
   Multiselección de verdad — un negocio tiene varios dolores a la vez. No rutea:
   marca hacia dónde apunta lo que el dueño dijo, y sobre todo delata cuando el
   triage todavía no preguntó nada de ese eslabón.                             */
function marcarDolor(v) {
  const s = new Set(M.dolores || []);
  s.has(v) ? s.delete(v) : s.add(v);
  M.dolores = [...s]; guardar(); pintarPanel();
}

// Enumera en castellano: "a, b y c". Un join(' y ') encadena la conjunción y se
// lee como si lo hubiera escrito una máquina — que es de lo que este panel
// tiene que despegarse.
const listar = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];

function eslabonesDeDolores() {
  const sel = new Set(M.dolores || []);
  const items = DOLORES.flatMap(g => g.items).filter(i => sel.has(i.v));
  const cuenta = {}, fuera = [];
  items.forEach(i => i.esl.length ? i.esl.forEach(n => cuenta[n] = (cuenta[n] || 0) + 1) : fuera.push(i.l));
  return { cuenta, fuera, n: items.length };
}

function pintarDolores() {
  const sel = new Set(M.dolores || []);
  const { cuenta, fuera, n } = eslabonesDeDolores();
  const ruta = rutear(R);
  const apuntados = Object.keys(cuenta).map(Number).sort((a, b) => cuenta[b] - cuenta[a]);
  // Un eslabón "a ciegas" es uno que los dolores señalan y que el triage todavía
  // no pudo evaluar. Es el aviso más útil de todo este bloque.
  const aCiegas = apuntados.filter(x => (ruta.estados || {})[x] === 'sin_datos');

  $('#dolores').innerHTML = `
  <details class="dol" ${n ? 'open' : ''}>
    <summary>¿Qué le está costando más hoy? — ${n} marcado${n === 1 ? '' : 's'} · se puede marcar varios</summary>
    <p class="dol-q">Se pregunta con sus palabras y <b>no solo de marketing</b>: el dolor puede ser comercial,
      de operación, de logística, de administración o de gente. Marca todo lo que reconozca — no elige el
      diagnóstico, pero dice por dónde entrar y qué falta preguntar.</p>
    ${DOLORES.map(g => `
      <div class="dol-g">
        <h4>${esc(g.g)}</h4>
        <div class="dol-chips">${g.items.map(i => `
          <button class="op-chip ${sel.has(i.v) ? 'sel' : ''} ${i.esl.length ? '' : 'ajeno'}"
            onclick="marcarDolor('${i.v}')"
            title="${i.esl.length ? 'Apunta a los eslabones ' + i.esl.map(dosDig).join(', ') : 'No lo resolvemos nosotros: se declara fuera de alcance'}">${esc(i.l)}</button>`).join('')}</div>
      </div>`).join('')}
    ${n ? `
    <div class="dol-res">
      <span class="kicker">Hacia dónde apunta lo que marcó</span>
      ${apuntados.length ? `<div class="dol-esl">${apuntados.map(x => `
        <span class="dol-e ${aCiegas.includes(x) ? 'ciego' : ''}">${dosDig(x)} · ${esc(CADENA[x - 1].nombre)}
          <i>${cuenta[x]} señal${cuenta[x] === 1 ? '' : 'es'}</i></span>`).join('')}</div>`
        : `<p class="dol-n">Nada de lo marcado cae dentro de la Cadena. Eso también es un resultado.</p>`}
      ${aCiegas.length ? `<p class="dol-aviso"><b>Falta preguntar.</b> El dolor apunta a
        ${aCiegas.map(x => dosDig(x) + ' ' + CADENA[x - 1].nombre).join(' y ')}, y el triage todavía no tiene datos
        de ${aCiegas.length > 1 ? 'esos eslabones' : 'ese eslabón'}. Es exactamente lo que hay que preguntar ahora.</p>` : ''}
      ${fuera.length ? `<p class="dol-fuera"><b>Fuera de nuestro alcance —</b> ${esc(fuera.join(' · '))}.
        Duele y es real, pero no lo arreglamos nosotros. Va declarado en el entregable, no se vende.</p>` : ''}
    </div>` : ''}
  </details>`;
}

/* ── Puente transcripción → triage ────────────────────────────────────────────
   Busca frases y PROPONE. No contesta. Cada propuesta viaja con la cita textual
   que la sostiene, porque una respuesta de triage sin la frase del cliente detrás
   es justo lo que la Guía §9 prohíbe entregar: "qué eslabón te pareció el roto y
   con qué frase del cliente se sostiene".

   Nunca propone sobre una pregunta ya contestada a mano: lo que dijo el operador
   gana siempre sobre lo que encontró el buscador.                              */
function sugerirDeTranscripcion(texto) {
  if (!texto || !texto.trim()) return [];
  const frases = texto.split(/(?<=[.?!¿¡])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const props = [];
  for (const [qid, pistas] of Object.entries(PISTAS_TRANSCRIPCION)) {
    if (R[qid]) continue;                       // contestada a mano: no se toca
    if ((M.descartadas || []).includes(qid)) continue;
    for (const p of pistas) {
      const frase = frases.find(f => p.re.test(f));
      if (frase) { props.push({ qid, v: p.v, cita: frase }); break; }
    }
  }
  return props;
}

function analizarTranscripcion() {
  M.transcripcion = $('#trans-txt').value;
  M.descartadas = [];
  guardar(); pintarPanel();
}
function aceptarSugerencia(qid, v, cita) {
  R[qid] = v;
  M.citas = M.citas || {}; M.citas[qid] = cita;   // la evidencia viaja con la respuesta
  guardar(); pintarPanel();
}
function descartarSugerencia(qid) {
  M.descartadas = [...(M.descartadas || []), qid];
  guardar(); pintarPanel();
}
function limpiarTranscripcion() {
  delete M.transcripcion; M.descartadas = []; guardar(); pintarPanel();
}

function pintarTranscripcion() {
  const props = sugerirDeTranscripcion(M.transcripcion);
  const etiqueta = (qid, v) => {
    const q = TRIAGE.find(x => x.id === qid);
    const o = q && q.opciones.find(x => x.v === v);
    return { cod: q ? q.cod : qid, texto: q ? q.texto : qid, op: o ? o.l : v, esl: q ? q.eslabon : null };
  };
  $('#transcripcion').innerHTML = `
  <details class="trans" ${M.transcripcion ? 'open' : ''}>
    <summary>Puente · pegar la transcripción de la reunión</summary>
    <p class="trans-que"><b>Qué hace esto:</b> busca frases y <b>propone</b> respuestas del triage con la cita
      que las sostiene. Tú aceptas o descartas — no rellena solo, y lo que contestes a mano nunca se pisa.
      <br><b>Qué NO es:</b> no es IA ni es el motor. Son expresiones regulares corriendo en tu navegador, sin
      conexión. Sirve para no perder lo que ya dijo el cliente, no para diagnosticar por ti.
      <br><b>De dónde sacas el texto:</b> Teams y Meet exportan su propia transcripción. Sirve cualquiera, y
      también tus notas escritas a mano.</p>
    <textarea id="trans-txt" class="trans-txt" rows="7"
      placeholder="Pega acá la transcripción, o escribe lo que te dijo…">${esc(M.transcripcion || '')}</textarea>
    <div class="trans-btns">
      <button class="btn pri" onclick="analizarTranscripcion()">Buscar respuestas en el texto</button>
      <button class="btn gh" onclick="limpiarTranscripcion()">Borrar transcripción</button>
    </div>
    ${M.transcripcion ? (props.length ? `
      <div class="trans-props">
        <span class="kicker">${props.length} propuesta${props.length > 1 ? 's' : ''} · ninguna aplicada todavía</span>
        ${props.map(p => { const e = etiqueta(p.qid, p.v); return `
          <div class="trans-prop">
            <div class="tp-h"><span class="cod">${esc(e.cod)}</span><span class="tp-q">${esc(e.texto)}</span>
              ${e.esl ? `<span class="esl-tag">Eslabón ${dosDig(e.esl)}</span>` : ''}</div>
            <div class="tp-r">Propone: <b>${esc(e.op)}</b></div>
            <div class="tp-c">“${esc(p.cita)}”</div>
            <div class="tp-b">
              <button class="btn pri" onclick="aceptarSugerencia('${p.qid}','${p.v}',${JSON.stringify(p.cita).replace(/"/g, '&quot;')})">Aceptar</button>
              <button class="btn gh" onclick="descartarSugerencia('${p.qid}')">Descartar</button>
            </div>
          </div>`; }).join('')}
      </div>`
      : `<p class="trans-nada">No encontré ninguna frase que calce con los literales del triage. Eso no
         significa que no se haya dicho: significa que no está escrito de una forma que este buscador
         reconozca. Contesta a mano.</p>`) : ''}
    <p class="trans-cob">Cubre ${Object.keys(PISTAS_TRANSCRIPCION).length} de las ${TRIAGE.length} preguntas.
      Sin pistas: ${SIN_PISTAS.join(', ').toUpperCase()} — pide un número de horas y nadie lo dice en voz alta
      de una forma que se pueda leer sin equivocarse.</p>
  </details>`;
}

/* ── Preguntas 0 y cierre: los seis minutos que faltaban ──────────────────── */
function pintarPreguntas0() {
  const hechas = PREGUNTAS_0.filter(q => (M.p0 || {})[q.id] || (M.notas || {})[q.id]).length;
  $('#preguntas0').innerHTML = `
    <div class="bloque-reu">
      <h3 class="gh2 amb">Preguntas 0 · primeros 3 minutos, siempre — ${hechas}/${PREGUNTAS_0.length}</h3>
      <p class="gh2-sub">Si no se responden, no sabes para quién es la reunión ni en qué modo estás. Preguntarlo al final es descubrir en el minuto veinte que le presentaste a quien no compra.</p>
    </div>
    ${PREGUNTAS_0.map(q => {
      const val = (M.p0 || {})[q.id];
      return `<div class="q p0 ${val || (M.notas || {})[q.id] ? 'done' : ''}">
        <div class="qh"><span class="cod amb">${q.cod}</span><span class="txt">${esc(q.texto)}</span></div>
        <div class="why">${esc(q.porque)}</div>
        ${q.opciones.length ? `<div class="ops">${q.opciones.map(o =>
          `<button class="op-chip ${val === o.v ? 'sel' : ''}" onclick="responder0('${q.id}','${o.v}')">${esc(o.l)}</button>`).join('')}</div>` : ''}
        <textarea class="nota" rows="2" placeholder="Con sus palabras…"
          oninput="notar0('${q.id}', this.value)">${esc((M.notas || {})[q.id] || '')}</textarea>
      </div>`;
    }).join('')}`;
}

function pintarCierre() {
  const dom = rutear(R).dominante;
  $('#cierre').innerHTML = `
    <div class="bloque-reu">
      <h3 class="gh2 amb">Las tres del cierre — ${PREGUNTAS_CIERRE.filter(q => (M.cierre || {})[q.id]).length}/3</h3>
      <p class="gh2-sub">Lo único que importa del final. C3 no pregunta si le interesa: pregunta cuándo.</p>
    </div>
    ${PREGUNTAS_CIERRE.map(q => `
      <div class="q p0 ${(M.cierre || {})[q.id] ? 'done' : ''}">
        <div class="qh"><span class="cod amb">${q.cod}</span><span class="txt">${esc(q.texto)}</span></div>
        <div class="why">${esc(q.porque)}</div>
        <textarea class="nota" rows="2" placeholder="Con sus palabras…"
          oninput="responderCierre('${q.id}', this.value)">${esc((M.cierre || {})[q.id] || '')}</textarea>
      </div>`).join('')}
    <div class="q p0 promesa">
      <div class="qh"><span class="cod amb">↩</span><span class="txt">${esc(PROMESA_DE_SALIDA)}</span></div>
      <div class="why">${dom
        ? `Hoy el ruteo dice <b>${dosDig(dom)} · ${esc(CADENA[dom - 1].nombre)}</b>. Dilo con la frase de él, no con la nuestra.`
        : 'Todavía no hay eslabón dominante: no lo inventes. Si el triage quedó corto, se dice que quedó corto.'}</div>
    </div>`;
}

function pintarPanel() {
  pintarReunion(); pintarTranscripcion(); pintarPreguntas0(); pintarCierre();
  const ruta = rutear(R);
  const sig = siguientePregunta(R);
  const dice = loQueSePuedeDecir(R, ruta);
  const contra = contradicciones(R);
  const flujo = puntoDeFlujo(R);
  const visibles = TRIAGE.filter(q => !q.gatillo || (flujo !== null && flujo >= 4) || R[q.id]);
  const hechas = visibles.filter(q => R[q.id]).length;

  // Barra superior
  $('#barra').innerHTML = `
    <span class="kicker">Triage ${hechas}/${visibles.length}</span>
    <span class="prog"><i style="width:${Math.round(hechas / visibles.length * 100)}%"></i></span>
    <button class="btn" onclick="cargarEcostar()">Cargar caso Eco Star</button>
    <button class="btn gh" onclick="limpiar()">Limpiar</button>`;

  // Preguntas
  $('#preguntas').innerHTML = visibles.map(q => {
    const val = R[q.id];
    const nueva = sig && sig.id === q.id;
    return `<div class="q ${val ? 'done' : ''} ${nueva ? 'nueva' : ''}">
      <div class="qh">
        <span class="cod">${q.cod}</span>
        <span class="txt">${esc(q.texto)}</span>
        <span class="esl-tag">Eslabón ${dosDig(q.eslabon)}</span>
      </div>
      <div class="why">${nueva ? '<b>Siguiente mejor pregunta.</b> ' : ''}${esc(q.porque)}</div>
      <div class="ops">${q.opciones.map(o =>
        `<button class="op-chip ${val === o.v ? 'sel' : ''}" onclick="responder('${q.id}','${o.v}')">${esc(o.l)}</button>`).join('')}</div>
    </div>`;
  }).join('');

  if (visibles.length < TRIAGE.length) {
    $('#preguntas').innerHTML += `<div class="q"><div class="why" style="margin-left:0">
      <b>T13 y T14 están en espera.</b> Se preguntan apenas T3 revele que sí llega flujo: sin flujo que filtrar, el criterio no se puede evaluar.</div></div>`;
  }

  // Panel lateral
  const dom = ruta.dominante ? CADENA[ruta.dominante - 1] : null;
  const sec = ruta.secundaria ? CADENA[ruta.secundaria - 1] : null;

  $('#side').innerHTML = `
    <div class="pnl">
      <span class="kicker">Ruteo en vivo · Cadena de Crecimiento</span>
      ${cadenaVertHTML(ruta.estados, ruta.dominante, ruta.secundaria)}
      <p style="font-size:12px;color:var(--ink-dim);margin-top:12px">${esc(ruta.motivo)}</p>
    </div>

    <div class="pnl dark">
      <span class="kicker">Eslabón dominante</span>
      ${dom ? `<div class="dato">${dosDig(dom.n)} · ${esc(dom.nombre)}</div>
               <div class="li"><b>Área que lo resuelve:</b> ${esc(dom.area)}</div>
               ${sec ? `<div class="li"><b>Área secundaria:</b> ${esc(sec.area)} (eslabón ${dosDig(sec.n)})</div>` : ''}`
             : `<div class="dato" style="font-size:19px">Todavía no se puede rutear</div>
                <div class="li">El motor no asume que el problema es de pauta: declara que falta triage y lo pide.</div>`}
      <div class="veredicto">
        <span class="pill ${ruta.veredicto === 'califica' ? 'ok' : 'gh'}">${esc(ruta.veredicto)}</span>
        <span class="pill gh">Confianza ${esc(ruta.confianza)}</span>
        <span class="pill gh">${hechas} de ${visibles.length} respondidas</span>
      </div>
      ${dom ? `<button class="btn pri" style="margin-top:14px;width:100%" onclick="ir('bloque')">
        Abrir bloque profundo de ${dosDig(dom.n)} · ${esc(BLOQUES_AREA[dom.n].prefijo)}1–${esc(BLOQUES_AREA[dom.n].prefijo)}${BLOQUES_AREA[dom.n].total} →</button>
      <p class="sub-dark">
        Con solo el triage el motor emite el ruteo y la siguiente pregunta. Las hipótesis exigen el bloque del área.</p>` : ''}
    </div>

    <div class="pnl">
      <span class="kicker">Siguiente mejor pregunta</span>
      ${sig ? `<h3>${sig.cod} · ${esc(sig.texto)}</h3>
               <p style="font-size:12.5px;color:var(--ink-dim);margin-top:6px">${esc(sig.porque)}</p>`
            : `<h3>Triage completo</h3>
               <p style="font-size:12.5px;color:var(--ink-dim);margin-top:6px">Corresponde abrir el bloque profundo del área dominante (Anexo A2). Dentro del bloque se pregunta hasta que el diagnóstico converja, no hasta agotar la lista.</p>`}
    </div>

    <div class="pnl">
      <span class="kicker">Seguro de decir</span>
      ${dice.seguro.length ? `<ul class="lista">${dice.seguro.map(x =>
        `<li>${esc(x.t)}<span class="ev">Evidencia · ${esc(x.ev)}</span></li>`).join('')}</ul>`
        : `<p style="font-size:13px;color:var(--ink-dim);margin-top:8px">Nada todavía. Sin evidencia visible, no se afirma.</p>`}
    </div>

    <div class="pnl">
      <span class="kicker">No decir aún</span>
      ${dice.noAun.length ? `<ul class="lista no">${dice.noAun.map(x =>
        `<li>${esc(x.t)}<span class="ev">${esc(x.ev)}</span></li>`).join('')}</ul>`
        : `<p style="font-size:13px;color:var(--ink-dim);margin-top:8px">—</p>`}
      ${contra.length ? contra.map(c =>
        `<div class="contra"><b>Contradicción · ${esc(c.par)}</b>${esc(c.txt)}</div>`).join('') : ''}
    </div>

    <div class="pnl" style="border-style:dashed">
      <span class="kicker">Qué está corriendo acá</span>
      <p style="font-size:12.5px;color:var(--ink-dim);margin-top:8px">
        Ruteo local determinista sobre el triage, escrito a partir de las reglas de precedencia del PRD §5.0.1–5.0.3.
        <b>No es el motor:</b> el motor real es Claude con el System Prompt Maestro del Anexo E. Por eso este panel
        rutea con las 14 preguntas y nada más, mientras el entregable del caso Eco Star incorpora además datos de
        panel del cliente — de ahí que ahí el eslabón 03 aparezca roto y acá no.</p>
    </div>`;
}

function responder(id, v) {
  R[id] = R[id] === v ? null : v;
  if (!R[id]) delete R[id];
  guardar(); pintarPanel();
}
function cargarEcostar() {
  R = {}; B = {};
  Object.entries(CASO_ECOSTAR_TRIAGE).forEach(([k, v]) => { if (v) R[k] = v; });
  guardar(); pintarPanel();
}
// Limpia la reunión entera, no solo el triage: el modo, las preguntas 0, las
// notas, el cierre y el reloj. Salir a la siguiente visita con el reloj del
// prospecto anterior corriendo es la forma más tonta de arruinar el dato.
function limpiar() { R = {}; B = {}; M = {}; ultimoTramo = null; guardar(); pintarPanel(); }

/* ── VISTA 3 · Bloque profundo del área dominante ────────────────────────── */
const EST_BLOQUE = [
  { v: 'resp', l: 'Respondida' }, { v: 'nd', l: 'Sin dato' }, { v: 'skip', l: 'No preguntada' }
];

function pintarBloque() {
  const ruta = rutear(R);
  const dom = ruta.dominante;

  if (!dom) {
    $('#bloque-cuerpo').innerHTML = `
      <div class="pnl" style="border-left:4px solid var(--amber)">
        <span class="kicker">Bloque bloqueado</span>
        <h3 style="margin-top:8px">Todavía no hay eslabón dominante</h3>
        <p style="font-size:14px;color:var(--ink-dim);margin-top:8px;max-width:70ch">
          El triage completo va antes de cualquier pregunta profunda. Preguntar por el Pixel antes de saber si el
          eslabón roto es la captura es exactamente el error que este modelo existe para evitar.</p>
        <p style="margin-top:16px"><button class="btn pri" onclick="ir('panel')">Volver al triage</button></p>
      </div>`;
    return;
  }

  const esl = CADENA[dom - 1];
  const blq = BLOQUES_AREA[dom];
  const soloN30 = dom === 3 && !document.body.classList.contains('p-extendido');
  const todas = blq.grupos.flatMap(g => g.preguntas).filter(q => !soloN30 || q.n30);
  const resp = todas.filter(q => (B[q.cod] || {}).e === 'resp');
  const claves = todas.filter(q => q.clave);
  const clavesResp = claves.filter(q => (B[q.cod] || {}).e === 'resp').length;
  const convergio = resp.length >= 3;
  const sec = ruta.secundaria ? CADENA[ruta.secundaria - 1] : null;

  const nRes = NUCLEO_NEGOCIO.preguntas.filter(q => (B[q.cod] || {}).e === 'resp').length;
  const mRes = BLOQUE_COMPETENCIA.preguntas.filter(q => (B[q.cod] || {}).e === 'resp').length;
  const listo = nRes >= 4 && resp.length >= 3;   // núcleo de negocio + área
  /* Minutos del bloque del área: con la regla de corte no se preguntan todas —
     se corta al converger, alrededor de diez. El único que no se puede acotar
     así es el de pauta completo, y por eso es el que revienta los 30 minutos. */
  const pregEsperadas = (dom === 3 && !soloN30) ? todas.length : Math.min(todas.length, 10);
  const minArea = Math.round(pregEsperadas * 0.8);
  const totalMin = 9 + NUCLEO_NEGOCIO.minutos + minArea + BLOQUE_COMPETENCIA.minutos + 3;

  const filaPregunta = q => {
    const st = (B[q.cod] || {});
    return `<div class="qd ${st.e === 'resp' ? 'done' : ''} ${st.e === 'nd' ? 'nd' : ''}">
      <div class="qh">
        <span class="cod">${esc(q.cod)}</span>
        <span class="txt">${esc(q.texto)}</span>
        ${q.n30 ? '<span class="clave n30">Núcleo 30 min</span>' : ''}
        ${q.clave ? '<span class="clave">Alto rendimiento</span>' : ''}
        ${q.origen && q.origen !== 'nueva' ? `<span class="orig">= ${esc(q.origen)} del Anexo A2</span>` : ''}
        ${q.origen === 'nueva' ? '<span class="orig nueva">Pregunta nueva</span>' : ''}
      </div>
      <div class="why">${esc(q.revela)}</div>
      <div class="ops">
        ${EST_BLOQUE.map(e => `<button class="op-chip ${st.e === e.v ? 'sel' : ''}"
            onclick="marcar('${q.cod}','${e.v}')">${e.l}</button>`).join('')}
        <input class="nota" placeholder="Nota de la conversación (opcional)"
               value="${esc(st.nota || '')}" oninput="notar('${q.cod}', this.value)">
      </div>
    </div>`;
  };

  $('#bloque-cuerpo').innerHTML = `
    <div class="barra">
      <span class="kicker">${nRes + resp.length + mRes} de ${NUCLEO_NEGOCIO.preguntas.length + todas.length + BLOQUE_COMPETENCIA.preguntas.length} respondidas</span>
      <span class="prog"><i style="width:${Math.round((nRes + resp.length + mRes) / (NUCLEO_NEGOCIO.preguntas.length + todas.length + BLOQUE_COMPETENCIA.preguntas.length) * 100)}%"></i></span>
      <button class="btn" onclick="simularBloque()">Simular avance</button>
      <button class="btn gh" onclick="limpiarBloque()">Limpiar</button>
    </div>

    <div class="ruteo-cab">
      <div class="rc-esl"><span class="kicker">Eslabón dominante</span>
        <div class="dato">${dosDig(esl.n)} · ${esc(esl.nombre)}</div>
        <p>${esc(esl.area)}${sec ? ` · secundaria: ${esc(sec.area)}` : ''}</p></div>
      <div class="rc-blq"><span class="kicker">Bloque que se abre</span>
        <div class="dato2">${esc(blq.prefijo)}1 – ${esc(blq.prefijo)}${blq.total}</div>
        <p>Los otros seis bloques no se abren. El contrato del motor admite un solo <code>bloque_area</code>.</p></div>
      <div class="rc-cor"><span class="kicker">Regla de corte en vivo</span>
        <div class="dato2">${listo ? 'Puedes cortar' : `Faltan ${(nRes < 4 ? 4 - nRes : 0) + (resp.length < 3 ? 3 - resp.length : 0)}`}</div>
        <p>${listo
          ? 'Si el diagnóstico ya convergió, se para. Preguntar de más no mejora el informe y cansa la reunión.'
          : 'Se pregunta hasta que la hipótesis dominante quede confirmada, no hasta agotar la lista. Mínimo: 4 del núcleo de negocio y 3 del área.'}</p></div>
    </div>

    <div class="reloj">
      <span class="kicker">Presupuesto de la reunión · ${totalMin} min</span>
      <div class="rl">
        <span class="seg s1" style="flex:9">Triage 14<i>9'</i></span>
        <span class="seg s2" style="flex:${NUCLEO_NEGOCIO.minutos}">Negocio ${NUCLEO_NEGOCIO.prefijo}1–${NUCLEO_NEGOCIO.prefijo}7<i>${NUCLEO_NEGOCIO.minutos}'</i></span>
        <span class="seg s3" style="flex:${minArea}">Área ${esc(blq.prefijo)}<i>${minArea}'</i></span>
        <span class="seg s4" style="flex:${BLOQUE_COMPETENCIA.minutos}">Competencia ${BLOQUE_COMPETENCIA.prefijo}1–${BLOQUE_COMPETENCIA.prefijo}5<i>${BLOQUE_COMPETENCIA.minutos}'</i></span>
        <span class="seg s5" style="flex:3">Cierre<i>3'</i></span>
      </div>
      <p>${totalMin <= 30
        ? 'Cabe en la media hora que dura una visita en terreno. El análisis de competencia observable no ocupa tiempo de reunión: se levanta antes.'
        : `Se pasa de 30 por ${totalMin - 30} minutos. El bloque de pauta es el único que no cierra completo — por eso está el núcleo de 10.`}</p>
    </div>

    <!-- Núcleo de negocio -->
    <div class="grupo">
      <h3 class="gh2 amb">Núcleo de negocio · se pregunta siempre — ${nRes}/${NUCLEO_NEGOCIO.preguntas.length}</h3>
      <div class="razon-fija amb"><b>Por qué va suelto del ruteo</b>${esc(NUCLEO_NEGOCIO.nota)}</div>
      ${NUCLEO_NEGOCIO.preguntas.map(filaPregunta).join('')}
    </div>

    <!-- Bloque del área dominante -->
    <div class="grupo">
      <h3 class="gh2">Bloque del área dominante · solo el de ${dosDig(esl.n)} — ${resp.length}/${todas.length}</h3>
      <div class="razon-fija"><b>Nota del bloque</b>${esc(blq.nota)}</div>
      ${dom === 3 ? `<p style="margin:0 0 14px">
        <button class="btn ${soloN30 ? 'pri' : 'gh'}" onclick="togglePExt()">
          ${soloN30 ? 'Viendo el núcleo de 10 — ver las 28' : 'Viendo las 28 — volver al núcleo de 10'}</button>
        <span style="font-size:12.5px;color:var(--ink-dim);margin-left:12px">Las 28 son el único bloque que no cabe en 30 minutos. El núcleo de 10 cubre las capas 1, 2, 3 y 5; la capa 4 —cliente ideal— ya la cubre el núcleo de negocio.</span></p>` : ''}
      ${blq.grupos.map(g => {
        const qs = g.preguntas.filter(q => !soloN30 || q.n30);
        if (!qs.length) return '';
        return `<h4 class="gh3">${esc(g.nombre)}</h4>${qs.map(filaPregunta).join('')}`;
      }).join('')}
    </div>

    <!-- Competencia y mercado -->
    <div class="grupo">
      <h3 class="gh2 amb">Competencia y mercado · transversal — ${mRes}/${BLOQUE_COMPETENCIA.preguntas.length}</h3>
      <div class="razon-fija amb"><b>No es un eslabón, es contexto</b>${esc(BLOQUE_COMPETENCIA.nota)} Como los eventos corporativos: califica a los siete eslabones, nunca aparece como <code>area_recomendada</code>.</div>
      ${BLOQUE_COMPETENCIA.preguntas.map(filaPregunta).join('')}
      <div class="senales">
        <span class="kicker">La otra mitad se levanta ANTES de la reunión — no ocupa tiempo de conversación</span>
        <p class="sen-int">Es lo que permite que el análisis de competencia quepa en 30 minutos: en la reunión van solo las cinco que no se pueden observar desde fuera. Estas se recogen en el pre-llenado del diagnóstico externo y llegan al motor como señales, con procedencia <code>observado</code>.</p>
        ${BLOQUE_COMPETENCIA.senales.map(s => `<div class="sen">
          <span class="cod">${esc(s.cod)}</span>
          <span><b>${esc(s.texto)}</b><i>${esc(s.revela)}</i></span></div>`).join('')}
      </div>
    </div>

    <!-- Anclas -->
    <div class="grupo">
      <h3 class="gh2">Contra qué se compara un negocio que no pauta</h3>
      <div class="razon-fija"><b>El hueco que produce la sensación</b>Las anclas cuantitativas del PRD §5.2 son 8 de 11 de pauta, y las tres fórmulas nucleares también. Un prospecto que no invierte en publicidad pasa el triage, rutea bien — y llega a un diagnóstico sin nada contra qué compararse. Se le describe el problema, no se le dimensiona.</div>
      <div class="tabla-scroll"><table class="t-anclas">
        <thead><tr><th style="width:20%">Ancla</th><th style="width:30%">Valor</th><th style="width:22%">Fuente</th><th style="width:28%">Dónde se usa</th></tr></thead>
        <tbody>${ANCLAS_B2B.map(a => `<tr class="${a.estado}">
          <td><b>${esc(a.ancla)}</b></td>
          <td>${a.valor ? `<span class="val">${esc(a.valor)}</span>` : '<span class="vacio">Sin dato — no se rellena</span>'}</td>
          <td>${a.fuente ? esc(a.fuente) : '<span class="vacio">Requiere fuente antes de usarse</span>'}</td>
          <td style="color:var(--ink-dim)">${esc(a.usa)}</td></tr>`).join('')}</tbody>
      </table></div>
      <p style="font-size:12.5px;color:var(--ink-dim);margin-top:10px;max-width:88ch">
        Las cuatro vacías se muestran vacías a propósito. La regla del PRD es no inventar datos de mercado: sin fuente se declara estimación, y una estimación no sirve como ancla. El hueco se muestra, no se tapa.</p>
    </div>

    <div class="cierre-bloque ${listo ? 'ok' : ''}">
      <div>
        <span class="kicker">${listo ? 'Listo para emitir' : 'Todavía no'}</span>
        <h3 style="margin-top:6px">${listo
          ? 'Con el triage, el núcleo de negocio y el bloque del área, el motor ya puede emitir el diagnóstico completo'
          : 'Con solo el triage, el motor emite el bloque 0 y la siguiente pregunta — no emite hipótesis'}</h3>
        <p style="font-size:13.5px;color:var(--ink-dim);margin-top:6px;max-width:78ch">
          ${listo
            ? `${nRes} del núcleo de negocio, ${resp.length} del área${mRes ? ` y ${mRes} de competencia` : ''}${clavesResp ? `, con ${clavesResp} de las ${claves.length} de alto rendimiento del área` : ''}. Las 3 hipótesis y las 3 soluciones salen de cruzar todo eso; sin el bloque del área, cualquier hipótesis sería una opinión.`
            : 'Es la regla de precedencia del contrato de entrada: <code>&lt;triage&gt;</code> solo produce ruteo. El diagnóstico completo exige <code>&lt;triage&gt; + &lt;bloque_area&gt;</code>, y con esta propuesta también el núcleo de negocio.'}</p>
      </div>
      <button class="btn ${listo ? 'pri' : 'gh'}" ${listo ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}
              onclick="${listo ? "ir('entregable')" : ''}">Generar el entregable →</button>
    </div>`;
}

function marcar(cod, e) {
  B[cod] = B[cod] || {};
  B[cod].e = B[cod].e === e ? null : e;
  guardar(); pintarBloque();
}
function notar(cod, v) { B[cod] = B[cod] || {}; B[cod].nota = v; guardar(); }
function limpiarBloque() { B = {}; guardar(); pintarBloque(); }

/* Marca estados de conversación — NO inventa respuestas del cliente: solo
   simula por dónde va la reunión, para poder mostrar la regla de corte. */
function simularBloque() {
  const dom = rutear(R).dominante; if (!dom) return;
  B = {};
  NUCLEO_NEGOCIO.preguntas.forEach(q => { B[q.cod] = { e: 'resp' }; });
  BLOQUE_COMPETENCIA.preguntas.forEach(q => { B[q.cod] = { e: q.clave ? 'resp' : 'nd' }; });
  BLOQUES_AREA[dom].grupos.flatMap(g => g.preguntas)
    .forEach((q, i) => { if (q.clave || i < 3) B[q.cod] = { e: 'resp' }; });
  guardar(); pintarBloque();
}

function togglePExt() { document.body.classList.toggle('p-extendido'); pintarBloque(); }

/* ── VISTA 3 · Entregable ────────────────────────────────────────────────── */
const PROC = { verbatim: ['proc v', 'PRD Anexo G · verbatim'], reconstruido: ['proc', 'Reconstruido para la demo'], mixto: ['proc', 'Mixto · ver leyenda'] };
const procHTML = k => `<span class="${PROC[k][0]}">${PROC[k][1]}</span>`;

function pintarEntregable() {
  const d = ENTREGABLE_ECOSTAR;
  const b0 = d.bloque_0_ruteo, b1 = d.bloque_1_data, b2 = d.bloque_2_hipotesis, b3 = d.bloque_3_soluciones, b4 = d.bloque_4_etapas;
  const estados = {}; b0.cadena.forEach(x => estados[x.eslabon] = x.estado);
  const dom = CADENA[b0.eslabon_dominante - 1];
  const secN = CADENA.find(c => c.area === b0.area_secundaria);

  const razon = (t) => `<div class="razon"><b>Razonamiento del motor</b>${esc(t)}</div>`;

  const html = `
  <div class="hero" style="padding-top:34px">
    <span class="kicker">Diagnóstico de crecimiento comercial · vista compartida</span>
    <h1 style="font-size:clamp(30px,5vw,52px);margin-top:10px">${esc(d.meta.cliente)}</h1>
    <p class="sub">${esc(d.meta.rubro)} · ${esc(d.meta.periodo)}</p>
    <div class="veredicto" style="margin-top:14px">
      <span class="pill dk">Vía ${esc(d.meta.via.replace('_', ' '))}</span>
      <span class="pill dk">Confianza global ${esc(d.meta.confianza_global)}</span>
      <span class="pill dk">Sin veredicto de calificación — eso no se comparte</span>
    </div>
  </div>

  <!-- BLOQUE 0 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 0 · Ruteo</span><h2>Dónde se rompe tu crecimiento</h2>${procHTML(b0.procedencia)}
      <p class="bs">Los siete eslabones del crecimiento comercial. El dominante es el primero que se rompe contando desde donde hoy sí hay flujo: se tapa el balde antes de abrir la llave.</p></div>
    ${cadenaHTML(estados, b0.eslabon_dominante, secN ? secN.n : null)}
    <div class="destacado">
      <span class="kicker">Eslabón ${dosDig(dom.n)} · ${esc(dom.nombre)} → ${esc(b0.area_recomendada)}</span>
      <p>${esc(b0.por_que_este_y_no_otro)}</p>
    </div>
    <div class="no-problema">
      <span class="kicker">Qué NO es tu problema</span>
      <p>${esc(b0.que_NO_es_tu_problema)}</p>
    </div>
    ${razon(b0.reasoning)}
  </section>

  <!-- BLOQUE 1 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 1 · Data</span><h2>Qué es verdad sobre tu negocio</h2>${procHTML(b1.procedencia)}
      <p class="bs">Ninguna cifra sin lectura. Donde no hay dato dice N/D, y N/D nunca se rellena con una estimación.</p></div>
    <div class="sem">${b1.semaforo_capas.map(c => `
      <div class="c ${c.estado === 'sin_datos' ? '' : c.estado}">
        <span class="kicker">Capa ${c.capa} · ${esc(c.estado.replace('_', ' '))}</span>
        <h4>${esc(c.nombre)}</h4><p>${esc(c.lectura)}</p></div>`).join('')}</div>
    <div class="tabla-scroll"><table>
      <thead><tr><th style="width:24%">Cifra</th><th style="width:20%">Valor</th><th>Qué significa</th><th style="width:16%">Evidencia</th></tr></thead>
      <tbody>${b1.cifras_clave.map(c => `<tr>
        <td><b>${esc(c.etiqueta)}</b></td>
        <td><span class="val">${esc(c.valor)}</span>${c.referencia !== 'N/D' ? `<span class="lec">Referencia: ${esc(c.referencia)}</span>` : ''}</td>
        <td>${esc(c.lectura)}</td>
        <td><span class="ev" style="margin:0">${esc(c.evidencia)}</span></td></tr>`).join('')}</tbody>
    </table></div>
    ${razon(b1.reasoning)}
  </section>

  <!-- BLOQUE 2 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 2 · Hipótesis</span><h2>Qué explicaría lo que te está pasando</h2>${procHTML(b2.procedencia)}
      <p class="bs">Hipótesis y no veredictos: cada una trae cómo comprobarla o descartarla. Una hipótesis sin método de verificación no es una hipótesis, es una opinión.</p></div>
    <div class="hipos">${b2.hipotesis.map(h => `
      <article class="hipo">
        <div class="hh"><span class="n">Hipótesis ${h.orden}</span><p>${esc(h.enunciado)}</p></div>
        <div class="hb">
          <div class="campo"><div class="k">Cómo se verifica</div><div class="v">${esc(h.como_se_verifica)}</div></div>
          <div class="campo"><div class="k">Si es cierta</div><div class="v">${esc(h.si_es_cierta)}</div></div>
          <div class="campo full"><div class="k">Por qué no era visible</div><div class="v">${esc(h.por_que_no_era_visible)}</div></div>
          <div class="campo full"><div class="k">Evidencia</div><div class="v">${esc(h.evidencia)}</div></div>
        </div>
        <div class="meta-row">
          <span class="pill dk">Atribución: ${esc(h.atribucion)}</span>
          <span class="pill dk">Alcance: ${esc(h.alcance)}</span>
          <span class="pill dk">Confianza ${esc(h.confianza)}</span>
          <span class="pill dk">${esc(h.procedencia)}</span>
        </div>
      </article>`).join('')}</div>
    <div class="razon"><b>Reparto de atribución</b>
      De las tres hipótesis: ${b2.reparto_atribucion.gestion} de gestión, ${b2.reparto_atribucion.estructura} de estructura,
      ${b2.reparto_atribucion.compartida} compartida. Se declara porque la pregunta que el dueño no hace en voz alta es si esto fue culpa de la agencia o suya.</div>
    ${razon(b2.reasoning)}
  </section>

  <!-- BLOQUE 3 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 3 · Soluciones</span><h2>Qué hacer, y cómo sabrás si acertamos</h2>${procHTML(b3.procedencia)}
      <p class="bs">Una por hipótesis. Cada una dice qué debería cambiar si la hipótesis era correcta — eso es lo que la vuelve falsable.</p></div>
    <div class="sols">${b3.soluciones.map(s => `
      <article class="sol">
        <div class="sh"><span class="sn">Solución ${s.orden}</span>
          <span class="verif">Verifica la hipótesis ${s.verifica_hipotesis}</span>
          <span class="verif">· Esfuerzo: ${esc(s.esfuerzo)}</span>
          <span class="verif">· Decide: ${esc(s.requiere_decision_de)}</span></div>
        <h4>${esc(s.accion)}</h4>
        <div class="pred"><b>Predicción</b>${esc(s.prediccion)}</div>
        ${s.puede_hacerlo_solo
          ? `<p class="solo"><b>Puedes hacerlo sin nosotros:</b> ${esc(s.como_hacerlo_solo)}</p>`
          : `<p class="solo"><b>Esta no se puede hacer sin ayuda técnica.</b> Va en el plan por etapas, no en esta semana.</p>`}
      </article>`).join('')}</div>
    <p class="cierre">${esc(b3.cierre)}</p>
    ${razon(b3.reasoning)}
  </section>

  <!-- BLOQUE 4 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 4 · Plan por etapas</span><h2>En qué orden, quién lo hace y qué es nuestro</h2>${procHTML(b4.procedencia)}
      <p class="bs">La etapa uno nunca es algo que nos compres. Es lo más barato y lo más verificable — es lo que hace creíble todo lo que viene después.</p></div>
    <div class="etapas">${b4.etapas.map(e => `
      <div class="etapa">
        <div class="en">${dosDig(e.orden)}</div>
        <div class="eb">
          <h4>${esc(e.nombre)}</h4>
          <div class="met">
            <span class="pill dk">Lo hace: ${esc(e.quien_lo_hace)}</span>
            <span class="pill dk">${esc(e.pilar_precision)}</span>
            <span class="pill dk">Esfuerzo: ${esc(e.esfuerzo)}</span>
          </div>
          <div class="campo"><div class="k">Por qué va primero</div><div class="v">${esc(e.por_que_primero)}</div></div>
          <div class="campo"><div class="k">Cómo se sabe que resultó</div><div class="v">${esc(e.como_se_sabe_que_resulto)}</div></div>
        </div>
      </div>`).join('')}</div>
    <div class="fuera">
      <span class="kicker">Fuera de nuestro alcance</span>
      <p style="margin-top:8px;max-width:80ch">${esc(b4.fuera_de_nuestro_alcance)}</p>
    </div>
    <p class="cierre">${esc(b4.cierre)}</p>
    ${razon(b4.reasoning)}
  </section>

  <!-- QA -->
  <div class="qa no-print" id="qa"></div>

  <div class="pie">
    <b>Procedencia de este entregable.</b> Bloques 0 y 4: salida esperada del caso dorado Eco Star, verbatim del Anexo G del PRD v5.4 —
    reproducción de un diagnóstico humano ya validado (informe semestral entregado el 5-jul-2026). Bloques 1 y 3, y los campos
    ampliados de las hipótesis 2 y 3: escritos para esta demostración a partir de las cifras reales citadas en ese mismo anexo.
    Ninguna cifra de este documento fue estimada.
  </div>`;

  $('#entregable').innerHTML = html;

  // QA de invariantes
  const checks = verificarInvariantes(d);
  const ok = checks.filter(c => c.ok).length;
  $('#qa').innerHTML = `
    <div class="qh"><span class="kicker">Invariantes del dashboard · PRD §5.8.4</span>
      <span class="pill ${ok === checks.length ? 'ok' : 'dk'}">${ok}/${checks.length} cumplen</span>
      <span style="font-size:12px;color:var(--ink-dim)">Se verifican en el navegador sobre el JSON que acabas de ver. No se muestran al prospecto.</span></div>
    <div class="items">${checks.map(c =>
      `<div class="it ${c.ok ? '' : 'bad'}"><i>${c.ok ? '✓' : '✕'}</i><span><b>${c.id}</b> · ${esc(c.txt)}</span></div>`).join('')}</div>`;
}

function toggleInterno() {
  const on = document.body.classList.toggle('interno');
  const b = $('#btn-interno');
  b.textContent = on ? 'Ocultar capa interna' : 'Ver capa interna';
  b.classList.toggle('pri', on);
}

/* ── Arranque ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  pintarEntregable();
  pintarPanel();
  ir((location.hash || '#inicio').slice(1));
  setInterval(tic, 1000);
});
