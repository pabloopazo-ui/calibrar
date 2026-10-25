/* CALIBRAR · Cabina — página de resultados (la única compartible).
   Reglas de esta vista, y no son cosméticas:
   - Solo se muestra lo que tiene evidencia suficiente («seguro de decir»).
     El veredicto de calificación, las contradicciones y los códigos del
     triage NUNCA se emiten acá: son capa interna.
   - Numeración pública 01–07. La taquigrafía E<n> no existe en esta página.
   - Ninguna cifra del negocio que el cliente no haya declarado; las
     referencias de industria van marcadas como rango referencial.
   - Si el ruteo no alcanza confianza suficiente, la página entera se
     reemplaza por un aviso neutro: así no se puede compartir a medias. */

const K = 'cabina_estado';
/* Modo ejemplo: ?reunion=<archivo.json> carga una reunión de solo lectura
   (para mostrar el reporte en otro dispositivo sin depender del localStorage). */
const DEMO_SRC = new URLSearchParams(location.search).get('reunion');
let E = {};
function normalizarE() {
  E.triage = E.triage || {}; E.num = E.num || {}; E.cierre = E.cierre || {}; E.ficha = E.ficha || {};
}
function leer() {
  if (DEMO_SRC) return;
  try { E = JSON.parse(localStorage.getItem(K) || 'null') || {}; } catch { E = {}; }
  normalizarE();
}
leer(); normalizarE();

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dosDig = n => String(n).padStart(2, '0');
const clp = n => '$' + Math.round(n).toLocaleString('es-CL');

/* Higiene de salida: la taquigrafía E1–E7 jamás llega a la vista del cliente. */
const limpiar = s => String(s ?? '').replace(/\bE([1-7])\b/g, '0$1');

/* Módulo profesional (24-sep-2026): al profesional se le habla de usted y en su vocabulario.
   Sin el módulo cargado o sin activarlo, la página es exactamente la de siempre. */
const PRO = () => typeof esProfesional === 'function' && esProfesional(E);
const T = (tu, usted) => PRO() ? usted : tu;

function render() {
  let ruta = rutear(E.triage);
  const fecha = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

  /* Si hay diagnóstico del motor Y pasa las 15 invariantes, manda el motor.
     Si no pasa, esta página sigue con la versión de reglas: nada sin verificar se comparte. */
  const motorOk = E.motor && Array.isArray(E.motorQA) && E.motorQA.length > 0 && E.motorQA.every(c => c.ok);
  const M = motorOk ? E.motor : null;
  if (M && M.bloque_0_ruteo) {
    const est = {};
    (M.bloque_0_ruteo.cadena || []).forEach(x => { est[x.eslabon] = x.estado; });
    ruta = { ...ruta, estados: est, dominante: M.bloque_0_ruteo.eslabon_dominante,
             motivo: limpiar(M.bloque_0_ruteo.por_que_este_y_no_otro) };
  }

  const listo = M ? true : (ruta.dominante && ruta.confianza !== 'baja');
  $('#gate').hidden = listo;
  $('#contenido').hidden = !listo;
  document.querySelector('.pie').hidden = !listo;
  if (!listo) return;

  const esl = CADENA[ruta.dominante - 1];
  const dicho = loQueSePuedeDecir(E.triage, ruta);
  const sanos = [1, 2, 3, 4, 5, 6, 7].filter(n => ruta.estados[n] === 'sano');

  $('#doc-emp').textContent = E.ficha.empresa || '';
  $('#doc-fecha').textContent = 'Preparado en reunión de trabajo · ' + (E.creada ? new Date(E.creada + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : fecha)
    + (DEMO_SRC ? ' · vista de ejemplo' : '');

  /* 0 · La historia primero: qué es esto y cómo leerlo, sin jerga */
  $('#como').innerHTML = `
    <h2>Cómo leer este diagnóstico</h2>
    <p class="motivo">Un negocio crece como el agua corre por una tubería: entra por un extremo
      ${T('(alguien se entera de que existes), avanza por tramos (te encuentra, te cotiza, le respondes, le cumples) y sale convertida en venta por el otro.',
          `(alguien se entera de que usted existe), avanza por tramos (lo busca, le escribe, recibe respuesta, pide hora) y sale convertida en ${esc(proTx('{personas}'))} atendidos por el otro.`)} Si un tramo tiene una fuga,
      <b>meter más presión río arriba no da más agua al final — da más pérdida en la fuga</b>.</p>
    <p class="motivo" style="margin-top:8px">Por eso este diagnóstico no parte por «qué publicidad hacer»:
      recorre los <b>siete tramos</b> de ${T('tu operación comercial', 'la forma en que llegan y se atienden sus ' + esc(proTx('{personas}')))}, encuentra el primero que gotea contando
      desde donde hoy sí corre el agua, y recomienda arreglar ese antes de invertir en los demás.
      Todo lo que sigue usa <b>solo lo que ${T('tú mismo contaste', 'usted mismo contó')} en la reunión</b> — donde no hubo dato,
      dice N/D en vez de inventarlo.</p>`;

  /* 1 · La Cadena */
  $('#cadena').innerHTML = `
    <h2>La Cadena de Crecimiento Comercial — dónde se corta hoy</h2>
    <div class="chart-wrap">${svgCadena(ruta)}</div>
    <p class="motivo" style="margin-top:14px">${esc(ruta.motivo)}</p>
    <p class="motivo" style="margin-top:8px"><b>Disciplina que lo resuelve:</b> ${esc(esl.area)}.</p>`;

  /* 2 · Lo que nos dijiste (sin códigos internos) */
  $('#dicho').innerHTML = dicho.seguro.length ? `
    <h2>Lo que vimos juntos — con lo que ${T('ustedes mismos contaron', 'usted mismo contó')}</h2>
    <ul class="dicho">${dicho.seguro.map(x => `<li>${esc(x.t)}</li>`).join('')}</ul>` : '';

  /* 3 · Cifras — solo con datos declarados */
  const stats = [];
  const t7 = E.triage.t7;
  if (t7 && t7 !== 'no_se') stats.push(statT7(t7));
  const hrs = numDe('t11', E.triage.t11);
  if (hrs !== null && hrs > 0) stats.push(`
    <div class="stat"><div class="lbl">Costo mensual del trabajo repetitivo</div>
      <div class="big">≈ ${clp(hrs * 6000 * 4.3)}</div>
      <div class="ref">${hrs} h/semana declaradas × $6.000/h (hora administrativa RM, valor referencial) × 4,3 semanas</div></div>`);
  const nin = E.num.n5in, nout = E.num.n5out;
  if (nin > 0 && nout != null) stats.push(`
    <div class="stat"><div class="lbl">${T('Línea base de conversión (último trimestre)', 'Línea base: consultas nuevas y atenciones (último mes)')}</div>
      <div class="big">${nout} de ${nin} <span style="font-size:16px;color:#5a6e7a">→ ${(nout / nin * 100).toFixed(1).replace('.', ',')}%</span></div>
      ${svgFunnel(nin, nout)}
      <div class="ref">${T('Contactos que entraron vs. los que cerraron', 'Personas nuevas que consultaron vs. las que ' + esc(proTx('{cierre}')))}, según lo declarado en la reunión</div></div>`);
  if (E.num.n7pct != null && E.num.n7pct !== '') stats.push(PRO() ? `
    <div class="stat"><div class="lbl">Cuánto de lo nuevo llega por recomendación</div>
      <div class="big">${esc(E.num.n7pct)}%</div>
      <div class="ref">De cada diez ${esc(proTx('{personas}'))} nuevos, según lo declarado. Es el activo que sostiene la entrada y, a la vez, su única vía: no existe un umbral de industria con fuente — se registra el dato, no un juicio</div></div>` : `
    <div class="stat"><div class="lbl">Concentración de cartera</div>
      <div class="big">${esc(E.num.n7pct)}%</div>
      <div class="ref">De la venta del último año en el cliente más grande, según lo declarado. No existe un umbral de industria con fuente — se registra el dato, no un juicio</div></div>`);
  $('#stats').innerHTML = stats.length ? `<h2>Las cifras — solo las que ${T('ustedes declararon', 'usted declaró')}</h2><div class="stats">${stats.join('')}</div>` : '';

  /* 4 · Hipótesis: del motor (verificadas por invariantes) o de reglas (fallback) */
  const urg = (E.cierre && E.cierre.c1) ? E.cierre.c1.trim() : '';
  const cambia = (E.cierre && E.cierre.c2) ? E.cierre.c2.trim() : '';
  if (M && M.bloque_2_hipotesis && M.bloque_3_soluciones) {
    const sols = M.bloque_3_soluciones.soluciones || [];
    $('#hipotesis').innerHTML = `
      <h2>Hipótesis de trabajo — para validar juntos</h2>
      ${urg ? `<p class="motivo" style="margin-bottom:10px"><b>Lo que ${T('tú mismo nombraste', 'usted mismo nombró')} como lo más urgente:</b>
        «${esc(urg)}»${cambia ? ` — y lo que cambia si se resuelve: «${esc(cambia)}»` : ''}.</p>` : ''}
      <p class="motivo" style="margin-bottom:14px;font-size:13px;color:#5a6e7a">Construidas con lo conversado
        en la reunión. Cada una dice cómo se comprueba y qué se haría: ninguna se da por cierta hasta verificarla.</p>
      ${(M.bloque_2_hipotesis.hipotesis || []).map(h => {
        const s = sols.find(x => x.verifica_hipotesis === h.orden);
        return `<div class="stat" style="margin-bottom:12px">
          <div class="lbl">Hipótesis ${h.orden}</div>
          <p style="font-size:15px;font-weight:600;margin:6px 0">${esc(limpiar(h.enunciado))}</p>
          <p style="font-size:13px;margin:4px 0"><b>Cómo se verifica:</b> ${esc(limpiar(h.como_se_verifica))}</p>
          <p style="font-size:13px;margin:4px 0"><b>Si se confirma:</b> ${esc(limpiar(h.si_es_cierta))}</p>
          ${s ? `<p style="font-size:13px;margin:4px 0"><b>Qué hacer esta semana:</b> ${esc(limpiar(s.accion))}
            ${s.como_hacerlo_solo ? ` — <i>y puedes partir sin contratar a nadie: ${esc(limpiar(s.como_hacerlo_solo))}</i>` : ''}</p>` : ''}
        </div>`; }).join('')}
      ${M.bloque_2_hipotesis.lectura_del_reparto ? `<p class="motivo" style="font-size:13px">${esc(limpiar(M.bloque_2_hipotesis.lectura_del_reparto))}</p>` : ''}`;

    const et = (M.bloque_4_etapas || {}).etapas || [];
    $('#etapas').innerHTML = et.length ? `
      <h2>El plan, por etapas</h2>
      ${et.map(e2 => `<div class="stat" style="margin-bottom:12px">
        <div class="lbl">Etapa ${e2.orden} · ${esc(limpiar(e2.nombre))}</div>
        <p style="font-size:13px;margin:6px 0"><b>Por qué primero:</b> ${esc(limpiar(e2.por_que_primero))}</p>
        <p style="font-size:13px;margin:4px 0"><b>Quién lo hace:</b> ${esc(e2.quien_lo_hace)} · <b>Esfuerzo:</b> ${esc(e2.esfuerzo || 'N/D')}</p>
        <p style="font-size:13px;margin:4px 0"><b>Se sabe que resultó cuando:</b> ${esc(limpiar(e2.como_se_sabe_que_resultó || e2.como_se_sabe_que_resulto || ''))}</p>
      </div>`).join('')}
      ${(M.bloque_4_etapas || {}).fuera_de_nuestro_alcance ? `<p class="motivo" style="font-size:13px"><b>Fuera del alcance de este plan:</b> ${esc(limpiar(M.bloque_4_etapas.fuera_de_nuestro_alcance))}</p>` : ''}` : '';
  } else {
  const hs = hipotesisDeTrabajo(ruta);
  $('#hipotesis').innerHTML = hs.length ? `
    <h2>Hipótesis de trabajo — para validar juntos</h2>
    ${urg ? `<p class="motivo" style="margin-bottom:10px"><b>Lo que ${T('tú mismo nombraste', 'usted mismo nombró')} como lo más urgente:</b>
      «${esc(urg)}»${cambia ? ` — y lo que cambia si se resuelve: «${esc(cambia)}»` : ''}.
      Las hipótesis de abajo existen para explicar por qué pasa eso y qué lo resuelve de raíz — no son un tema aparte.</p>` : ''}
    <p class="motivo" style="margin-bottom:14px;font-size:13px;color:#5a6e7a">Construidas únicamente con lo
      conversado en la reunión. Cada una dice cómo se comprueba: ninguna se da por cierta hasta verificarla.</p>
    ${hs.map((h, i) => `
      <div class="stat" style="margin-bottom:12px">
        <div class="lbl">Hipótesis ${i + 1} · eslabón ${dosDig(h.n)} ${esc(CADENA[h.n - 1].nombre)}</div>
        <p style="font-size:15px;font-weight:600;margin:6px 0">${esc(h.t)}</p>
        <p style="font-size:13px;margin:4px 0"><b>Cómo se verifica:</b> ${esc(h.ver)}</p>
        <p style="font-size:13px;margin:4px 0"><b>Si se confirma:</b> ${esc(h.si)}</p>
        <div class="ref">Disciplina que lo trabaja: ${esc(CADENA[h.n - 1].area)}</div>
      </div>`).join('')}` : '';
    $('#etapas').innerHTML = '';
  }

  /* 5 · Lo que NO es el problema */
  /* «El orden» — nunca un no seco (regla DB17): todo lo pedido está en el plan,
     en su etapa; lo sano se cuida y se potencia, no se descarta. */
  const pedidoTexto = ((E.cierre || {}).c1 || '') + ' ' + ((E.cierre || {}).c2 || '');
  const MAPA_PEDIDOS = [
    [/cotizaci|crm|orden|registro|seguimiento/i, 'Ordenar las cotizaciones y su seguimiento', 'Etapa 1 — va primero: es la fuga que hace rendir todo lo demás'],
    [/cat[aá]logo|web|p[aá]gina|sitio/i, 'Catálogo y sitio renovado', 'Etapa 2 — el activo que muestra la oferta real y alimenta el registro'],
    [/contenido|conocer|difusi|digital/i, 'Dar a conocer los productos / plan de contenidos', 'Etapa 3 — con el catálogo como munición y el registro capturando'],
    [/anuncio|publici|pauta|campañ/i, 'Anuncios publicitarios', 'Etapa 3 — recién cuando el registro y el catálogo existan: invertir antes riega la fuga']
  ];
  const MAPA_PRO = [
    [/agenda|registro|seguimiento|whatsapp|respond|asistente/i, 'Ordenar la entrada de consultas y su seguimiento', 'Fase de reparar u ordenar, según el eslabón que se cortó'],
    [/web|p[aá]gina|sitio/i, 'Sitio y páginas por ' + proTx('{servicio}'), 'Puerta de entrada — va cuando exista dónde registrar lo que llega'],
    [/contenido|redes|instagram|tiktok|conocer|difusi/i, 'Contenido y redes', 'Fase de acelerar — sobre la entrada ya ordenada'],
    [/anuncio|publici|pauta|campañ/i, 'Publicidad pagada', typeof conSalud === 'function' && conSalud(E)
      ? 'Fuera del plan: en salud la publicidad para captar pacientes tiene límites éticos (Código de Ética del Colegio Médico, arts. 48 a 52). La demanda se construye con buscadores, contenido y derivación'
      : 'Fase de acelerar — recién con el resto funcionando: invertir antes riega la fuga']
  ];
  const pedidos = (PRO() ? MAPA_PRO : MAPA_PEDIDOS).filter(([re]) => re.test(pedidoTexto));
  const NUANCE_SANO = {
    1: 'Tu criterio comercial funciona en la práctica (rutas, industria, tamaño de proyecto) — en el plan solo se deja por escrito, no se reinventa.',
    2: 'Quien te busca por nombre te encuentra y con buena cara. Se potencia en la Etapa 3 con contenido — no se toca antes.',
    3: 'La demanda orgánica llega sola y sin gastar. La demanda pagada entra en la Etapa 3, sobre el sistema ya reparado — así cada peso rinde.',
    5: 'La velocidad de respuesta es tu fortaleza — el plan la protege y le agrega el registro que hoy falta.',
    6: 'La atención da abasto hoy. Se automatiza cuando exista el registro que la alimente.',
    7: 'La operación se sostiene — y el plan la documenta para que no dependa de una sola persona.'
  };
  $('#sano').innerHTML = `
    <h2>El orden — todo lo que ${T('pediste', 'pidió')} está en el plan, cada cosa en su etapa</h2>
    ${pedidos.length ? `<ul class="dicho">${pedidos.map(([, p, et]) =>
      `<li><b>${esc(p)}</b> → ${esc(et)}.</li>`).join('')}</ul>` : ''}
    ${sanos.length ? `<p class="motivo" style="margin-top:14px"><b>Lo que ya funciona</b> — se cuida y se potencia en su momento, no se interviene primero:</p>
    <ul class="dicho">${sanos.map(n => `<li class="sano-li">${dosDig(n)} · ${esc(CADENA[n - 1].nombre)} — ${esc(PRO() ? proNuanceSano(n, E) : (NUANCE_SANO[n] || 'está funcionando.'))}</li>`).join('')}</ul>` : ''}
    ${M && M.bloque_0_ruteo && M.bloque_0_ruteo.que_NO_es_tu_problema ? `<p class="motivo" style="margin-top:10px">${esc(limpiar(M.bloque_0_ruteo.que_NO_es_tu_problema))}</p>` : ''}`;

  /* Sistema personalizado — solo con el módulo profesional. Se arma con el mismo ruteo
     que esta página muestra; no agrega ninguna cifra que el profesional no haya dicho. */
  const sis = PRO() && typeof armarSistema === 'function' ? armarSistema(ruta, E) : null;
  $('#sistema').innerHTML = sis ? `
    <h2>Su sistema de crecimiento — qué se construye y en qué orden</h2>
    <p class="motivo" style="margin-bottom:14px">Cada pieza responde a un tramo de la Cadena. Se parte por donde hoy se corta
      y se acelera al final: traer más personas antes de ordenar la entrada solo agranda la pérdida.</p>
    ${sis.fases.map(f => `<div class="stat" style="margin-bottom:12px">
      <div class="lbl">Fase ${f.orden} · ${esc(f.nombre)}</div>
      <p style="font-size:13px;margin:6px 0">${esc(f.por_que)}</p>
      ${f.componentes.map(c => `
        <p style="font-size:15px;font-weight:600;margin:10px 0 4px">${dosDig(c.n)} · ${esc(c.nombre)}</p>
        <p style="font-size:13px;margin:2px 0">${esc(c.que_es)}</p>
        <ul class="dicho" style="margin:6px 0">${c.piezas.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <p style="font-size:13px;margin:2px 0"><b>Se sabe que funciona cuando se mueve:</b> ${esc(c.mide)}</p>
        ${c.cuidado ? `<div class="ref">${esc(c.cuidado)}</div>` : ''}`).join('')}
    </div>`).join('')}
    <p class="motivo" style="font-size:13px"><b>Criterio de revisión:</b> ${esc(sis.revision)}</p>` : '';

  /* Presencia digital — SEO del sitio y canales, con procedencia y fuentes */
  const D = E.digital;
  const COLOR_EST = { verde: '#3f9f7a', ambar: '#F5A623', rojo: '#d9534f', nd: '#c3d0d8' };
  $('#digital').innerHTML = D ? `
    <h2>Presencia digital — el sitio y los canales, mirados desde afuera</h2>
    ${D.resumen ? `<p class="motivo" style="margin-bottom:14px">${esc(limpiar(D.resumen))}</p>` : ''}
    ${(D.canales || []).map(c => `
      <div style="display:grid;grid-template-columns:14px 130px 1fr;gap:10px;align-items:start;border-top:1px solid #edf2f5;padding:9px 0">
        <span style="width:12px;height:12px;border-radius:50%;margin-top:4px;background:${COLOR_EST[c.estado] || COLOR_EST.nd}"></span>
        <b style="font-size:13.5px">${esc(c.canal)}</b>
        <span style="font-size:13.5px">${esc(limpiar(c.hallazgo))}
          ${c.fuente ? `<span style="font-size:11px;color:#7d8f9a"> — ${esc(c.fuente)}</span>` : ''}</span>
      </div>`).join('')}
    ${(D.benchmark || []).length ? `
      <p class="motivo" style="margin:16px 0 10px"><b>Contra qué compararse</b> — referencias de industria, citadas con su fuente y como rango referencial, nunca como estimación de su caso:</p>
      <div class="stats">${D.benchmark.map(b => `
        <div class="stat"><div class="lbl">${esc(b.metrica)}</div>
          <div class="big" style="font-size:18px">${esc(b.valor || 'N/D')}</div>
          <div class="ref">${esc(b.referencia)}${b.fuente ? ` · ${esc(b.fuente)}` : ''}</div></div>`).join('')}
      </div>` : ''}
    <p class="ref" style="font-size:11px;color:#7d8f9a;margin-top:12px">Lo observado prueba presencia o ausencia en lo público, nunca intención ni cifras internas. Verificado el ${esc(D.fecha || '')}.</p>` : '';

  /* 5 · Próximo paso */
  const paso = E.cierre.c3 || '';
  const f = E.fechaPaso ? new Date(E.fechaPaso + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  $('#paso').innerHTML = (paso || f) ? `
    <h2>Próximo paso</h2>
    <p class="motivo">${esc(paso)}${paso && f ? ' — ' : ''}${f ? `<b>${esc(f)}</b>` : ''}</p>` : '';

  document.querySelectorAll('.card').forEach(c => { c.style.display = c.innerHTML.trim() ? '' : 'none'; });
}

/* Hipótesis por eslabón: enunciados fijos del método, poblados solo con lo
   declarado. Máximo 3: dominante, secundaria y la del costo repetitivo. */
function hipotesisDeTrabajo(ruta) {
  const r = E.triage;
  const POR_ESLABON = {
    1: { t: 'Están llegando oportunidades y no existe un criterio escrito y compartido para decidir cuáles trabajar: cada contacto se evalúa de nuevo, según quien lo tome.',
         ver: 'Escribir el criterio en una página y contrastarlo contra los últimos diez negocios ganados y perdidos.',
         si: 'Conseguir más contactos no mejora el cierre: lo diluye. Lo primero es definir a quién sí y a quién no.' },
    2: { t: 'El trabajo es mejor que su huella pública: quien los busca no encuentra evidencia suficiente para decidirse por ustedes.',
         ver: 'Comparar lo que encuentra un tercero al buscarlos contra lo que encuentra al buscar a los competidores que ustedes mismos nombraron.',
         si: 'Parte de la decisión ocurre antes de la primera conversación, y hoy esa etapa no está jugando a favor.' },
    3: { t: 'El flujo de oportunidades nuevas no alcanza para sostener el crecimiento: el negocio depende de la cartera y de los referidos existentes.',
         ver: 'Registrar durante un mes cuántas oportunidades nuevas entran y por qué vía llega cada una.',
         si: 'El riesgo no es perder ventas hoy: es que el tamaño de la cartera actual fije el techo del negocio.' },
    4: { t: 'Quien llega interesado no tiene dónde dejar sus datos sin hablar antes con una persona: el activo digital muestra, pero no captura.',
         ver: 'Recorrer completo el camino de un interesado, desde que los encuentra hasta que logra contactarlos.',
         si: 'Parte del interés que hoy se genera se pierde sin dejar rastro.' },
    5: { t: 'Las oportunidades llegan, pero se responden tarde y sin registro: la fuga está entre que alguien pregunta y que alguien contesta.',
         ver: 'Revisar los últimos treinta días: cuántos contactos entraron, en cuánto tiempo se respondió cada uno y dónde quedó registrado.',
         si: 'Atraer más interesados amplifica la pérdida. Primero se tapa la fuga, después se abre la llave.' },
    6: { t: 'La atención es buena pero no da abasto: cada mes quedan conversaciones de venta sin seguimiento.',
         ver: 'Contar las conversaciones abiertas del último mes y cuántas recibieron un seguimiento con fecha.',
         si: 'El crecimiento está limitado por horas disponibles, no por falta de demanda.' },
    7: { t: 'La operación comercial depende de personas específicas: si una falta, la continuidad no está asegurada.',
         ver: 'Listar qué partes del proceso comercial puede ejecutar hoy más de una persona.',
         si: 'Lo que se construya tiene que quedar documentado y transferido, no solo funcionando.' }
  };
  const hs = [];
  const fuente = PRO() && typeof PRO_HIPOTESIS !== 'undefined' ? PRO_HIPOTESIS : POR_ESLABON;
  const add = n => { if (n && fuente[n] && !hs.some(h => h.n === n)) {
    const h = fuente[n];
    hs.push({ n, t: PRO() ? proTx(h.t, E) : h.t, ver: PRO() ? proTx(h.ver, E) : h.ver, si: PRO() ? proTx(h.si, E) : h.si });
  } };
  add(ruta.dominante);
  if (ruta.secundaria && ruta.estados[ruta.secundaria] === 'roto') add(ruta.secundaria);
  const hrs = numDe('t11', r.t11);
  if (hrs !== null && hrs >= 6 && ruta.estados[6] === 'roto') add(6);
  return hs.slice(0, 3);
}

/* Actualización en vivo: la página se rearma sola cuando la reunión guarda.
   En modo ejemplo no aplica: los datos vienen del archivo, no del localStorage. */
let ultimo = localStorage.getItem(K);
function refrescar() {
  if (DEMO_SRC) return;
  const cur = localStorage.getItem(K);
  if (cur === ultimo) return;
  ultimo = cur; leer(); render();
}
window.addEventListener('storage', refrescar);
setInterval(refrescar, 1500);

if (DEMO_SRC) {
  document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.top nav a').forEach(a => {
      a.href = a.getAttribute('href').split('?')[0] + '?reunion=' + encodeURIComponent(DEMO_SRC);
    });
    try {
      const r = await fetch(DEMO_SRC);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      E = await r.json(); normalizarE(); render();
    } catch (e2) {
      document.getElementById('gate').hidden = false;
      document.querySelector('#gate h1').textContent = 'No se pudo cargar el ejemplo';
      document.querySelector('#gate p').textContent = 'Archivo: ' + DEMO_SRC + ' — ' + e2.message;
    }
  });
}

/* Cadena en galones SVG — sano petróleo, roto ámbar, sin evaluar gris */
function svgCadena(ruta) {
  const W = 800, H = 96, w = W / 7;
  const color = n => ruta.estados[n] === 'roto' ? '#F5A623' : ruta.estados[n] === 'sano' ? '#0D4F6A' : '#c3d0d8';
  const txt = n => ruta.estados[n] === 'sin_datos' ? '#5a6e7a' : '#ffffff';
  let s = `<svg viewBox="0 0 ${W} ${H + 40}" width="100%" role="img" aria-label="Cadena de crecimiento">`;
  for (let i = 0; i < 7; i++) {
    const n = i + 1, x = i * w, dom = n === ruta.dominante;
    const p = `${x},8 ${x + w - 14},8 ${x + w},${8 + (H - 16) / 2} ${x + w - 14},${H - 8} ${x},${H - 8} ${i ? x + 14 : x},${8 + (H - 16) / 2} ${x},8`;
    s += `<polygon points="${p}" fill="${color(n)}" ${dom ? 'stroke="#B4791B" stroke-width="3"' : ''}/>`;
    s += `<text x="${x + w / 2 + 2}" y="${H / 2 - 6}" text-anchor="middle" font-size="17" font-weight="800" fill="${txt(n)}">${dosDig(n)}</text>`;
    s += `<text x="${x + w / 2 + 2}" y="${H / 2 + 14}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${txt(n)}">${CADENA[i].nombre.split(' ')[0]}</text>`;
    if (dom) s += `<text x="${x + w / 2 + 2}" y="${H + 26}" text-anchor="middle" font-size="12" font-weight="800" fill="#B4791B">aquí se corta hoy</text>`;
  }
  return s + '</svg>';
}

/* Velocidad de respuesta vs. la ventana en que el interesado sigue decidiendo */
function statT7(v) {
  const escala = [['menos_5min', 'Menos de 5 min'], ['menos_1h', 'Menos de 1 hora'], ['mismo_dia', 'El mismo día'], ['mas_1dia', 'Más de un día']];
  const idx = escala.findIndex(e => e[0] === v);
  const W = 300, seg = W / 4;
  let s = `<svg viewBox="0 0 ${W} 58" width="100%">`;
  escala.forEach((e, i) => {
    s += `<rect x="${i * seg + 1}" y="18" width="${seg - 2}" height="14" rx="3" fill="${i === 0 ? '#3f9f7a' : i === 1 ? '#a8c6b8' : '#e3cba3'}" opacity="${i === idx ? 1 : .45}"/>`;
    s += `<text x="${i * seg + seg / 2}" y="52" text-anchor="middle" font-size="8.5" fill="#5a6e7a">${e[1]}</text>`;
  });
  if (idx >= 0) s += `<text x="${idx * seg + seg / 2}" y="12" text-anchor="middle" font-size="10" font-weight="800" fill="#B4791B">hoy</text>`;
  s += '</svg>';
  return `
    <div class="stat"><div class="lbl">Velocidad de respuesta al interesado</div>
      <div class="big" style="font-size:20px">${escala[idx] ? escala[idx][1] : ''}</div>${s}
      <div class="ref">Referencia de industria: responder dentro de 5 minutos multiplica por 21 la probabilidad de calificar al contacto frente a hacerlo a los 30 (MIT/InsideSales — rango referencial, no una estimación de su caso)</div></div>`;
}

function svgFunnel(nin, nout) {
  const W = 300, max = Math.max(nin, 1);
  const b = v => Math.max(4, v / max * (W - 90));
  return `<svg viewBox="0 0 ${W} 52" width="100%">
    <rect x="70" y="6" width="${b(nin)}" height="15" rx="3" fill="#0D4F6A"/>
    <rect x="70" y="29" width="${b(nout)}" height="15" rx="3" fill="#F5A623"/>
    <text x="64" y="18" text-anchor="end" font-size="10" fill="#5a6e7a">${PRO() ? 'Consultaron' : 'Entraron'}</text>
    <text x="64" y="41" text-anchor="end" font-size="10" fill="#5a6e7a">${PRO() ? esc(proTx('{cierre_corto}')) : 'Cerraron'}</text>
    <text x="${74 + b(nin)}" y="18" font-size="10" font-weight="700" fill="#0D4F6A">${nin}</text>
    <text x="${74 + b(nout)}" y="41" font-size="10" font-weight="700" fill="#B4791B">${nout}</text>
  </svg>`;
}

document.addEventListener('DOMContentLoaded', render);
