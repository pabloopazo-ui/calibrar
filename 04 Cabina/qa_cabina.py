#!/usr/bin/env python3
"""QA de la Cabina de Calibrar (04 Cabina) — creado el 19-ago-2026 tras los
errores de la primera demo a terceros. No lee el código por encima: lo EJECUTA
(node) y comprueba qué hace. Correr después de tocar cualquier archivo de la
carpeta: python3 qa_cabina.py"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).parent
PRD = BASE.parent / '01 Producto' / 'Calibrar_PRD_v3_jul2026.md'

VERDE, ROJO, GRIS, FIN = '\033[92m', '\033[91m', '\033[90m', '\033[0m'
resultados = []


def check(grupo, nombre, ok, detalle=''):
    resultados.append((grupo, nombre, bool(ok)))
    marca = f'{VERDE}✓{FIN}' if ok else f'{ROJO}✗{FIN}'
    print(f'  {marca} {nombre}' + (f' {GRIS}{detalle}{FIN}' if detalle and not ok else ''))


def node(script, archivos=()):
    """Ejecuta JS en node con stubs de navegador. Los archivos y el script de
    prueba se evalúan JUNTOS en un mismo ámbito (los const de un archivo deben
    ser visibles para el siguiente y para la prueba)."""
    stubs = """
const _noop = () => {};
globalThis.window = globalThis;
globalThis.location = { search: '', pathname: '/04 Cabina/reunion.html', href: '' };
globalThis.localStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=v; }, removeItem(k){ delete this._d[k]; } };
globalThis.sessionStorage = { _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=v; }, removeItem(k){ delete this._d[k]; } };
globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: _noop, createElement: () => ({ style: {}, appendChild: _noop, click: _noop, remove: _noop, setAttribute: _noop }), body: { appendChild: _noop } };
globalThis.cargarJS = () => {};   // los archivos se inyectan en el mismo ámbito, ver node()
globalThis.setInterval = () => 0; globalThis.alert = _noop; globalThis.confirm = () => true; globalThis.fetch = () => Promise.reject(new Error('sin red en QA'));
"""
    # `cargarJS('x.js')` dentro del script declara qué archivo necesita esa prueba. Se
    # resuelve acá: el archivo se antepone a la fuente, en el MISMO ámbito, para que sus
    # `const` sean visibles desde la prueba. Sin esto, node evalúa una llamada a una
    # función que no existe y toda la prueba muere con un error de línea, no de contenido.
    pedidos = re.findall(r"cargarJS\(\s*['\"]([^'\"]+)['\"]\s*\)", script)
    archivos = list(archivos) + [f for f in pedidos if f not in archivos]
    fuente = '\n;\n'.join((BASE / f).read_text() for f in archivos)
    r = subprocess.run(['node', '-e', stubs + fuente + '\n;\n' + script],
                       capture_output=True, text=True, cwd=BASE)
    if r.returncode != 0:
        lineas = [l for l in r.stderr.strip().split('\n') if l.strip() and 'Node.js v' not in l]
        return None, (lineas[0] if lineas else 'error desconocido')[:200]
    return r.stdout.strip(), ''


HTMLS = ['login.html', 'reunion.html', 'resultados.html', 'guia.html', 'guiada.html']
# Las cuatro de arriba son las páginas de la aplicación: cargan assets con `?v=` y exigen
# login, así que los grupos VERSIONES y ACCESO solo aplican a ellas. Pero la carpeta
# acumula además entregables sueltos y autocontenidos (los demos aplicados a un prospecto),
# y ESOS también se proyectan. El 24-ago-2026 entraron tres sin que nadie los agregara a
# ninguna lista, y uno traía el nombre completo del gerente de un prospecto: el barrido de
# Ley 21.719 se hace por GLOB justamente para que un archivo nuevo no nazca fuera de alcance.
HTMLS_TODOS = sorted(p.name for p in BASE.glob('*.html'))
JS = ['assets/config.js', 'assets/auth.js', 'assets/cabina.js', 'assets/motor_api.js',
      'assets/resultados.js', 'assets/preguntas_v2.js', 'assets/prompt_maestro.js',
      'assets/apendices_motor.js', 'assets/modulo_profesional.js', 'assets/guiada.js']

# ── ARCHIVOS ────────────────────────────────────────────────────────────────
print('ARCHIVOS')
for f in HTMLS + JS + ['assets/cabina.css', 'Iniciar Cabina.command', 'LEEME.md']:
    check('archivos', f'existe {f}', (BASE / f).exists())
check('archivos', 'Iniciar Cabina.command es ejecutable',
      (BASE / 'Iniciar Cabina.command').stat().st_mode & 0o111)
jsons = list((BASE / 'Reuniones').glob('*.json'))
check('archivos', 'Reuniones/ tiene al menos una reunión publicada', len(jsons) >= 1)
for j in jsons:
    try:
        d = json.loads(j.read_text())
        check('archivos', f'{j.name} es JSON válido con ficha y triage',
              isinstance(d.get('ficha'), dict) and isinstance(d.get('triage'), dict))
    except Exception as e:
        check('archivos', f'{j.name} es JSON válido', False, str(e))

# ── LEY 21.719 — datos personales en Reuniones/ ─────────────────────────────
# Decisiones 2a/2b del 22-ago-2026: las reuniones guardan CARGO/ROL, nunca el
# nombre de la contraparte. Mismo espíritu que qa_prospeccion con el maestro:
# el guardarraíl vive en código, no en la buena memoria.
print('LEY 21.719')
ROL_OK = re.compile(
    r'^(n/d|contraparte|gerent|gerenc|jef[ea]|superintendent|encargad|director|dueñ|soci|'
    r'ingenier|asistent|administra|operador|supervisor|analista|coordinador|'
    r'representante|equipo|comité|comite|área|area|técnic|tecnic|asesor|abogad)', re.I)
# La regla protege al TITULAR, no a quien firma el trabajo: una cita atribuida a alguien de
# Precisión es autoría, no dato personal de un tercero. Sin esta lista, el guardarraíl
# marcaría en rojo que Pablo aparezca citado en su propio entregable.
EQUIPO_PRECISION = re.compile(
    r'^(Pablo|Pablo Opazo|Andrés|Andrés Farías|Andres|Álvaro|Alvaro|'
    r'María Jesús|Maria Jesús|Sebastián|Sebastian|Precisión|Precision)$', re.I)
NOMBRE_PROPIO = re.compile(r'\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b')
CORREO_NOMINATIVO = re.compile(r'\b[a-z]+[._][a-z]+@|\b[a-z]\.[a-z]+@', re.I)
TELEFONO_PERSONAL = re.compile(r'\+?56\s?9\s?\d{4}\s?\d{4}')
for j in jsons:
    try:
        d = json.loads(j.read_text())
    except Exception:
        continue
    quienes = str((d.get('ficha') or {}).get('quienes') or '')
    # Cada trozo del campo parte por vocabulario de cargo, o es un patrón
    # Nombre Apellido cuyo primer token es un cargo ("Gerente Comercial" pasa,
    # "Matías Retamal" no).
    sospechosos = [m.group(0) for m in NOMBRE_PROPIO.finditer(quienes)
                   if not ROL_OK.match(m.group(0))]
    check('ley21719', f'{j.name}: ficha.quienes trae cargo/rol, no nombres',
          not sospechosos, str(sospechosos))
    plano = json.dumps(d, ensure_ascii=False)
    check('ley21719', f'{j.name}: sin correos nominativos',
          not CORREO_NOMINATIVO.search(plano))
    check('ley21719', f'{j.name}: sin teléfonos celulares personales',
          not TELEFONO_PERSONAL.search(plano))

# Los .html de la carpeta se proyectan. Se barren TODOS por glob, no por lista.
PREPARADO_PARA = re.compile(
    r'Preparad[oa] para\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)')
# Atribución de una cita: «…texto…» seguido de un nombre y un separador de fecha.
ATRIBUCION = re.compile(
    r'[”"]\s*<[^>]*>\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\s*·')


def texto_visible(html):
    sin = re.sub(r'<(script|style)\b.*?</\1>', ' ', html, flags=re.S | re.I)
    return re.sub(r'<[^>]+>', ' ', sin)


for h in HTMLS_TODOS:
    crudo = (BASE / h).read_text()
    vis = texto_visible(crudo)
    malos = [m.group(1) for m in PREPARADO_PARA.finditer(vis)
             if not ROL_OK.match(m.group(1)) and not EQUIPO_PRECISION.match(m.group(1))]
    check('ley21719', f'{h}: «Preparado para» no nombra a una persona', not malos,
          str(malos))
    citas = [m.group(1) for m in ATRIBUCION.finditer(crudo)
             if not ROL_OK.match(m.group(1)) and not EQUIPO_PRECISION.match(m.group(1))]
    check('ley21719', f'{h}: las citas se atribuyen a un cargo, no a una persona',
          not citas, str(sorted(set(citas))))
    check('ley21719', f'{h}: sin correos nominativos',
          not CORREO_NOMINATIVO.search(vis))
    check('ley21719', f'{h}: sin teléfonos celulares personales',
          not TELEFONO_PERSONAL.search(vis))

# ── SINTAXIS ────────────────────────────────────────────────────────────────
print('SINTAXIS')
for f in JS:
    r = subprocess.run(['node', '--check', str(BASE / f)], capture_output=True, text=True)
    # node --check no acepta scripts sueltos con top-level odd; usa new Function
    r = subprocess.run(['node', '-e', f'new Function(require("fs").readFileSync({str(BASE / f)!r},"utf8"))'],
                       capture_output=True, text=True)
    check('sintaxis', f'{f} compila', r.returncode == 0, r.stderr.strip()[:120])

# ── GLOBALES QUE CADA PÁGINA NECESITA ───────────────────────────────────────
# Agregado el 6-sep-2026, y es el detector que faltaba. El borrado dejó nueve
# estructuras fuera de `data.js` y tres apéndices fuera de la cabina; los archivos
# compilaban, el hash del prompt daba verde y el QA entero pasaba, porque nadie
# comprobaba que lo que el código NOMBRA exista. La cabina moría en el primer
# render de la reunión. Esto carga los scripts de cada página en el orden real del
# HTML y exige que toda constante en mayúsculas que el código usa esté declarada.
print('GLOBALES (lo que el código nombra, existe)')

BUILTINS = {'JSON', 'NaN', 'Infinity', 'URL', 'Math', 'Date', 'Promise', 'Intl', 'RegExp',
            'Object', 'Array', 'Number', 'String', 'Boolean', 'Error', 'Map', 'Set'}

# Estos archivos están llenos de prosa en mayúsculas —los textos de las preguntas, el
# prompt maestro entero— así que el uso NO se busca por «palabra en mayúsculas»: se
# busca por ANCLA DE CÓDIGO, algo que la prosa no puede imitar. Un primer intento con
# un tokenizador propio (quitar comentarios y cadenas) se desincronizó con los template
# literales anidados y produjo tres colores hexadecimales como si fueran constantes
# faltantes. Las anclas son menos ambiciosas y no se equivocan.
METODOS = ('map|filter|forEach|length|every|reduce|some|find|includes|flatMap|join|'
           'slice|split|match|test|replace|sort|indexOf|keys|entries')
ANCLAS = [
    re.compile(r'\b([A-Z][A-Z0-9_]{2,})\s*\.\s*(?:' + METODOS + r')\b'),   # NOMBRE.map(
    # Sin espacio antes del corchete, a propósito: «$6.000 CLP [referencial]» y
    # «alto LTV [referencial]» son prosa del prompt, no un índice.
    re.compile(r'\b([A-Z][A-Z0-9_]{2,})\['),                               # NOMBRE[
    re.compile(r'\bObject\.(?:keys|entries|values)\(\s*([A-Z][A-Z0-9_]{2,})\b'),
    re.compile(r'\besc\(\s*([A-Z][A-Z0-9_]{2,})\s*\)'),                    # esc(NOMBRE)
]
# Un paréntesis suelto —«(NOMBRE)»— y una suma —«+ NOMBRE»— se probaron y se
# descartaron: la prosa del prompt está llena de siglas entre paréntesis (CAC, CAPI,
# CLP) y de códigos de pregunta tras dos puntos, y el detector se llenaba de falsos
# positivos. Un detector que grita por cosas que están bien deja de leerse. Los tres
# apéndices, que esas anclas cubrían, tienen su propia verificación más abajo.


def scripts_de(pagina):
    """Los .js locales que la página carga, en el orden en que los carga."""
    txt = (BASE / pagina).read_text()
    rutas = re.findall(r'<script src="([^"]+\.js)(?:\?v=\d+)?"', txt)
    return [r for r in rutas if not r.startswith(('http://', 'https://', '//'))]


for pagina in HTMLS:
    codigo = '\n'.join((BASE / r).read_text() for r in scripts_de(pagina))
    declarados = set(re.findall(r'\b(?:const|let|var|function|class)\s+([A-Z][A-Z0-9_]{2,})\b', codigo))
    usados = set()
    for ancla in ANCLAS:
        usados |= set(ancla.findall(codigo))
    faltan = sorted(usados - declarados - BUILTINS)
    check('globales', f'{pagina}: toda constante que usa está declarada',
          not faltan, 'sin declarar: ' + ', '.join(faltan))

# Los tres apéndices son el caso que ya se rompió una vez: se los concatena al
# system de la llamada a la API, así que faltar uno no se nota hasta que alguien
# aprieta el botón en reunión.
apend = (BASE / 'assets/apendices_motor.js').read_text()
for nombre in ('APENDICE_VIVO', 'APENDICE_PREPARACION', 'APENDICE_DIGITAL'):
    check('globales', f'{nombre} vive fuera del prompt generado',
          f'const {nombre}' in apend)
check('globales', 'prompt_maestro.js (generado) solo declara PROMPT_MAESTRO',
      set(re.findall(r'^const\s+([A-Z_][A-Z0-9_]*)\s*=', (BASE / 'assets/prompt_maestro.js').read_text(), re.M))
      == {'PROMPT_MAESTRO'})

# ── VERSIONES DE CACHÉ ──────────────────────────────────────────────────────
print('VERSIONES (rompe-caché consistente)')
versiones = set()
sin_version = []
for h in HTMLS:
    txt = (BASE / h).read_text()
    for m in re.finditer(r'(?:src|href)="([^"]+\.(?:js|css))(\?v=(\d+))?"', txt):
        if 'accounts.google.com' in m.group(1):
            continue
        if m.group(3):
            versiones.add(m.group(3))
        else:
            sin_version.append(f'{h}: {m.group(1)}')
check('versiones', 'todo asset local lleva ?v=', not sin_version, '; '.join(sin_version))
check('versiones', f'una sola versión en las 4 páginas (v={"/".join(sorted(versiones))})', len(versiones) == 1)

# ── ACCESO ──────────────────────────────────────────────────────────────────
print('ACCESO')
for h in ['reunion.html', 'resultados.html', 'guia.html', 'guiada.html']:
    check('acceso', f'{h} exige login', 'exigirLogin();' in (BASE / h).read_text())
check('acceso', 'login.html NO se exige login a sí mismo',
      'exigirLogin();' not in (BASE / 'login.html').read_text())
check('acceso', 'el login conserva la página de destino (next=)',
      'next=' in (BASE / 'assets/auth.js').read_text())
out, err = node("""
cargarJS('assets/auth.js');
const casos = [
  ['reunion.html?reunion=Reuniones/x.json', true],
  ['resultados.html', true],
  ['https://evil.com/x.html', false],
  ['//evil.com', false],
  ['javascript:alert(1)', false]
];
let ok = true;
for (const [next, permitido] of casos) {
  global.location.search = '?next=' + encodeURIComponent(next);
  const d = destinoPostLogin();
  const paso = (d === next) === permitido;
  if (!paso) { ok = false; console.error('falla:', next, '→', d); }
}
console.log(ok ? 'OK' : 'FALLA');
""")
check('acceso', 'destinoPostLogin acepta páginas locales y rechaza URLs externas', out == 'OK', err)
out, err = node("""
cargarJS('assets/auth.js');
const crypto = require('crypto');
const casos = ['cabina·prueba123', 'áéíñü ñandú 中文', 'clave con espacios y $ímbolos'];
let ok = casos.every(t => sha256js(t) === crypto.createHash('sha256').update(t, 'utf8').digest('hex'));
console.log(ok ? 'OK' : 'FALLA');
""")
check('acceso', 'sha256js (respaldo sin crypto.subtle) coincide con SHA-256 real', out == 'OK', err)

# ── CONTRATO DEL MOTOR ──────────────────────────────────────────────────────
print('CONTRATO DEL MOTOR (PRD §5.5 y Anexo F.2)')
motor_txt = (BASE / 'assets/motor_api.js').read_text()
check('motor', 'jamás envía temperature/top_p/top_k',
      not re.search(r'["\']?(temperature|top_p|top_k)["\']?\s*:', motor_txt))
check('motor', 'modelos fijados: claude-sonnet-5 (vivo) y claude-opus-5 (cierre)',
      "MODELO_VIVO = 'claude-sonnet-5'" in motor_txt and "MODELO_CIERRE = 'claude-opus-5'" in motor_txt)
check('motor', 'profundidad por output_config.effort', 'output_config' in motor_txt and 'effort' in motor_txt)
check('motor', 'header anthropic-version presente', 'anthropic-version' in motor_txt)
CAMPOS_F2 = ['t1_origen_cliente', 't2_huella_publica', 't3_oportunidades_mes', 't4_pauta_activa',
             't5_destino_compra', 't6_captura_datos', 't7_tiempo_respuesta', 't8_registro_contacto',
             't9_seguimiento_perdido', 't10_uso_ia', 't11_horas_repetitivas', 't12_dependencia',
             't13_criterio_escrito', 't14_criterio_demostrable',
             'n1_mejor_cliente', 'n7_concentracion_cartera', 'm1_contra_quien', 'm5_cambio_sectorial']
faltan = [c for c in CAMPOS_F2 if c not in motor_txt]
check('motor', 'los nombres de campo del Anexo F.2 están completos', not faltan, ', '.join(faltan))
# El System Prompt Maestro debe ser VERBATIM el Anexo E del PRD
prd_lineas = PRD.read_text().split('\n')
ini = fin = None
for i, l in enumerate(prd_lineas):
    if l.startswith('# Anexo E'):
        j = i
        while prd_lineas[j].strip() != '```':
            j += 1
        ini = j + 1
        k = ini
        while prd_lineas[k].strip() != '```':
            k += 1
        fin = k
        break
anexo_e = '\n'.join(prd_lineas[ini:fin])
hash_prd = hashlib.sha256(anexo_e.encode()).hexdigest()
out, err = node("""
cargarJS('assets/prompt_maestro.js');
console.log(require('crypto').createHash('sha256').update(PROMPT_MAESTRO, 'utf8').digest('hex'));
""")
check('motor', 'PROMPT_MAESTRO es VERBATIM el Anexo E del PRD (hash idéntico)', out == hash_prd,
      f'js={out and out[:12]} prd={hash_prd[:12]} {err}')
out, err = node("""
cargarJS('assets/apendices_motor.js');
const ok = APENDICE_VIVO.includes('estado_vivo') && APENDICE_VIVO.includes('seguro_de_decir')
  && APENDICE_PREPARACION.includes('mejor_pregunta') && APENDICE_PREPARACION.includes('que_falta')
  && !APENDICE_PREPARACION.includes('{{');
console.log(ok ? 'OK' : 'FALLA');
""")
check('motor', 'apéndices vivo y preparación completos y sin llaves dobles', out == 'OK', err)

# ── RUTEO FUNCIONAL (casos dorados, ejecutados de verdad) ───────────────────
print('RUTEO FUNCIONAL')
out, err = node("""
cargarJS('../03 Front/assets/data.js');
cargarJS('../03 Front/assets/motor.js');
const fs2 = require('fs');
const res = [];
// Caso dorado Eco Star (Anexo G.1): debe rutear a 05
const eco = rutear(CASO_ECOSTAR_TRIAGE);
res.push(['ecostar→05', eco.dominante === 5]);
// Reunión completa de Ambrot: 05 dominante, 04 y 07 rotos, confianza alta
const amb = JSON.parse(fs2.readFileSync('Reuniones/AMBROT_DEMO_resultados.json', 'utf8'));
const ra = rutear(amb.triage);
res.push(['ambrot→05', ra.dominante === 5]);
res.push(['ambrot 04 y 07 rotos', ra.estados[4] === 'roto' && ra.estados[7] === 'roto']);
res.push(['ambrot confianza alta', ra.confianza === 'alta']);
// Sin respuestas: insuficiente, jamás rutea al azar
const rv = rutear({});
res.push(['triage vacío = insuficiente', rv.veredicto === 'insuficiente' && rv.dominante === null]);
// Sin flujo: 03 dominante aunque haya señales río abajo
const rf = rutear({ t3: '0', t1: 'recomendacion', t8: 'no_queda', t5: 'whatsapp' });
res.push(['t3=0 → dominante 03', rf.dominante === 3]);
res.forEach(([n, ok]) => console.log((ok ? 'OK' : 'FALLA') + '|' + n));
""")
if out is None:
    check('ruteo', 'ejecución del motor local', False, err)
else:
    for linea in out.split('\n'):
        estado, nombre = linea.split('|', 1)
        check('ruteo', nombre, estado == 'OK')

# ── INSTRUMENTO V2 ──────────────────────────────────────────────────────────
print('INSTRUMENTO V2')
out, err = node("""
cargarJS('../03 Front/assets/data.js');
cargarJS('assets/preguntas_v2.js');
const res = [];
res.push(['V2 cubre las 14 del triage', TRIAGE.every(q => V2[q.id] && V2[q.id].texto)]);
res.push(['V2 cubre N1–N7', NUCLEO_NEGOCIO.preguntas.every(q => V2[q.cod] && V2[q.cod].texto)]);
res.push(['V2 cubre M1–M5', BLOQUE_COMPETENCIA.preguntas.every(q => V2[q.cod] && V2[q.cod].texto)]);
res.push(['V2 cubre las de decisión (p01–p03)', PREGUNTAS_0.every(q => V2[q.id] && V2[q.id].texto)]);
res.push(['toda V2 trae «decirlo así» y «escuchar»',
  Object.values(V2).every(v => v.decir && v.oro)]);
res.push(['nuevas: 3 de gatillo + 2 de cierre + protocolo del oro',
  GATILLO.length === 3 && CIERRE_X.length === 2 && PROTOCOLO_ORO.length >= 5]);
res.push(['V2 NO redefine valores de opciones (solo conducción)',
  !Object.values(V2).some(v => v.opciones)]);
res.forEach(([n, ok]) => console.log((ok ? 'OK' : 'FALLA') + '|' + n));
""")
if out is None:
    check('v2', 'carga del instrumento v2', False, err)
else:
    for linea in out.split('\n'):
        estado, nombre = linea.split('|', 1)
        check('v2', nombre, estado == 'OK')

# ── CABINA FUNCIONAL ────────────────────────────────────────────────────────
print('CABINA FUNCIONAL')
out, err = node("""
cargarJS('../03 Front/assets/data.js');
cargarJS('../03 Front/assets/motor.js');
cargarJS('assets/preguntas_v2.js');
cargarJS('assets/cabina.js');
pintarTriage = pintarBloque = pintarPanel = pintarEstado = pintarPuente = pintarExtra = pintarSelector = pintarCarpeta = pintarFicha = _noop;
const res = [];
// Estado inicial completo
const e0 = estadoInicial();
res.push(['estado inicial con todas las claves', ['ficha','fichax','triage','nt','nucleo','num','bloque','comp','cierre','extra','gx','cx','crono'].every(k => k in e0)]);
// Detección de pares pregunta→respuesta
E = estadoInicial();
const qa = detectarQA('pablo: ¿Y cuánto pagas de arriendo por la bodega del terreno grande?\\ncliente: Dos millones al mes, contrato a diez años.');
res.push(['detecta par pregunta→respuesta de la conversación', qa.length === 1 && qa[0].r.includes('Dos millones')]);
// No duplica preguntas del instrumento
const qa2 = detectarQA('pablo: Cuando te llega un cliente nuevo, ¿cómo supo de ti entonces ahora?\\ncliente: Por recomendación de un amigo del rubro industrial.');
res.push(['filtra preguntas que ya cubre el instrumento', qa2.length === 0]);
// Multi-respuesta: principal rutea, secundaria queda aparte
E = estadoInicial();
rT('t1', 'recomendacion'); rT('t1', 'busqueda');
res.push(['multi-respuesta: principal + secundaria', E.triage.t1 === 'recomendacion' && (E.multi.t1 || []).includes('busqueda')]);
// La URL de agendar se arma bien
E = estadoInicial(); E.ficha.empresa = 'PRUEBA'; E.fechaPaso = '2026-08-21'; E.horaPaso = '17:00';
let url = ''; global.window.open = u => { url = u; };
agendarProxima();
res.push(['agendar arma la URL de Google Calendar', url.includes('calendar.google.com') && url.includes('20260821T170000') && url.includes('PRUEBA')]);
// El cronómetro respeta los 32 minutos por tramo
res.push(['presupuesto de tramos suma 32', TRAMOS.reduce((a, [, m]) => a + m, 0) === 32]);
res.forEach(([n, ok]) => console.log((ok ? 'OK' : 'FALLA') + '|' + n));
""")
if out is None:
    check('cabina', 'ejecución de cabina.js', False, err)
else:
    for linea in out.split('\n'):
        estado, nombre = linea.split('|', 1)
        check('cabina', nombre, estado == 'OK')

res_html_mod = (BASE / 'resultados.html').read_text()
# ── MÓDULO PROFESIONAL (24-sep-2026) ────────────────────────────────────────
# El módulo es una CAPA: si cambia un id, un valor de opción o el ruteo, deja de serlo y
# rompe el contrato del Anexo F.2 en silencio. Y la capa de salud existe por cuatro límites
# legales: cada uno se comprueba ejecutando el código, no leyéndolo.
print('MÓDULO PROFESIONAL')
out, err = node("""
cargarJS('../03 Front/assets/data.js');
cargarJS('../03 Front/assets/motor.js');
cargarJS('assets/preguntas_v2.js');
cargarJS('assets/modulo_profesional.js');
cargarJS('assets/cabina.js');
cargarJS('assets/prompt_maestro.js');
cargarJS('assets/apendices_motor.js');
cargarJS('assets/motor_api.js');
pintarTriage = pintarBloque = pintarPanel = pintarEstado = pintarPuente = pintarExtra = pintarSelector = pintarCarpeta = pintarFicha = pintarMotor = pintarGatillo = pintarNucleo = pintarComp = pintarP0 = pintarCierre = _noop;
const res = [];
const claves = [...TRIAGE.map(q => q.id), ...NUCLEO_NEGOCIO.preguntas.map(q => q.cod),
                ...BLOQUE_COMPETENCIA.preguntas.map(q => q.cod), ...PREGUNTAS_0.map(q => q.id)];
res.push(['cubre las 14 del triage, N1–N7, M1–M5 y p01–p03, con «decirlo así» y «escuchar»',
  claves.every(k => PRO_GUIA[k] && PRO_GUIA[k].texto && PRO_GUIA[k].decir && PRO_GUIA[k].oro)]);
res.push(['no redefine opciones ni agrega preguntas fuera del instrumento',
  !Object.values(PRO_GUIA).some(v => v.opciones) && Object.keys(PRO_GUIA).every(k => claves.includes(k))]);
res.push(['las etiquetas nuevas solo renombran valores que ya existen (el ruteo no cambia)',
  Object.entries(PRO_OPCIONES).every(([qid, m]) => { const q = TRIAGE.find(x => x.id === qid);
    return q && Object.keys(m).every(v => q.opciones.some(o => o.v === v)); })]);
const vacios = [];
for (const salud of [false, true]) {
  const e = { modulo: { tipo: 'profesional', salud } };
  for (const [k, v] of Object.entries(PRO_GUIA)) for (const c of ['texto', 'decir', 'oro', 'nota_op'])
    if (v[c] && /\\{\\w+\\}/.test(proTx(v[c], e))) vacios.push(k + '.' + c);
}
res.push(['el vocabulario rellena todo, con y sin capa de salud', vacios.length === 0]);
const e1 = { modulo: { tipo: 'profesional', salud: true } };
const n1 = proTx(PRO_GUIA.N1.texto, e1);
res.push(['N1 no pide un nombre: pide el tipo, sin nombres', /sin dar nombres/i.test(n1) && !/n[oó]mbre(me|lo)\\b/i.test(n1)]);
res.push(['el bloque profundo 01 tampoco pide un nombre con el módulo', /sin dar nombres/i.test(proTx(PRO_BLOQUE.Q1, e1)) && BLOQUES_AREA[1].grupos.some(g => g.preguntas.some(q => q.cod === 'Q1'))]);
const tuteo = Object.entries(PRO_GUIA).filter(([, v]) => /(\\btú\\b|\\btienes\\b|\\bcuéntame\\b|\\bte llega\\b|\\btu negocio\\b)/i.test(v.texto + ' ' + v.decir));
res.push(['al profesional se le pregunta de usted, nunca de tú', tuteo.length === 0]);
const eco = rutear(CASO_ECOSTAR_TRIAGE);
res.push(['con el módulo cargado el ruteo no cambia (Eco Star sigue en 05)', eco.dominante === 5]);
res.push(['sin dominante no hay sistema', armarSistema(rutear({}), e1) === null]);
const amb = JSON.parse(require('fs').readFileSync('Reuniones/AMBROT_DEMO_resultados.json', 'utf8'));
const s1 = armarSistema(rutear(amb.triage), { modulo: { tipo: 'profesional', salud: false } });
res.push(['el sistema parte reparando el dominante y deja 02 y 03 para acelerar',
  s1 && s1.fases[0].nombre === 'Reparar' && s1.fases[0].componentes[0].n === 5
  && s1.fases.filter(f => f.nombre !== 'Acelerar').every(f => f.componentes.every(c => c.n !== 2 && c.n !== 3))]);
// Caso con 02 roto y 05 dominante: la reputación tiene que quedar en Acelerar, no antes.
const r25 = { t3: '6_20', t1: 'recomendacion', t2: 'casi_nada', t7: 'mas_1dia', t8: 'no_queda', t5: 'whatsapp', t6: 'solo_wsp' };
const s25 = armarSistema(rutear(r25), e1);
const fase = n => (s25.fases.find(f => f.componentes.some(c => c.n === n)) || {}).nombre;
res.push(['con 02 roto, la reputación entra recién en Acelerar', rutear(r25).estados[2] === 'roto' && fase(2) === 'Acelerar' && s25.fases[0].nombre === 'Reparar']);
res.push(['cada pieza del sistema trae su métrica y hay criterio de revisión',
  s1.fases.every(f => f.componentes.every(c => c.mide && c.piezas.length)) && /90 días/.test(s1.revision)]);
const r3 = { t3: '0', t1: 'recomendacion', t8: 'no_queda', t5: 'whatsapp' };
const ruta3 = rutear(r3);
const s3 = armarSistema(ruta3, e1);
const p3 = s3 && s3.fases.flatMap(f => f.componentes).find(c => c.n === 3);
res.push(['capa de salud: con 03 roto el sistema NO propone publicidad pagada',
  ruta3.dominante === 3 && p3 && !p3.piezas.some(x => /publicidad|pauta|anuncio/i.test(x)) && /Colegio Médico/.test(p3.cuidado)]);
const al = alertasSalud({ ...e1, triage: { t4: 'meta' } }, ruta3);
res.push(['capa de salud: el panel avisa pauta activa, 03 sin pauta y los cuatro límites',
  al.length === 6 && /publicidad activa/.test(al[1].t) && /03 Demanda/.test(al[0].t)
  && ['Colegio Médico', '21.719', '20.584', 'CONAR'].every(f => al.some(x => x.ev.includes(f)))]);
E = estadoInicial();
res.push(['una reunión nueva nace como empresa, sin capa de salud', E.modulo.tipo === 'empresa' && E.modulo.salud === false]);
let m0 = construirMensaje(false);
res.push(['empresa: el motor recibe <arquetipo> no_determinado y ningún <modulo>',
  m0.includes('<arquetipo>\\nno_determinado\\n</arquetipo>') && !m0.includes('<modulo>') && m0.includes('n1_mejor_cliente')]);
E.arquetipo = 'ignacio';
res.push(['empresa: el arquetipo elegido por el operador viaja al motor', construirMensaje(false).includes('<arquetipo>\\nignacio')]);
rTipo('profesional'); rSalud();
const m1 = construirMensaje(false);
res.push(['profesional con salud: perfil, módulo y núcleo propios viajan al motor',
  m1.includes('<arquetipo>\\nprofesional') && m1.includes('tipo: profesional_independiente')
  && m1.includes('capa_salud: sí') && m1.includes('n1_persona_ideal') && m1.includes('n7_dependencia_recomendacion')
  && !m1.includes('n1_mejor_cliente')]);
res.push(['profesional: la etiqueta que lee el motor es la del módulo',
  etiquetaDe('t1', 'licitacion') === 'Derivación de otro profesional o convenio']);
// Con clave cargada: sin ella la llamada muere antes de salir y el control pasaría en vacío.
localStorage.setItem('cabina_api_key', 'clave-de-prueba');
let llamadas = 0; global.fetch = () => { llamadas++; return Promise.reject(new Error('x')); };
global.confirm = () => false;
consultaVivo().then(() => {
  res.push(['capa de salud: sin confirmar que no hay datos de pacientes, nada sale a la API', llamadas === 0]);
  rTipo('empresa');
  global.confirm = () => true;
  res.push(['empresa: la puerta de salud no se interpone', puertaSalud(E) === true]);
  res.push(['volver a empresa apaga la capa de salud', E.modulo.salud === false && E.arquetipo === '']);
  res.forEach(([n, ok]) => console.log((ok ? 'OK' : 'FALLA') + '|' + n));
});
""")
if out is None:
    check('profesional', 'ejecución del módulo profesional', False, err)
else:
    for linea in out.split('\n'):
        estado, nombre = linea.split('|', 1)
        check('profesional', nombre, estado == 'OK')
check('profesional', 'el prompt del motor conoce el perfil PROFESIONAL y el bloque <modulo_profesional>',
      'PROFESIONAL — "El Profesional Independiente"' in anexo_e and '<modulo_profesional>' in anexo_e)
check('profesional', 'el prompt declara los cuatro límites de salud con su fuente',
      all(f in anexo_e for f in ('arts. 48 a 52', 'Ley 21.719', 'Ley 20.584', 'CONAR, art. 34')))
check('profesional', 'resultados.html tiene la tarjeta del sistema y carga el módulo antes que resultados.js',
      'id="sistema"' in res_html_mod and res_html_mod.index('modulo_profesional.js') < res_html_mod.index('assets/resultados.js'))
check('profesional', 'resultados: con capa de salud la publicidad pagada queda fuera del plan',
      'Fuera del plan: en salud la publicidad' in (BASE / 'assets/resultados.js').read_text())

# ── LO QUE VE EL CLIENTE (anti-fuga y anti-bluffing) ───────────────────────
print('LO QUE VE EL CLIENTE')
res_txt = (BASE / 'assets/resultados.js').read_text()
res_html = (BASE / 'resultados.html').read_text()
check('cliente', 'la taquigrafía E1–E7 se limpia antes de mostrarse (limpiar aplicada)',
      'const limpiar' in res_txt and res_txt.count('limpiar(') >= 8)
check('cliente', 'la salida del motor solo se muestra si pasa TODAS las invariantes',
      'every(c => c.ok)' in res_txt)
check('cliente', 'sin dominante con confianza suficiente, la página se cierra sola (gate)',
      "confianza !== 'baja'" in res_txt and 'gate' in res_txt)
check('cliente', 'el pie declara «preparado y conducido por Precisión»',
      'preparado y conducido por Precisión' in res_html)
prohibidas = re.findall(r'(diagnóstico automático|informe automático|al instante|instantáne)',
                        res_txt + res_html, re.I)
check('cliente', 'cero promesas de automatismo en la vista del cliente', not prohibidas, str(prohibidas))
# Se busca en el CÓDIGO, no en los comentarios: la cabecera de resultados.js documenta
# justamente esta regla ("el veredicto, las contradicciones y los códigos del triage NUNCA
# se emiten acá"), y una comparación sobre el archivo crudo se tropieza con esa frase y
# acusa la fuga que el comentario está prohibiendo. Si alguien de verdad emite el panel,
# el nombre del campo aparece en el código y esto se pone rojo igual.
res_codigo = re.sub(r'/\*.*?\*/', '', res_txt, flags=re.S)
res_codigo = re.sub(r'(?m)^\s*//.*$', '', res_codigo)
check('cliente', 'el panel del operador y contradicciones NO se emiten en resultados',
      'no_decir_aun' not in res_codigo and 'contradicciones' not in res_codigo)

# ── RESUMEN ─────────────────────────────────────────────────────────────────
total = len(resultados)
ok = sum(1 for _, _, r in resultados if r)
print('─' * 62)
color = VERDE if ok == total else ROJO
print(f'{color}{ok}/{total} pasan{FIN}')
sys.exit(0 if ok == total else 1)
