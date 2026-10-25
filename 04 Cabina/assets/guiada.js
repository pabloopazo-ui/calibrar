/* CALIBRAR · Modo guiado (24-sep-2026). Pedido de Pablo en plena reunión: «hay mucho
   texto, me pierdo». Una pregunta por pantalla, opciones grandes, lo demás escondido.
   Escribe en la MISMA reunión que la cabina completa (localStorage 'cabina_estado'),
   así Resultados y reunion.html ven lo mismo. No redefine preguntas: lee data.js,
   preguntas_v2.js y modulo_profesional.js. Los eventos van por addEventListener
   (sin onclick en línea) para que también funcione dentro de una página de claude.ai. */

const GK = 'cabina_estado', GKA = 'cabina_archivo';
function gLeer() { try { return JSON.parse(localStorage.getItem(GK) || 'null'); } catch { return null; } }
function gNuevo() {
  return { id: 'r' + Date.now(), creada: new Date().toISOString().slice(0, 10),
    ficha: { empresa: '', rubro: '', quienes: '', modo: 'terreno' }, fichax: {}, p0: {}, n0: {}, triage: {}, nt: {},
    nucleo: {}, num: {}, bloque: {}, comp: {}, cierre: {}, fechaPaso: '', extra: [], transcripcion: '', descartadas: [],
    gx: {}, cx: {}, crono: { acum: 0, corriendo: false, desde: 0 }, modulo: { tipo: 'profesional', salud: true }, arquetipo: 'profesional' };
}
let E = gLeer() || gNuevo();
if (!E.modulo) E.modulo = { tipo: 'empresa', salud: false };
['triage', 'nt', 'nucleo', 'num', 'cierre', 'gx', 'ficha'].forEach(k => { E[k] = E[k] || {}; });
function gGuardar() {
  try {
    localStorage.setItem(GK, JSON.stringify(E));
    const a = JSON.parse(localStorage.getItem(GKA) || '{}'); a[E.id] = E; localStorage.setItem(GKA, JSON.stringify(a));
  } catch { }
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dd = n => String(n).padStart(2, '0');

/* Texto de una pregunta: la guía del módulo si es profesional, la v2 si no, la base al final. */
function guia(k, base) {
  const X1_PRO = { texto: '¿Qué pasó para que nos juntáramos justo ahora? ¿Hubo algo que lo hizo decir «veamos esto»?',
                  decir: '¿Por qué ahora y no hace seis meses?', oro: 'El gatillo: revela el eslabón que ya duele y la urgencia real' };
  const pro = esProfesional(E) && (k === 'x1' ? X1_PRO : PRO_GUIA[k]);
  const v = pro || (typeof V2 !== 'undefined' && V2[k]) || null;
  const t = x => pro ? proTx(x, E) : x;
  return { texto: t(v ? v.texto : base), decir: v && v.decir ? t(v.decir) : '', oro: v && v.oro ? t(v.oro) : '' };
}

/* Los pasos, en el orden de la reunión. Solo lo que rutea y lo que alimenta el sistema. */
function pasos() {
  const flujo = puntoDeFlujo(E.triage);
  const abiertas = flujo !== null && flujo >= 4;
  const L = [{ tipo: 'inicio', grupo: 'Inicio' },
             { tipo: 'abierta', grupo: 'Apertura', id: 'x1', cod: 'X1', donde: 'gx', base: GATILLO[0].texto }];
  TRIAGE.filter(q => q.gatillo !== 'flujo' || abiertas)
    .forEach(q => L.push({ tipo: 'opciones', grupo: 'Dónde se rompe', id: q.id, cod: q.cod, q }));
  NUCLEO_NEGOCIO.preguntas.forEach(q => L.push({ tipo: q.cod === 'N5' ? 'n5' : q.cod === 'N7' ? 'n7' : 'abierta',
    grupo: 'Su negocio', id: q.cod, cod: q.cod, donde: 'nucleo', base: q.texto }));
  PREGUNTAS_CIERRE.forEach(q => L.push({ tipo: 'abierta', grupo: 'Cierre', id: q.id, cod: q.cod, donde: 'cierre', base: q.texto, fijo: true }));
  L.push({ tipo: 'fin', grupo: 'Resultado' });
  return L;
}
let paso = 0;

function respondido(p) {
  if (p.tipo === 'opciones') return !!E.triage[p.id];
  if (p.tipo === 'n5') return E.num.n5in != null;
  if (p.tipo === 'n7') return E.num.n7pct != null && E.num.n7pct !== '';
  if (p.tipo === 'abierta') return !!(E[p.donde] || {})[p.id];
  return false;
}

function barraRuteo() {
  const r = rutear(E.triage);
  const txt = r.dominante ? `Se corta en <b>${dd(r.dominante)} · ${esc(CADENA[r.dominante - 1].nombre)}</b> <span class="conf">confianza ${esc(r.confianza)}</span>`
                          : `<span class="conf">Todavía sin eslabón roto · ${r.respondidas.length} de 14 respondidas</span>`;
  return `<div class="ruteo">${txt}${r.dominante ? '<button class="lnk" data-acc="sistema">Ver sistema</button>' : ''}</div>`;
}

function pintar() {
  const L = pasos();
  if (paso >= L.length) paso = L.length - 1;
  const p = L[paso];
  const grupos = [...new Set(L.map(x => x.grupo))];
  const hechas = L.filter(respondido).length, total = L.filter(x => x.tipo !== 'inicio' && x.tipo !== 'fin').length;
  let cuerpo = '';

  if (p.tipo === 'inicio') {
    cuerpo = `<h1 class="preg">¿A quién diagnosticamos?</h1>
      <div class="ops">
        <button class="op ${esProfesional(E) ? 'sel' : ''}" data-acc="tipo" data-v="profesional">Profesional independiente</button>
        <button class="op ${!esProfesional(E) ? 'sel' : ''}" data-acc="tipo" data-v="empresa">Empresa</button>
      </div>
      ${esProfesional(E) ? `<div class="ops"><button class="op chico ${conSalud(E) ? 'sel' : ''}" data-acc="salud">${conSalud(E) ? '✓ ' : ''}Atiende pacientes (capa de salud)</button></div>` : ''}
      <label class="campo">Cargo de quien está en la reunión (sin nombre)
        <input id="g-quienes" value="${esc(E.ficha.quienes)}" placeholder="Ej.: cirujano bariátrico"></label>
      <label class="campo">Nombre de la consulta o empresa
        <input id="g-empresa" value="${esc(E.ficha.empresa)}" placeholder="Para encontrar la reunión después"></label>
      <div class="ops"><button class="op chico" data-acc="nueva">Empezar una reunión nueva en blanco</button></div>`;
  } else if (p.tipo === 'fin') {
    cuerpo = `<h1 class="preg">Listo. Esto es lo que salió.</h1>${sistemaHTML()}`;
  } else {
    const g = guia(p.id, p.q ? p.q.texto : p.base);
    let campo = '';
    if (p.tipo === 'opciones') {
      campo = `<div class="ops">${p.q.opciones.map(o => `<button class="op ${E.triage[p.id] === o.v ? 'sel' : ''}" data-acc="op" data-v="${esc(o.v)}">${esc(etiquetaOpcion(p.id, o, E))}</button>`).join('')}</div>`;
    } else if (p.tipo === 'n5') {
      const L2 = esProfesional(E) ? proEtiquetasNum(E) : { n5in: 'Entraron', n5out: 'Cerraron' };
      campo = `<div class="nums"><label>${esc(L2.n5in)}<input type="number" min="0" id="g-n5in" value="${esc(E.num.n5in ?? '')}"></label>
        <label>${esc(L2.n5out)}<input type="number" min="0" id="g-n5out" value="${esc(E.num.n5out ?? '')}"></label></div>`;
    } else if (p.tipo === 'n7') {
      const L2 = esProfesional(E) ? proEtiquetasNum(E) : { n7pct: '% de la venta en el cliente más grande' };
      campo = `<div class="nums"><label>${esc(L2.n7pct)}<input type="number" min="0" max="100" id="g-n7" value="${esc(E.num.n7pct ?? '')}"></label></div>`;
    }
    if (p.tipo !== 'opciones') {
      const v = (E[p.donde] || {})[p.id] || '';
      campo += `<textarea id="g-texto" rows="3" placeholder="Anota con sus palabras${conSalud(E) ? ' · sin nombres ni datos clínicos' : ''}">${esc(v)}</textarea>`;
    }
    cuerpo = `<div class="cod">${esc(p.cod)}</div>
      <h1 class="preg">${esc(g.texto)}</h1>
      ${campo}
      ${(g.decir || g.oro) ? `<details class="ayuda"><summary>Ayuda para esta pregunta</summary>
        ${g.decir ? `<p><b>Otra forma de decirlo:</b> «${esc(g.decir)}»</p>` : ''}${g.oro ? `<p><b>Qué escuchar:</b> ${esc(g.oro)}</p>` : ''}</details>` : ''}`;
  }

  document.getElementById('app').innerHTML = `
    <div class="migas">${grupos.map(x => `<span class="${x === p.grupo ? 'act' : ''}">${esc(x)}</span>`).join('')}</div>
    <div class="prog"><i style="width:${Math.round(hechas / Math.max(total, 1) * 100)}%"></i></div>
    <div class="tarjeta">${cuerpo}</div>
    <div class="nav">
      <button class="nv" data-acc="atras" ${paso === 0 ? 'disabled' : ''}>← Atrás</button>
      <span class="cuenta">${paso + 1} / ${L.length}</span>
      ${paso < L.length - 1 ? `<button class="nv prim" data-acc="sig">${respondido(p) || p.tipo === 'inicio' ? 'Siguiente →' : 'Saltar →'}</button>` : ''}
    </div>
    ${barraRuteo()}
    ${conSalud(E) ? '<p class="salud">Capa de salud: sin nombres ni datos clínicos de pacientes · no se recomienda publicidad para captar pacientes.</p>' : ''}`;
}

function sistemaHTML() {
  const ruta = rutear(E.triage);
  const s = typeof armarSistema === 'function' ? armarSistema(ruta, E) : null;
  if (!s) return '<p class="vacio">Faltan respuestas del bloque «Dónde se rompe» para ubicar el eslabón.</p>';
  return `<p class="dom">Se corta en <b>${dd(ruta.dominante)} · ${esc(CADENA[ruta.dominante - 1].nombre)}</b></p>
    ${s.fases.map(f => `<div class="fase"><div class="fase-t">Fase ${f.orden} · ${esc(f.nombre)}</div>
      ${f.componentes.map(c => `<p class="pieza"><b>${dd(c.n)} · ${esc(c.nombre)}</b><br><span>Se mide: ${esc(c.mide)}</span></p>`).join('')}</div>`).join('')}
    ${s.sinDatos.length ? `<p class="vacio">Sin datos todavía: ${s.sinDatos.map(dd).join(', ')}.</p>` : ''}
    <p class="vacio">${esc(s.revision)}</p>`;
}

/* Guarda lo escrito en la pantalla actual antes de moverse. */
function capturar() {
  const p = pasos()[paso]; const $ = id => document.getElementById(id);
  if (p.tipo === 'inicio') { if ($('g-quienes')) E.ficha.quienes = $('g-quienes').value; if ($('g-empresa')) E.ficha.empresa = $('g-empresa').value; }
  if (p.tipo === 'n5') { const a = $('g-n5in').value, b = $('g-n5out').value; E.num.n5in = a === '' ? null : Number(a); E.num.n5out = b === '' ? null : Number(b); }
  if (p.tipo === 'n7') { const a = $('g-n7').value; E.num.n7pct = a === '' ? null : Number(a); }
  if ($('g-texto') && p.donde) { E[p.donde] = E[p.donde] || {}; E[p.donde][p.id] = $('g-texto').value; }
  gGuardar();
}

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-acc]'); if (!b) return;
  const acc = b.dataset.acc, p = pasos()[paso];
  if (acc === 'sistema') { const d = document.getElementById('sis'); d.innerHTML = `<div class="tarjeta">${sistemaHTML()}<button class="nv prim" data-acc="cerrar">Volver a la pregunta</button></div>`; d.hidden = false; return; }
  if (acc === 'cerrar') { document.getElementById('sis').hidden = true; return; }
  capturar();
  if (acc === 'tipo') { E.modulo = { tipo: b.dataset.v, salud: b.dataset.v === 'profesional' ? (E.modulo.salud !== false) : false };
                        E.arquetipo = b.dataset.v === 'profesional' ? 'profesional' : ''; }
  if (acc === 'salud') E.modulo.salud = !E.modulo.salud;
  if (acc === 'nueva') { E = gNuevo(); paso = 0; }
  if (acc === 'op') {
    if (E.triage[p.id] === b.dataset.v) delete E.triage[p.id];
    else { E.triage[p.id] = b.dataset.v; gGuardar(); paso++; }   // elegir avanza solo
  }
  if (acc === 'sig') paso++;
  if (acc === 'atras' && paso > 0) paso--;
  gGuardar(); pintar(); window.scrollTo(0, 0);
});
document.addEventListener('input', () => { capturar(); });
document.addEventListener('DOMContentLoaded', pintar);
