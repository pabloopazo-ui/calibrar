/* CALIBRAR · Cabina — dos vías para que el texto entre solo al Puente.

   A · DICTADO EN VIVO. Reconocimiento de voz del navegador (Chrome). Va
       escribiendo mientras hablan y lo que queda firme se agrega al Puente.
       Es ayuda de sala, no la fuente: tiene errores, no distingue quién habla
       y con dos personas encima baja. El diagnóstico se arma sobre C.

   C · TRAER DE NOTAS DE VOZ. macOS ya transcribe las grabaciones solo, en el
       equipo y gratis. Esto las lista y trae el texto completo. Es la fuente
       buena. Necesita el servidor de la Cabina (servidor_cabina.py): abierta
       con doble clic en «Iniciar Cabina.command» ya lo tiene.

   Ninguna de las dos manda audio a ninguna parte desde acá: A lo resuelve el
   navegador y C lee texto que el sistema ya escribió. */

const DICT_LANG = 'es-CL';
let _rec = null, _dictando = false, _parcial = '';

function dictadoSoportado() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function _pintarEstadoDictado(msg, tono) {
  const el = document.getElementById('dict-estado');
  if (el) el.innerHTML = msg ? `<span class="${tono || ''}">${esc(msg)}</span>` : '';
  const b = document.getElementById('dict-btn');
  if (b) {
    b.textContent = _dictando ? '⏹ Detener dictado' : '🎙 Dictar en vivo';
    b.classList.toggle('sel', _dictando);
  }
}

/* Lo que el motor de voz da por firme se agrega al Puente. Lo provisional se
   muestra aparte y no se guarda: cambia mientras la persona sigue hablando. */
function _agregar(texto) {
  if (!texto.trim()) return;
  const ta = document.getElementById('p-txt');
  const sep = (E.transcripcion && !/\s$/.test(E.transcripcion)) ? ' ' : '';
  E.transcripcion = (E.transcripcion || '') + sep + texto.trim();
  if (ta) { ta.value = E.transcripcion; ta.scrollTop = ta.scrollHeight; }
  guardar();
}

function dictadoToggle() {
  if (_dictando) {                       // parar: onend no reinicia
    _dictando = false;
    try { _rec && _rec.stop(); } catch (e) { /* ya estaba parado */ }
    _pintarEstadoDictado('Dictado detenido. El texto quedó en el Puente — dale a «Buscar respuestas».', 'si');
    pintarPuente();
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    _pintarEstadoDictado('Este navegador no dicta. Abre la Cabina en Chrome, o usa «Traer de Notas de Voz».', 'no');
    return;
  }
  _rec = new SR();
  _rec.lang = DICT_LANG;
  _rec.continuous = true;
  _rec.interimResults = true;

  _rec.onresult = (ev) => {
    let firme = '', prov = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) firme += r[0].transcript; else prov += r[0].transcript;
    }
    if (firme) _agregar(firme);
    _parcial = prov;
    const p = document.getElementById('dict-parcial');
    if (p) p.textContent = prov ? '… ' + prov : '';
  };
  /* Chrome corta solo tras un silencio largo. Mientras el usuario no haya
     apretado Detener, se vuelve a levantar: una reunión tiene pausas. */
  _rec.onend = () => {
    if (!_dictando) return;
    try { _rec.start(); } catch (e) { /* arranque muy seguido: lo reintenta el próximo onend */ }
  };
  _rec.onerror = (ev) => {
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
      _dictando = false;
      _pintarEstadoDictado('El navegador bloqueó el micrófono. Dale permiso en el candado de la barra de direcciones.', 'no');
    } else if (ev.error === 'network') {
      _pintarEstadoDictado('El dictado necesita conexión. Sigue grabando con Notas de Voz y al final usa «Traer de Notas de Voz».', 'no');
    } else if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
      _pintarEstadoDictado('Dictado interrumpido (' + ev.error + '). Se reintenta solo.', 'no');
    }
  };

  try {
    _rec.start(); _dictando = true;
    _pintarEstadoDictado('Escuchando. Avísale a tu contraparte que estás transcribiendo — es dato personal (Ley 21.719).', 'si');
  } catch (e) {
    _dictando = false;
    _pintarEstadoDictado('No se pudo iniciar: ' + e.message, 'no');
  }
}

/* ── C · Notas de Voz ─────────────────────────────────────────────────────── */

const _AYUDA_BLOQUEO = {
  sin_acceso_disco_completo:
    'El intérprete que levantó el servidor no tiene Acceso Total al Disco. En Ajustes del Sistema → Privacidad y Seguridad → Acceso Total al Disco, agrega Terminal (o el intérprete que usaste) y vuelve a abrir la Cabina.',
  sin_rutina:
    'No está instalada la rutina de Notas de Voz en ~/.claude/scheduled-tasks/, que es la que sabe leer las transcripciones.',
  sin_base_de_datos:
    'No se encontró la base de Notas de Voz. ¿La app tiene alguna grabación en este equipo?',
  sin_transcripcion:
    'Esa grabación todavía no tiene transcripción. macOS la hace sola un rato después de grabar: ábrela en Notas de Voz y espera a que aparezca el texto.',
  no_encontrada: 'Esa grabación ya no está en el índice. Vuelve a listar.',
};

function _sinServidor() {
  document.getElementById('nv-lista').innerHTML =
    '<p class="vacio">No hay servidor de Cabina escuchando. Cierra esta ventana y abre la Cabina con doble clic en <b>«Iniciar Cabina.command»</b>: eso levanta el servidor que sabe leer las Notas de Voz.</p>';
}

async function traerNotasVoz(dias) {
  const cont = document.getElementById('nv-lista');
  if (!cont) return;
  cont.innerHTML = '<p class="vacio">Leyendo las grabaciones del equipo…</p>';
  let d;
  try {
    const r = await fetch('/api/notas?dias=' + (dias || 3), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    d = await r.json();
  } catch (e) { return _sinServidor(); }

  if (!d.ok) {
    cont.innerHTML = `<p class="vacio">${esc(_AYUDA_BLOQUEO[d.bloqueo] || ('No se pudo leer: ' + (d.detalle || d.bloqueo)))}</p>`;
    return;
  }
  if (!d.notas.length) {
    cont.innerHTML = `<p class="vacio">Ninguna grabación con transcripción en los últimos ${esc(dias || 3)} días.
      <button class="chip" onclick="traerNotasVoz(15)">Buscar en 15 días</button></p>`;
    return;
  }
  cont.innerHTML = d.notas.map(n => `
    <div class="prop">
      <div><b>${esc(n.titulo)}</b> <span class="ev">${esc((n.fecha || '').replace('T', ' ').slice(0, 16))}</span></div>
      <div class="prop-r">${Math.round(n.caracteres / 1000)} mil caracteres transcritos</div>
      <div class="ops" style="margin:6px 0 0 0">
        <button class="chip" onclick="cargarNotaVoz('${esc(n.id)}')">Traer al Puente</button>
      </div>
    </div>`).join('')
    + `<div class="ops" style="margin:8px 0 0 0"><button class="chip" onclick="traerNotasVoz(15)">Ver 15 días</button></div>`;
}

/* El título de la nota es la UBICACIÓN GPS donde se grabó, no el tema: por eso
   la reunión de un cliente aparece con el nombre del edificio o del vecino. */
async function cargarNotaVoz(id) {
  const cont = document.getElementById('nv-lista');
  cont.innerHTML = '<p class="vacio">Trayendo la transcripción…</p>';
  let d;
  try {
    const r = await fetch('/api/nota?id=' + encodeURIComponent(id), { cache: 'no-store' });
    d = await r.json();
  } catch (e) { return _sinServidor(); }

  if (!d.ok) {
    cont.innerHTML = `<p class="vacio">${esc(_AYUDA_BLOQUEO[d.bloqueo] || d.bloqueo)}</p>`;
    return;
  }
  const previo = (E.transcripcion || '').trim();
  if (previo && !confirm('El Puente ya tiene texto. ¿Agregar la transcripción al final?\n\n(Cancelar la deja como está.)')) return;
  E.transcripcion = (previo ? previo + '\n\n' : '') + d.texto;
  guardar();
  /* analizarPuente() relee el textarea, así que hay que dejarlo sincronizado
     ANTES de llamarlo: si no, pisa con el valor viejo lo que se acaba de traer. */
  const ta = document.getElementById('p-txt');
  if (ta) ta.value = E.transcripcion; else pintarPuente();
  analizarPuente();
  /* El Puente son expresiones regulares, no comprensión: sobre una reunión
     entera dispara falsos positivos (medido el 5-sep-2026 con una nota de 109
     mil caracteres: 4 aciertos de 8 propuestas — matchea «los dos» como
     «Ambas» y la landing de un competidor como si fuera del prospecto). En
     pedazos cortos pegados durante la reunión acierta mucho más. Por eso el
     aviso escala con el largo: cada propuesta se revisa antes de aceptar. */
  const cont2 = document.getElementById('nv-lista');
  const miles = Math.round(d.texto.length / 1000);
  const ojo = d.texto.length > 20000
    ? ' <b>Ojo:</b> sobre una transcripción larga el Puente propone de más — revisa cada propuesta contra su cita antes de aceptarla. Lo que no calce, descártalo y contéstalo a mano.'
    : '';
  if (cont2) cont2.innerHTML = `<p class="vacio">Cargada «${esc(d.titulo)}» — ${miles} mil caracteres.
    Las propuestas del triage están abajo; el resto queda en el texto para que lo leas.${ojo}</p>`;
}
