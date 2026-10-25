/* CALIBRAR · Build de presentación — presentacion.js
   Lo que se proyecta frente a un prospecto. Se alimenta del mismo data.js que
   el front interno, con tres filtros que NO son cosméticos:

   1. Se elimina el `reasoning` de los cinco bloques. Es la capa interna y usa
      la taquigrafía E1–E7, que no puede aparecer en nada que vea un cliente.
   2. Se elimina la procedencia por bloque (verbatim / reconstruido) y el QA de
      invariantes: son control de calidad interno, no argumento de venta.
   3. El caso de ejemplo va ANONIMIZADO. Las cifras son reales y no se tocan;
      el nombre del cliente no se muestra. Mostrarle a un prospecto la cuenta
      con nombre de otro cliente es exactamente lo que no queremos que piense
      que haremos con la suya.                                                 */

const $$$ = s => document.querySelector(s);
const dd = n => String(n).padStart(2, '0');

/* ── Anonimización del caso de ejemplo ───────────────────────────────────── */
/* Va DENTRO del escape, no en un helper aparte, y la razón no es de estilo:
   antes la anonimización vivía solo en txt(), y las ~18 rutas de render que
   llaman a escP() directo (rubro, etiquetas, anclas, quien_lo_hace, esfuerzo…)
   NO la aplicaban. Hoy no se filtra nada sólo porque el nombre del cliente
   está en dos campos que sí pasan por txt() y en meta.cliente, que no se
   renderiza — o sea, por cómo quedaron los datos, no por lo que garantiza el
   código. Bastaba mover el nombre a otro campo de data.js para imprimirlo en
   una pantalla proyectada frente a un prospecto. El filtro va en el cuello:
   si un texto sale a la vista, pasó por aquí. */
const CLIENTE_REAL = /Eco\s?Star/gi;      // cubre 'Eco Star' y 'EcoStar'
const CLIENTE_ANON = 'la empresa';
const anon = t => String(t == null ? '' : t).replace(CLIENTE_REAL, CLIENTE_ANON);
const escP = s => anon(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const txt = escP;   // alias: ambos anonimizan y escapan. Se conserva por legibilidad.

/* ── La Cadena, en galones ───────────────────────────────────────────────── */
function cadenaPresentacion(estados, dominante, secundaria) {
  const pie = `<div class="cadena-pie">
    <span><i class="i-sano"></i>Sano</span>
    <span><i class="i-roto"></i>Roto</span>
    <span><i class="i-dom"></i>Dominante — el primero que se rompe desde donde hay flujo</span>
    <span><i class="i-sd"></i>Sin datos</span>
  </div>`;
  return `<div class="cadena">${CADENA.map(e => {
    const st = (estados || {})[e.n] || 'sin_datos';
    const cls = ['esl', st, e.n === dominante ? 'dom' : '', e.n === secundaria ? 'sec' : ''].filter(Boolean).join(' ');
    const tag = e.n === dominante ? '<span class="tag">Dominante</span>'
              : e.n === secundaria ? '<span class="tag">Secundario</span>' : '';
    return `<div class="${cls}" title="${escP(e.nombre)} · ${escP(e.area)}">
      ${tag}<div class="num">${dd(e.n)}</div>
      <div class="nom">${escP(e.nombre)}</div></div>`;
  }).join('')}</div>${estados ? pie : ''}`;
}

/* ── Sección 1 · la Cadena en frío, sin diagnóstico encima ───────────────── */
function pintarCadena() {
  $$$('#cadena-neutra').innerHTML = cadenaPresentacion(null, null, null);
  $$$('#tabla-cadena-p').innerHTML = CADENA.map(e => `
    <tr>
      <td><b>${dd(e.n)}</b></td>
      <td><b>${escP(e.nombre)}</b></td>
      <td class="cita">“${escP(e.dueno)}”</td>
      <td>${escP(e.area)}</td>
    </tr>`).join('');
}

/* ── Sección 3 · el entregable, versión cliente ──────────────────────────── */
function pintarEntregableCliente() {
  const d = ENTREGABLE_ECOSTAR;
  const b0 = d.bloque_0_ruteo, b1 = d.bloque_1_data, b2 = d.bloque_2_hipotesis,
        b3 = d.bloque_3_soluciones, b4 = d.bloque_4_etapas;

  const estados = {}; b0.cadena.forEach(x => estados[x.eslabon] = x.estado);
  const dom = CADENA[b0.eslabon_dominante - 1];
  const secN = CADENA.find(c => c.area === b0.area_secundaria);

  $$$('#entregable-cliente').innerHTML = `

  <div class="cabecera-doc">
    <span class="kicker">Diagnóstico de crecimiento comercial</span>
    <h2 class="tit-doc">Caso real · nombre reservado</h2>
    <p class="sub-doc">${escP(d.meta.rubro)}</p>
    <div class="veredicto" style="margin-top:14px">
      <span class="pill dk">${escP(d.meta.periodo)}</span>
      <span class="pill dk">Confianza global ${escP(d.meta.confianza_global)}</span>
      <span class="pill dk">Cifras reales, sin estimaciones</span>
    </div>
  </div>

  <!-- BLOQUE 0 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 0 · Ruteo</span><h2>Dónde se rompe tu crecimiento</h2>
      <p class="bs">Los siete eslabones. El dominante es el primero que se rompe contando desde donde hoy sí hay flujo: se tapa el balde antes de abrir la llave.</p></div>
    ${cadenaPresentacion(estados, b0.eslabon_dominante, secN ? secN.n : null)}
    <div class="destacado">
      <span class="kicker">Eslabón ${dd(dom.n)} · ${escP(dom.nombre)} → ${escP(b0.area_recomendada)}</span>
      <p>${txt(b0.por_que_este_y_no_otro)}</p>
    </div>
    <div class="no-problema">
      <span class="kicker">Qué NO es tu problema</span>
      <p>${txt(b0.que_NO_es_tu_problema)}</p>
    </div>
  </section>

  <!-- BLOQUE 1 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 1 · Data</span><h2>Qué es verdad sobre tu negocio</h2>
      <p class="bs">Ninguna cifra sin lectura. Donde no hay dato dice N/D, y N/D nunca se rellena con una estimación.</p></div>
    <div class="sem">${b1.semaforo_capas.map(c => `
      <div class="c ${c.estado === 'sin_datos' ? '' : c.estado}">
        <span class="kicker">Capa ${c.capa} · ${escP(c.estado.replace('_', ' '))}</span>
        <h4>${escP(c.nombre)}</h4><p>${txt(c.lectura)}</p></div>`).join('')}</div>
    <div class="tabla-scroll"><table>
      <thead><tr><th style="width:24%">Cifra</th><th style="width:20%">Valor</th><th>Qué significa</th></tr></thead>
      <tbody>${b1.cifras_clave.map(c => `<tr>
        <td><b>${escP(c.etiqueta)}</b></td>
        <td><span class="val">${escP(c.valor)}</span>${c.referencia !== 'N/D' ? `<span class="lec">Referencia: ${escP(c.referencia)}</span>` : ''}</td>
        <td>${txt(c.lectura)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <!-- BLOQUE 2 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 2 · Hipótesis</span><h2>Qué explicaría lo que te está pasando</h2>
      <p class="bs">Hipótesis y no veredictos: cada una trae cómo comprobarla o descartarla. Una hipótesis sin método de verificación no es una hipótesis, es una opinión.</p></div>
    <div class="hipos">${b2.hipotesis.map(h => `
      <article class="hipo">
        <div class="hh"><span class="n">Hipótesis ${h.orden}</span><p>${txt(h.enunciado)}</p></div>
        <div class="hb">
          <div class="campo"><div class="k">Cómo se verifica</div><div class="v">${txt(h.como_se_verifica)}</div></div>
          <div class="campo"><div class="k">Si es cierta</div><div class="v">${txt(h.si_es_cierta)}</div></div>
          <div class="campo full"><div class="k">Por qué no era visible</div><div class="v">${txt(h.por_que_no_era_visible)}</div></div>
        </div>
        <div class="meta-row">
          <span class="pill dk">Atribución: ${escP(h.atribucion)}</span>
          <span class="pill dk">Confianza ${escP(h.confianza)}</span>
        </div>
      </article>`).join('')}</div>
    <div class="razon-fija"><b>Reparto de atribución</b>
      De las tres hipótesis: ${b2.reparto_atribucion.gestion} de gestión, ${b2.reparto_atribucion.estructura} de estructura,
      ${b2.reparto_atribucion.compartida} compartida. Se declara porque la pregunta que un dueño no hace en voz alta es si esto fue culpa de la agencia o suya.</div>
  </section>

  <!-- BLOQUE 3 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 3 · Soluciones</span><h2>Qué hacer, y cómo sabrás si acertamos</h2>
      <p class="bs">Una por hipótesis. Cada una dice qué debería cambiar si la hipótesis era correcta — eso es lo que la vuelve falsable.</p></div>
    <div class="sols">${b3.soluciones.map(s => `
      <article class="sol">
        <div class="sh"><span class="sn">Solución ${s.orden}</span>
          <span class="verif">Verifica la hipótesis ${s.verifica_hipotesis}</span>
          <span class="verif">· Esfuerzo: ${escP(s.esfuerzo)}</span></div>
        <h4>${txt(s.accion)}</h4>
        <div class="pred"><b>Predicción</b>${txt(s.prediccion)}</div>
        ${s.puede_hacerlo_solo
          ? `<p class="solo"><b>Puedes hacerlo sin nosotros:</b> ${txt(s.como_hacerlo_solo)}</p>`
          : `<p class="solo"><b>Esta no se puede hacer sin ayuda técnica.</b> Va en el plan por etapas, no en esta semana.</p>`}
      </article>`).join('')}</div>
    <p class="cierre">${txt(b3.cierre)}</p>
  </section>

  <!-- BLOQUE 4 -->
  <section class="bloque">
    <div class="bh"><span class="bnum">Bloque 4 · Plan por etapas</span><h2>En qué orden, quién lo hace y qué es nuestro</h2>
      <p class="bs">La etapa uno nunca es algo que nos compres. Es lo más barato y lo más verificable — es lo que hace creíble todo lo que viene después.</p></div>
    <div class="etapas">${b4.etapas.map(e => `
      <div class="etapa">
        <div class="en">${dd(e.orden)}</div>
        <div class="eb">
          <h4>${txt(e.nombre)}</h4>
          <div class="met">
            <span class="pill dk">Lo hace: ${escP(e.quien_lo_hace)}</span>
            <span class="pill dk">${escP(e.pilar_precision)}</span>
            <span class="pill dk">Esfuerzo: ${escP(e.esfuerzo)}</span>
          </div>
          <div class="campo"><div class="k">Por qué va primero</div><div class="v">${txt(e.por_que_primero)}</div></div>
          <div class="campo"><div class="k">Cómo se sabe que resultó</div><div class="v">${txt(e.como_se_sabe_que_resulto)}</div></div>
        </div>
      </div>`).join('')}</div>
    <div class="fuera">
      <span class="kicker">Fuera de nuestro alcance</span>
      <p style="margin-top:8px;max-width:80ch">${txt(b4.fuera_de_nuestro_alcance)}</p>
    </div>
    <p class="cierre">${txt(b4.cierre)}</p>
  </section>`;
}

document.addEventListener('DOMContentLoaded', () => {
  pintarCadena();
  pintarEntregableCliente();
});
